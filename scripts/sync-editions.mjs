import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const osBaseRoot = resolve(process.argv[2] ?? '../freesense-os-base');
const editionsPath = resolve(root, 'src/data/editions.json');
const releaseDirectory = resolve(osBaseRoot, 'config/releases');
const policyPath = resolve(osBaseRoot, 'config/build-policy.json');

const versionValue = (version) => version.split('.').map((part) => Number.parseInt(part, 10));
const compareVersions = (left, right) => {
  const leftParts = versionValue(left);
  const rightParts = versionValue(right);
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
};

const releaseFiles = (await readdir(releaseDirectory))
  .filter((file) => /^1\.0\.\d+\.json$/.test(file));
const releases = await Promise.all(releaseFiles.map(async (file) =>
  JSON.parse(await readFile(resolve(releaseDirectory, file), 'utf8')),
));
const stable = releases
  .filter((release) => release.sealed === true)
  .sort((left, right) => compareVersions(right.release, left.release))[0];

if (!stable) throw new Error(`no sealed 1.0.x release lock found in ${releaseDirectory}`);

const policy = JSON.parse(await readFile(policyPath, 'utf8'));
const editions = JSON.parse(await readFile(editionsPath, 'utf8'));
editions.stable = {
  ...editions.stable,
  label: `${stable.release} Stable`,
  route_prefix: '/stable',
  release: stable.release,
  lifecycle: policy.release.stable_lifecycle,
  source_sha: stable.source_sha,
  system_ports_sha: stable.system_ports_sha,
  packages_sha: stable.packages_sha,
  freebsd_source_sha: stable.freebsd_source_sha,
  freebsd_ports_sha: stable.freebsd_ports_sha,
};
editions.devel = {
  ...editions.devel,
  label: `${policy.release.development_train} Development`,
  route_prefix: '/devel',
  release: policy.release.development_version,
  lifecycle: policy.release.development_lifecycle,
};

await writeFile(editionsPath, `${JSON.stringify(editions, null, 2)}\n`, 'utf8');
console.log(`Synced ${editions.stable.label} and ${editions.devel.label} from FreeSense release policy.`);
