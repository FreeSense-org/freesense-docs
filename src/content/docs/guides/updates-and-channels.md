---
title: Updates & release channels
description: How FreeSense delivers updates as signed packages, and how to choose a release channel.
---

FreeSense updates are **package-based**, not image-based. You do not reinstall to update — the system
upgrades in place from the official signed repository.

## How updates work

The OS itself is a set of core packages (base system, kernel, and supporting pieces). Updating runs
`pkg upgrade` against `pkg.freesense.org` from the GUI:

**System → Update**

The same mechanism keeps add-on [packages](/packages/installing-packages/) current. Everything is
delivered through one unified, cryptographically signed package path.

:::note[Signed packages]
FreeSense's official repository is signed with the project's key, and the matching public key ships
in the OS. Packages that fail signature verification are rejected.
:::

## Release channels

There are two channels:

| Channel | For | Tracks |
| --- | --- | --- |
| **Stable** | Production | Tested release builds |
| **Development** | Testing / early access | Latest FreeBSD & features |

Choose the channel that fits the machine. Production firewalls should stay on **Stable**;
**Development** is for trying new things and helping test.

## Switching channels

Select the channel on the **System → Update → Update Settings** page, then check for updates. The box
will repoint at the chosen channel's repository and offer the packages available there.

## Update cadence

Package and security updates are published **continuously** — as upstream fixes land and FreeSense
packages are rebuilt, your firewall picks them up over the air from **System → Update**. Fresh,
signed **installer images** are rebuilt on a roughly **14-day cadence**, so a new install always
starts from a current FreeBSD 16 base rather than an old snapshot.

## ISOs vs updates

Installer images (ISOs) are for **fresh installs** only. Once installed, stay current with package
updates rather than re-imaging. Major FreeBSD version jumps may occasionally call for a reinstall —
this is noted in release announcements when it applies.
