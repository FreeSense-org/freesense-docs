#!/usr/bin/env node
/*
 * generate-api-reference.mjs
 *
 * Builds src/content-source/api/reference.md from the REST API route table
 * of a FreeSense source checkout.
 *
 *   node scripts/generate-api-reference.mjs [freesense-checkout] [--check]
 *
 * The checkout defaults to ../freesense-src (relative to this repository).
 * With --check nothing is written; the script exits 1 when the file on disk
 * differs from what would be generated (for CI).
 *
 * The route table is not a static list: restapi_routes_*() build it with
 * helper closures, loops over resource kinds, string interpolation and
 * array_merge(). Matching restapi_route( calls with regular expressions
 * would miss or misread many routes, so this script contains a small PHP
 * subset interpreter. It loads every function in src/etc/inc/restapi/,
 * runs restapi_routes_v1() exactly like the firewall does, and records each
 * restapi_route() call. Unknown library calls evaluate to an "unknown"
 * value; package plugin routes (pkg_call_plugins) are not part of the base
 * table and are skipped because function_exists() reports false.
 *
 * No dependencies; deterministic output (no timestamps, no local paths).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const OUTPUT = path.join(repoRoot, 'src', 'content-source', 'api', 'reference.md');

/* ------------------------------------------------------------------ */
/* Values                                                              */
/* ------------------------------------------------------------------ */

const UNKNOWN = Symbol('unknown');

class PArr {
	constructor() {
		this.map = new Map();
		this.next = 0;
	}
	static normKey(k) {
		if (typeof k === 'number') return Math.trunc(k);
		if (typeof k === 'boolean') return k ? 1 : 0;
		if (k === null) return '';
		if (typeof k === 'string' && /^(0|-?[1-9][0-9]*)$/.test(k) && Number.isSafeInteger(Number(k))) return Number(k);
		return String(k);
	}
	set(k, v) {
		if (k === undefined) {
			k = this.next;
		}
		k = PArr.normKey(k);
		this.map.set(k, v);
		if (typeof k === 'number' && k >= this.next) this.next = k + 1;
	}
	get(k) {
		return this.map.get(PArr.normKey(k));
	}
	has(k) {
		return this.map.has(PArr.normKey(k));
	}
	delete(k) {
		this.map.delete(PArr.normKey(k));
	}
	get size() {
		return this.map.size;
	}
	keys() {
		return [...this.map.keys()];
	}
	values() {
		return [...this.map.values()];
	}
	entries() {
		return [...this.map.entries()];
	}
	clone() {
		const a = new PArr();
		for (const [k, v] of this.map) a.map.set(k, copyValue(v));
		a.next = this.next;
		return a;
	}
	isList() {
		let i = 0;
		for (const k of this.map.keys()) if (k !== i++) return false;
		return true;
	}
	static fromList(list) {
		const a = new PArr();
		for (const v of list) a.set(undefined, v);
		return a;
	}
}

/* PHP arrays are values: copy them on assignment and when passed. */
function copyValue(v) {
	return v instanceof PArr ? v.clone() : v;
}

class Closure {
	constructor(params, body, bound, name) {
		this.params = params;
		this.body = body;
		this.bound = bound;
		this.name = name;
	}
}

function toStr(v) {
	if (v === UNKNOWN) return UNKNOWN;
	if (v === null || v === undefined || v === false) return '';
	if (v === true) return '1';
	if (typeof v === 'number') return String(v);
	if (typeof v === 'string') return v;
	if (v instanceof PArr) return 'Array';
	return UNKNOWN;
}

function toBool(v) {
	if (v === UNKNOWN) throw new EvalError('condition depends on an unknown value');
	if (v instanceof PArr) return v.size > 0;
	if (typeof v === 'string') return v !== '' && v !== '0';
	return Boolean(v);
}

function toNum(v) {
	if (v === UNKNOWN) return UNKNOWN;
	if (typeof v === 'number') return v;
	if (typeof v === 'boolean') return v ? 1 : 0;
	if (v === null || v === undefined) return 0;
	if (typeof v === 'string') {
		const n = parseFloat(v);
		return Number.isNaN(n) ? 0 : n;
	}
	return UNKNOWN;
}

function looseEq(a, b) {
	if (a === UNKNOWN || b === UNKNOWN) return UNKNOWN;
	if (a instanceof PArr || b instanceof PArr) return strictEq(a, b);
	if (typeof a === 'string' && typeof b === 'string') {
		const na = /^\s*-?\d+(\.\d+)?\s*$/.test(a), nb = /^\s*-?\d+(\.\d+)?\s*$/.test(b);
		return (na && nb) ? Number(a) === Number(b) : a === b;
	}
	if (a === null || typeof a === 'boolean' || b === null || typeof b === 'boolean') return toBool(a) === toBool(b);
	if (typeof a === 'number' || typeof b === 'number') return toNum(a) === toNum(b);
	return a === b;
}

function strictEq(a, b) {
	if (a === UNKNOWN || b === UNKNOWN) return UNKNOWN;
	if (a instanceof PArr && b instanceof PArr) {
		if (a.size !== b.size) return false;
		for (const [k, v] of a.map) {
			if (!b.map.has(k)) return false;
			const r = strictEq(v, b.map.get(k));
			if (r !== true) return r;
		}
		return true;
	}
	return a === b;
}

/* ------------------------------------------------------------------ */
/* Tokenizer                                                           */
/* ------------------------------------------------------------------ */

const PUNCT = ['<<=', '>>=', '**=', '...', '<=>', '===', '!==', '??=', '?->',
	'=>', '->', '::', '??', '==', '!=', '<>', '<=', '>=', '&&', '||', '.=', '+=', '-=', '*=', '/=', '%=',
	'|=', '&=', '^=', '++', '--', '<<', '>>', '**'];

