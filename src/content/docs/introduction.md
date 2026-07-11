---
title: Introduction
description: What FreeSense is, where it comes from, and how it's built.
---

**FreeSense** is a free and open-source firewall and router operating system. It gives you a
complete web-managed firewall — rules, NAT, VPNs, DHCP, DNS, traffic shaping, monitoring, and a
package manager — on a hardened, up-to-date **FreeBSD 16** base with the newest kernel and drivers.

## Open from top to bottom

FreeSense is a fully open derivative of **pfSense® CE**, itself derived from **m0n0wall** and built
on **FreeBSD**. Everything is public and Apache-2.0 licensed:

- the base operating system and web GUI,
- the package recipes,
- and the entire build pipeline.

You can build the whole system yourself from source, or run the official signed images. There is no
proprietary core and no vendor lock-in.

:::note[Independent project]
FreeSense is an independent community project and is not affiliated with or endorsed by the pfSense
project. *pfSense* and *FreeBSD* are trademarks of their respective owners.
:::

## How it's built

Every release pins exact **source**, **ports**, **OS-definition**, and **FreeBSD** revisions plus a
frozen set of upstream package sources. The world, kernel, and curated package catalog are built
from that sealed definition and cryptographically **signed** with the project key.

Signed packages publish to `pkg.freesense.org` and installer images to `downloads.freesense.org`,
both served over a global CDN. Installed systems fetch updates over the air, verified against the
project fingerprint — no phone-home and no accounts.

## Release channels

FreeSense uses three explicit channels:

- **Stable** — supported artifacts promoted from an accepted candidate without recompilation.
- **Candidate** — immutable release candidates undergoing installation, upgrade, and rollback tests.
- **Development** — continuously integrated snapshots that track the latest FreeBSD and features.

See [Updates & release channels](/guides/updates-and-channels/) for how updates are delivered and
how to switch.

## Next steps

- [Install FreeSense](/getting-started/installation/)
- [First boot & setup](/getting-started/first-boot/)
- [Download an image](https://freesense.org/download)
