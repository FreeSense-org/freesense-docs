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
arm64 (UEFI) is also on Stable, starting with [1.1.1](/releases/previous-1.1/#freesense-111).

Package availability is defined by the [curated catalog](/packages/catalog/), not by a generic
FreeBSD repository. Some optional packages are not built for arm64.

## Before you test

1. Export the configuration from **Diagnostics → Backup & Restore**.
2. Keep a Stable installer, so the system can be reinstalled if needed.
3. Read [Updates and release channels](/guides/updates-and-channels/).

Moving from Stable 1.1 to Development 1.2 is one-way: the updater never offers Stable again on a
Development system. Returning to Stable means reinstalling from a Stable installer and restoring a
configuration backup.

## Build names

Development builds are named `1.2.0-dev.YYYYMMDD.G`: the version of the line, the UTC date of the
FreeSense source commit, and the build generation, for example
`FreeSense-1.2.0-dev.20261015.412-amd64.iso`. Builds published before October 2026 use the older
`1.2.0-gG` form. On an installed system, **System → Update** shows the System package version
of the same build, `1.2.0.a.YYYYMMDD.HHMM_G`.

The exact current build is shown in the live Development release document,
`https://pkg.freesense.org/v1/releases/devel.json`, and in the provenance attached to its images.

## Recent changes in 1.2

What reached the Development line in the second week of October 2026, newest first. Development
builds are experimental; see [Fleet status and known issues](/1.2/configure/fleet-status/) for what
was tested.

### 21 October

- **PHP 8.5.12 (security).** Fixes the two critical PHP vulnerabilities CVE-2026-109618 and
  CVE-2026-109619, the same fix as [FreeSense 1.1.10](/releases/previous-1.1/#freesense-1110). The
  change landed on `main` on 21 October and is published in build `1.2.0-dev.20261020.1792754032`
  (23 October). Installed Development systems receive it with that System update; until they do,
  they run the affected PHP 8.5.11. Development is experimental and unsupported, so keep the WebUI
  off untrusted networks.

### 17-18 October

- **Fleet 0.5.0**: one-paste invitations, three ways to connect (Fleet tunnel, Tailscale, direct),
  visible firewall rules for the connection points, and step-by-step guides for adding a firewall
  and for the controller's first run. The HA pair wizard is step by step too.
- **Fleet 0.4.0**: internet connectivity and connection quality (loss, latency, jitter, a quality
  score, failover alerts). **0.3.0**: live view 2.0 with split screen, panels and a paged firewall
  list, and firewall groups in the NOC view.
- **Fleet fixes from the lab**: no false split-brain when an HA member loses power; policy failures
  reach the headline, the top-bar icon and the alerts; the per-firewall Stats charts were empty;
  WebGUI login protection checks real protection; every filter bar applies as you choose.
- **WebUI hardening**: widget disconnect uses POST, `unserialize()` is restricted, legacy hashes
  are handled safely, captive portal file names and CSRF checks are tightened, and IDs are random.

### 15-16 October

- **WebUI**: the home page is now titled **Dashboard**. New **Page width** (Classic or Wide) and
  **menu icons** options under **System → General Setup**, a top bar that fits every window width, a
  notifications panel under the bell, and top-bar items and notices that packages can add. See the
  [menu reference](/reference/menu-guide/).
- **Dashboard widgets**: one look, an icon in every title, compact settings forms, a tidier update
  notice, and a real empty state in the ZFS and thermal widgets.
- **PHP 8**: code whose behavior changed since PHP 7 is fixed, and a full crawl of the WebUI no
  longer produces warnings. RADIUS authentication was rewritten for PHP 8.5.
- **REST API**: port forwards, rule tabs and the rule interface check now accept every interface
  for an API user, a filter rule must name an existing interface, and a remote logging route was
  added. The API level is now 14.
- **HA**: configuration sync pins the peer's WebGUI certificate.
- **Fleet 0.2.0**: a dashboard widget, a status menu in the top bar, per-firewall Stats, central
  users and groups, alerts and alert channels, templates and drift, NOC screens, the Deployment
  Factory, HA pair setup and a standby controller.
- **Stable and Development**: the updater keeps the selected update channel and reports real exit
  codes; custom package repositories are shown to the shell and never to the system upgrader.

For fixes that also shipped in Stable, read the [Stable release notes](/releases/stable/#release-notes). The FreeBSD
security advisories that are open or fixed on 1.2 are listed on the
[security site](https://security.freesense.org/all/?version=1.2); see
[Security advisories](/guides/security/).
