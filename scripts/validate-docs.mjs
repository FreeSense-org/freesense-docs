import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(readFileSync(resolve(root, 'public/docs-manifest.json'), 'utf8'));
const coverage = JSON.parse(readFileSync(resolve(root, 'src/data/package-coverage.json'), 'utf8'));
const editions = JSON.parse(readFileSync(resolve(root, 'src/data/editions.json'), 'utf8'));
const catalogPath = process.argv[2] ?? resolve(root, '../freesense-src/src/etc/freesense-package-catalog.json');
const osBaseRoot = resolve(process.argv[3] ?? resolve(root, '../freesense-os-base'));
const sourceRoot = resolve(root, 'src/content-source');

if (manifest.schema_version !== 1 || !manifest.channels?.devel || !manifest.channels?.stable) {
	throw new Error('docs manifest must declare Development and Stable channels');
}
if (editions.schema_version !== 1 || !editions.stable || !editions.devel) {
	throw new Error('edition registry must declare Stable and Development editions');
}
if (!/^1\.0\.\d+$/.test(editions.stable.release) || editions.stable.lifecycle !== 'supported') {
	throw new Error('Stable edition must identify a supported 1.0.x release');
}
if (editions.devel.release !== '1.1.0' || editions.devel.lifecycle !== 'experimental') {
	throw new Error('Development edition must identify the experimental 1.1.0 train');
}
const releasesDirectory = resolve(osBaseRoot, 'config/releases');
const stableLocks = readdirSync(releasesDirectory)
	.filter((file) => /^1\.0\.\d+\.json$/.test(file))
	.map((file) => JSON.parse(readFileSync(resolve(releasesDirectory, file), 'utf8')))
	.filter((release) => release.sealed === true)
	.sort((left, right) => right.release.localeCompare(left.release, undefined, { numeric: true }));
const latestStable = stableLocks[0];
if (!latestStable) throw new Error('no sealed Stable release lock is available for edition validation');
if (editions.stable.release !== latestStable.release) {
	throw new Error(`Stable docs identify ${editions.stable.release}, but latest sealed release is ${latestStable.release}`);
}
for (const field of ['source_sha', 'packages_sha']) {
	if (editions.stable[field] !== latestStable[field]) {
		throw new Error(`Stable docs ${field} does not match release ${latestStable.release}`);
	}
}
const buildPolicy = JSON.parse(readFileSync(resolve(osBaseRoot, 'config/build-policy.json'), 'utf8'));
if (editions.devel.release !== buildPolicy.release.development_version ||
	editions.devel.label !== `${buildPolicy.release.development_train} Development`) {
	throw new Error('Development docs edition does not match the current build policy');
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
console.log(`Docs validation passed: ${Object.keys(catalog).length} published packages covered across ${editions.stable.label} and ${editions.devel.label}.`);
