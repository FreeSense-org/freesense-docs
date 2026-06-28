---
title: Introduction
description: What FreeSense is, where it comes from, and how it's built.
---

**FreeSense** is a free and open-source firewall and router operating system. It gives you a
complete web-managed firewall — rules, NAT, VPNs, DHCP, DNS, traffic shaping, monitoring, and a
package manager — on a hardened FreeBSD base.

## Open from top to bottom

FreeSense is a fully open derivative of **pfSense® CE**, itself derived from **m0n0wall** and built
on **FreeBSD**. Everything is public and Apache-2.0 licensed:

- the base operating system and web GUI,
- the package recipes,
- and the entire build pipeline.

You can build the whole system yourself from source, or run the official signed images. There is no
proprietary core and no vendor lock-in.

:::note[Not affiliated with Netgate]
FreeSense is an independent community project. It is **not** affiliated with, sponsored by, or
endorsed by Netgate or the pfSense project. *pfSense* is a registered trademark of Netgate.
:::

## How it's built

The OS is rebuilt automatically from upstream FreeBSD sources plus a small overlay of FreeSense
packages. Builds run on GitHub, and the resulting packages are signed and published to the official
repository at `pkg.freesense.org`. Installer images are published to `downloads.freesense.org`.

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
