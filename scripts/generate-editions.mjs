import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const sourceRoot = resolve(root, 'src/content-source');
const overridesRoot = resolve(root, 'src/content-overrides');
const outputRoot = resolve(root, 'src/content/docs');
const editions = ['stable', 'devel'];
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
      continue;
    }
    if (['.md', '.mdx'].includes(extname(entry.name))) files.push(fullPath);
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
  if (firstSegment === 'stable' || firstSegment === 'devel') return url;
  return `/${edition}${pathname}${suffix}`;
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
  return rewritten;
}

function sourceEditUrl(sourcePath) {
  const relativePath = relative(root, sourcePath).split(sep).join('/');
  return `${editBaseUrl}${relativePath}`;
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

const sourceFiles = await listSourceFiles(sourceRoot);
const docRoots = new Set(sourceFiles.map((sourceFile) => {
  const sourcePath = relative(sourceRoot, sourceFile).split(sep);
  return sourcePath.length === 1
    ? sourcePath[0].replace(/\.(md|mdx)$/, '')
    : sourcePath[0];
}));

for (const edition of editions) {
  const outputDirectory = resolve(outputRoot, edition);
  assertOutputPath(outputDirectory);
  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });

  for (const sharedSource of sourceFiles) {
    const relativePath = relative(sourceRoot, sharedSource);
    const editionOverride = resolve(overridesRoot, edition, relativePath);
    const selectedSource = existsSync(editionOverride) ? editionOverride : sharedSource;
    const target = resolve(outputDirectory, relativePath);
    assertOutputPath(target);
    await mkdir(dirname(target), { recursive: true });

    let content = await readFile(selectedSource, 'utf8');
    content = injectEditUrl(content, sourceEditUrl(selectedSource));
    content = rewriteDocumentationUrls(content, edition, docRoots);
    await writeFile(target, content, 'utf8');
  }
}

console.log(`Materialized ${sourceFiles.length} shared documentation files for ${editions.join(' and ')}.`);
