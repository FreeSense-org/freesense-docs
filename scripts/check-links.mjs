// Checks every root-relative link in the built site (dist/) resolves to a
// generated page, a static file, or a documented redirect in public/_redirects.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, process.argv[2] ?? 'dist');
if (!existsSync(dist)) throw new Error(`build output not found: ${dist} (run npm run build first)`);

const redirects = readFileSync(resolve(root, 'public/_redirects'), 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split(/\s+/)[0]);
const redirected = (path) => redirects.some((source) => source.endsWith('*')
  ? path.startsWith(source.slice(0, -1))
  : path === source || `${path}/` === source);

const walk = (directory) => readdirSync(directory).flatMap((name) => {
  const fullPath = join(directory, name);
  return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
});

const exists = (path) => {
  const target = resolve(dist, `.${decodeURIComponent(path)}`);
  if (!target.startsWith(dist)) return false;
  if (existsSync(target) && statSync(target).isFile()) return true;
  return existsSync(join(target, 'index.html'));
};

const broken = [];
let checked = 0;
for (const file of walk(dist).filter((path) => path.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  for (const [, url] of html.matchAll(/\s(?:href|src)="(\/[^"#?]*)[^"]*"/g)) {
    if (url.startsWith('//')) continue;
    checked += 1;
    if (!exists(url) && !redirected(url)) {
      broken.push(`${relative(dist, file).split(sep).join('/')}: ${url}`);
    }
  }
}

if (broken.length) {
  console.error(`${broken.length} broken internal link(s):`);
  for (const line of [...new Set(broken)].sort()) console.error(`  ${line}`);
  process.exit(1);
}
console.log(`Internal links valid: ${checked} links checked.`);
