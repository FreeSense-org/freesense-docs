---
title: Introduction
description: What FreeSense is, where it comes from, and how it is built.
---

**FreeSense** is a free and open-source firewall and router operating system. It provides a complete
web-managed firewall — rules, NAT, VPNs, DHCP, DNS, traffic shaping, monitoring, and a package
manager — on a pinned **FreeBSD 16** base.

## Open from top to bottom

FreeSense is a fully open derivative of **pfSense® CE**, itself derived from **m0n0wall** and built
on **FreeBSD**. Everything is public and Apache-2.0 licensed:

- the base operating system and web GUI;
- the package recipes; and
- the entire build pipeline.

You can build the whole system yourself from source or run the official signed images. There is no
proprietary core and no vendor lock-in.

:::note[Independent project]
FreeSense is an independent community project and is not affiliated with or endorsed by the pfSense
project. *pfSense* and *FreeBSD* are trademarks of their respective owners.
:::

## How it is built

Every release pins exact **source**, **ports**, **OS-definition**, and **FreeBSD** revisions plus a
frozen set of upstream package sources. The world, kernel, and curated package catalog are built
from that sealed definition and cryptographically **signed** with the project key.

Signed packages publish to `pkg.freesense.org` and installer images to `downloads.freesense.org`,
both served over a global CDN. Installed systems fetch updates over the air, verified against the
project fingerprint — no phone-home and no accounts.

## Release channels

FreeSense uses two active channels:

- **Stable 1.0.x** — supported, immutable production releases. Routine development is frozen;
  necessary security or maintenance work is published as an explicit tagged patch such as `1.0.1`.
- **Development 1.1** — continuously integrated experimental builds for contributors and labs.
  Development receives **no support** and is not intended for production.

System updates and optional packages have independent build fingerprints. A System-only change does
not rebuild optional packages; they rebuild when package sources or the pinned FreeBSD platform
changes. Installer images publish to `downloads.freesense.org`, while the small independent Stable
and Development channel documents publish to `pkg.freesense.org` and are read live by the website.

See [Updates & release channels](/guides/updates-and-channels/) for the update and downgrade
boundaries.

## Next steps

- [Install FreeSense](/getting-started/installation/)
- [First boot & setup](/getting-started/first-boot/)
- [Download an image](https://freesense.org/download)
