---
title: Updates & release channels
description: How FreeSense delivers signed updates and how to choose a release channel.
---

FreeSense updates are package-based. You do not reinstall for a routine update: the system upgrades
in place from the official signed repository through **System → Update**.

The operating system is delivered as core packages for the base system, kernel, and supporting
components. Add-on packages use the same signed repository mechanism. Packages that fail fingerprint
verification are rejected.

## Release channels

| Channel | Intended use | Tracks |
| --- | --- | --- |
| **Stable** | Production and normal use | Not available while FreeSense uses FreeBSD 16-CURRENT |
| **Candidate** | Preview testing | Current RC Preview build |
| **Development** | Early testing | Current FreeBSD and feature development |

FreeSense does not currently offer a production-supported Stable build. Candidate contains the
**1.0.0 RC Preview**, based on the unsupported FreeBSD 16-CURRENT development branch, and must only
be used on non-critical systems. Development is for contributors and earlier testing.

## Switching channels

Select a channel on **System → Update → Update Settings**, save, and check for updates. Selecting
Candidate is clearly marked as pre-release software and is intended only for non-critical testing.

Downgrading through the updater is not supported. On compatible ZFS installations, updates are
prepared in a new [boot environment](/operations/zfs-boot-environments/) and a failed first boot can
automatically return to the previous complete system state. UFS recovery may require a reinstall
followed by restoration of a known-good configuration.

## Cadence and artifact policy

Preview candidates are published only after the release checklist passes. They cannot be promoted
to Stable while their FreeBSD base lacks an upstream-supported release branch. The planned monthly
Stable train begins after FreeSense moves to a supported FreeBSD base. Development packages follow
current project snapshots, while installer images are produced when content and cadence require one.

Stable and Candidate artifacts are immutable. Promotion reuses the exact signed packages and ISO
that passed testing rather than rebuilding from source. Installer images are for fresh installations;
installed systems should normally remain current through package updates.
