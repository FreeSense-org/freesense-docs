---
title: Release process
description: How FreeSense builds, verifies, versions, and publishes System updates, optional packages, and installer and cloud images for the Stable 1.1 and Development 1.2 lines.
---

FreeSense has two active release lines with different promises:

| Line | Purpose | Support policy |
| --- | --- | --- |
| **Stable 1.1.x** | Production and normal use | Supported; changes only through tagged patch releases such as `1.1.9` |
| **Development 1.2** | Integration testing, contributors, disposable labs | **Experimental; no support** |

## Versions, branches, and tags

| Line | Version on the system | Release name | Source branch | Tag |
| --- | --- | --- | --- | --- |
| Stable | `1.1.N-RELEASE` | `1.1.N` | `RELENG_1_1` | `v1.1.N` |
| Testing | `1.1.N-DEVELOPMENT` (the next patch) | none: update channel only, no images | `RELENG_1_1` | none |
| Development | `1.2.0-DEVELOPMENT` | `1.2.0-dev.YYYYMMDD.G` (source commit date, build generation) | `main` | none |

New work lands on `main` in the FreeSense repositories and ships in the nightly Development build.
Every night the `RELENG_1_1` maintenance branch is also built as the next Stable patch and published
on the **Testing** channel, so test systems can try Stable fixes before they are released.
A fix for the Stable line is then copied (cherry-picked) to the `RELENG_1_1` maintenance branch,
and only commits on that branch can become a Stable release. Every Stable release is tagged
`v1.1.N` in all four build repositories; tags are never moved.

A Stable version number is used exactly once. A release that is cancelled or found broken is
marked withdrawn (`config/releases/withdrawn.json` in `freesense-os-base`) and the fix ships as the
next number. Stable patches are cut for security fixes, broken updates or regressions, or a
reviewed batch of fixes, and at least 24 hours apart unless a security or broken-update fix needs
to go out sooner.

FreeSense 1.1.0 replaced 1.0.x as the Stable line. The 1.0.x releases remain published and
auditable, but ordinary fixes are not backported to them. The frozen 1.0 documentation is at
[/1.0/](/1.0/).

Three kinds of output are published, and each has its own trigger:

| Output | What it contains | Who receives it |
| --- | --- | --- |
| **System** | Kernel, world, base packages, WebUI, updater | Installed firewalls through **System → Update** |
| **Optional Packages** | The curated optional package repository for a package train | Installed firewalls through **System → Package Manager** |
| **Installer and cloud images** | ISO and UFS/ZFS disk images built from one System and Optional Packages pair | New installations, through the download page |

## Release locks

Every Stable release is defined by a sealed release lock in the `freesense-os-base` repository at
`config/releases/<version>.json`. The lock records the exact inputs:

| Field | Meaning |
| --- | --- |
| `source_sha` | FreeSense base source commit |
| `system_ports_sha` | System ports commit |
| `packages_sha` | Optional packages commit |
| `freebsd_source_sha`, `freebsd_ports_sha` | Pinned FreeBSD source and ports commits |
| `freebsd_osversion` | FreeBSD `osversion` of the pinned platform |
| `package_train` | Package train, for example `1.1` |
| `sealed` | `true` once the release is final |
| `notes` | Hand-written release notes, including the releases it supersedes |
| `soak_override` | Optional reason to publish sooner than 24 hours after the previous release |

Locks are append-only: once merged, a lock is never edited or deleted.

For 1.1.0 the lock is `config/releases/1.1.0.json`: source `0318257`, System ports `26853c0`,
optional packages `ce79191`, FreeBSD source `a52c50b4`, `osversion` 1600027, package train `1.1`.
See the [1.1.0 release notes](/releases/previous-1.1/#freesense-110).

A Stable release is published in two manual steps from its checked lock:

1. **Test build.** The System and then the Optional Packages are built from the lock into their own
   repositories. Nothing changes for installed systems. The test build is upgrade-tested from the
   current Stable release on a test system.
2. **Seal.** After a maintainer approves it, the build checks that the test build is complete, that
   its sources are on `RELENG_1_1`, and that the previous release is at least 24 hours old. It then
   signs the Stable channel into the channel manifests, tags the release, and builds and publishes
   the installer and cloud images.

Once the channel is signed, installed Stable systems can update to the release, even before the
images and the download page are updated. The Stable channel only ever moves forward.

## Independent System and Optional Packages builds

The System repository and the optional-package repository have separate immutable input
fingerprints, so a change to one does not force a rebuild of the other.

1. A component whose fingerprint was already built and published is reused, not rebuilt.
2. A System-only change rebuilds the System and reuses the current optional-package repository.
3. Optional packages rebuild when their sources or build configuration change, or when the pinned
   FreeBSD platform changes.
4. The System and optional-package repositories are verified and published together as one pair, so
   a channel never points at a half-updated set.

## The Development cycle

The Development cycle is scheduled daily at 01:00 UTC; GitHub can start scheduled runs later than
that. It freezes the current sources, computes the System and optional-package fingerprints for each
architecture (amd64 and arm64), builds only what changed, and publishes the verified repository pair
so installed Development systems can update.

Development installer and disk images, and the download page entry, are rebuilt only when the
FreeBSD platform pin changes, not every night. Rolling Development workflows never promote anything
into Stable.

## FreeBSD platform pin

The FreeBSD source, ports, build seed, worker image, and worker tools are pinned together as one
reviewed platform input. The pin normally stays fixed for 14 days. A scheduled check runs daily at
02:00 UTC and does the rollover work only near the end of the window, through one reusable pull
request. A follow-up job at 06:30 UTC cuts the frozen package mirror for a new pin. Because the
platform is part of the optional-package fingerprint, an accepted pin change triggers a new
Optional Packages build.

## Repository verification and image publication

System and optional-package repositories are signed and verified independently. Installer and cloud
images are a separate step that consumes an exact, verified System and Optional Packages pair.
Publication is ordered so a channel never advertises a partial bundle:

1. Assemble the installer and the UFS and ZFS disk images (QCOW2 and raw GPT) from the selected
   signed repositories.
2. Verify completion markers, SHA-256 checksums, sizes, and the shared bundle fingerprint.
3. Boot-test the images.
4. Upload the files to immutable paths on `downloads.freesense.org` and verify them.
5. Publish the channel's release document on `pkg.freesense.org`, for example
   `https://pkg.freesense.org/v1/releases/stable.json`. Architecture-specific documents such as
   `stable.amd64.json` exist alongside it; the unqualified document is the amd64 alias.

Stable 1.1.0 published amd64 images only. Starting with 1.1.1, Stable also publishes arm64: System
and Optional Packages for aarch64 and the generic arm64 UEFI installer image, but no arm64 cloud
images and no Raspberry Pi images. The amd64 and arm64 Stable chains run independently, so an arm64
failure never holds back amd64. Development publishes amd64, generic arm64 UEFI,
and Raspberry Pi appliance images.

The website keeps no release number in its source. It reads the channel documents when a page is
requested, so Stable and Development are published independently without rebuilding the website.

## Upgrade boundaries

- 1.0.x → 1.1 is a one-way upgrade. See [Upgrading from 1.0](/guides/upgrading-from-1.0/).
- Stable 1.1 → Development 1.2 is allowed but one-way. Development → Stable is not offered.
- The updater never offers a channel whose release is older than the running system.

See [Updates and release channels](/guides/updates-and-channels/) for the recovery rules.

Report security issues privately through GitHub private vulnerability reporting, not in a public
issue.
