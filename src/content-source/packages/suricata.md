---
title: Suricata IDS/IPS
description: Install, configure and operate the Suricata 8 intrusion detection and prevention package on FreeSense 1.1.
---

Suricata is the supported intrusion detection and prevention (IDS/IPS) package for FreeSense. The
package (`FreeSense-pkg-suricata` 8.0.0) manages the **Suricata 8** engine from the FreeBSD ports
tree (the port requires `suricata>=8.0.0`): one Suricata instance per protected interface, rule
downloads and updates, pass and suppress lists, SID management, alert and event browsing, host
blocking and log maintenance. The Overview shows the exact engine version.

Suricata is an **intensive** package. Use it when you have a defined rule set, someone who reviews
alerts, and the CPU, memory and storage to inspect your traffic. Start in alert-only mode and
move to blocking only after tuning.

<!-- needs verification: exact Suricata 8.0.x version in the 1.1.0 Optional Packages set. -->

## Install

1. Open **System → Package Manager → Available Packages**.
2. Install **Suricata IDS/IPS** (category Security, resource profile Intensive).

Architecture: amd64 only. Suricata is not built for arm64, neither for Stable arm64 (from
[1.1.1](/releases/previous-1.1/#freesense-111)) nor for Development (1.2) arm64, because its build options still need a
Rust source build under emulation.

## Where to find it

**Services → Suricata** (menu group Security) opens the **Overview**. The package uses these
top-level tabs:

| Tab | Contents |
| --- | --- |
| **Overview** | Running state per interface, mode, configuration validity, last rule change, engine and package version |
| **Interfaces** | The list of Suricata instances; the editor has its own tabs: **Settings**, **Categories**, **Rules**, **Flow/Stream**, **App parsers**, **Variables**, **IP reputation** |
| **Policies & Rules** | **Interface rules** and **SID management** |
| **Events** | **Events** (EVE), **Alerts**, **Blocked hosts**, **Files**, **Logs** |
| **Network Lists** | **Pass lists**, **Suppress lists**, **IP reputation files** |
| **Updates** | Rule set status and manual update |
| **Advanced** | Global settings (rule sources, update schedule, GeoLite2, blocking, notifications, package removal) |
| **Maintenance** | Log size limits and retention |
| **High Availability** | XMLRPC sync of Suricata settings to a peer |

A **Suricata Alerts** dashboard widget shows recent alerts.

## First-time setup

1. Open **Services → Suricata → Advanced**. Under **Rule sources**, enable at least one source,
   for example **ET Open** (free) or **Snort GPLv2 Community** (free). Snort registered or
   subscriber rules need an Oinkmaster code; ET Pro needs a subscription code.
2. Under **Rule updates**, choose an **Update interval** (12 hours suits most sites) and save.
3. Open **Updates** and download the rules once.
4. Open **Interfaces** and add an interface. Tick **Enable**, choose the **Interface**, and keep the
   default **Home net**, **External net** and **Pass list** to begin with.
5. Leave **Block offenders** off for the first deployment (IDS, alert only). Save.
6. On the interface's **Categories** tab, select the rule categories you want. Enable only what you
   will review.
7. On the **Overview**, start the interface and use **Validate** to check the active configuration.
8. Generate normal and test traffic, then review **Events → Alerts**. Suppress or disable noisy
   rules before you turn on blocking.

:::caution[Turn off hardware offloading]
Suricata needs checksum offload, TSO and LRO disabled. The interface editor warns when any of
them is still on and links to **Interfaces → NIC Settings**.
:::

## Settings reference

### Advanced (global settings)

| Field | What it does | Default |
| --- | --- | --- |
| **ET Open** | Install Emerging Threats Open rules; optional custom download URL. | Off |
| **ET Pro** + **ET Pro subscription code** | Emerging Threats Pro (includes ET Open, which is then turned off). | Off |
| **Snort** + **Snort rules file name** + **Snort Oinkmaster code** | Snort registered or subscriber rules. Use a Snort 2.9 rules file; Snort 3 files are incompatible. | Off |
| **Snort GPLv2 Community** | Free community subset. | Off |
| **abuse.ch** | Feodo Tracker botnet C2 IP rules and the SSL Blacklist certificate rules. | Off |
| **Deprecated categories** | Hide deprecated categories and remove them from the configuration. | Off |
| **Extra rules** | Extra `.rules` or `.tar.gz` downloads, each with name, URL and optional MD5 check. | Off |
| **Update interval** | NEVER, 6 hours, 12 hours, 1 day, 4 days, 7 days or 28 days. | — |
| **Start time** | First run time (HH:MM); a random minute after 00:00 is suggested. | `00:<random>` |
| **Live rule swap** | Reload rules without restarting Suricata after an update. | Off |
| **GeoLite2 updates** + **Account ID** + **License key** | Download the free MaxMind GeoLite2 country database. | Off |
| **Remove blocked hosts after** | Clear the legacy-mode block table after this time (NEVER to 28 days). Ignored in inline mode. | — |
| **Log to system log**, **Log facility**, **Log priority** | Copy Suricata messages to the system log. | Off, LOCAL1, NOTICE |
| **Notifications** | Notify about updates and new rule categories through **System → Advanced → Notifications**. | Off |
| **Keep settings** | Keep Suricata settings when the package is removed. | On (set at first install) |
| **Clear blocked hosts** | Remove all hosts blocked by Suricata when the package is removed. | On |

### Interface editor (Settings tab)

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Inspect traffic on this interface. | — |
| **Interface** | The firewall interface; each interface can have only one Suricata instance. | — |
| **Description** | Display name. | Interface name |
| **Home net** | Networks Suricata protects. The default adds local networks, WAN addresses, gateways, VPNs and virtual IPs. | default |
| **External net** | Networks outside the home net. | default |
| **Suppress list** | Suppression and event filtering applied to alerts. | default (off) |
| **Block offenders** | Block hosts that trigger an alert. | Off |
| **IPS mode** | **Legacy Mode** (blocks the host after the matching packets have passed, using the `snort2c` table) or **Inline Mode** (drops packets with netmap before they reach the host). | Legacy Mode |
| **Netmap threads** | Inline mode threads; `auto` uses one per NIC queue. | auto |
| **Kill states** | Kill the firewall states of a blocked IP. | On |
| **Which IP to block** | SRC, DST or BOTH. | BOTH recommended |
| **Block on DROP only** | Block only for rules whose action is DROP. | Off |
| **Pass list** | Addresses never blocked. The default adds gateways, DNS servers, local networks, the WAN address, VPNs and virtual IPs. | default |

The editor continues with **Alert logging**, **EVE JSON output**, **HTTP and TLS logs**,
**File store and packet capture**, **Statistics**, **Performance and detection engine** and
**Advanced configuration pass-through** (collapsed by default).

Inline mode requires a NIC driver with native netmap support; the editor lists the accepted
drivers (for example `em`, `igb`, `ix`, `ixl`, `re`, `vtnet`) and refuses others. In inline mode a
rule only blocks when its action is DROP. Use `dropsid.conf` under **Policies & Rules → SID
management** to change rule actions.

## Firewall rules and interfaces

- Suricata does not need inbound rules of its own. Rule and database downloads go out from the
  firewall over HTTPS.
- Legacy-mode blocking adds offenders to the built-in `snort2c` table ("Hosts blocked by IDS"),
  which the firewall enforces. **Events → Blocked hosts** lists and removes entries.
- Keep management, VPN and monitoring addresses on the pass list before you enable blocking, and
  keep a console or out-of-band path while you test.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service | `suricata`, one process per enabled interface; boot script `/usr/local/etc/rc.d/suricata.sh` (generated) |
| Configuration | `/usr/local/etc/suricata/suricata_<uuid>_<interface>/suricata.yaml`, written as a candidate, checked with `suricata -T`, then moved into place |
| Logs | `/var/log/suricata/suricata_<interface><uuid>/` (`alerts.log`, `eve.json`, `suricata.log`) |
| Rule update log | `/var/log/suricata/suricata_rules_update.log` |
| SID modification files | `/var/db/suricata/sidmods/` (sample `enablesid`, `disablesid`, `dropsid`, `modifysid` files included) |


The Overview shows each interface as Running or Stopped and its configuration as **Valid** or
**Not validated**, with start, restart, stop and validate actions. A valid configuration only
means Suricata can parse it, not that the policy is right.

## Upgrade, backup, and removal

- Settings live in `config.xml` under `installedpackages/suricata` and are included in backups.
  Downloaded rules are fetched again by the next update.
- **Keep settings** is turned on at first install, so removing and reinstalling the package keeps
  the configuration. Turn it off under **Advanced → Package removal** if you want removal to delete
  it.
- **Clear blocked hosts** (on by default) empties the block table on removal.
- Removal stops every Suricata process and removes its PID and lock files.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Interface will not start | Use **Validate** on the Overview and read `suricata.log` for that interface. Rule sources that were never downloaded are a common cause. |
| A change is saved but Suricata keeps the old behavior | The generated configuration failed `suricata -T` and was rejected; the active file was kept. The system log shows `Rejected invalid Suricata configuration for <interface>` with the reason. The previous file is also kept as `suricata.yaml.last-good`. |
| Inline mode cannot be selected or saved | The NIC driver has no native netmap support. Use Legacy Mode. |
| Legitimate hosts are blocked | Add them to the pass list, remove the entry under **Blocked hosts**, then suppress or disable the rule. |
| Inline mode does not block | Rules default to ALERT. Change the wanted rules to DROP with `dropsid.conf`. |
| Opening an internal Suricata page shows a PHP error or loops | Fixed in 1.1: fragment pages redirect to the interface list, and the alias picker only returns to local pages. |
| **View List** buttons in the interface editor do nothing | Fixed in 1.1. |

:::note[Changes in FreeSense 1.1]
- WebUI rebuilt in the FreeSense style: Overview, interface list and editor, global settings, lists,
  updates, events, alerts, rules and per-interface pages (`d430d80`, `750ba6f`), with menu groups
  (`4ae11df`).
- Fragment pages and the alias picker no longer crash or loop (`2d0fc1b`); the interface editor's
  **View List** buttons work again (`4c0de94`).
- The offloading check reads the effective NIC settings and links to **Interfaces → NIC Settings**
  (`8bc37c1`).
- Rule and GeoIP downloads no longer send the host UUID in the user agent (`8d82a24`).
- HA sync uses the FreeSense XMLRPC client; it was calling a function that does not exist
  (`8312aa4`).
- The obsolete pfBlockerNG section that was on this page is gone: pfBlockerNG is not in the 1.1
  catalog. See [Threat Shield](/packages/threat-shield/).
:::
