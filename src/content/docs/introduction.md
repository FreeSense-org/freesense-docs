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

Every release pins an exact **FreeBSD 16** source snapshot and a frozen set of upstream package
sources, so builds are reproducible and never drift out from under you. The world, kernel and 570+
packages are compiled from source on automated CI runners — with dedicated FreeBSD hardware for
larger releases — then cryptographically **signed** with the project key.

Signed packages publish to `pkg.freesense.org` and installer images to `downloads.freesense.org`,
both served over a global CDN. Installed systems fetch updates over the air, verified against the
project fingerprint — no phone-home and no accounts.

## Release channels

FreeSense offers two channels so you can balance stability against freshness:

- **Stable** — tested release builds, recommended for production.
- **Development** — bleeding-edge snapshots that track the latest FreeBSD and features.

See [Updates & release channels](/guides/updates-and-channels/) for how updates are delivered and
how to switch.

## Next steps

- [Install FreeSense](/getting-started/installation/)
- [First boot & setup](/getting-started/first-boot/)
- [Download an image](https://freesense.org/download)
