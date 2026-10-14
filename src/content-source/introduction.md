---
title: Introduction
description: What FreeSense is, where it comes from, and how it is built.
---

**FreeSense** is a free and open-source firewall and router operating system. It provides a complete
web-managed firewall (rules, NAT, VPNs, DHCP, DNS, traffic shaping, monitoring, a REST API, and a
package manager) on a pinned **FreeBSD 16** base. FreeSense has a single edition: every feature is
in the same free build.

![The FreeSense dashboard with system information, interfaces, gateways and traffic graphs](__ASSET_ROOT__/screenshots/getting-started/dashboard.png)

## Open from top to bottom

FreeSense is a fully open derivative of **pfSense® CE**, itself derived from **m0n0wall** and built
on **FreeBSD**. Everything is public and Apache-2.0 licensed:

- the base operating system and web GUI;
- the package recipes; and
- the entire build pipeline.

You can build the whole system yourself from source or run the official signed installer and cloud
images. There is no proprietary core and no vendor lock-in.

:::note[Independent project]
FreeSense is an independent community project and is not affiliated with or endorsed by the pfSense
project. *pfSense* and *FreeBSD* are trademarks of their respective owners.
:::

## How it is built

Every release pins exact **source**, **ports**, **OS-definition**, and **FreeBSD** revisions plus a
frozen set of upstream package sources. The world, kernel, and curated package catalog are built
from that sealed definition and cryptographically **signed** with the project key.

Signed packages publish to `pkg.freesense.org`; installer media and preinstalled UFS and ZFS cloud
disks publish to `downloads.freesense.org`. Both are served over a global CDN. Installed systems
fetch updates over the air, verified against the project fingerprint, with no phone-home and no
accounts.

## No phone-home or project telemetry

FreeSense sends no device identifier, telemetry, configuration, or usage report to the project.
Legacy vendor registration, dashboard polling, the device identifier, and automatic cloud
configuration upload paths are removed. Download and package requests identify only as
`FreeSense/<version>`.

The updater makes unauthenticated HTTPS reads to `pkg.freesense.org` for the RSA-signed repository
manifest, update notes, repository metadata, and packages. It does not contact the marketing
website for updates. Network services and optional packages you enable may contact the upstream
services you configure; those are functional connections, not FreeSense project telemetry.

## Release channels

FreeSense uses two active channels:

- **Stable 1.1.x**: supported production releases built from sealed release locks. Necessary fixes
  are published as tagged patch releases such as `1.1.1`. FreeSense 1.1.0 replaced the 1.0.x line,
  which stays published but no longer receives routine fixes.
- **Development 1.2**: the rolling line for the next release, rebuilt nightly for contributors and
  labs. Development receives **no support** and is not intended for production.

Stable is published for amd64 and, starting with [1.1.1](/releases/1.1.1/), for generic arm64
(UEFI installer image); 1.1.0 itself was amd64 only. The Raspberry Pi appliance images are
available on Development only.

System updates and optional packages have independent build fingerprints. A System-only change does
not rebuild optional packages; they rebuild when package sources or the pinned FreeBSD platform
change. Installer images publish to `downloads.freesense.org`, while the small independent Stable
and Development channel documents publish to `pkg.freesense.org` and are read live by the website.

See [What's new in FreeSense 1.1](/releases/whats-new-1.1/) for the current release and
[Updates & release channels](/guides/updates-and-channels/) for the one-way upgrade rules.

## Next steps

- [Install FreeSense](/getting-started/installation/)
- [Upgrade from 1.0](/guides/upgrading-from-1.0/)
- [Deploy a cloud image](/getting-started/cloud-images/)
- [First boot & setup](/getting-started/first-boot/)
- [Download an image](https://freesense.org/download)
