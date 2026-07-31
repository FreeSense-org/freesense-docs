---
title: Updates & release channels
description: How FreeSense delivers signed updates and how to choose between Stable 1.0.x and Development 1.1.
---

FreeSense updates are package-based. Routine updates are installed in place from official signed
repositories through **System → Update**. Repository signatures and package fingerprints are
verified before the appliance changes its package configuration or installs an update.

The update check is a public, unauthenticated HTTPS read from `pkg.freesense.org`. It fetches the
signed repository manifest, update notes, package repository metadata, and requested packages. It
does not send a device identifier, configuration, telemetry, or usage report, and it does not use
the marketing website as an update service.

## Active release channels

| Channel | Intended use | Tracks | Support |
| --- | --- | --- | --- |
| **Stable** | Production and normal use | Immutable 1.0.x releases | Supported |
| **Development** | Contributors, integration testing, and disposable labs | Rolling 1.1 builds | **Experimental; no support** |

Stable advances only through an explicit tagged patch release, such as `1.0.1`, when a necessary
maintenance or security correction is accepted. It does not receive routine feature development.

Development continuously receives current 1.1 work. A successfully built and verified Development
artifact is still experimental software: verification protects artifact integrity, but it does not
create a support promise or make the build suitable for production.

:::danger[Development is unsupported]
Development 1.1 is experimental and intended only for testing. Keep a configuration backup and
recovery media, and do not use it for a deployment that depends on support.
:::

## Switching channels

Select a channel under **System → Update → Update Settings**, save, and check for updates. Moving
from Stable 1.0.x to Development 1.1 is allowed, but it is a one-way transition through the updater.

The updater will not downgrade a running 1.1 system to 1.0. To return to Stable, boot a retained 1.0
ZFS boot environment or reinstall from a tagged 1.0.x image, restore the configuration as needed,
and perform future Stable updates from that running 1.0 system.

ZFS first-boot recovery may return a failed update to the previous complete boot environment. That
recovery mechanism is not permission to resolve a 1.1-to-1.0 package downgrade. UFS recovery may
require reinstalling and restoring a known-good configuration.

## Why optional packages do not rebuild every day

System and optional packages are planned and published independently. The daily System check starts
at 06:00 UTC and builds only when the System fingerprint changes. The package check runs afterward
but reuses the current optional-package repository unless package sources, its build recipe, or the
pinned FreeBSD platform changed.

The platform pin groups exact FreeBSD source, ports, world seed, build image, and worker tools. A
02:00 UTC daily check performs rollover work only near expiry and advances the pin by exactly 14
days through a reusable pull request. When the accepted pin changes, the package fingerprint changes
and a new optional-package build is required.

## Installer and metadata locations

Installer files live at immutable versioned URLs on `downloads.freesense.org`. The canonical
per-channel release documents live on `pkg.freesense.org`:

- `https://pkg.freesense.org/v1/releases/stable.json`
- `https://pkg.freesense.org/v1/releases/devel.json`

The release pipeline publishes the installer and verifies its public checksum and size before it
updates the matching channel document. The download page fetches those documents live and contains
no checked-in release number. Publishing Development never changes Stable, and publishing Stable
never changes Development.
