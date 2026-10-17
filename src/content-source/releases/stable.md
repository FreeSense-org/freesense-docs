---
title: Stable channel
description: The supported FreeSense 1.1.x production line, its release notes, and where its release metadata is published.
---

Stable is the supported FreeSense production line. It currently tracks **1.1.x**. The first release
of the line is `1.1.0`; it replaced 1.0.x as the supported line on 2026-10-13.

Each Stable release is built from a sealed release lock that records the exact source, ports,
optional package, and FreeBSD revisions, so a published release can be audited and recreated (see
[Release process](/guides/release-process/)). Fixes are made on the `RELENG_1_1` maintenance
branch, built and upgrade-tested as a test build, and then published as patch releases such as
`1.1.9`. Every published release is tagged `v1.1.N` in the FreeSense repositories. Earlier
artifacts stay immutable, and a version number is never reused: a withdrawn release is replaced by
the next number.

## Release notes

| Release | Date | Notes |
| --- | --- | --- |
| 1.1.9 | 2026-10-17 | [Release notes](/releases/1.1.9/) · RADIUS works on PHP 8.5; boot environments of older releases locked in the WebUI; PHP 8 fixes across the WebUI and Optional Packages; serial-console installs |
| 1.1.6 to 1.1.8 | | **Withdrawn before release**, never published; included in 1.1.9 |
| 1.1.0 to 1.1.5 | 2026-10-13 to 2026-10-14 | [Previous 1.1 releases](/releases/previous-1.1/) · [What's new in 1.1](/releases/whats-new-1.1/) |

Release notes for the earlier 1.0.x line are in the [frozen 1.0 documentation](/1.0/).

To try the fixes lined up for the next patch before it is released, a test system can switch to the
**Testing** channel; see [Updates & release channels](/guides/updates-and-channels/).

## Architectures

Stable publishes **amd64** (installer ISO plus UFS and ZFS cloud disks). Starting with
[1.1.1](/releases/previous-1.1/#freesense-111), Stable also publishes **arm64**: System and Optional Packages for
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
