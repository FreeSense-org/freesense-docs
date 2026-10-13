// Rejects version wording in the maintained editions that disagrees with
// src/data/editions.json. The frozen snapshot is exempt: it describes its own era.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const editions = JSON.parse(readFileSync(resolve(root, 'src/data/editions.json'), 'utf8'));
const stable = editions.stable.train;
const devel = editions.devel.train;
const frozen = editions.frozen.train;

const walk = (directory) => readdirSync(directory).flatMap((name) => {
  const fullPath = join(directory, name);
  return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
});
const files = ['src/content-source', 'src/content-overrides']
  .flatMap((directory) => walk(resolve(root, directory)))
  .filter((path) => /\.(md|mdx)$/.test(path));

const rules = [
  {
    pattern: /\bStable (\d+\.\d+)(?!\.\d)/g,
    valid: ([, train]) => train === stable || train === frozen,
    reason: `Stable is ${stable} (or the frozen ${frozen})`,
  },
  {
    pattern: /\b(\d+\.\d+) Stable\b/g,
    valid: ([, train]) => train === stable || train === frozen,
    reason: `Stable is ${stable} (or the frozen ${frozen})`,
  },
  {
    pattern: /\bDevelopment (\d+\.\d+)(?!\.\d)/g,
    valid: ([, train]) => train === devel,
    reason: `Development is ${devel}`,
  },
  {
    pattern: /\b(\d+\.\d+) Development\b/g,
    valid: ([, train]) => train === devel,
    reason: `Development is ${devel}`,
  },
  {
    pattern: /(?:\]\(|href=["'])\/(\d+\.\d+)\//g,
    valid: ([, prefix]) => [devel, frozen].includes(prefix),
    reason: `edition links use /${devel}/ or /${frozen}/`,
  },
  {
    pattern: /\bCandidate\b/g,
    valid: () => false,
    reason: 'the Candidate channel is retired',
  },
];

const problems = [];
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    for (const rule of rules) {
      for (const match of line.matchAll(rule.pattern)) {
        if (!rule.valid(match)) {
          problems.push(`${relative(root, file).split(sep).join('/')}:${index + 1}: "${match[0]}" (${rule.reason})`);
        }
      }
    }
  });
}

if (problems.length) {
  console.error(`${problems.length} version inconsistencies:`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(`Version wording consistent with Stable ${stable}, Development ${devel}, frozen ${frozen} (${files.length} files).`);
