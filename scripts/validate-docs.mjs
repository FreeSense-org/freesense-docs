import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const manifest = JSON.parse(readFileSync(resolve(root, 'public/docs-manifest.json'), 'utf8'));
const coverage = JSON.parse(readFileSync(resolve(root, 'src/data/package-coverage.json'), 'utf8'));
const catalogPath = process.argv[2] ?? resolve(root, '../freesense-src/src/etc/freesense-package-catalog.json');

if (manifest.schema_version !== 1 || !manifest.channels?.devel || !manifest.channels?.candidate || !manifest.channels?.stable) {
  throw new Error('docs manifest must declare devel, candidate, and stable channels');
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
  if (!existsSync(resolve(root, `src/content/docs/${guide}.md`))) {
    throw new Error(`package ${name} points to missing guide: ${guide}`);
  }
}
for (const name of Object.keys(documented)) {
  if (!catalog[name]) throw new Error(`package coverage contains unknown package: ${name}`);
}
console.log(`Docs validation passed: ${Object.keys(catalog).length} published packages covered.`);