function tokenize(src, file) {
	const toks = [];
	let i = src.indexOf('<?php');
	if (i < 0) return toks;
	i += 5;
	let line = src.slice(0, i).split('\n').length;
	const n = src.length;
	const push = (t, v, extra) => toks.push(Object.assign({ t, v, line, file }, extra || {}));
	while (i < n) {
		const c = src[i];
		if (c === '\n') { line++; i++; continue; }
		if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
		if (c === '?' && src[i + 1] === '>') {
			const j = src.indexOf('<?php', i);
			if (j < 0) break;
			line += src.slice(i, j).split('\n').length - 1;
			i = j + 5;
			continue;
		}
		if ((c === '/' && src[i + 1] === '/') || (c === '#' && src[i + 1] !== '[')) {
			while (i < n && src[i] !== '\n') i++;
			continue;
		}
		if (c === '/' && src[i + 1] === '*') {
			const j = src.indexOf('*/', i + 2);
			const end = j < 0 ? n : j + 2;
			line += src.slice(i, end).split('\n').length - 1;
			i = end;
			continue;
		}
		if (c === '$' && /[A-Za-z_]/.test(src[i + 1] || '')) {
			let j = i + 1;
			while (j < n && /\w/.test(src[j])) j++;
			push('var', src.slice(i + 1, j));
			i = j;
			continue;
		}
		if (/[A-Za-z_\\]/.test(c)) {
			let j = i;
			while (j < n && /[\w\\]/.test(src[j])) j++;
			push('id', src.slice(i, j));
			i = j;
			continue;
		}
		if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
			const m = /^(0[xX][0-9a-fA-F_]+|0[bB][01_]+|(\d[\d_]*)?\.?\d[\d_]*([eE][+-]?\d+)?)/.exec(src.slice(i));
			const raw = m[0].replace(/_/g, '');
			let v;
			if (/^0[xX]/.test(raw)) v = parseInt(raw.slice(2), 16);
			else if (/^0[bB]/.test(raw)) v = parseInt(raw.slice(2), 2);
			else if (/^0[0-7]+$/.test(raw)) v = parseInt(raw, 8);
			else v = Number(raw);
			push('num', v);
			i += m[0].length;
			continue;
		}
		if (c === "'") {
			let j = i + 1, s = '';
			while (j < n && src[j] !== "'") {
				if (src[j] === '\\' && (src[j + 1] === "'" || src[j + 1] === '\\')) { s += src[j + 1]; j += 2; continue; }
				if (src[j] === '\n') line++;
				s += src[j++];
			}
			push('str', s);
			i = j + 1;
			continue;
		}
		if (c === '"') {
			let j = i + 1;
			while (j < n && src[j] !== '"') j += (src[j] === '\\') ? 2 : 1;
			const body = src.slice(i + 1, j);
			push('dstr', null, { parts: parseInterpolated(body, file, line) });
			line += body.split('\n').length - 1;
			i = j + 1;
			continue;
		}
		if (c === '<' && src.startsWith('<<<', i)) {
			const m = /^<<<[ \t]*(["']?)([A-Za-z_]\w*)\1\r?\n/.exec(src.slice(i));
			if (m) {
				const nowdoc = m[1] === "'";
				const start = i + m[0].length;
				const endRe = new RegExp('\\n([ \\t]*)' + m[2] + '\\b', 'g');
				endRe.lastIndex = start - 1;
				const em = endRe.exec(src);
				if (!em) throw new SyntaxError(`${file}:${line}: unterminated heredoc`);
				let body = src.slice(start, em.index);
				const indent = em[1];
				if (indent) body = body.split('\n').map((l) => l.startsWith(indent) ? l.slice(indent.length) : l).join('\n');
				if (nowdoc) push('str', body);
				else push('dstr', null, { parts: parseInterpolated(body.replace(/"/g, '\\"'), file, line) });
				line += src.slice(i, em.index + em[0].length).split('\n').length - 1;
				i = em.index + em[0].length;
				continue;
			}
		}
		const p = PUNCT.find((q) => src.startsWith(q, i));
		if (p) { push('op', p); i += p.length; continue; }
		push('op', c);
		i++;
	}
	push('eof', null);
	return toks;
}

/* Double-quoted string: literal parts and interpolated expressions (as token lists). */
function parseInterpolated(body, file, line) {
	const parts = [];
	let lit = '';
	let i = 0;
	const n = body.length;
	const flush = () => { if (lit !== '') { parts.push(lit); lit = ''; } };
	while (i < n) {
		const c = body[i];
		if (c === '\\') {
			const d = body[i + 1];
			const simple = { n: '\n', t: '\t', r: '\r', v: '\v', e: '\x1b', f: '\f', '\\': '\\', $: '$', '"': '"' };
			if (d in simple) { lit += simple[d]; i += 2; continue; }
			let m;
			if ((m = /^[0-7]{1,3}/.exec(body.slice(i + 1)))) { lit += String.fromCharCode(parseInt(m[0], 8)); i += 1 + m[0].length; continue; }
			if (d === 'x' && (m = /^[0-9a-fA-F]{1,2}/.exec(body.slice(i + 2)))) { lit += String.fromCharCode(parseInt(m[0], 16)); i += 2 + m[0].length; continue; }
			if (d === 'u' && (m = /^\{([0-9a-fA-F]+)\}/.exec(body.slice(i + 2)))) { lit += String.fromCodePoint(parseInt(m[1], 16)); i += 2 + m[0].length; continue; }
			lit += c;
			i++;
			continue;
		}
		if (c === '{' && body[i + 1] === '$') {
			let depth = 1, j = i + 1;
			while (j < n && depth > 0) {
				if (body[j] === '{') depth++;
				else if (body[j] === '}') depth--;
				else if (body[j] === "'") { j++; while (j < n && body[j] !== "'") j += body[j] === '\\' ? 2 : 1; }
				if (depth > 0) j++;
			}
			flush();
			parts.push({ expr: tokenize('<?php ' + body.slice(i + 1, j).replace(/\\"/g, '"'), file).map((t) => ({ ...t, line })) });
			i = j + 1;
			continue;
		}
		if (c === '$' && /[A-Za-z_]/.test(body[i + 1] || '')) {
			let j = i + 1;
			while (j < n && /\w/.test(body[j])) j++;
			let code = body.slice(i, j);
			if (body[j] === '[') {
				const k = body.indexOf(']', j);
				let key = body.slice(j + 1, k);
				if (!/^(-?\d+|\$\w+|'.*')$/.test(key)) key = `'${key}'`;
				code += `[${key}]`;
				j = k + 1;
			} else if (body[j] === '-' && body[j + 1] === '>' && /[A-Za-z_]/.test(body[j + 2] || '')) {
				let k = j + 2;
				while (k < n && /\w/.test(body[k])) k++;
				code += body.slice(j, k);
				j = k;
			}
			flush();
			parts.push({ expr: tokenize('<?php ' + code, file).map((t) => ({ ...t, line })) });
			i = j;
			continue;
		}
		lit += c;
		i++;
	}
	flush();
	return parts;
}

/* ------------------------------------------------------------------ */
/* Parser (a practical PHP subset)                                     */
/* ------------------------------------------------------------------ */

const CASTS = new Set(['int', 'integer', 'string', 'bool', 'boolean', 'float', 'double', 'array', 'object']);
const ASSIGN_OPS = new Set(['=', '.=', '+=', '-=', '*=', '/=', '%=', '??=', '|=', '&=', '^=', '<<=', '>>=', '**=']);
const BINARY = {
	'or': 1, 'xor': 2, 'and': 3,
	'??': 7, '||': 8, '&&': 9, '|': 10, '^': 11, '&': 12,
	'==': 13, '!=': 13, '===': 13, '!==': 13, '<>': 13, '<=>': 13,
	'<': 14, '<=': 14, '>': 14, '>=': 14,
	'.': 15, '<<': 16, '>>': 16, '+': 17, '-': 17, '*': 18, '/': 18, '%': 18,
	'instanceof': 20, '**': 21,
};
const RIGHT_ASSOC = new Set(['??', '**']);

class Parser {
	constructor(toks, pos = 0) {
		this.toks = toks;
		this.pos = pos;
	}
	peek(o = 0) { return this.toks[this.pos + o]; }
	next() { return this.toks[this.pos++]; }
	is(v, o = 0) { const t = this.peek(o); return t && (t.t === 'op' || t.t === 'id') && t.v === v; }
	isId(v, o = 0) { const t = this.peek(o); return t && t.t === 'id' && t.v.toLowerCase() === v; }
	accept(v) { if (this.is(v)) { this.pos++; return true; } return false; }
	expect(v) {
		const t = this.next();
		if (!t || t.v !== v) throw new SyntaxError(`${t?.file}:${t?.line}: expected "${v}", found "${t?.v ?? t?.t}"`);
		return t;
	}
	fail(msg) {
		const t = this.peek();
		throw new SyntaxError(`${t?.file}:${t?.line}: ${msg} (at "${t?.v ?? t?.t}")`);
	}

	/* Statements */
	block() {
		this.expect('{');
		const body = [];
		while (!this.is('}')) body.push(this.statement());
		this.expect('}');
		return { k: 'block', body };
	}
	bodyStmt() {
		if (this.is(':')) this.fail('alternative control syntax is not supported');
		return this.statement();
	}
	statement() {
		const t = this.peek();
		if (t.t === 'op' && t.v === '{') return this.block();
		if (t.t === 'op' && t.v === ';') { this.next(); return { k: 'noop' }; }
		if (t.t === 'id') {
			const w = t.v.toLowerCase();
			switch (w) {
			case 'return': {
				this.next();
				const e = this.is(';') ? null : this.expr();
				this.expect(';');
				return { k: 'return', e };
			}
			case 'if': {
				this.next();
				this.expect('(');
				const cond = this.expr();
				this.expect(')');
				const then = this.bodyStmt();
				let els = null;
				if (this.isId('elseif')) {
					this.peek().v = 'if';
					els = this.statement();
				} else if (this.isId('else')) {
					this.next();
					els = this.bodyStmt();
				}
				return { k: 'if', cond, then, els };
			}
			case 'foreach': {
				this.next();
				this.expect('(');
				const subject = this.expr();
				if (!this.isId('as')) this.fail('expected "as"');
				this.next();
				let key = null;
				this.accept('&');
				let val = this.expr(30);
				if (this.accept('=>')) {
					key = val;
					this.accept('&');
					val = this.expr(30);
				}
				this.expect(')');
				return { k: 'foreach', subject, key, val, body: this.bodyStmt() };
			}
			case 'for': {
				this.next();
				this.expect('(');
				const list = (end) => {
					const out = [];
					while (!this.is(end)) { out.push(this.expr()); this.accept(','); }
					this.expect(end);
					return out;
				};
				const init = list(';'), cond = list(';'), step = list(')');
				return { k: 'for', init, cond, step, body: this.bodyStmt() };
			}
			case 'while': {
				this.next();
				this.expect('(');
				const cond = this.expr();
				this.expect(')');
				return { k: 'while', cond, body: this.bodyStmt() };
			}
			case 'do': {
				this.next();
				const body = this.statement();
				if (!this.isId('while')) this.fail('expected "while"');
				this.next();
				this.expect('(');
				const cond = this.expr();
				this.expect(')');
				this.expect(';');
				return { k: 'dowhile', cond, body };
			}
			case 'switch': {
				this.next();
				this.expect('(');
				const subject = this.expr();
				this.expect(')');
				this.expect('{');
				const cases = [];
				while (!this.is('}')) {
					let test = null;
					if (this.isId('case')) { this.next(); test = this.expr(); } else if (this.isId('default')) { this.next(); } else this.fail('expected case');
					if (!this.accept(':')) this.expect(';');
					const body = [];
					while (!this.isId('case') && !this.isId('default') && !this.is('}')) body.push(this.statement());
					cases.push({ test, body });
				}
				this.expect('}');
				return { k: 'switch', subject, cases };
			}
			case 'break': case 'continue': {
				this.next();
				let levels = 1;
				if (this.peek().t === 'num') levels = this.next().v;
				this.expect(';');
				return { k: w, levels };
			}
			case 'try': {
				this.next();
				const body = this.block();
				const catches = [];
				let fin = null;
				while (this.isId('catch')) {
					this.next();
					this.expect('(');
					while (!this.is(')')) this.next();
					this.expect(')');
					catches.push(this.block());
				}
				if (this.isId('finally')) { this.next(); fin = this.block(); }
				return { k: 'try', body, catches, fin };
			}
			case 'throw': {
				this.next();
				const e = this.expr();
				this.expect(';');
				return { k: 'throw', e };
			}
			case 'global': case 'static': {
				if (w === 'static' && (this.isId('function', 1) || this.isId('fn', 1) || this.is('::', 1))) break;
				this.next();
				const vars = [];
				do {
					const v = this.next();
					let init = null;
					if (this.accept('=')) init = this.expr();
					vars.push({ name: v.v, init });
				} while (this.accept(','));
				this.expect(';');
				return { k: w, vars };
			}
			case 'unset': {
				this.next();
				this.expect('(');
				const targets = [];
				while (!this.is(')')) { targets.push(this.expr()); this.accept(','); }
				this.expect(')');
				this.expect(';');
				return { k: 'unset', targets };
			}
			case 'echo': case 'print': {
				this.next();
				const args = [this.expr()];
				while (this.accept(',')) args.push(this.expr());
				this.expect(';');
				return { k: 'noop', args };
			}
			case 'function':
				if (this.peek(1).t === 'id') {
					this.next();
					const name = this.next().v;
					const params = this.params();
					this.returnType();
					return { k: 'fndecl', name, params, body: this.block() };
				}
				break;
			default:
				break;
			}
		}
		const e = this.expr();
		if (!this.accept(';') && !this.is('eof') && !this.is('}')) this.fail('expected ";"');
		return { k: 'expr', e };
	}
	returnType() {
		if (this.accept(':')) {
			this.accept('?');
			do { this.next(); } while (this.accept('|'));
		}
	}
	params() {
		this.expect('(');
		const params = [];
		while (!this.is(')')) {
			if (this.peek().t === 'id' && !this.is('&')) {
				while (this.peek().t === 'id' || this.is('?') || this.is('|')) this.next();
			}
			this.accept('?');
			const byRef = this.accept('&');
			const variadic = this.accept('...');
			const v = this.next();
			if (v.t !== 'var') this.fail('expected parameter');
			let def = null;
			if (this.accept('=')) def = this.expr();
			params.push({ name: v.v, def, byRef, variadic });
			this.accept(',');
		}
		this.expect(')');
		return params;
	}

	/* Expressions (precedence climbing) */
	expr(minPrec = 0) {
		let left = this.unary();
		for (;;) {
			const t = this.peek();
			if (t.t !== 'op' && t.t !== 'id') break;
			const op = t.t === 'id' ? t.v.toLowerCase() : t.v;
			if (ASSIGN_OPS.has(op) && t.t === 'op') {
				if (minPrec > 4) break;
				this.next();
				const byRef = op === '=' && this.accept('&');
				const right = this.expr(4);
				left = { k: 'assign', op, target: left, value: right, byRef };
				continue;
			}
			if (op === '?' && t.t === 'op') {
				if (minPrec > 6) break;
				this.next();
				let then = null;
				if (!this.accept(':')) {
					then = this.expr(5);
					this.expect(':');
				}
				const els = this.expr(7);
				left = { k: 'ternary', cond: left, then, els };
				continue;
			}
			const prec = BINARY[op];
			if (prec === undefined || prec < minPrec || (prec === minPrec && !RIGHT_ASSOC.has(op))) break;
			if (t.t === 'id' && !['and', 'or', 'xor', 'instanceof'].includes(op)) break;
			this.next();
			if (op === 'instanceof') {
				const cls = this.unary();
				left = { k: 'instanceof', e: left, cls };
				continue;
			}
			const right = this.expr(RIGHT_ASSOC.has(op) ? prec : prec + 1);
			left = { k: 'bin', op, l: left, r: right };
		}
		return left;
	}
	unary() {
		const t = this.peek();
		if (t.t === 'op') {
			if (t.v === '!') { this.next(); return { k: 'not', e: this.expr(19) }; }
			if (t.v === '-' || t.v === '+') { this.next(); return { k: 'neg', op: t.v, e: this.expr(19) }; }
			if (t.v === '~') { this.next(); return { k: 'unknownop', e: this.expr(19) }; }
			if (t.v === '@') { this.next(); return this.expr(19); }
			if (t.v === '&') { this.next(); return this.unary(); }
			if (t.v === '++' || t.v === '--') { this.next(); return { k: 'incdec', op: t.v, pre: true, e: this.unary() }; }
			if (t.v === '(' && this.peek(1).t === 'id' && CASTS.has(this.peek(1).v.toLowerCase()) && this.is(')', 2)) {
				this.next();
				const to = this.next().v.toLowerCase();
				this.next();
				return { k: 'cast', to, e: this.expr(19) };
			}
		}
		if (t.t === 'id') {
			const w = t.v.toLowerCase();
			if (w === 'new') {
				this.next();
				let cls;
				if (this.peek().t === 'id') cls = this.next().v; else cls = this.unary();
				const args = this.is('(') ? this.args() : [];
				return this.postfix({ k: 'new', cls, args });
			}
			if (w === 'clone' || w === 'print') { this.next(); return this.expr(19); }
			if (w === 'throw') { this.next(); return { k: 'throwexpr', e: this.expr() }; }
			if (['include', 'include_once', 'require', 'require_once'].includes(w)) {
				this.next();
				return { k: 'call', name: 'require_once', args: [this.expr()] };
			}
		}
		return this.postfix(this.primary());
	}
	args() {
		this.expect('(');
		const args = [];
		while (!this.is(')')) {
			if (this.is('...') && this.is(')', 1)) { this.next(); break; }
			const spread = this.accept('...');
			if (this.peek().t === 'id' && this.is(':', 1) && !this.is('::', 1)) { this.next(); this.next(); }
			args.push(spread ? { k: 'spread', e: this.expr() } : this.expr());
			if (!this.accept(',')) break;
		}
		this.expect(')');
		return args;
	}
	arrayItems(close) {
		const items = [];
		while (!this.is(close)) {
			if (this.is(',')) { this.next(); items.push(null); continue; }
			if (this.accept('...')) { items.push({ spread: this.expr() }); this.accept(','); continue; }
			this.accept('&');
			let key = null;
			let value = this.expr();
			if (this.accept('=>')) {
				key = value;
				this.accept('&');
				value = this.expr();
			}
			items.push({ key, value });
			if (!this.accept(',')) break;
		}
		this.expect(close);
		return { k: 'array', items };
	}
	closure(isArrow) {
		const params = this.params();
		const uses = [];
		if (!isArrow && this.isId('use')) {
			this.next();
			this.expect('(');
			while (!this.is(')')) {
				const byRef = this.accept('&');
				uses.push({ name: this.next().v, byRef });
				this.accept(',');
			}
			this.expect(')');
		}
		this.returnType();
		if (isArrow) {
			this.expect('=>');
			return { k: 'closure', params, uses, arrow: true, body: this.expr(5) };
		}
		return { k: 'closure', params, uses, arrow: false, body: this.block() };
	}
	primary() {
		const t = this.next();
		switch (t.t) {
		case 'num': return { k: 'lit', v: t.v };
		case 'str': return { k: 'lit', v: t.v };
		case 'dstr': return {
			k: 'interp',
			parts: t.parts.map((p) => (typeof p === 'string' ? p : new Parser(p.expr).expr())),
		};
		case 'var': return { k: 'var', name: t.v };
		case 'op':
			if (t.v === '(') { const e = this.expr(); this.expect(')'); return e; }
			if (t.v === '[') return this.arrayItems(']');
			if (t.v === '$' && this.is('{')) { this.next(); const e = this.expr(); this.expect('}'); return { k: 'varvar', e }; }
			break;
		case 'id': {
			const w = t.v.toLowerCase();
			if (w === 'array' && this.is('(')) { this.next(); return this.arrayItems(')'); }
			if (w === 'list' && this.is('(')) { this.next(); return this.arrayItems(')'); }
			if (w === 'isset' || w === 'empty') return { k: w, args: this.args() };
			if (w === 'static' && (this.isId('function') || this.isId('fn'))) return this.primary();
			if (w === 'function' && this.is('(')) return this.closure(false);
			if (w === 'fn' && this.is('(')) return this.closure(true);
			if (w === 'match') this.fail('match expressions are not supported');
			if (this.is('(')) return { k: 'call', name: t.v.replace(/^\\/, ''), args: this.args() };
			if (this.is('::')) {
				this.next();
				const m = this.next();
				if (this.is('(')) return { k: 'unknowncall', args: this.args() };
				return { k: 'lit', v: UNKNOWN, what: `${t.v}::${m.v}` };
			}
			return { k: 'const', name: t.v.replace(/^\\/, '') };
		}
		default: break;
		}
		throw new SyntaxError(`${t.file}:${t.line}: unexpected "${t.v ?? t.t}"`);
	}
	postfix(e) {
		for (;;) {
			if (this.is('[')) {
				this.next();
				if (this.accept(']')) { e = { k: 'index', e, idx: null }; continue; }
				const idx = this.expr();
				this.expect(']');
				e = { k: 'index', e, idx };
			} else if (this.is('{') && false) {
				break;
			} else if (this.is('->') || this.is('?->')) {
				this.next();
				const name = this.next();
				if (this.is('(')) e = { k: 'unknowncall', args: this.args(), obj: e };
				else e = { k: 'prop', e, name: name.v };
			} else if (this.is('::')) {
				this.next();
				this.next();
				if (this.is('(')) e = { k: 'unknowncall', args: this.args() };
				else e = { k: 'lit', v: UNKNOWN };
			} else if (this.is('(')) {
				e = { k: 'callvalue', callee: e, args: this.args() };
			} else if (this.is('++') || this.is('--')) {
				e = { k: 'incdec', op: this.next().v, pre: false, e };
			} else break;
		}
		return e;
	}
}

/* ------------------------------------------------------------------ */
/* Interpreter                                                         */
/* ------------------------------------------------------------------ */

class ReturnSignal { constructor(v) { this.v = v; } }
class BreakSignal { constructor(levels, cont) { this.levels = levels; this.cont = cont; } }
class PhpThrow { constructor(v) { this.v = v; } }

class Ref { constructor(v) { this.v = v; } }

class Scope {
	constructor() { this.vars = new Map(); }
	ref(name) {
		let r = this.vars.get(name);
		if (!r) { r = new Ref(null); this.vars.set(name, r); }
		return r;
	}
	get(name) { const r = this.vars.get(name); return r ? r.v : null; }
	has(name) { return this.vars.has(name) && this.vars.get(name).v !== null; }
	set(name, v) { this.ref(name).v = v; }
}

class Interpreter {
	constructor() {
		this.functions = new Map(); // lowercase name -> {name, toks, pos, file, decl}
		this.constants = new Map([['true', true], ['false', false], ['null', null], ['php_eol', '\n'],
			['php_int_max', Number.MAX_SAFE_INTEGER], ['ent_quotes', 3], ['json_pretty_print', 128],
			['json_unescaped_slashes', 64]]);
		this.natives = new Map();
		this.globals = new Scope();
		this.depth = 0;
	}

	loadFile(file, label) {
		const toks = tokenize(fs.readFileSync(file, 'utf8'), label);
		let depth = 0;
		for (let i = 0; i < toks.length; i++) {
			const t = toks[i];
			if (t.t === 'op' && (t.v === '{')) depth++;
			else if (t.t === 'op' && t.v === '}') depth--;
			else if (depth === 0 && t.t === 'id' && t.v.toLowerCase() === 'function' && toks[i + 1]?.t === 'id' && toks[i + 2]?.v === '(') {
				const name = toks[i + 1].v;
				if (!this.functions.has(name.toLowerCase())) {
					this.functions.set(name.toLowerCase(), { name, toks, pos: i, file: label, decl: null });
				}
			} else if (depth === 0 && t.t === 'id' && t.v.toLowerCase() === 'define' && toks[i + 1]?.v === '(') {
				try {
					const p = new Parser(toks, i);
					this.evalExpr(p.expr(), this.globals);
				} catch (e) {
					/* a define() we cannot evaluate leaves the constant unknown */
				}
			}
		}
	}

	getFunction(name) {
		const f = this.functions.get(name.toLowerCase());
		if (!f) return null;
		if (!f.decl) {
			const p = new Parser(f.toks, f.pos);
			const stmt = p.statement();
			if (stmt.k !== 'fndecl') throw new SyntaxError(`${f.file}: could not parse function ${name}`);
			f.decl = stmt;
		}
		return f;
	}

	call(name, args, callSite) {
		const lname = name.toLowerCase();
		if (this.natives.has(lname)) return this.natives.get(lname)(args, callSite);
		const f = this.getFunction(name);
		if (f) return this.invoke(f.decl.params, f.decl.body, new Scope(), args, f.name);
		if (BUILTINS[lname]) return BUILTINS[lname].call(this, args);
		return UNKNOWN;
	}

	callValue(callee, args, callSite) {
		if (callee instanceof Closure) {
			const scope = new Scope();
			for (const [k, r] of callee.bound) scope.vars.set(k, r);
			return this.invoke(callee.params, callee.body, scope, args, callee.name);
		}
		if (typeof callee === 'string') return this.call(callee, args, callSite);
		return UNKNOWN;
	}

	invoke(params, body, scope, args, name) {
		if (++this.depth > 200) throw new RangeError(`call depth exceeded in ${name}`);
		try {
			params.forEach((p, i) => {
				if (p.variadic) { scope.set(p.name, PArr.fromList(args.slice(i))); return; }
				if (i < args.length) scope.set(p.name, copyValue(args[i]));
				else scope.set(p.name, p.def ? this.evalExpr(p.def, scope) : null);
			});
			if (body.k !== 'block') return this.evalExpr(body, scope);
			try {
				this.execBlock(body.body, scope);
			} catch (e) {
				if (e instanceof ReturnSignal) return e.v;
				throw e;
			}
			return null;
		} finally {
			this.depth--;
		}
	}

	execBlock(stmts, scope) {
		for (const s of stmts) this.exec(s, scope);
	}

	exec(s, scope) {
		switch (s.k) {
		case 'noop': case 'fndecl': return;
		case 'block': return this.execBlock(s.body, scope);
		case 'expr': this.evalExpr(s.e, scope); return;
		case 'return': throw new ReturnSignal(s.e ? copyValue(this.evalExpr(s.e, scope)) : null);
		case 'if':
			if (toBool(this.evalExpr(s.cond, scope))) this.exec(s.then, scope);
			else if (s.els) this.exec(s.els, scope);
			return;
		case 'foreach': {
			const subject = this.evalExpr(s.subject, scope);
			if (!(subject instanceof PArr)) {
				if (subject === UNKNOWN) throw new EvalError('foreach over an unknown value');
				return;
			}
			for (const [k, v] of subject.clone().entries()) {
				if (s.key) this.assignTo(s.key, k, scope);
				if (s.val.k === 'array') this.destructure(s.val, v, scope); else this.assignTo(s.val, copyValue(v), scope);
				try {
					this.exec(s.body, scope);
				} catch (e) {
					if (e instanceof BreakSignal) {
						if (e.levels > 1) { e.levels--; throw e; }
						if (e.cont) continue;
						break;
					}
					throw e;
				}
			}
			return;
		}
		case 'for': case 'while': case 'dowhile': {
			let guard = 0;
			if (s.k === 'for') s.init.forEach((e) => this.evalExpr(e, scope));
			const test = () => (s.k === 'for' ? s.cond.every((e) => toBool(this.evalExpr(e, scope))) : toBool(this.evalExpr(s.cond, scope)));
			let first = s.k === 'dowhile';
			while (first || test()) {
				first = false;
				if (++guard > 100000) throw new RangeError('loop limit');
				try {
					this.exec(s.body, scope);
				} catch (e) {
					if (e instanceof BreakSignal) {
						if (e.levels > 1) { e.levels--; throw e; }
						if (!e.cont) break;
					} else throw e;
				}
				if (s.k === 'for') s.step.forEach((e) => this.evalExpr(e, scope));
			}
			return;
		}
		case 'switch': {
			const v = this.evalExpr(s.subject, scope);
			let matched = false;
			try {
				for (const c of s.cases) {
					if (!matched) matched = c.test === null ? false : toBool(looseEq(v, this.evalExpr(c.test, scope)));
					if (matched) this.execBlock(c.body, scope);
				}
				if (!matched) {
					let inDefault = false;
					for (const c of s.cases) {
						if (c.test === null) inDefault = true;
						if (inDefault) this.execBlock(c.body, scope);
					}
				}
			} catch (e) {
				if (e instanceof BreakSignal) {
					if (e.levels > 1 || e.cont) { if (e.levels > 1) e.levels--; throw e; }
				} else throw e;
			}
			return;
		}
		case 'break': throw new BreakSignal(s.levels, false);
		case 'continue': throw new BreakSignal(s.levels, true);
		case 'try':
			try {
				this.exec(s.body, scope);
			} catch (e) {
				if (!(e instanceof PhpThrow) || s.catches.length === 0) throw e;
				this.exec(s.catches[0], scope);
			} finally {
				if (s.fin) this.exec(s.fin, scope);
			}
			return;
		case 'throw': throw new PhpThrow(this.evalExpr(s.e, scope));
		case 'global':
			for (const v of s.vars) scope.vars.set(v.name, this.globals.ref(v.name));
			return;
		case 'static':
			for (const v of s.vars) if (!scope.vars.has(v.name)) scope.set(v.name, v.init ? this.evalExpr(v.init, scope) : null);
			return;
		case 'unset':
			for (const t of s.targets) {
				if (t.k === 'var') scope.vars.delete(t.name);
				else if (t.k === 'index') {
					const c = this.evalExpr(t.e, scope);
					if (c instanceof PArr) c.delete(this.evalExpr(t.idx, scope));
				}
			}
			return;
		default:
			throw new EvalError(`unsupported statement ${s.k}`);
		}
	}

	destructure(pattern, value, scope) {
		let i = 0;
		for (const item of pattern.items) {
			if (item === null) { i++; continue; }
			const key = item.key ? this.evalExpr(item.key, scope) : i++;
			const v = value instanceof PArr ? value.get(key) : UNKNOWN;
			if (item.value.k === 'array') this.destructure(item.value, v, scope);
			else this.assignTo(item.value, copyValue(v ?? null), scope);
		}
	}

	/* The container (a Ref or a PArr slot) an lvalue refers to. */
	lref(target, scope) {
		if (target.k === 'var') return scope.ref(target.name);
		if (target.k === 'index') {
			const parent = this.lref(target.e, scope);
			if (!(parent.v instanceof PArr)) {
				if (parent.v === null || parent.v === undefined || parent.v === '') parent.v = new PArr();
				else return new Ref(UNKNOWN);
			}
			const arr = parent.v;
			let key;
			if (target.idx === null) {
				key = arr.next;
				arr.set(key, null);
			} else {
				key = this.evalExpr(target.idx, scope);
				if (key === UNKNOWN) return new Ref(UNKNOWN);
			}
			return {
				get v() { return arr.has(key) ? arr.get(key) : null; },
				set v(x) { arr.set(key, x); },
			};
		}
		return new Ref(UNKNOWN);
	}

	assignTo(target, value, scope) {
		if (target.k === 'array') { this.destructure(target, value, scope); return; }
		this.lref(target, scope).v = value;
	}

	evalExpr(e, scope) {
		switch (e.k) {
		case 'lit': return e.v;
		case 'interp': {
			let s = '';
			for (const p of e.parts) {
				const v = typeof p === 'string' ? p : toStr(this.evalExpr(p, scope));
				if (v === UNKNOWN) return UNKNOWN;
				s += v;
			}
			return s;
		}
		case 'var':
			if (e.name === 'this') return UNKNOWN;
			return scope.get(e.name);
		case 'varvar': return UNKNOWN;
		case 'const': {
			const v = this.constants.get(e.name.toLowerCase());
			if (v !== undefined) return v;
			return this.constants.has(e.name) ? this.constants.get(e.name) : UNKNOWN;
		}
		case 'array': {
			const a = new PArr();
			for (const item of e.items) {
				if (item === null) continue;
				if (item.spread) {
					const s = this.evalExpr(item.spread, scope);
					if (s instanceof PArr) for (const [k, v] of s.entries()) (typeof k === 'number' ? a.set(undefined, copyValue(v)) : a.set(k, copyValue(v)));
					continue;
				}
				const v = copyValue(this.evalExpr(item.value, scope));
				if (item.key) {
					const k = this.evalExpr(item.key, scope);
					if (k === UNKNOWN) continue;
					a.set(k, v);
				} else a.set(undefined, v);
			}
			return a;
		}
		case 'index': {
			const c = this.evalExpr(e.e, scope);
			if (e.idx === null) return UNKNOWN;
			const k = this.evalExpr(e.idx, scope);
			if (c === UNKNOWN || k === UNKNOWN) return UNKNOWN;
			if (c instanceof PArr) return c.has(k) ? c.get(k) : null;
			if (typeof c === 'string') return c[toNum(k)] ?? '';
			return null;
		}
		case 'prop': return UNKNOWN;
		case 'assign': {
			if (e.op === '=') {
				const v = copyValue(this.evalExpr(e.value, scope));
				if (e.target.k === 'array') { this.destructure(e.target, v, scope); return v; }
				if (e.byRef && e.target.k === 'var' && e.value.k === 'var') {
					scope.vars.set(e.target.name, scope.ref(e.value.name));
					return v;
				}
				this.lref(e.target, scope).v = v;
				return v;
			}
			const ref = this.lref(e.target, scope);
			if (e.op === '??=') {
				if (ref.v === null || ref.v === undefined) ref.v = copyValue(this.evalExpr(e.value, scope));
				return ref.v;
			}
			ref.v = this.binop(e.op.slice(0, -1), ref.v, this.evalExpr(e.value, scope));
			return ref.v;
		}
		case 'ternary': {
			const c = this.evalExpr(e.cond, scope);
			if (toBool(c)) return e.then ? this.evalExpr(e.then, scope) : c;
			return this.evalExpr(e.els, scope);
		}
		case 'bin': {
			if (e.op === '??') {
				const l = this.quiet(e.l, scope);
				return (l === null || l === undefined) ? this.evalExpr(e.r, scope) : l;
			}
			if (e.op === '&&' || e.op === 'and') return toBool(this.evalExpr(e.l, scope)) && toBool(this.evalExpr(e.r, scope));
			if (e.op === '||' || e.op === 'or') return toBool(this.evalExpr(e.l, scope)) || toBool(this.evalExpr(e.r, scope));
			return this.binop(e.op, this.evalExpr(e.l, scope), this.evalExpr(e.r, scope));
		}
		case 'not': return !toBool(this.evalExpr(e.e, scope));
		case 'neg': {
			const v = toNum(this.evalExpr(e.e, scope));
			return v === UNKNOWN ? UNKNOWN : (e.op === '-' ? -v : v);
		}
		case 'unknownop': return UNKNOWN;
		case 'incdec': {
			const ref = this.lref(e.e, scope);
			const old = toNum(ref.v);
			if (old === UNKNOWN) return UNKNOWN;
			ref.v = e.op === '++' ? old + 1 : old - 1;
			return e.pre ? ref.v : old;
		}
		case 'cast': {
			const v = this.evalExpr(e.e, scope);
			if (v === UNKNOWN) return UNKNOWN;
			switch (e.to) {
			case 'string': return toStr(v);
			case 'int': case 'integer': return Math.trunc(toNum(v));
			case 'float': case 'double': return toNum(v);
			case 'bool': case 'boolean': return toBool(v);
			case 'array':
				if (v instanceof PArr) return v;
				return v === null ? new PArr() : PArr.fromList([v]);
			default: return UNKNOWN;
			}
		}
		case 'isset': {
			return e.args.every((a) => {
				const v = this.quiet(a, scope);
				if (v === UNKNOWN) throw new EvalError('isset() of an unknown value');
				return v !== null && v !== undefined;
			});
		}
		case 'empty': {
			const v = this.quiet(e.args[0], scope);
			return v === null || v === undefined || !toBool(v);
		}
		case 'closure': {
			const bound = new Map();
			if (e.arrow) {
				for (const [k, r] of scope.vars) bound.set(k, new Ref(copyValue(r.v)));
			} else {
				for (const u of e.uses) bound.set(u.name, u.byRef ? scope.ref(u.name) : new Ref(copyValue(scope.get(u.name))));
			}
			return new Closure(e.params, e.body, bound, '{closure}');
		}
		case 'call': {
			const args = this.evalArgs(e.args, scope);
			return this.call(e.name, args, e);
		}
		case 'callvalue': {
			const callee = this.evalExpr(e.callee, scope);
			return this.callValue(callee, this.evalArgs(e.args, scope), e);
		}
		case 'unknowncall':
			this.evalArgs(e.args, scope);
			return UNKNOWN;
		case 'new': {
			const args = this.evalArgs(e.args, scope);
			return { phpObject: typeof e.cls === 'string' ? e.cls : '?', args };
		}
		case 'instanceof': return UNKNOWN;
		case 'throwexpr': throw new PhpThrow(this.evalExpr(e.e, scope));
		default:
			throw new EvalError(`unsupported expression ${e.k}`);
		}
	}

	/* Evaluate without notices: a missing variable or key is null. */
	quiet(e, scope) {
		if (e.k === 'var') return scope.get(e.name);
		if (e.k === 'index' && e.idx !== null) {
			const c = this.quiet(e.e, scope);
			if (c === UNKNOWN) return UNKNOWN;
			if (!(c instanceof PArr)) return null;
			const k = this.evalExpr(e.idx, scope);
			if (k === UNKNOWN) return UNKNOWN;
			return c.has(k) ? c.get(k) : null;
		}
		return this.evalExpr(e, scope);
	}

	evalArgs(args, scope) {
		const out = [];
		for (const a of args) {
			if (a.k === 'spread') {
				const v = this.evalExpr(a.e, scope);
				if (v instanceof PArr) out.push(...v.values());
			} else out.push(this.evalExpr(a, scope));
		}
		return out;
	}

	binop(op, a, b) {
		if (a === UNKNOWN || b === UNKNOWN) return UNKNOWN;
		switch (op) {
		case '.': {
			const x = toStr(a), y = toStr(b);
			return (x === UNKNOWN || y === UNKNOWN) ? UNKNOWN : x + y;
		}
		case '+':
			if (a instanceof PArr && b instanceof PArr) {
				const r = a.clone();
				for (const [k, v] of b.entries()) if (!r.has(k)) r.set(k, copyValue(v));
				return r;
			}
			return toNum(a) + toNum(b);
		case '-': return toNum(a) - toNum(b);
		case '*': return toNum(a) * toNum(b);
		case '/': return toNum(a) / toNum(b);
		case '%': return Math.trunc(toNum(a)) % Math.trunc(toNum(b));
		case '**': return toNum(a) ** toNum(b);
		case '==': return looseEq(a, b);
		case '!=': case '<>': { const r = looseEq(a, b); return r === UNKNOWN ? r : !r; }
		case '===': return strictEq(a, b);
		case '!==': { const r = strictEq(a, b); return r === UNKNOWN ? r : !r; }
		case '<': return toNum(a) < toNum(b);
		case '<=': return toNum(a) <= toNum(b);
		case '>': return toNum(a) > toNum(b);
		case '>=': return toNum(a) >= toNum(b);
		case '<=>': return Math.sign(toNum(a) - toNum(b));
		case '|': return toNum(a) | toNum(b);
		case '&': return toNum(a) & toNum(b);
		case '^': return toNum(a) ^ toNum(b);
		case '<<': return toNum(a) << toNum(b);
		case '>>': return toNum(a) >> toNum(b);
		case 'xor': return toBool(a) !== toBool(b);
		default: return UNKNOWN;
		}
	}
}

/* PHP regex "/x/i" or "#x#" to a JS RegExp. */
function phpRegex(pattern) {
	if (typeof pattern !== 'string' || pattern.length < 2) return null;
	const open = pattern[0];
	const close = { '(': ')', '{': '}', '[': ']', '<': '>' }[open] || open;
	const end = pattern.lastIndexOf(close);
	if (end <= 0) return null;
	const body = pattern.slice(1, end);
	const mods = pattern.slice(end + 1).replace(/[^imsxuD]/g, '');
	const flags = [...new Set(mods.replace(/[xD]/g, '').split(''))].join('');
	try {
		return new RegExp(body, flags);
	} catch {
		return null;
	}
}

const isStr = (v) => typeof v === 'string';
const allKnown = (args) => args.every((a) => a !== UNKNOWN);

const BUILTINS = {
	gettext: ([s]) => s,
	array_merge(args) {
		if (!allKnown(args)) return UNKNOWN;
		const r = new PArr();
		for (const a of args) {
			if (!(a instanceof PArr)) return UNKNOWN;
			for (const [k, v] of a.entries()) (typeof k === 'number' ? r.set(undefined, copyValue(v)) : r.set(k, copyValue(v)));
		}
		return r;
	},
	array_keys: ([a]) => (a instanceof PArr ? PArr.fromList(a.keys()) : UNKNOWN),
	array_values: ([a]) => (a instanceof PArr ? PArr.fromList(a.values()) : UNKNOWN),
	array_key_exists: ([k, a]) => (a instanceof PArr && k !== UNKNOWN ? a.has(k) : UNKNOWN),
	array_flip: ([a]) => {
		if (!(a instanceof PArr)) return UNKNOWN;
		const r = new PArr();
		for (const [k, v] of a.entries()) r.set(v, k);
		return r;
	},
	array_combine: ([a, b]) => {
		if (!(a instanceof PArr) || !(b instanceof PArr)) return UNKNOWN;
		const r = new PArr();
		const bv = b.values();
		a.values().forEach((k, i) => r.set(k, bv[i]));
		return r;
	},
	array_map(args) {
		const [fn, arr] = args;
		if (!(arr instanceof PArr) || args.length > 2) return UNKNOWN;
		const r = new PArr();
		for (const [k, v] of arr.entries()) r.set(k, this.callValue(fn, [v]));
		return r;
	},
	array_filter(args) {
		const [arr, fn] = args;
		if (!(arr instanceof PArr) || args.length > 2) return UNKNOWN;
		const r = new PArr();
		for (const [k, v] of arr.entries()) if (toBool(fn === undefined ? v : this.callValue(fn, [v]))) r.set(k, v);
		return r;
	},
	count: ([a]) => (a instanceof PArr ? a.size : UNKNOWN),
	in_array: ([needle, hay, strict]) => {
		if (!(hay instanceof PArr) || needle === UNKNOWN) return UNKNOWN;
		return hay.values().some((v) => (strict ? strictEq(v, needle) === true : looseEq(v, needle) === true));
	},
	implode: ([glue, pieces]) => {
		if (glue instanceof PArr) [glue, pieces] = [pieces, glue];
		if (!(pieces instanceof PArr) || !isStr(glue)) return UNKNOWN;
		const parts = pieces.values().map(toStr);
		return parts.includes(UNKNOWN) ? UNKNOWN : parts.join(glue);
	},
	explode: ([sep, s]) => (isStr(sep) && isStr(s) ? PArr.fromList(s.split(sep)) : UNKNOWN),
	is_array: ([a]) => (a === UNKNOWN ? UNKNOWN : a instanceof PArr),
	is_string: ([a]) => (a === UNKNOWN ? UNKNOWN : isStr(a)),
	function_exists([name]) {
		if (!isStr(name)) return UNKNOWN;
		return this.natives.has(name.toLowerCase()) || this.functions.has(name.toLowerCase()) || Boolean(BUILTINS[name.toLowerCase()]);
	},
	define([name, value]) {
		if (isStr(name)) this.constants.set(name, value);
		return true;
	},
	defined([name]) { return isStr(name) ? this.constants.has(name) : UNKNOWN; },
	constant([name]) { return isStr(name) && this.constants.has(name) ? this.constants.get(name) : UNKNOWN; },
	sprintf(args) {
		const [fmt, ...rest] = args;
		if (!isStr(fmt) || !allKnown(rest)) return UNKNOWN;
		let i = 0;
		return fmt.replace(/%(?:(\d+)\$)?([-+ 0]|'.)*(\d+)?(?:\.(\d+))?([%bcdeEfFgGosuxX])/g, (m, pos, flag, width, prec, conv) => {
			if (conv === '%') return '%';
			const v = pos ? rest[Number(pos) - 1] : rest[i++];
			if (conv === 'd' || conv === 'u') return String(Math.trunc(toNum(v)));
			if (conv === 'f' || conv === 'F') return toNum(v).toFixed(prec ? Number(prec) : 6);
			return toStr(v);
		});
	},
	str_replace: ([search, rep, subject]) => {
		if (!isStr(search) || !isStr(rep) || !isStr(subject)) return UNKNOWN;
		return subject.split(search).join(rep);
	},
	strtolower: ([s]) => (isStr(s) ? s.toLowerCase() : UNKNOWN),
	strtoupper: ([s]) => (isStr(s) ? s.toUpperCase() : UNKNOWN),
	ucfirst: ([s]) => (isStr(s) ? s.charAt(0).toUpperCase() + s.slice(1) : UNKNOWN),
	lcfirst: ([s]) => (isStr(s) ? s.charAt(0).toLowerCase() + s.slice(1) : UNKNOWN),
	ucwords: ([s]) => (isStr(s) ? s.replace(/(^|\s)(\S)/g, (m, a, b) => a + b.toUpperCase()) : UNKNOWN),
	trim: ([s]) => (isStr(s) ? s.trim() : UNKNOWN),
	rtrim: ([s, chars]) => (isStr(s) ? (isStr(chars) ? s.replace(new RegExp(`[${chars.replace(/[\]\\^-]/g, '\\$&')}]+$`), '') : s.trimEnd()) : UNKNOWN),
	ltrim: ([s]) => (isStr(s) ? s.trimStart() : UNKNOWN),
	strlen: ([s]) => (isStr(s) ? Buffer.byteLength(s) : UNKNOWN),
	substr: ([s, start, len]) => {
		if (!isStr(s)) return UNKNOWN;
		const st = start < 0 ? Math.max(0, s.length + start) : start;
		if (len === undefined || len === null) return s.slice(st);
		return len < 0 ? s.slice(st, s.length + len) : s.slice(st, st + len);
	},
	strpos: ([h, n]) => (isStr(h) && isStr(n) ? (h.indexOf(n) < 0 ? false : h.indexOf(n)) : UNKNOWN),
	str_contains: ([h, n]) => (isStr(h) && isStr(n) ? h.includes(n) : UNKNOWN),
	str_starts_with: ([h, n]) => (isStr(h) && isStr(n) ? h.startsWith(n) : UNKNOWN),
	str_ends_with: ([h, n]) => (isStr(h) && isStr(n) ? h.endsWith(n) : UNKNOWN),
	preg_match: ([pattern, subject]) => {
		const re = phpRegex(pattern);
		if (!re || !isStr(subject)) return UNKNOWN;
		return re.test(subject) ? 1 : 0;
	},
	preg_replace: ([pattern, rep, subject]) => {
		const re = phpRegex(pattern);
		if (!re || !isStr(rep) || !isStr(subject)) return UNKNOWN;
		return subject.replace(new RegExp(re.source, re.flags + 'g'), rep.replace(/\$(\d)|\\(\d)/g, (m, a, b) => `$${a || b}`));
	},
	preg_quote: ([s]) => (isStr(s) ? s.replace(/[.\\+*?[^\]$(){}=!<>|:\-#/]/g, '\\$&') : UNKNOWN),
	intval: ([v]) => Math.trunc(toNum(v)),
	strval: ([v]) => toStr(v),
	max: (args) => (allKnown(args) ? Math.max(...args.map(toNum)) : UNKNOWN),
	min: (args) => (allKnown(args) ? Math.min(...args.map(toNum)) : UNKNOWN),
	require_once: () => true,
	array_is_list: ([a]) => (a instanceof PArr ? a.isList() : UNKNOWN),
};

/* ------------------------------------------------------------------ */
/* Load the route table                                                */
/* ------------------------------------------------------------------ */

function loadRoutes(checkout) {
	const inc = path.join(checkout, 'src', 'etc', 'inc');
	const dir = path.join(inc, 'restapi');
	if (!fs.existsSync(path.join(dir, 'routes_v1.inc'))) {
		throw new Error(`${dir}/routes_v1.inc not found: pass the path of a freesense checkout`);
	}
	const interp = new Interpreter();
	const files = [];
	const walk = (d, rel) => {
		for (const name of fs.readdirSync(d).sort()) {
			const full = path.join(d, name);
			if (fs.statSync(full).isDirectory()) walk(full, `${rel}${name}/`);
			else if (name.endsWith('.inc')) files.push([full, `${rel}${name}`]);
		}
	};
	walk(dir, 'restapi/');
	/* framework.inc and areas.inc first: their define()s are used by the others. */
	files.sort((a, b) => {
		const rank = (f) => (/\/areas\.inc$/.test(f) ? 0 : /\/framework\.inc$/.test(f) ? 1 : 2);
		return rank(a[1]) - rank(b[1]) || (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0);
	});
	for (const [full, label] of files) interp.loadFile(full, label);
	const restapiInc = path.join(inc, 'restapi.inc');
	if (fs.existsSync(restapiInc)) interp.loadFile(restapiInc, 'restapi.inc');

	const routes = [];
	interp.natives.set('restapi_route', ([method, p, handler, opts]) => {
		const get = (k) => (opts instanceof PArr && opts.has(k) ? opts.get(k) : null);
		const area = get('area') ?? '';
		const write = toBool(get('write') ?? false);
		const route = {
			method: isStr(method) ? method.toUpperCase() : '?',
			path: isStr(p) ? p : '?',
			handler: isStr(handler) ? handler : '',
			page: get('page'),
			area: isStr(area) ? area : '',
			write,
			safe: !write && toBool(get('safe') ?? false),
			summary: get('summary') ?? '',
			body: get('body'),
			query: get('query'),
			produces: get('produces') ?? 'application/json',
			schema: get('schema'),
		};
		route.scope = route.area === '' ? '' : `${route.area}:${write ? 'write' : 'read'}`;
		routes.push(route);
		const r = new PArr();
		for (const [k, v] of Object.entries(route)) r.set(k, k === 'body' || k === 'query' ? copyValue(v) : v);
		r.set('regex', `#^${route.path}$#`);
		return r;
	});
	interp.natives.set('pkg_call_plugins', () => new PArr());

	const table = interp.call('restapi_routes_v1', []);
	if (!(table instanceof PArr)) throw new Error('restapi_routes_v1() did not return a route list');
	/* Keep the order and multiplicity of the returned table (records are matched by identity). */
	const byPath = new Map();
	for (const r of routes) {
		const key = `${r.method} ${r.path}`;
		if (!byPath.has(key)) byPath.set(key, []);
		byPath.get(key).push(r);
	}
	const ordered = [];
	for (const rec of table.values()) {
		if (!(rec instanceof PArr)) continue;
		const key = `${rec.get('method')} ${rec.get('path')}`;
		const list = byPath.get(key);
		const found = list && list.shift();
		if (found) {
			found.schema = rec.get('schema') ?? found.schema;
			found.summary = rec.get('summary') ?? found.summary;
			ordered.push(found);
		}
	}

	const areasArr = interp.call('restapi_areas', []);
	const areas = areasArr instanceof PArr ? areasArr.entries() : [];
	const privName = (area, action) => {
		const v = interp.call('restapi_area_privilege', [area, action]);
		return isStr(v) ? v : `api-${area.replace(/\./g, '-')}-${action}`;
	};
	const level = interp.constants.get('RESTAPI_LEVEL');
	const caps = interp.call('restapi_capabilities', []);
	return {
		routes: ordered,
		areas,
		privName,
		level: typeof level === 'number' ? level : null,
		capabilities: caps instanceof PArr ? caps.values().filter(isStr) : [],
		pages: loadPagePrivileges(inc),
	};
}

/* GUI page => privilege name, from priv.defs.inc and priv/*.priv.inc. */
function loadPagePrivileges(inc) {
	const files = [path.join(inc, 'priv.defs.inc')];
	const privDir = path.join(inc, 'priv');
	if (fs.existsSync(privDir)) for (const f of fs.readdirSync(privDir).sort()) files.push(path.join(privDir, f));
	const privs = new Map();
	const unq = (s) => s.replace(/\\(["'\\])/g, '$1');
	for (const f of files) {
		if (!fs.existsSync(f)) continue;
		const src = fs.readFileSync(f, 'utf8');
		for (const m of src.matchAll(/\$priv_list\['([^']+)'\]\['name'\]\s*=\s*(?:gettext\()?\s*(["'])((?:\\.|(?!\2).)*)\2/g)) {
			if (!privs.has(m[1])) privs.set(m[1], { name: unq(m[3]), match: [] });
			else privs.get(m[1]).name = unq(m[3]);
		}
		for (const m of src.matchAll(/\$priv_list\['([^']+)'\]\['match'\]\[\]\s*=\s*(["'])((?:\\.|(?!\2).)*)\2/g)) {
			if (!privs.has(m[1])) privs.set(m[1], { name: m[1], match: [] });
			privs.get(m[1]).match.push(unq(m[3]));
		}
	}
	/* The most specific pattern wins; "*" (WebCfg - All pages) is never the answer. */
	return (page) => {
		let best = null;
		for (const [id, p] of privs) {
			for (const pat of p.match) {
				if (pat.replace(/\*/g, '') === '') continue;
				const re = new RegExp('^' + pat.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
				if (re.test(page) && (!best || pat.length > best.len)) best = { id, name: p.name, len: pat.length };
			}
		}
		return best;
	};
}

/* ------------------------------------------------------------------ */
/* Markdown                                                            */
/* ------------------------------------------------------------------ */

function md(text) {
	return String(text)
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/[\\`*_[\]|]/g, '\\$&')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\{/g, '&#123;')
		.replace(/\}/g, '&#125;');
}

function code(text) {
	const s = String(text).replace(/\|/g, '\\|');
	return s.includes('`') ? `\`\` ${s} \`\`` : `\`${s}\``;
}

function sentence(text) {
	const s = md(text);
	return s === '' || /[.!?]$/.test(s) ? s : `${s}.`;
}

function typeHint(schema) {
	if (!(schema instanceof PArr)) return '';
	const t = schema.get('type');
	const en = schema.get('enum');
	if (en instanceof PArr) return en.values().map((v) => toStr(v)).join(' | ');
	if (t === 'array') {
		const items = schema.get('items');
		const it = items instanceof PArr ? items.get('type') : null;
		return it ? `array of ${it}` : 'array';
	}
	return isStr(t) ? t : '';
}

function bodyHint(body) {
	if (!(body instanceof PArr)) return '';
	const parts = [];
	const required = body.get('required') instanceof PArr ? body.get('required').values() : [];
	const props = body.get('properties');
	if (props instanceof PArr && props.size > 0) {
		const fields = props.entries().map(([name, s]) => {
			const t = typeHint(s);
			const req = required.includes(name) ? ', required' : '';
			return `${code(name)}${t || req ? ` (${md(t)}${req})` : ''}`;
		});
		parts.push(`Body: ${fields.join(', ')}.`);
	}
	const descr = body.get('description');
	if (isStr(descr) && descr.trim() !== '') parts.push(`Body: ${sentence(descr)}`);
	return parts.join(' ');
}

function queryHint(query) {
	if (!(query instanceof PArr) || query.size === 0) return '';
	return 'Query: ' + query.entries().map(([name, d]) => `${code(name)}${isStr(d) && d ? ` (${md(d)})` : ''}`).join(', ') + '.';
}

function render(data) {
	const { routes, areas, privName, level, capabilities, pages } = data;
	const L = [];
	L.push('---');
	L.push('title: REST API reference');
	L.push('description: Every endpoint of the FreeSense REST API v1, grouped by permission area, with the scope and privilege each one needs.');
	L.push('---');
	L.push('');
	L.push('<!-- Generated from freesense src/etc/inc/restapi/ (routes_*.inc, areas.inc) by scripts/generate-api-reference.mjs; do not edit by hand. -->');
	L.push('');
	L.push(':::note[Generated page]');
	L.push('Generated from freesense `src/etc/inc/restapi/`; do not edit by hand. Regenerate it with `node scripts/generate-api-reference.mjs <freesense checkout>`.');
	L.push(':::');
	L.push('');
	L.push(`This reference lists the ${routes.length} endpoints of the base system's REST API` +
		(level !== null ? ` (API level ${level})` : '') + '. All paths are below `https://<firewall>/api`. ' +
		'Optional packages can add further endpoints; those are listed in the firewall\'s own OpenAPI document ' +
		'(`GET /api/v1/openapi.json`) and in the API Explorer, not here.');
	L.push('');
	L.push('How to read the tables:');
	L.push('');
	L.push('- **Scope** is the permission the endpoint needs, `<area>:read` or `<area>:write`. A write scope includes read.');
	L.push('- **Access** names the WebUI page that grants the scope: a user who may open that page may call the endpoint. ' +
		'The `REST API - <area>` privileges listed under each area grant the same scope without any WebUI access. ' +
		'An API key limited to scopes must also include the scope.');
	L.push('- Write endpoints are refused for read-only keys and for users with the "User - Config: Deny Config Write" privilege.');
	L.push('- Path parameters are shown in braces, for example `{name}`. "Body" and "Query" summarize what the endpoint accepts, ' +
		'as declared in the route table.');
	L.push('');
	L.push('See [REST API overview](/api/overview/) for authentication, errors and staging, and ' +
		'[Getting started with the REST API](/api/getting-started/) for worked examples.');
	if (capabilities.length) {
		L.push('');
		L.push(`Capabilities reported by \`GET /api/v1/meta\`: ${capabilities.map((c) => code(c)).join(', ')}.`);
	}

	const groups = [['', 'Any authenticated key']].concat(areas.map(([k, v]) => [String(k), toStr(v)]));
	const known = new Set(groups.map(([k]) => k));
	for (const r of routes) {
		if (!known.has(r.area)) { groups.push([r.area, r.area]); known.add(r.area); }
	}
	L.push('');
	L.push('## Areas');
	L.push('');
	L.push('| Area | Covers | Endpoints |');
	L.push('| --- | --- | --- |');
	for (const [area, label] of groups) {
		const n = routes.filter((r) => r.area === area).length;
		if (n === 0) continue;
		L.push(`| ${area === '' ? '(none)' : code(area)} | ${md(label)} | ${n} |`);
	}

	for (const [area, label] of groups) {
		const list = routes.filter((r) => r.area === area);
		if (list.length === 0) continue;
		L.push('');
		if (area === '') {
			L.push('## General endpoints');
			L.push('');
			L.push('These endpoints belong to no permission area: any valid API key of a user with REST API access may call them.');
		} else {
			L.push(`## ${md(label.replace(/\s*\(.*\)$/, ''))} (\`${area}\`)`);
			L.push('');
			L.push(`${md(label)}.`);
			L.push('');
			L.push(`API-only privileges: "REST API - ${md(label)}: read" (${code(privName(area, 'read'))}) and ` +
				`"REST API - ${md(label)}: write" (${code(privName(area, 'write'))}).`);
		}
		L.push('');
		L.push('| Endpoint | Description | Scope | Access |');
		L.push('| --- | --- | --- | --- |');
		for (const r of list) {
			const ep = `${code(r.method)} ${code('/api' + r.path)}`;
			const desc = [sentence(toStr(r.summary) === UNKNOWN ? '' : toStr(r.summary))];
			const q = queryHint(r.query);
			if (q) desc.push(q);
			const b = bodyHint(r.body);
			if (b) desc.push(b);
			if (r.safe) desc.push('Changes nothing (POST for the request body).');
			if (isStr(r.produces) && r.produces !== 'application/json') desc.push(`Returns ${code(r.produces)}.`);
			if (isStr(r.schema) && r.schema) desc.push(`Form schema: ${code(`GET /api/v1/schema/${r.schema}`)}.`);
			let access;
			if (r.page === '@authenticated') access = 'any valid key';
			else {
				const p = isStr(r.page) ? pages(r.page) : null;
				access = isStr(r.page) ? `${code(r.page)}${p ? ` (${md(p.name)})` : ''}` : '';
			}
			const scope = r.scope ? code(r.scope) : '-';
			L.push(`| ${ep} | ${desc.filter(Boolean).join(' ')} | ${scope} | ${access} |`);
		}
	}
	L.push('');
	return L.join('\n');
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

function main() {
	const args = process.argv.slice(2);
	const check = args.includes('--check');
	const positional = args.filter((a) => !a.startsWith('--'));
	const checkout = positional[0] ? path.resolve(process.cwd(), positional[0]) : path.resolve(repoRoot, '..', 'freesense-src');
	const data = loadRoutes(checkout);
	const out = render(data);
	if (check) {
		const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8').replace(/\r\n/g, '\n') : null;
		if (current !== out) {
			console.error(`${path.relative(repoRoot, OUTPUT)} is out of date (${data.routes.length} routes); ` +
				'run: node scripts/generate-api-reference.mjs <freesense checkout>');
			process.exit(1);
		}
		console.log(`${path.relative(repoRoot, OUTPUT)} is up to date (${data.routes.length} routes).`);
		return;
	}
	fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
	fs.writeFileSync(OUTPUT, out);
	console.log(`Wrote ${path.relative(repoRoot, OUTPUT)} (${data.routes.length} routes).`);
}

try {
	main();
} catch (e) {
	console.error(`generate-api-reference: ${e && e.stack ? e.stack : e}`);
	process.exit(2);
}
