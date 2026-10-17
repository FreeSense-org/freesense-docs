---
title: Previous 1.1 releases
description: Release notes for FreeSense 1.1.0 to 1.1.5, the earlier releases of the 1.1 Stable line, and the release numbers 1.1.6 to 1.1.8 that were withdrawn before release.
---

These are the release notes of the earlier 1.1 Stable releases, newest first. The current release
is [FreeSense 1.1.9](/releases/1.1.9/); it contains every change listed here.

| Release | Date | Summary |
| --- | --- | --- |
| 1.1.6 to 1.1.8 | 2026-10-15 to 2026-10-17 | **Withdrawn before release**, never published · see [below](#withdrawn-before-release) |
| [1.1.5](#freesense-115) | 2026-10-14 | Updates and package changes work again on 1.1.1 and later (one console command first); the update window opens at once; Threat Shield save and map fixes |
| [1.1.4](#freesense-114) | 2026-10-14 | **Withdrawn**, superseded by 1.1.5 · Threat Shield 1.1.0: GeoIP and DNS redirection work, IP threat lists, inbound protection, threat map |
| [1.1.3](#freesense-113) | 2026-10-14 | Multi-line settings keep their line breaks; Threat Shield settings and query log; no stray VLAN interfaces |
| [1.1.2](#freesense-112) | 2026-10-14 | Tailscale and WireGuard keys kept out of logs and process lists |
| [1.1.1](#freesense-111) | October 2026 | Adds arm64 (generic UEFI installer); amd64 code unchanged from 1.1.0 |
| [1.1.0](#freesense-110) | 2026-10-13 | First 1.1 Stable release · [What's new in 1.1](/releases/whats-new-1.1/) |

Release notes for the 1.0.x line are in the [frozen 1.0 documentation](/1.0/).

## Withdrawn before release

The numbers **1.1.6, 1.1.7 and 1.1.8** were test builds of the next patch. Each was withdrawn
before it was published, so no system ever installed them, and its changes ship in
[1.1.9](/releases/1.1.9/). A version number is never reused.

- **1.1.6** was replaced so that security fixes merged after it was locked could ship in the same
  release.
- **1.1.7** passed its upgrade test but was replaced so that the PHP 8 fixes merged afterwards could
  ship with it.
- **1.1.8** failed its upgrade test: the changed Optional Packages and Status Monitoring kept their
  old version numbers, so updated systems would not have received the fixes.

## FreeSense 1.1.5

| | |
| --- | --- |
| **Released** | 2026-10-14 |
| **Line** | Stable 1.1.x |
| **Product version** | `1.1.5-RELEASE` |
| **Architectures** | amd64; arm64 (generic UEFI installer image) |
| **Platform** | FreeBSD 16.0-CURRENT snapshot, source `a52c50b4`, `osversion` 1600027 (unchanged) |
| **FreeSense source** | `dd73c46` |
| **System ports** | `489b477` |
| **Optional packages** | `2990b33` |
| **Previous release** | [1.1.4](#freesense-114) |

The release lock is `config/releases/1.1.5.json` in the `freesense-os-base` repository. It keeps
the FreeBSD platform of 1.1.0 to 1.1.4 and moves all three FreeSense repositories.

:::caution[Systems on 1.1.1 to 1.1.4: one console command first]
On 1.1.1, 1.1.2, 1.1.3 and 1.1.4 the updater itself is broken, so **System → Update** and the
Package Manager cannot install 1.1.5 on their own. Run the command in
[Before you update](/releases/1.1.9/#before-you-update-from-111-to-114) once, then update as usual.
Systems on 1.1.0 update normally.
:::

### What changed in 1.1.5

#### Base system

- **Updates and package changes work again.** On 1.1.1 and later, every system update and every
  package install, update, reinstall and removal stopped with "Another instance of
  FreeSense-upgrade is running. Try again later", and the update check could not find new
  versions. The updater handed a setting meant for `pkg` to the tool that picks the update
  channel, which then lost the selected channel. The channel chosen under **System → Update →
  Update Settings** now always wins.
- **The update and package window opens at once.** Confirming a system update or a package
  install, update, reinstall or removal no longer waits, sometimes minutes, for the updater to
  start. The progress window appears immediately and shows what the updater is doing
  ("Fetching FreeSense-base", "Extracting new base tarball", ...), a progress bar and the elapsed
  time. When another update or package operation is already running, it says so instead of
  retrying for minutes.
- **Clear results.** An updater that stops early now reports its own error, and a run that
  succeeds quickly (for example a package that is already up to date) is shown as a success.
- **Package versions without the build number.** Package lists and the install review show
  package versions as `1.1` instead of `1.1_8`; the full version is in the tooltip. An update that
  only changes the build number shows as `1.0.0 (build 7)`.
- **The login page shows the firewall version**, for example "FreeSense 1.1.5". To hide it, check
  **System → General Setup → Login version**.
- The WebUI's copyright line reads "© 2025-2026".
- The install review no longer shows "Tested on: Development" on Stable systems.

#### Optional packages

- **Threat Shield** (`FreeSense-pkg-ThreatShield` 1.1.0_1):
  - **Saving no longer fails at random** with "Activation failed; the previous Threat Shield
    settings were restored. AdGuard Home did not start." A save that coincided with Threat
    Shield's 5-minute self-repair was rolled back.
  - **No CSRF warning page** from the threat map's **Turn on map locations** button or from the
    one-click fixes in the health panel.
  - The open threat map no longer writes a session warning to the system log every two seconds.
- Threat Shield 1.1.0 from [1.1.4](#freesense-114) is part of 1.1.5: GeoIP and DNS
  redirection work, IP threat lists, inbound protection and the live threat map.

### Before you update from 1.1.1 to 1.1.4 in 1.1.5

Open a shell (console option **8**, or SSH) and run this once. It points the update channel
tool at the channel you chose and installs the fixed updater from 1.1.5:

```sh
cd /usr/local/etc/FreeSense/pkg/repos && rm -f FreeSense-repo-*.default && touch FreeSense-repo-stable.default && env -u REPOS_DIR -u FETCH_TIMEOUT /usr/local/sbin/FreeSense-repo-setup && pkg-static update -f -r FreeSense && pkg-static upgrade -y -r FreeSense FreeSense-upgrade FreeSense-repoc
```

The command only reads the FreeSense repository, so an unreachable custom repository can't stop
it. Then open **System → Update** (or console option **13**) and install 1.1.5. If you use the
Development channel instead of Stable, write `devel` instead of `stable` in `FreeSense-repo-stable.default`.

### What to check after updating in 1.1.5

- **Threat Shield**: open **Status → Threat Shield Status**; the health pill should read **All
  checks passed**. Settings from 1.1.0 to 1.1.3 are converted once, as described in the
  [1.1.4 notes](#what-to-check-after-updating-in-114). GeoIP policies and DNS
  redirection are enforced from now on.

### Known issues in 1.1.5

These are open in 1.1.5. Everything else on the
[1.1.0 list](#known-issues-in-110) is fixed.

- **RADIUS logins fail.** Any login that goes through a RADIUS authentication server fails: the
  WebUI, VPN users and Captive Portal. The RADIUS code needs PHP 8 changes that the system ports
  don't provide. Until a fix, use local users or another authentication server. Found by testing
  1.1.5 against a FreeRADIUS server; 1.1.0 to 1.1.4 are very likely affected as well.
- **Older boot environments are not locked everywhere.** The REST API refuses to activate a boot
  environment that holds an older release (HTTP 409, `locked`), but **System → Boot Environments**,
  `freesense-be` and the loader menu don't yet. Activating a 1.0 boot environment is not a
  supported downgrade; see
  [Upgrading from 1.0](/guides/upgrading-from-1.0/#if-the-upgrade-fails). The WebUI check is
  planned for 1.1.6.
- **Tailscale can take over DNS.** Tailscale's MagicDNS replaces `/etc/resolv.conf` with
  `100.100.100.100`. When that address doesn't answer, the firewall loses DNS after a reboot and
  updates fail with "Unable to read the package catalogue". Turn it off with
  `tailscale set --accept-dns=false` in a shell.
- **Secure Web Gateway stopped after an upgrade reboot.** In one 1.1.0 upgrade test the service was
  stopped after the reboot; starting it from **Status → Services** works. The cause is not known
  and it has not been seen again.
- **Installing over a serial console fails at the ZFS step** with "ZFS setup failed". The installer
  media gives a serial console no screen size. Choose **Exit** to get a shell, run
  `stty rows 24 cols 80`, type `exit` and install again. Installing on a video console is not
  affected.

### Upgrade notes in 1.1.5

- **From 1.1.0:** a normal Stable update. See
  [Updates and release channels](/guides/updates-and-channels/).
- **From 1.1.1 to 1.1.4:** run the [console command](/releases/1.1.9/#before-you-update-from-111-to-114) first.
- **From 1.0.x:** the upgrade to the 1.1 line is one-way. Read
  [Upgrading from 1.0](/guides/upgrading-from-1.0/) first.

## FreeSense 1.1.4

:::caution[Withdrawn]
1.1.4 is withdrawn and superseded by [1.1.5](#freesense-115). It reached the Stable update
channel, but its publication was cancelled before the installer images were published, and like
1.1.1 to 1.1.3 it cannot update further without the one-time console command in the 1.1.5 notes.
Its version number is not reused.
:::

| | |
| --- | --- |
| **Released** | 2026-10-14 |
| **Line** | Stable 1.1.x |
| **Product version** | `1.1.4-RELEASE` |
| **Architectures** | amd64; arm64 (generic UEFI installer image) |
| **Platform** | FreeBSD 16.0-CURRENT snapshot, source `a52c50b4`, `osversion` 1600027 (unchanged) |
| **FreeSense source** | `75c28d9` (unchanged) |
| **System ports** | `5e9287a` (unchanged) |
| **Optional packages** | `b11b6e6` |
| **Previous release** | [1.1.3](#freesense-113) |

The release lock is `config/releases/1.1.4.json` in the `freesense-os-base` repository. It is an
Optional Packages release: the FreeBSD platform, the FreeSense source and the system ports are
those of 1.1.3. Only the Optional Packages move, and the only package that changed is Threat
Shield.

### What changed in 1.1.4

#### Base system

No changes. The version reads `1.1.4`.

#### Optional packages

- **Threat Shield** (`FreeSense-pkg-ThreatShield` 1.1.0):
  - **GeoIP country blocking and DNS redirection now work.** Package 1.0.0 generated these
    firewall rules but never loaded them (a known issue of 1.1.0). The DNS redirect is only loaded
    while Threat Shield answers, so a stopped filter never takes DNS down, and it no longer
    catches queries to the firewall itself.
  - **Better ad blocking**: three protection levels (Light, Normal, Aggressive) with curated
    lists, an **Allowlist** tab with one-click **Unblock** from the query log and the Overview, and
    blocking of DNS-over-TLS, known DNS-over-HTTPS servers and plain IPv6 DNS to outside servers,
    so devices cannot bypass the filter.
  - **IP threat lists** such as Spamhaus DROP, FireHOL level 1 and abuse.ch Feodo Tracker, loaded
    into firewall tables.
  - **Inbound protection**: reputation (DNSBL) checks and flood limits for services you expose to
    the internet. See [Threat Shield inbound protection](/packages/threat-shield-inbound/).
  - **Threat map**: a live world map of blocked and allowed connections under
    **Status → Threat Map**, with a full-screen view in three styles and a dashboard widget. See
    [Threat Shield threat map](/packages/threat-shield-map/).
  - **Pause** (5 minutes to "until I resume"), **schedules** for blocked services, **health
    checks** with one-click fixes, and a one-switch **Enable DNS blocking** setup.
  - High availability: settings can be synchronized to the HA peer, and the package no longer
    breaks configuration sync for other packages.

See [Threat Shield](/packages/threat-shield/) for the full guide.

### What to check after updating in 1.1.4

- **Threat Shield settings are converted once.** Your lists keep their downloads and the
  protection level shows as **Custom**. Simple `@@||domain^` allow rules move from custom rules to
  the **Allowlist** tab. New firewall features (anti-bypass, IP lists, inbound protection) stay off
  until you turn them on.
- **GeoIP now blocks.** If you had a GeoIP policy enabled on 1.1.0 to 1.1.3, it had no effect
  there; after the update it is enforced. Check **Services → Threat Shield → GeoIP** before
  updating if you are unsure what it blocks.
- **DNS redirection now redirects.** If **DNS redirection** was on, clients that use their own DNS
  server are now answered by Threat Shield.
- Open **Status → Threat Shield Status** after the update: the health pill should read
  **All checks passed**.

## FreeSense 1.1.3

| | |
| --- | --- |
| **Released** | 2026-10-14 |
| **Line** | Stable 1.1.x |
| **Product version** | `1.1.3-RELEASE` |
| **Architectures** | amd64; arm64 (generic UEFI installer image) |
| **Platform** | FreeBSD 16.0-CURRENT snapshot, source `a52c50b4`, `osversion` 1600027 (unchanged) |
| **FreeSense source** | `75c28d9` |
| **System ports** | `5e9287a` |
| **Optional packages** | `6beb4bf` |
| **Previous release** | [1.1.2](#freesense-112) |

The release lock is `config/releases/1.1.3.json` in the `freesense-os-base` repository. It keeps
the FreeBSD platform of 1.1.0 to 1.1.2 and moves all three FreeSense repositories.

### What changed in 1.1.3

#### Base system

- **Multi-line settings keep their line breaks.** Browsers send text areas with Windows line breaks
  (CRLF). The configuration file dropped those line breaks when it was read back, so a list
  entered one per line could turn into a single line, for example two DNS upstream servers merged
  into one invalid address. `config.xml` now stores the carriage return as `&#13;` and reads it
  back unchanged.
- **Creating a VLAN no longer leaves an empty interface behind.** Saving a new VLAN could leave a
  stray `vlanN` interface, shown as an unassigned VLAN on **Interfaces → NIC Settings**.
- **Versions without the build number.** **System → Update** and the dashboard show versions as
  `1.1.3` instead of the package version `1.1.3_N`. The full package version is in the tooltip.
  When two builds of the same release differ only in their build number, as Development builds do,
  the WebUI shows `1.2.0 (build N)`.
- **Change list on System → Update.** The **What is new** panel now also lists changes to Optional
  Packages and build changes that the release names itself. When a release has no base-system
  changes, the panel says so and links to these release notes instead of showing
  "No FreeSense changes in this firmware."
- **Help links.** The help link of each Optional Package page opens that package's guide, including
  WireGuard and Diagnostics, which opened the menu reference before. UPnP and the Crash Reporter have
  their own help topics. Help links of the 1.1 line go straight to the Stable documentation instead
  of redirecting from `/1.1/`.
- **REST API.** Creating or updating an alias with a field the endpoint does not know (for example
  `descr` or `address`, the field names of `config.xml`) now fails with `400 unknown_field`. Before,
  such fields were ignored and the alias was created without a description or entries. Use
  `description` and `entries`; see [Getting started with the API](/api/getting-started/).
- **Error pages.** The WebUI's 404 and server error pages use the sign-in page's design.
- **Update channel name.** The Stable channel is shown as **FreeSense 1.1 Stable**.

#### Optional packages

- **Threat Shield** (`FreeSense-pkg-ThreatShield` 1.0.0_6):
  - Saving **Settings** from a browser always failed with "Settings could not be saved to
    config.xml; the previous settings were restored." It now saves, on 1.1.3 and on older 1.1.x
    systems that install the updated package.
  - The **Query log** never marked a query as **Blocked**, so the **Blocked** filter was empty and
    **Allow** never appeared. Blocked queries are now marked, and rewritten answers (including safe
    search) show as **Rewritten**.
- Copyright notices of all packages list every source copyright line.

### What to check after updating in 1.1.3

- **Multi-line fields saved on 1.1.0 to 1.1.2.** Lines that were merged before the update stay
  merged. Open the pages where you entered several lines, such as the Threat Shield **Upstream
  servers**, **Bootstrap DNS** and **Fallback DNS**, and put each entry back on its own line.
- **Stray VLAN interfaces.** A `vlanN` interface left behind by an earlier VLAN save disappears at
  the next reboot. It carries no configuration.
- **API clients** that send alias fields other than `name`, `type`, `description`, `entries` and
  `update_frequency` must drop them.

### Known issues in 1.1.3

The [known issues of 1.1.0](#known-issues-in-110) still apply, except the dashboard
"built on" time ([1.1.1](#freesense-111)), the empty change list and the `/1.1/` help links,
which this release fixes.

### Upgrade notes in 1.1.3

- **From 1.1.0, 1.1.1 or 1.1.2:** a normal Stable update. See
  [Updates and release channels](/guides/updates-and-channels/). Update the Optional Packages
  afterwards if **System → Package Manager** offers them.
- **From 1.0.x:** the upgrade to the 1.1 line is one-way. Read
  [Upgrading from 1.0](/guides/upgrading-from-1.0/) first.

## FreeSense 1.1.2

| | |
| --- | --- |
| **Released** | 2026-10-14 |
| **Line** | Stable 1.1.x |
| **Product version** | `1.1.2-RELEASE` |
| **Architectures** | amd64; arm64 (generic UEFI installer image) |
| **Platform** | FreeBSD 16.0-CURRENT snapshot, source `a52c50b4`, `osversion` 1600027 |
| **FreeSense source** | `0318257` (unchanged from 1.1.0) |
| **System ports** | `26853c0` (unchanged from 1.1.0) |
| **Optional packages** | `bacc305` |
| **Previous release** | [1.1.1](#freesense-111) |

The release lock is `config/releases/1.1.2.json` in the `freesense-os-base` repository. It names
the same FreeSense, System ports and FreeBSD revisions as 1.1.1; only the Optional Packages move.

### What changed in 1.1.2

FreeSense 1.1.2 is a security fix for two Optional Packages. The base system is unchanged, so
**System → Update** lists no base-system changes for this release.

- **Tailscale.** Connecting the firewall wrote the full `tailscale up` command line, auth key
  included, to the system log, and passed the key on the command line, where other processes could
  read it. The key now goes through a root-only temporary file that is removed right away, and it is
  never logged. Changing the auth key no longer logs it either.
- **WireGuard.** An invalid pre-shared key was repeated in the validation error message, and
  deriving a public key put the private key in a shell command. Neither happens any more.

### What to do in 1.1.2

Update to 1.1.2 or later, then update the Tailscale and WireGuard packages if
**System → Package Manager** offers them.

If Tailscale was configured with an auth key on 1.1.0 or 1.1.1, the key may be in the system log
and in any remote syslog server that receives it. Revoke it in the Tailscale admin console and create a new
one. See [Tailscale](/packages/tailscale/) and [WireGuard](/packages/wireguard/).

### Known issues in 1.1.2

The [known issues of 1.1.0](#known-issues-in-110) still apply, except the dashboard
"built on" time, which [1.1.1](#freesense-111) fixed.

### Upgrade notes in 1.1.2

- **From 1.1.0 or 1.1.1:** a normal Stable update. See
  [Updates and release channels](/guides/updates-and-channels/).
- **From 1.0.x:** the upgrade to the 1.1 line is one-way. Read
  [Upgrading from 1.0](/guides/upgrading-from-1.0/) first.

## FreeSense 1.1.1

| | |
| --- | --- |
| **Released** | October 2026 (sealed release lock) |
| **Line** | Stable 1.1.x |
| **Product version** | `1.1.1-RELEASE` |
| **Architectures** | amd64; arm64 (generic UEFI installer image) |
| **Sources** | Identical to [1.1.0](#freesense-110) |
| **Platform** | FreeBSD 16.0-CURRENT snapshot, source `a52c50b4`, `osversion` 1600027 |
| **FreeSense source** | `0318257` |
| **System ports** | `26853c0` |
| **Optional packages** | `ce79191` |
| **Previous release** | [1.1.0](#freesense-110) |

The release lock is `config/releases/1.1.1.json` in the `freesense-os-base` repository. It names
the same FreeSense, System ports, Optional Packages, and FreeBSD revisions as the 1.1.0 lock and adds
an arm64 build.

### What changed in 1.1.1

FreeSense 1.1.1 brings **arm64** to the Stable line. It is the first Stable release with:

- a signed **arm64 System repository** and **arm64 Optional Packages repository**, built from the
  1.1.0 sources;
- the **generic arm64 UEFI installer image** (`installer.img`, build profile
  `generic-arm64-uefi`) for machines with standard UEFI firmware and virtio storage and networking.

It also fixes the dashboard build time: the System build now stamps the real build time and source
commit into `/etc/version.buildtime` and `/etc/version.lastcommit`, which were empty in 1.1.0. This
is a build pipeline fix (freesense-os-base `f1123cd`); the FreeSense source code is unchanged.
FreeSense 1.1.0 itself was published for amd64 only.
<!-- needs verification: confirm on a 1.1.1 system that the dashboard shows the real build time -->

### For amd64 systems in 1.1.1

The amd64 System and Optional Packages are built from exactly the same sources as 1.1.0. Updating
a 1.1.0 firewall to 1.1.1 moves the reported version to 1.1.1 and corrects the dashboard's "built
on" time; nothing else changes.

### Known issues in 1.1.1

Because the code is the same, the [known issues of 1.1.0](#known-issues-in-110) also
apply to 1.1.1, on amd64 and arm64, except the dashboard "built on" time, which 1.1.1 fixes.

### arm64 notes in 1.1.1

- **Installer image only.** Stable arm64 ships the generic UEFI installer image. Write it to a USB
  drive or attach it as a virtual disk, then follow
  [Installation](/getting-started/installation/). Machines need UEFI firmware; the image does not
  boot with legacy BIOS or U-Boot without UEFI.
- **No arm64 cloud images.** There are no arm64 QCOW2 or raw cloud disks on Stable. Cloud images
  remain amd64 only; see [Cloud images](/getting-started/cloud-images/).
- **No Raspberry Pi images.** The Raspberry Pi appliance images are not part of Stable. They are
  published only on the [Development](/releases/development/) 1.2 line; see
  [Raspberry Pi](/1.2/getting-started/raspberry-pi/).
- **Packages not built for arm64.** The Optional Packages architecture policy leaves
  [Suricata](/packages/suricata/) and Web Gateway Local Antivirus (the
  [Secure Web Gateway](/packages/web-gateway/) ClamAV add-on) out of arm64 builds, because their
  dependencies still need Rust source builds under emulation. The policy excludes no other package
  in the [catalog](/packages/catalog/).
  <!-- needs verification: confirm on a Stable 1.1.1 arm64 install which catalog packages actually appear in Available Packages (individual ports may also restrict architectures) -->

### Upgrade notes in 1.1.1

- **From 1.1.0:** a normal Stable update. See [Updates and release channels](/guides/updates-and-channels/).
- **From 1.0.x:** the upgrade to the 1.1 line is one-way. Read
  [Upgrading from 1.0](/guides/upgrading-from-1.0/) first.

## FreeSense 1.1.0

| | |
| --- | --- |
| **Released** | 2026-10-13 (sealed release lock) |
| **Line** | Stable 1.1.x, replaces 1.0.x as the supported line |
| **Architecture** | amd64 only. Stable arm64 (generic UEFI installer) starts with [1.1.1](#freesense-111). |
| **Platform** | FreeBSD 16.0-CURRENT snapshot, source `a52c50b4`, `osversion` 1600027 |
| **FreeSense source** | `0318257` |
| **System ports** | `26853c0` |
| **Optional packages** | `ce79191` |
| **Previous release** | [1.0.7](/1.0/) |

The release lock is `config/releases/1.1.0.json` in the `freesense-os-base` repository. For a
narrative tour of the changes, read [What's new in FreeSense 1.1](/releases/whats-new-1.1/). To
upgrade an existing firewall, follow [Upgrading from 1.0](/guides/upgrading-from-1.0/).

### New in 1.1.0

- **REST API.** A versioned JSON API at `/api/v1` with per-user API keys, privileges matching the
  WebUI pages, read-only keys, ETag-protected writes, batch requests, and an OpenAPI document.
  Configure it at **System → REST API**. It is disabled until enabled. Includes the **API
  Explorer** and a built-in guide. See the [API overview](/api/overview/).
- **Custom package repositories.** **System → Package Manager → Repositories** adds custom HTTPS
  pkg repositories (signed or explicitly unsigned) and the FreeBSD package repository at fixed
  priorities below FreeSense. Available and Installed Packages gain a **Source** column and filter.
  See [Custom package repositories](/packages/custom-repositories/).
- **VXLAN interfaces.** **Interfaces → Assignments → VXLANs** creates unicast or multicast VXLAN
  tunnels that can be assigned and bridged, with an optional outer pass rule. See
  [VXLAN](/configure/interfaces-vlans-bridges/#vxlan).
- **Encrypted remote configuration backups.** **Diagnostics → Backup & Restore → Remote Backup**
  uploads encrypted backups to S3-compatible storage, WebDAV, or SFTP on a schedule or after
  configuration changes, with retention, browsing, and restore. New CLI `freesense-remote-backup`.
- **Grouped menus and menu search.** System, Services, Status, and Diagnostics open as grouped
  panels with a filter; **Ctrl+K** searches every menu.
- **Threat Shield & DNS Protection** optional package: DNS filtering with AdGuard Home and
  automatically updated threat feeds. It takes over DNS blocking from the removed pfBlockerNG.
  GeoIP country blocking does not take effect in 1.1.0; see [Known issues](#known-issues-in-110).

### Improved in 1.1.0

- WebUI restyle and navigation overhaul: rebuilt lists, editors, status pages, logs, diagnostics,
  traffic shaper, captive portal, IPsec, OpenVPN, and L2TP pages. The existing light and dark themes
  and all page addresses are kept.
- Package Manager rebuilt: searchable lists with filters, a review step, progress header, and output
  console. Available Packages starts with the packages that are not installed.
- **System → Update**: the available version is shown only when it is newer, the page is locked
  behind a progress overlay during an update, and the overlay shows the from and to versions.
- **System → Boot Environments** is one list with create, edit, and clone dialogs.
- **Interface Assignments** is a searchable list; **NIC Settings** shows link speed and duplex;
  interface link settings (MAC, MTU, MSS, speed) sit in a collapsible section.
- **Configuration History** pages the revision table (25, 50, 100, or all).
- Optional package pages rebuilt in the same style: Suricata, Threat Shield, CrowdSec, Secure Web
  Gateway, WireGuard, ACME, FRR, Automation, syslog-ng, OpenVPN Client Export. Package menu entries
  declare their menu group.
- WebUI performance: the configuration cache works again after the first configuration write,
  parsed menu data is cached, PHP OPcache is configured correctly, systems with more than 2 GB of
  memory get more PHP-FPM workers, and dashboard polling skips busy widgets, backs off on errors,
  and pauses in hidden tabs.
- Base system on PHP 8.5; front-end libraries updated.
- Kea log level is configurable on the DHCP and DHCPv6 settings pages; URL and URL table aliases can
  import `.tgz` and `.tar.gz` archives; the traffic graph ceiling is raised to 200 Gbps.
- Download and pkg requests identify only as `FreeSense/<version>`; the device ID and remaining
  upstream phone-home code are removed.

### Fixed in 1.1.0

#### Base system

- The dashboard update check never reported an available update; it now checks the selected
  channel.
- The System image now includes the `if_wg` kernel module. Without it, WireGuard tunnels failed
  with "Unable to create WireGuard tunnel(s)".
- Services queued by package install scripts are started; a removed package's services are stopped.
- Package restore matches the catalog by package name when the internal name differs.
- Configuration arrays with numeric keys are never written as XML tags.
- OpenVPN cipher list crash and NTP GPS page writes.
- One `X-Frame-Options` header on the HTTPS WebUI; no fatal error when `csrf_error.php` is opened
  directly.
- `check_reload_status` start is retried with backoff.
- Fixes from the pfSense 2.9.0 release notes, rewritten for FreeSense, including: unassociated filter
  rules for port forwards, OpenVPN networks in `vpn_networks`, no `reply-to` on NAT64 rules, the
  failed ruleset kept as `rules.debug.failed`, applying one interface no longer restarting every
  OpenVPN instance, Unbound binding the same address twice, Kea DNS registration while Unbound is
  disabled, nginx messages kept out of `system.log`, a single `updaterrd.sh` collector, synchronous
  trust store rehash at boot, and fstab swap entries kept when the first device is missing.
- Ported upstream fixes: unicast DHCP renewals stay on the WAN holding the lease, OpenVPN gateway
  monitor routes pinned to their tunnel, filter rules can match IPIP, and traffic graph tooltips work
  on touch devices.
- Status Monitoring saved views validate their fields.
- The UEFI boot entry is labelled "FreeSense (*disk*)".

#### Optional packages

- **Threat Shield:** settings that never saved, AdGuard Home not starting in proxy or standalone
  mode, broken Unbound configuration in proxy mode, and DNS outages when switching modes or turning
  the package off.
- **Secure Web Gateway:** local antivirus scanning blocked all browsing with ICAP errors; the
  parent-proxy password is no longer printed into the page.
- **CrowdSec:** the Decisions page hung while CrowdSec was not running, and the block list stayed
  empty, so nothing was blocked.
- **Automation:** settings could never be saved.
- **BIND:** DNSSEC on BIND 9.20 took named down; key generation and DS records now work; zones that
  fail to load raise a notice.
- **WireGuard:** uninstalling no longer leaves the firewall without a DNS resolver and gateway
  monitoring; the service starts after a reinstall when enabled.
- **Suricata:** fragment pages and the alias picker no longer crash or loop; the interface editor's
  **View list** buttons work again.
- **HA sync** in BIND, ACME, FreeRADIUS, and Suricata called a function that does not exist on
  FreeSense; **OpenVPN Client Export** downloads failed with a fatal error.
- **FreeRADIUS:** includes the FreeSense RADIUS dictionary; the placeholder localhost client gets a
  random secret instead of a fixed one.
- **net-snmp:** corrected default `sysDescr`.
- The post-deinstall stage now runs for Automation, CrowdSec, Threat Shield, and ZeroTier.

### Security in 1.1.0

FreeSense 1.1.0 fixes the WebUI issues described in advisories **SA-26_05 through SA-26_21**. The
upstream fixes were not published as source, so each fix was written for FreeSense from the
advisory text.

| Advisory | Area | Fix |
| --- | --- | --- |
| SA-26_05 | Captive Portal dashboard widget | Cross-site scripting |
| SA-26_06 | Proxy settings | Control characters rejected and kept out of the crontab (command execution) |
| SA-26_07 | OpenVPN | DNS default domain and NetBIOS scope validated; unsafe push values dropped |
| SA-26_08 | File browser | Cross-site scripting |
| SA-26_09 | Status Monitoring saved views | Fields validated and safely encoded (System ports `c9e2ca4`) |
| SA-26_10 | Firewall log rule descriptions | Cross-site scripting |
| SA-26_11 | Rule schedules | Cross-site scripting |
| SA-26_12, SA-26_13 | DHCP pool descriptions | Cross-site scripting |
| SA-26_14 | IPsec Phase 1 description | Cross-site scripting |
| SA-26_15 | PPP provider and plan | Cross-site scripting |
| SA-26_16 | Dynamic DNS dashboard widget | Cross-site scripting |
| SA-26_17 | URL table alias popups | Cross-site scripting |
| SA-26_18 | Dashboard layout | Only installed widget names accepted (file inclusion) |
| SA-26_19 | Encrypted backups | Passphrase passed to `openssl` over a pipe, temporary files created private |
| SA-26_20 | Custom Kea configuration | Requires administrator or the new privilege **WebCfg - Services: DHCP Server: Edit Custom Kea Configuration** |
| SA-26_21 | Traffic Graphs host table | Cross-site scripting |

All except SA-26_09 are fixed in FreeSense source commit `183c419`. Related hardening in the same
change: `pam_ldap` is a required account module so an LDAP group restriction denies shell logins,
Captive Portal usernames are sanitized in log lines, `is_ipaddrv4()` rejects NUL bytes, Dynamic DNS
credentials are URL-encoded, and **Wake All** on Wake-on-LAN acts only on POST. Existing encrypted
backups still decrypt.

Report security issues privately through GitHub private vulnerability reporting.

### Packages added and removed in 1.1.0

| Change | Package | Notes |
| --- | --- | --- |
| Added | Threat Shield & DNS Protection | DNS filtering with a native AdGuard Home build and threat feeds |
| Removed | pfBlockerNG | No longer in the catalog. Threat Shield replaces its DNS blocking; for IP block lists use a URL table alias with a firewall rule. |
| Changed | ntopng | The FreeSense 6.6-stable overlay is removed; the package now uses FreeBSD's `net/ntopng` (a 6.6 development snapshot) |
| Changed | Open VM Tools | The `nox11` flavor is the default |
| Changed | Prometheus Node Exporter | Interface metrics renamed to `node_freesense_interface_up` and `node_freesense_interface_info` in `freesense.prom` |

The 1.1 catalog lists 34 optional packages. See the [package catalog](/packages/catalog/).

### Known issues in 1.1.0

- **Dashboard "built on" time.** The System Information widget shows the current time as the build
  time, because `/etc/version.buildtime` is empty in 1.1.0. Fixed in [1.1.1](#freesense-111).
- **Secure Web Gateway stopped after upgrade.** In an upgrade test the Web Gateway service was found
  stopped after the post-upgrade reboot. Starting it by hand from **Status → Services** works. The
  cause is not yet known. <!-- needs verification: root cause of Web Gateway not starting after upgrade reboot -->
- **Older boot environments are not locked everywhere.** The REST API refuses to activate a boot
  environment that holds an older release (HTTP 409, `locked`), but **System → Boot Environments**,
  `freesense-be`, and the loader menu do not yet enforce this. Activating a 1.0 boot environment is
  not a supported downgrade; see [Upgrading from 1.0](/guides/upgrading-from-1.0/#if-the-upgrade-fails).
- **Threat Shield GeoIP and DNS redirect rules are not loaded.** The package's GeoIP country
  blocking and its option to redirect clients' DNS traffic generate firewall rules that 1.1.0 never
  loads, so neither takes effect. DNS filtering for clients that use the firewall as their DNS
  server works. See [Threat Shield](/packages/threat-shield/).
- **No change list in System → Update.** 1.1.0 is the first release in its Stable release document,
  so the **What is new** panel on **System → Update** has no entries for it. These release notes are
  the change list. From [1.1.3](#freesense-113) the panel also lists Optional Packages changes.
- **Multi-line settings lose their line breaks.** A list entered one entry per line in the WebUI
  can be read back as a single line. Fixed in [1.1.3](#freesense-113); see its notes for what to
  check after updating.
- **Threat Shield settings do not save from a browser, and the query log never shows Blocked.**
  Fixed in Threat Shield 1.0.0_6, published with [1.1.3](#freesense-113).
- **WebUI help links.** Help links in 1.1.0 point to `/1.1/` addresses on the documentation site,
  which redirect to the matching Stable page. Fixed in [1.1.3](#freesense-113).

### Upgrade notes in 1.1.0

- **One-way.** Upgrading from 1.0.x to 1.1 cannot be undone through the updater, which never offers
  a downgrade. Back up the configuration first.
- **pfBlockerNG.** pfBlockerNG is not available in 1.1. Note its settings and plan a move to
  [Threat Shield](/packages/threat-shield/) before upgrading.
  <!-- needs verification: what happens to an installed pfBlockerNG package and its config during the 1.0 -> 1.1 upgrade -->
- **Node Exporter dashboards** that use `node_pfsense_*` metric names must switch to the
  `node_freesense_*` names.
- **Custom Kea configuration** is now limited to administrators and users with the new privilege.
- **Device ID.** The **Do NOT send Device ID** option is removed; saving **System → Advanced →
  Miscellaneous** drops the old setting.
- **Tested path.** A Stable 1.0.6 system was upgraded to 1.1.0 with the console updater. An upgrade
  from 1.0.7 was not tested separately.

Follow [Upgrading from 1.0](/guides/upgrading-from-1.0/) for the full procedure.
