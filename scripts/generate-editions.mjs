import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { isPublishedIn } from '../src/data/navigation.mjs';

const root = resolve(import.meta.dirname, '..');
const sourceRoot = resolve(root, 'src/content-source');
const overridesRoot = resolve(root, 'src/content-overrides');
const frozenRoot = resolve(root, 'src/content-frozen');
const outputRoot = resolve(root, 'src/content/docs');
const registry = JSON.parse(await readFile(resolve(root, 'src/data/editions.json'), 'utf8'));
// Maintained editions are built from the shared source plus their overrides; a
// frozen edition is materialized only from its own snapshot under
// src/content-frozen/<prefix>/ and never picks up shared-source edits.
const editions = ['stable', 'devel', 'frozen'].map((name) => ({
  name,
  routePrefix: registry[name].route_prefix.replace(/^\/+/, ''),
  frozen: registry[name].lifecycle === 'frozen',
  label: registry[name].label,
}));
const editionPrefixes = new Set(editions.map((edition) => edition.routePrefix).filter(Boolean));
const editBaseUrl = 'https://github.com/FreeSense-org/freesense-docs/edit/main/';

function assertOutputPath(target) {
  const expectedPrefix = `${outputRoot}${sep}`;
  if (!target.startsWith(expectedPrefix)) {
    throw new Error(`refusing to write outside generated docs output: ${target}`);
  }
}

async function listSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listSourceFiles(fullPath));
    } else if (['.md', '.mdx'].includes(extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function splitUrl(url) {
  const match = url.match(/^([^?#]*)(.*)$/);
  return { pathname: match[1], suffix: match[2] };
}

function rewriteUrl(url, edition, docRoots) {
  const { pathname, suffix } = splitUrl(url);
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  if (!firstSegment || !docRoots.has(firstSegment)) return url;
  if (editionPrefixes.has(firstSegment)) return url;
  return `${edition.routePrefix ? `/${edition.routePrefix}` : ''}${pathname}${suffix}`;
}

function rewriteDocumentationUrls(content, edition, docRoots) {
  let rewritten = content.replace(
    /\]\((\/[^\s)]+)(?=\s|\))/g,
    (match, url) => match.replace(url, rewriteUrl(url, edition, docRoots)),
  );
  rewritten = rewritten.replace(
    /href=(['"])(\/[^'"\s>]+)\1/g,
    (match, quote, url) => match.replace(url, rewriteUrl(url, edition, docRoots)),
  );
  // Starlight hero actions and other frontmatter links.
  rewritten = rewritten.replace(
    /^(\s*link:\s*)(\/\S+)$/gm,
    (match, key, url) => `${key}${rewriteUrl(url, edition, docRoots)}`,
  );
  return rewritten;
}

function rewriteEditionAssets(content, edition) {
  const assetRoot = edition.routePrefix ? '../../../assets/' : '../../assets/';
  return content.replaceAll('__ASSET_ROOT__/', assetRoot);
}

function sourceEditUrl(sourcePath) {
  const relativePath = relative(root, sourcePath).split(sep).join('/');
  return `${editBaseUrl}${relativePath}`;
}

function injectFrozenBanner(content, edition) {
  const release = edition.label.replace(/ \(frozen\)$/, '');
  const banner = `banner:\n  content: 'Frozen FreeSense ${release} documentation, no longer maintained. <a href="/">Read the current Stable documentation</a>.'\n`;
  return content.replace(/^---\r?\n/, `---\n${banner}`);
}

function injectEditUrl(content, editUrl) {
  if (/^---\r?\n/.test(content)) {
    return content.replace(/^---\r?\n/, `---\neditUrl: ${editUrl}\n`);
  }
  return `---\neditUrl: ${editUrl}\n---\n\n${content}`;
}

if (!existsSync(sourceRoot)) {
  throw new Error(`shared documentation source is missing: ${sourceRoot}`);
}

const collectDocRoots = (files, base) => new Set(files.map((sourceFile) => {
  const sourcePath = relative(base, sourceFile).split(sep);
  return sourcePath.length === 1
    ? sourcePath[0].replace(/\.(md|mdx)$/, '')
    : sourcePath[0];
}));
const sourceFiles = await listSourceFiles(sourceRoot);
const docRoots = collectDocRoots(sourceFiles, sourceRoot);
const slugOf = (relativePath) => relativePath.split(sep).join('/').replace(/\.(md|mdx)$/, '').replace(/\/index$/, '');

// The output directory is entirely generated. Remove every previous generated
// entry, while retaining its tracked .gitignore, so removed source pages cannot
// leave a competing legacy route behind.
for (const entry of await readdir(outputRoot, { withFileTypes: true })) {
  if (entry.name === '.gitignore') continue;
  const generatedTarget = resolve(outputRoot, entry.name);
  assertOutputPath(generatedTarget);
  await rm(generatedTarget, { recursive: true, force: true });
}

let written = 0;
for (const edition of editions) {
  const editionSourceRoot = edition.frozen ? resolve(frozenRoot, edition.routePrefix) : sourceRoot;
  if (edition.frozen && !existsSync(editionSourceRoot)) {
    throw new Error(`frozen edition ${edition.name} has no snapshot at ${editionSourceRoot}`);
  }
  const editionFiles = edition.frozen ? await listSourceFiles(editionSourceRoot) : sourceFiles;
  const editionRoots = edition.frozen ? collectDocRoots(editionFiles, editionSourceRoot) : docRoots;
  for (const editionSource of editionFiles) {
    const relativePath = relative(editionSourceRoot, editionSource);
    if (!edition.frozen && !isPublishedIn(slugOf(relativePath), edition.name)) continue;
    const editionOverride = resolve(overridesRoot, edition.name, relativePath);
    const selectedSource = !edition.frozen && existsSync(editionOverride) ? editionOverride : editionSource;
    const target = resolve(outputRoot, edition.routePrefix, relativePath);
    assertOutputPath(target);
    await mkdir(dirname(target), { recursive: true });

    let content = await readFile(selectedSource, 'utf8');
    content = injectEditUrl(content, sourceEditUrl(selectedSource));
    if (edition.frozen) content = injectFrozenBanner(content, edition);
    content = rewriteDocumentationUrls(content, edition, editionRoots);
    content = rewriteEditionAssets(content, edition);
    await writeFile(target, content, 'utf8');
    written += 1;
  }
}

console.log(`Materialized ${written} documentation files for ${editions.map((edition) => `/${edition.routePrefix}`).join(', ')}.`);
