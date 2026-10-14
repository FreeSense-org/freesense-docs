---
title: Stable channel
description: The supported FreeSense 1.1.x production line, its release notes, and where its release metadata is published.
---

Stable is the supported FreeSense production line. It currently tracks **1.1.x**. The first release
of the line is tagged `1.1.0`; it replaced 1.0.x as the supported line on 2026-10-13.

Each Stable release is built from a sealed release lock that records the exact source, ports,
optional package, and FreeBSD revisions, so a published release can be audited and recreated (see
[Release process](/guides/release-process/)). Necessary fixes are built, tested, tagged, and
published as patch releases such as `1.1.1`. Earlier artifacts stay immutable.

## Release notes

| Release | Date | Notes |
| --- | --- | --- |
| 1.1.4 | 2026-10-14 | [Release notes](/releases/1.1.4/) · Threat Shield 1.1.0: GeoIP and DNS redirection work, IP threat lists, inbound protection, threat map |
| 1.1.3 | 2026-10-14 | [Release notes](/releases/1.1.3/) · multi-line settings keep their line breaks; Threat Shield settings and query log; no stray VLAN interfaces |
| 1.1.2 | 2026-10-14 | [Release notes](/releases/1.1.2/) · Tailscale and WireGuard keys kept out of logs and process lists |
| 1.1.1 | October 2026 | [Release notes](/releases/1.1.1/) · adds arm64 (generic UEFI installer); amd64 code unchanged from 1.1.0 |
| 1.1.0 | 2026-10-13 | [Release notes](/releases/1.1.0/) · [What's new in 1.1](/releases/whats-new-1.1/) |

Release notes for the earlier 1.0.x line are in the [frozen 1.0 documentation](/1.0/).

## Architectures

Stable publishes **amd64** (installer ISO plus UFS and ZFS cloud disks). Starting with
[1.1.1](/releases/1.1.1/), Stable also publishes **arm64**: System and Optional Packages for
aarch64 and the generic arm64 UEFI installer image. There are no arm64 cloud disks on Stable.
FreeSense 1.1.0 itself was amd64 only. The Raspberry Pi
appliance images are not part of the Stable line; they are available on
[Development](/releases/development/) only.

## Release metadata

Stable release metadata is published at `https://pkg.freesense.org/v1/releases/stable.json`. Its
installer and cloud-disk URLs point to immutable objects on `downloads.freesense.org`. The document
is updated only after every listed artifact has passed its integrity checks and boot test and is
publicly downloadable. See [Cloud images](/getting-started/cloud-images/) for file system and
format selection.

## 1.0.x and upgrades

The 1.0.x releases remain published, but ordinary fixes are no longer backported to them. A 1.0.x
firewall on the Stable channel is offered the current 1.1.x release as a system update. That upgrade is one-way; read
[Upgrading from 1.0](/guides/upgrading-from-1.0/) first.

Moving from Stable to [Development](/releases/development/) is possible but also one-way: a
Development system is never offered Stable again. Read
[Updates and release channels](/guides/updates-and-channels/) before changing channels.
