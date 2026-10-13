---
title: Development channel
description: The experimental, unsupported FreeSense 1.2 Development line, rebuilt nightly, including the arm64 and Raspberry Pi previews.
---

:::danger[Experimental, no support]
Development 1.2 is experimental. It is intended for contributors, integration testing, and
disposable lab systems only, and receives no support.
:::

Development is the rolling **1.2** line that will become the next Stable release. It follows current
work and can contain feature changes, short artifact retention, and defects that need a reinstall
to recover from. A build that passed its signature, integrity, and boot checks is the artifact the
project produced; that does not make it a supported release.

## How Development is built

- The Development cycle is scheduled daily at **01:00 UTC**. GitHub can start scheduled runs later.
- The System and optional-package repositories have independent fingerprints. A System-only change
  does not rebuild optional packages; they rebuild when their sources or build configuration change,
  or when the pinned FreeBSD platform changes.
- Installed Development systems receive System and package updates from each successful cycle.
  Installer and disk images, and the download page entry, are rebuilt only when the FreeBSD platform
  pin changes.

See [Release process](/guides/release-process/) for details.

## Architectures and previews

Development publishes:

- an amd64 installer ISO plus UFS and ZFS disks in QCOW2 and raw GPT format;
- an experimental generic **arm64 UEFI** installer image (no arm64 cloud disks);
- **Raspberry Pi** appliance images (preview). See
  [Raspberry Pi appliances](/1.2/getting-started/raspberry-pi/).

The Raspberry Pi images are Development-only and are not part of the 1.1 Stable line. Generic
arm64 (UEFI) is also on Stable, starting with [1.1.1](/releases/1.1.1/).

Package availability is defined by the [curated catalog](/packages/catalog/), not by a generic
FreeBSD repository. Some optional packages are not built for arm64.

## Before you test

1. Export the configuration from **Diagnostics → Backup & Restore**.
2. Keep a Stable installer, so the system can be reinstalled if needed.
3. Read [Updates and release channels](/guides/updates-and-channels/).

Moving from Stable 1.1 to Development 1.2 is one-way: the updater never offers Stable again on a
Development system. Returning to Stable means reinstalling from a Stable installer and restoring a
configuration backup.

The exact current build is shown in the live Development release document,
`https://pkg.freesense.org/v1/releases/devel.json`, and in the provenance attached to its images.
