import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { navigation } from '../src/data/navigation.mjs';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(readFileSync(resolve(root, 'public/docs-manifest.json'), 'utf8'));
const coverage = JSON.parse(readFileSync(resolve(root, 'src/data/package-coverage.json'), 'utf8'));
const editions = JSON.parse(readFileSync(resolve(root, 'src/data/editions.json'), 'utf8'));
const catalogPath = process.argv[2] ?? resolve(root, '../freesense-src/src/etc/freesense-package-catalog.json');
const osBaseRoot = resolve(process.argv[3] ?? resolve(root, '../freesense-os-base'));
const sourceRoot = resolve(root, 'src/content-source');

const buildPolicy = JSON.parse(readFileSync(resolve(osBaseRoot, 'config/build-policy.json'), 'utf8'));
const { stable_train: stableTrain, development_train: developmentTrain } = buildPolicy.release;
const trainPattern = (train) => new RegExp(`^${train.replaceAll('.', '\\.')}\\.\\d+$`);

if (manifest.schema_version !== 1 || !manifest.channels?.devel || !manifest.channels?.stable || !manifest.channels?.frozen) {
	throw new Error('docs manifest must declare the Stable, Development, and frozen channels');
}
if (manifest.channels.candidate) throw new Error('docs manifest must not declare the retired Candidate channel');
if (editions.schema_version !== 2 || !editions.stable || !editions.devel || !editions.frozen) {
	throw new Error('edition registry must declare Stable, Development, and frozen editions');
}
if (editions.stable.train !== stableTrain || !trainPattern(stableTrain).test(editions.stable.release) ||
	editions.stable.lifecycle !== 'supported') {
	throw new Error(`Stable edition must identify a supported ${stableTrain}.x release`);
}
if (editions.devel.release !== buildPolicy.release.development_version || editions.devel.train !== developmentTrain ||
	editions.devel.label !== `${developmentTrain} Development` || editions.devel.lifecycle !== 'experimental') {
	throw new Error('Development docs edition does not match the current build policy');
}
if (editions.frozen.lifecycle !== 'frozen' || editions.frozen.train === stableTrain) {
	throw new Error('the frozen edition must be an earlier, frozen Stable train');
}
const expectedRoutes = { stable: '', devel: `/${developmentTrain}`, frozen: `/${editions.frozen.train}` };
for (const [edition, route] of Object.entries(expectedRoutes)) {
	if (editions[edition].route_prefix !== route) {
		throw new Error(`${edition} edition must be served at '${route || '/'}', not '${editions[edition].route_prefix}'`);
	}
	if (manifest.channels[edition].path !== `${route}/`) {
		throw new Error(`docs manifest ${edition} path must be ${route}/`);
	}
	const entry = `src/content/docs${route}/index.mdx`;
	if (!existsSync(resolve(root, entry))) throw new Error(`generated edition entry is missing: ${entry}`);
}
const releasesDirectory = resolve(osBaseRoot, 'config/releases');
const sealedLocks = (train) => readdirSync(releasesDirectory)
	.filter((file) => trainPattern(train).test(file.replace(/\.json$/, '')))
	.map((file) => JSON.parse(readFileSync(resolve(releasesDirectory, file), 'utf8')))
	.filter((release) => release.sealed === true)
	.sort((left, right) => right.release.localeCompare(left.release, undefined, { numeric: true }));
for (const edition of ['stable', 'frozen']) {
	const latest = sealedLocks(editions[edition].train)[0];
	if (!latest) throw new Error(`no sealed ${editions[edition].train}.x release lock is available for edition validation`);
	if (editions[edition].release !== latest.release) {
		throw new Error(`${edition} docs identify ${editions[edition].release}, but the latest sealed release is ${latest.release}`);
	}
	for (const field of ['source_sha', 'packages_sha', 'system_ports_sha']) {
		if (editions[edition][field] !== latest[field]) {
			throw new Error(`${edition} docs ${field} does not match release ${latest.release}`);
		}
	}
}
// Every release-notes page must be in the sidebar, or readers can't find it.
const navigationSlugs = new Set();
const collectSlugs = (items) => {
	for (const item of items) {
		if (Array.isArray(item)) navigationSlugs.add(item[1]);
		else collectSlugs(item.items ?? []);
	}
};
collectSlugs(navigation);
for (const file of readdirSync(resolve(sourceRoot, 'releases'))) {
	if (!/^\d+\.\d+\.\d+\.mdx?$/.test(file)) continue;
	const slug = `releases/${file.replace(/\.mdx?$/, '')}`;
	if (!navigationSlugs.has(slug)) throw new Error(`${slug} has no sidebar entry in src/data/navigation.mjs`);
}
for (const field of manifest.documentation_contract ?? []) {
  if (!['source', 'ports', 'os_definition', 'freebsd'].includes(field)) {
    throw new Error(`unknown documentation contract field: ${field}`);
  }
}
if (!existsSync(catalogPath)) {
  console.log(`Docs metadata valid; package catalog not available at ${catalogPath}`);
  process.exit(0);
}
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8')).packages;
const documented = coverage.packages;
for (const name of Object.keys(catalog)) {
  const guide = documented[name];
  if (!guide) throw new Error(`published package lacks documentation coverage: ${name}`);
  if (!existsSync(resolve(sourceRoot, `${guide}.md`))) {
    throw new Error(`package ${name} points to missing guide: ${guide}`);
  }
}
for (const name of Object.keys(documented)) {
  if (!catalog[name]) throw new Error(`package coverage contains unknown package: ${name}`);
}
console.log(`Docs validation passed: ${Object.keys(catalog).length} published packages covered across ${editions.stable.label} and ${editions.devel.label}; ${editions.frozen.label} is frozen.`);
