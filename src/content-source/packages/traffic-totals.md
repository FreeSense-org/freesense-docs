---
title: Traffic Totals
description: Track hourly, daily, monthly, and top-day traffic totals per interface on FreeSense with vnStat.
---

The **Traffic Totals** package (port `FreeSense-pkg-Status_Traffic_Totals`) adds a
**Status → Traffic Totals** page that shows how much traffic each interface received and sent per
hour, per day, per month, and on its ten busiest days. Data is collected by the
[vnStat](https://humdi.net/vnstat/) daemon, which reads the kernel's interface counters, so it adds
almost no load and does not capture packets.

At the 1.1.0 release lock the package (version 2.3.5_5) depends on vnStat 2.13 from the
pinned FreeBSD ports tree.

Use it to answer "how much did we use this month?" questions, check ISP data caps, or compare
interfaces over time. It does not show who used the traffic; for per-host or per-application detail
use [ntopng](/packages/ntopng/) or export flows with [softflowd](/packages/softflowd/). For live
per-second graphs, use the built-in traffic graph described in
[Monitoring and logs](/operations/monitoring-and-logs/).

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **Traffic Totals** (category Monitoring, lightweight) and select **Install package**, then
   **Confirm**.

Stable packages are published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64. See [Installing packages](/packages/installing-packages/).

## Where to find it

| Menu path | Page |
| --- | --- |
| **Status → Traffic Totals** (Traffic group) | Settings panel, interactive graph, and data summary table, with **Hourly**, **Daily**, **Monthly**, and **Top 10 Days** tabs |

The collector service appears as **vnstatd** (*Status Traffic Totals data collection daemon*) under
**Status → Services**.

## First-time setup

Graphing is **off** after a fresh installation; the page shows *Graphing is not enabled, Enable
Graphing in the Advanced Settings above* until you turn it on.

1. Open **Status → Traffic Totals**.
2. In the **Settings** panel, select **Display Advanced**.
3. Select **Enable Graphing**. FreeSense writes `/usr/local/etc/vnstat.conf`, starts `vnstatd`, and
   creates a vnStat database entry for every interface (see below).
4. Wait at least five minutes. vnStat updates its data every five minutes, so the first graph is
   empty or nearly empty.
5. Choose the interfaces, graph type, and other options, select **Update Graphs**, and switch
   between the **Hourly**, **Daily**, **Monthly**, and **Top 10 Days** tabs.
6. To keep your choices, select **Display Advanced** → **Save As Defaults**.

Databases are created for every assigned interface, plus **IPsec** (`enc0`) when IPsec is enabled
and each enabled OpenVPN server and client instance. Each database is given the interface's
description as its vnStat alias.

## Settings reference

All settings are on the **Settings** panel of the page.

| Control | What it does | Default |
| --- | --- | --- |
| **Interface(s)** | Interfaces shown in the graph and summary. Multiple can be selected; **Top 10 Days** accepts only one. | All |
| **Type** | **Line**, **Bar**, **Line (Stacked)**, or **Bar (Stacked)**. | Line |
| **Inverse** | **On** plots transmitted traffic below the axis. | On |
| **Cumulative** | **On** shows a running total across the period instead of per-period values. | Off |
| **Start Day** | Day of the month (1-28) on which the monthly period begins (vnStat `MonthRotate`); set it to your ISP billing day. | 1 |
| **Update Graphs** | Redraws the graph with the current options. | - |
| **Display Advanced** | Shows the buttons below. | - |
| **Export As CSV** | Downloads the data summary table as CSV. | - |
| **Save As Defaults** | Stores the current period, interfaces, type, inverse, cumulative, and start day as the page defaults and applies **Start Day** to vnStat. | - |
| **Enable Graphing** / **Disable Graphing** | Starts collection, or stops `vnstatd` and **deletes all collected data**. | Disabled |
| **Reset Graphing Data** | Deletes all vnStat databases, restarts `vnstatd`, and recreates empty databases. | - |

## Firewall rules and interfaces

No firewall rules are needed. vnStat reads interface counters locally and the page reads vnStat's
JSON output through the WebUI.

Interfaces added after graphing was enabled are added to vnStat the next time the configuration is
synchronized, for example by **Save As Defaults**, or by disabling and re-enabling graphing (which
discards existing data).

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service | `vnstatd` (**Status → Services**) |
| rc script | `/usr/local/etc/rc.d/vnstatd.sh` (generated while graphing is enabled) |
| Configuration | `/usr/local/etc/vnstat.conf` (generated, do not edit) |
| Database | `/var/db/vnstat/` |
| PID file | `/var/run/vnstat/vnstat.pid`; the daemon runs as user `vnstat` |
| Data source for the page | `/vnstat_fetch_json.php` (output of `vnstat --json`) |
| Package messages | Errors such as *Could not write /usr/local/etc/vnstat.conf* go to the system log with the `Traffic Totals` prefix |

The package registers `vnstat` as a RAM-disk directory: when `/var` is a RAM disk, FreeSense's
package-data backup saves `/var/db/vnstat` to the RAM disk store under `/cf/conf/RAM_Disk_Store`
so it can be restored at boot.

Access to the page and its data endpoint is controlled by the **WebCfg - Status: Traffic Totals**
privilege.

## Upgrade, backup, and removal

- Page defaults and the enabled state are stored in `config.xml` under
  `installedpackages/traffictotals` and are included in configuration backups. The traffic history
  in `/var/db/vnstat/` is **not** part of the configuration backup.
- When the package is reinstalled (for example during an upgrade) and graphing was enabled but no
  data can be read, the package rewrites the configuration and recreates the databases.
- Removing the package deletes `/var/db/vnstat/` and all traffic history. In 1.1 the Package
  Manager stops `vnstatd` before removing its service entry.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| *Graphing is not enabled, Enable Graphing in the Advanced Settings above* | Graphing is off or the database is missing. Select **Display Advanced** → **Enable Graphing**. |
| *Top 10 doesn't allow for more than one interface to be selected* | Select a single interface on the **Top 10 Days** tab. |
| Graph is empty right after enabling | vnStat records data every five minutes; wait and select **Update Graphs**. |
| A new interface or VPN instance is missing | Select **Save As Defaults** to resynchronize the interface databases. |
| Monthly totals do not match the ISP bill | Set **Start Day** to the billing day and save it as default. vnStat counts all traffic on the interface, including traffic the firewall itself sends. |
| *Invalid Start Day* | Use a value from 1 to 28. |
| Data disappeared | **Disable Graphing**, **Reset Graphing Data**, and package removal all delete the history. On a RAM-disk `/var`, data collected since the last package-data backup is lost on an unclean shutdown. |

:::note[Changes in FreeSense 1.1]
- The menu entry carries the **Traffic** group, so it appears in that group of the **Status**
  panel (freesense-packages `4ae11df`).
- Removing the package now stops `vnstatd` before its service entry is deleted (freesense
  `c767de3`).
:::
