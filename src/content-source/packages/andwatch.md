---
title: ANDwatch
description: Monitor ARP and IPv6 Neighbor Discovery on FreeSense, keep a history of IP-to-MAC mappings, and get notified when they change.
---

The **ANDwatch** package (shown as **Neighbor Watch** in the Package Manager) runs the
[ANDwatch](https://github.com/dennypage/andwatch) daemon, which listens to ARP (IPv4) and Neighbor
Discovery (IPv6) traffic on local networks and records which Ethernet address uses which IP address,
when it was last seen, and the hardware vendor (MAC organization) of each address. When an IP address
moves to a different Ethernet address, ANDwatch can send a notification.

At the 1.1.0 release lock the package (`FreeSense-pkg-ANDwatch` 2.1_6) depends on andwatch 2.4.0
from the pinned FreeBSD ports tree.

Use it to spot new or unexpected devices, track down IP address conflicts, detect ARP or NDP
spoofing attempts, and answer "which device had this IP last week?". It is a passive monitor and
does not block anything.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **Neighbor Watch** (category Monitoring, lightweight) and select **Install package**, then
   **Confirm**.

Stable packages are published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64. See [Installing packages](/packages/installing-packages/).

## Where to find it

| Menu path | Page |
| --- | --- |
| **Services → ANDwatch** (Monitoring group) | *Services: ANDwatch* - general and per-interface settings |
| **Status → ANDwatch Database** (Network group) | Address records, one tab per monitored interface |

The service appears as **andwatchd** (*ANDwatch Daemon*) under **Status → Services**.

## First-time setup

1. Open **Services → ANDwatch**.
2. Select **Enable**.
3. In **Interfaces**, select the local networks to watch, for example **LAN** and a guest
   network. Interfaces that have an IPv4 or IPv6 gateway (such as WAN) are not offered.
4. For each selected interface a *&lt;interface&gt; Settings* section appears. Leave
   **Notifications** off for now, keep **Record Expiration** at 30 days, and keep the PCAP filter
   that ignores link-local and unique local addresses.
5. Select **Save**. ANDwatch downloads the MAC assignments (vendor) database if it is not present
   yet and starts one daemon per interface.
6. After several minutes, open **Status → ANDwatch Database** and check that records appear.
7. Once the initial learning burst is over, return to the settings and enable **Notifications** on
   the interfaces where address changes matter.
8. Make sure a notification method is configured under
   **System → Advanced → Notifications**.

## Settings reference

### General Settings

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Enables the ANDwatch daemon(s). Clearing it stops the daemons and removes the rc script and the MAC database update cron job. | Off |
| **Interfaces** | Interfaces to monitor (required, multiple). Interfaces with a gateway are excluded. One daemon runs per interface. | - |

### Per-interface settings

| Field | What it does | Default |
| --- | --- | --- |
| **Notifications** | Sends a notification when an IP address changes to a different Ethernet address on this interface. Enabling it on a new interface can produce many notifications at first, so let ANDwatch learn for a few minutes before turning it on. | Off |
| **Record Expiration** | Records not updated for this many days are deleted: 5, 10, 15, 20, 30, 60, or 90 days. | 30 days |
| **PCAP Filter** | Extra filter for the ARP/ND packets: **none**, **Ignore link-local addresses** (169.254.0.0/16, fe80::/10), **Ignore link-local and unique local addresses** (adds fc00::/7), or **Custom filter**. | Ignore link-local and unique local addresses |
| **Custom Filter** | A `pcap-filter(7)` expression used when **PCAP Filter** is **Custom filter**, at most 100 characters. Test it first with `tcpdump -d '<filter>'`. | Empty |

### ANDwatch Database page

| Control | What it does |
| --- | --- |
| Interface tabs | One tab per monitored interface. |
| Records table | **DateTime**, **Age**, **Hostname**, **IP Address**, **MAC Address**, **MAC Organization**. |
| **Search** | Filters the table by a string or regular expression in **Any Field**, **Hostname**, **IP Address**, **MAC Address**, or **MAC Organization**. **Clear** resets it. |
| **Show Historical Records** / **Show Current Records Only** | Switches between current mappings and the full history including previous Ethernet addresses. |

## Firewall rules and interfaces

No firewall rules are needed. ANDwatch passively captures ARP and Neighbor Discovery packets on the
monitored interfaces. The MAC assignments database update needs outbound internet access from the
firewall.

Monitor only networks the firewall is directly attached to; ARP and NDP do not cross routers, so
devices behind another router appear only as that router's address.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service | `andwatchd` (**Status → Services**) |
| rc script | `/usr/local/etc/rc.d/andwatch.sh` (generated while enabled) |
| Daemon | `/usr/local/bin/andwatchd`, one per interface, PID file `/var/run/andwatch-<if>.pid` |
| Database | `/var/db/andwatch/` (MAC assignments database `ma_db.sqlite` and per-interface records) |
| MAC database update | `andwatch-update-ma`, run from cron on the 1st and 15th of each month at a random time, and at service start if the database is missing |
| Query tool | `andwatch-query [-a] <if>` prints current (or, with `-a`, all) records for a real interface name |
| Logs | Daemons log to syslog (**Status → System Logs**); package start and stop messages use the `ANDwatch` prefix |
| Notifications | Sent through `/usr/local/pkg/andwatch-notify.php` to every remote notification method configured under **System → Advanced → Notifications** |

Each notification lists the timestamp, interface, host name, IP address, and the new and old
Ethernet addresses with their organizations.

The package registers `andwatch` as a RAM-disk directory, so when `/var` is a RAM disk the record
database is saved to the RAM disk store by FreeSense's package-data backup.

## Upgrade, backup, and removal

- Settings are stored in `config.xml` under `installedpackages/andwatch` and are included in
  configuration backups. The address records in `/var/db/andwatch/` are not.
- Removing the package stops the daemons and removes the rc script and the cron job. The database
  directory is left in place.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| *No interfaces selected* | Select at least one interface before saving. |
| WAN or another interface is missing from the list | Interfaces with a gateway are excluded by design. |
| *custom filter exceeds maximum length of 100 bytes* | Shorten the custom PCAP filter. |
| Database page is empty | Wait a few minutes after enabling, confirm `andwatchd` is running, and check that devices on that network actually send ARP/ND traffic. |
| **MAC Organization** is empty | The MAC assignments database is missing or outdated. Check outbound internet access, then restart the service to trigger an update. |
| Flood of notifications | Notifications were enabled before ANDwatch had learned the network. Disable them, wait, and re-enable. Devices using randomized (private) MAC addresses also cause repeated changes. |
| No notifications arrive | Configure and test a method under **System → Advanced → Notifications**. |

:::note[Changes in FreeSense 1.1]
- The settings entry carries the **Monitoring** group in the **Services** panel, and
  **ANDwatch Database** carries the **Network** group in the **Status** panel
  (freesense-packages `4ae11df`).
- Removing the package now stops `andwatchd` in the Package Manager's own removal step as well
  (freesense `c767de3`).
:::
