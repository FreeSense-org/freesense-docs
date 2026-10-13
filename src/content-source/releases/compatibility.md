---
title: Version compatibility
description: Which FreeSense versions, channels, architectures, and documentation editions belong together, and where WebUI help links lead.
---

## Versions, channels, and documentation

| Version | Channel | Status | Architectures | Documentation |
| --- | --- | --- | --- | --- |
| **1.1.x** (1.1.0 and later patches) | Stable | Supported | amd64; generic arm64 UEFI installer from 1.1.1 (1.1.0 was amd64 only) | [Stable, at the site root](/) |
| **1.2** (rolling) | Development | Experimental, unsupported | amd64, generic arm64 UEFI, Raspberry Pi previews | [Development, at /1.2/](/1.2/) |
| **1.0.x** (1.0.0 to 1.0.7) | Former Stable | Published, no longer maintained; replaced by 1.1 | amd64 | [Frozen 1.0, at /1.0/](/1.0/) |

The Stable and Development editions are rebuilt from the same documentation sources whenever the
documentation changes. The 1.0 edition is a frozen snapshot that is not updated.

## Release inputs

A published release records its immutable inputs in a sealed release lock (see
[Release process](/guides/release-process/)):

| Input | 1.1.0 | 1.0.7 |
| --- | --- | --- |
| FreeSense source | `0318257` | `2766a24` |
| System ports | `26853c0` | `56d41e2` |
| Optional packages | `ce79191` | `fe2ff95` |
| FreeBSD source | `a52c50b4` | `e004ff15` |

## Upgrade compatibility

| From | To | Allowed |
| --- | --- | --- |
| 1.0.x | 1.1 Stable | Yes, one-way |
| 1.1 Stable | 1.2 Development | Yes, one-way, unsupported |
| 1.2 Development | 1.1 Stable | No |
| 1.1 or 1.2 | 1.0 | No |

The updater offers only channels whose release is the same as or newer than the running release.
On ZFS, the pre-upgrade boot environment is an emergency recovery point right after a failed upgrade,
not a supported downgrade path. See [Updates and release channels](/guides/updates-and-channels/).

The System and optional-package repositories are separate, but each channel always publishes a
compatible, verified pair. Optional packages are reused across System updates while their sources
and the pinned FreeBSD platform stay the same. Optional packages are built per package train
(`1.1`, `1.2`), so a 1.1 system installs packages from the 1.1 train.

## WebUI help links

The **Help** link on WebUI pages opens the documentation page for that screen. Which edition it
opens depends on the version of the firewall:

| Firewall version | Help links open |
| --- | --- |
| 1.0.x | The site root, which is now the Stable 1.1 documentation. Use the version menu or [/1.0/](/1.0/) for the frozen 1.0 pages. |
| 1.1.x | `/1.1/…` addresses, which redirect to the matching Stable page at the site root |
| 1.2 Development | `/1.2/…` |

The documentation keeps a [version chooser](/help/) for older bookmarks.

## Documentation rules

When behavior differs between lines, the Development edition carries its own complete version of
the page. A page must not describe channel selection as a safe downgrade, and a package guide must
not claim support for an untested version or for experimental Development.
