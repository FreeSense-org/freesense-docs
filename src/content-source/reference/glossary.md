---
title: Glossary
description: Terms used in FreeSense configuration, package, API, and release documentation.
---

**API Explorer** - The page under **System → REST API** that lists every REST API endpoint with its
parameters and lets an authorized user try requests from the browser. See the
[API reference](/api/reference/).

**Boot environment** - On a ZFS installation, a bootable copy of the root file system. The upgrader
clones the current boot environment and upgrades the clone; earlier ones can be selected from the
loader menu or **System → Boot Environments**. After a failed 1.0 → 1.1 upgrade the pre-upgrade boot
environment is an emergency recovery point, not a supported downgrade path. See
[ZFS boot environments](/operations/zfs-boot-environments/).

**Build set** - The resolved source, ports, OS-definition, and FreeBSD revisions consumed by a build.

**Capability** - A declared package behavior with security or operational impact, such as packet
inspection or firewall modification.

**Channel** - A publication stream with its own release document and support promise: Stable (the
supported 1.1.x line) or Development (the rolling 1.2 line, experimental and unsupported).

**Custom repository** - A package repository added by the administrator under **System → Package
Manager → Repositories**. Official FreeSense repositories always take priority, and packages from a
custom repository are listed after the official ones. See
[custom repositories](/packages/custom-repositories/).

**FreeBSD pin** - The exact FreeBSD source and ports commits, with the worker inputs, that System and
Optional Packages builds use. A pin normally stays fixed for 14 days; when it changes, Optional Packages
are rebuilt. FreeSense 1.1.0 is built on a FreeBSD 16.0-CURRENT snapshot (source `a52c50b4`,
osversion 1600027). Also called the platform pin.

**Image release** - A separate publication of installer and cloud images (ISO and other disk images).
An image release requires a verified pair of a System build and an Optional Packages build, and is not
made for every package update.

**Intensive package** - A package expected to need notable CPU, memory, storage, or sustained I/O
capacity.

**Optional Packages build** - A build of the Optional Packages repository (WireGuard, Suricata, HAProxy,
and the rest of the [catalog](/packages/catalog/)). It runs when package sources or build configuration
change, or when the FreeBSD pin changes, and is published independently of System builds.

**Package catalog** - The machine-readable inventory of package integrations and their services,
capabilities, resource profiles, and WebUI destinations.

**Release lock** - The sealed file that defines a Stable release: `config/releases/<version>.json` in
the `freesense-os-base` repository. It pins the `freesense`, `freesense-system-ports`, and
`freesense-packages` commits, the FreeBSD source and ports commits, and the worker inputs. A published
Stable release is never rebuilt; a fix ships as a new patch release with a new lock. See
[release process](/guides/release-process/).

**Reserved table** - A FreeSense-owned firewall table maintained by an integration, such as CrowdSec
decisions.

**REST API** - The HTTP API of a FreeSense appliance under `/api/v1/`, configured under **System →
REST API**. Requests authenticate with a per-user API key sent as a bearer token and are limited by
that user's privileges. See the [REST API overview](/api/overview/).

**Sealed provenance** - The immutable commits recorded with a build artifact and its documentation.

**System build** - A build of the FreeSense base system packages (the core system and WebUI from
`freesense` and the system ports from `freesense-system-ports`) for one channel. A System-only change produces a System build without rebuilding
Optional Packages.

**Threat Shield** - An Optional Package that combines DNS filtering, automatic threat-feed
synchronization, and GeoIP country blocking, configured under **Services → Threat Shield**. See
[Threat Shield](/packages/threat-shield/).

**VXLAN** - Virtual Extensible LAN: an interface type that carries an Ethernet segment inside UDP
packets (port 4789 by default) between tunnel endpoints, identified by a VXLAN Network Identifier.
FreeSense supports VXLAN interfaces under **Interfaces → Assignments → VXLANs**; pfSense does not.
See [VXLAN](/configure/interfaces-vlans-bridges/#vxlan).
