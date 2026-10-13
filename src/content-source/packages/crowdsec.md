---
title: CrowdSec
description: Install CrowdSec on FreeSense and block addresses with active CrowdSec decisions through a managed WAN rule.
---

CrowdSec is an open-source behavior-based detection engine that turns what it sees in logs into
**decisions**, usually a temporary ban of an IP address, and can share signals with the CrowdSec
community. The FreeSense package (`FreeSense-pkg-CrowdSec` 1.0.0) installs the CrowdSec engine from
the FreeBSD ports tree (the port requires `crowdsec>=1.7.8`) and connects its decisions to the
firewall: every minute the active decisions are loaded into the built-in **CrowdSecBlocklist**
alias, and a managed WAN rule blocks those addresses.

Use CrowdSec when you want automatic, short-lived bans of addresses that misbehave, maintained by
CrowdSec rather than by hand. It is not a packet inspector; for that, see
[Suricata](/packages/suricata/).

## Install

1. Open **System → Package Manager → Available Packages**.
2. Install **CrowdSec** (category Security, resource profile Moderate).

The package is installed with protection off. Stable packages are published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64.

## Where to find it

| Menu path | Page |
| --- | --- |
| **Services → CrowdSec** | **Overview**: enable switch, engine version, enforcement, active decisions, metrics, console enrollment |
| **Status → CrowdSec Decisions** | **Decisions**: the active decisions, with search, origin filter and per-decision removal |

Both entries are in the **Security** group.

## First-time setup

1. Open **Services → CrowdSec**.
2. Under **Protection**, tick **Enable** and save. FreeSense adds the WAN block rule, installs the
   per-minute sync job, reloads the firewall and starts CrowdSec.
3. Confirm the summary shows **Running** and an **Engine** version.
4. Optional: select **Enroll in console** and paste an enrollment token from your CrowdSec console
   account, then accept the engine in the console.
5. Open **Status → CrowdSec Decisions** and review what is being blocked. Keep console or another
   management path available while you watch the first decisions.

The package does not configure which logs CrowdSec reads or which collections it uses; that is
CrowdSec's own configuration under `/usr/local/etc/crowdsec/`, managed with `cscli` at the
console.

<!-- needs verification: which acquisitions and collections the FreeBSD crowdsec port enables by default on FreeSense, i.e. what CrowdSec actually detects out of the box. -->

## Settings reference

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** (Protection) | Starts CrowdSec, adds the WAN block rule for **CrowdSecBlocklist** and refreshes the alias every minute from the active decisions. | Off |
| **Enrollment token** (Enroll in console) | Passed once to `cscli console enroll`. It is not stored in the FreeSense configuration. | — |
| Decision removal (Decisions page) | Deletes one decision with `cscli decisions delete`. CrowdSec may decide again if the behavior continues. | — |

## Firewall rules and interfaces

- **CrowdSecBlocklist** is a reserved, built-in URL table alias backed by
  `/var/db/crowdsec/freesense-blocks.txt`.
- Enabling the package adds one block rule on **WAN**, IPv4 and IPv6, source **CrowdSecBlocklist**,
  destination any, described "FreeSense CrowdSec decisions". It is added only once.
- Only IP addresses and CIDR networks from decisions are loaded. The table is replaced atomically.
- Other interfaces are not covered by the managed rule. Add your own rules with the alias if you
  need that.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service | `crowdsec` (shown as "CrowdSec Engine" in **Status → Services**); started with `service crowdsec onestart` when you save |
| Sync job | `/usr/local/pkg/crowdsec/crowdsec_sync.php`, cron every minute while enabled |
| Block file | `/var/db/crowdsec/freesense-blocks.txt` (generated; do not edit) |
| Status | **Status → CrowdSec Decisions**, and **Metrics** on the Overview |

The sync job runs only while CrowdSec is running and keeps the current table when it is not. A
failed refresh is logged as "CrowdSec decision refresh failed". `cscli` calls from the WebUI time
out after 10 seconds.

## Upgrade, backup, and removal

- The enable setting is stored in `config.xml` under `installedpackages/crowdsec`. CrowdSec's own
  data and configuration (including console enrollment) live outside `config.xml` and are not part
  of a FreeSense configuration backup.
- Removal removes the sync job and the managed WAN rule, reloads the firewall and deletes the block
  file. In 1.1 removal also deregisters the package in `config.xml`, so a configuration restore no
  longer reinstalls it.
- To stop blocking without removing the package, untick **Enable**. The cron job is removed, but
  the WAN rule stays and keeps matching the last loaded addresses until the table is emptied.
  <!-- needs verification: disabling does not stop CrowdSec or remove the rule; confirm the table contents after disable and reboot. -->

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| "CrowdSec is enabled but not running" | Start it from **Status → Services**, or save the Overview again (that runs `onestart`). See the next row after a reboot. |
| CrowdSec does not run after a reboot | The package starts CrowdSec with `onestart` when you save, and does not set an rc.conf enable flag; the boot-time start may therefore not happen. Save the Overview again, or run `service crowdsec onestart`. |
| The Decisions page hung for minutes | Fixed in 1.1: `cscli` runs only while CrowdSec runs, with a 10-second timeout. |
| Decisions were listed but nothing was blocked | Fixed in 1.1: the decision list format of current CrowdSec releases is now read correctly, so addresses reach **CrowdSecBlocklist**. |
| Enrollment fails | The error from `cscli` is shown on the page. Tokens must be 10–512 characters of letters, digits, dot, dash or underscore. |

<!-- needs verification: whether CrowdSec starts automatically at boot on 1.1.0 (package has no resync command and sets no crowdsec_enable). -->

:::note[Changes in FreeSense 1.1]
- The Decisions page no longer hangs when CrowdSec is not running, and decisions are now actually
  loaded into the block table (`1f87181`).
- Removal runs the post-deinstall stage, so the package no longer comes back after a configuration
  restore (`f903b12`).
- WebUI rebuilt in the FreeSense style, with menu groups (`4b54358`, `4ae11df`).
:::
