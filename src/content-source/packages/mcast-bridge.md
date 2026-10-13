---
title: Multicast Bridge
description: Forward selected UDP multicast streams between FreeSense interfaces with the mcast-bridge package, using IGMP/MLD or static forwarding.
---

The **Multicast Bridge** package (`FreeSense-pkg-mcast-bridge` 1.4) runs the `mcast-bridge`
daemon (version 1.3.0 or later, from the FreeBSD package repository). It forwards UDP multicast
traffic for chosen groups and ports between interfaces, for both IPv4 and IPv6. Typical uses are
IPTV or audio streams, multicast-based discovery for specific applications, and sensors that
publish to a multicast group on another VLAN.

Each forwarding rule is a **bridge**: one UDP port, one IPv4 and/or IPv6 multicast group, a set of
inbound interfaces and a set of outbound interfaces. By default the bridge uses IGMP (IPv4) and
MLD (IPv6) to forward only to interfaces that have an active subscriber.

For mDNS (UDP 5353, `224.0.0.251`) use [mDNS Bridge](/packages/mdns-bridge/) or
[Avahi](/packages/avahi/) instead: link-local groups cannot be bridged by this package. For
broadcast-based protocols use [UDP Broadcast Relay](/packages/udpbroadcastrelay/).

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **Multicast Bridge** (package `FreeSense-pkg-mcast-bridge`) and click **Install**.

On Stable 1.1 the package is available for amd64. See
[Installing packages](/packages/installing-packages/).

## Where to find it

**Services → Multicast Bridge** (in the *Routing* group of the Services menu):

- `mcast_bridge.php`: the **Settings** section and the **Bridges** table (UDP Port, IPv4
  Address, IPv6 Address, Inbound Interfaces, Outbound Interfaces, Description). Static interfaces
  are marked with an asterisk.
- `mcast_bridge_edit.php`: **Edit Bridge**, opened with **Add** or the edit icon.

## First-time setup

1. Open **Services → Multicast Bridge**.
2. Click **Add** under **Bridges**.
3. Enter the **UDP Port** of the stream, for example `5004`.
4. Enter the **IPv4 Multicast Address**, for example `239.1.1.10`, and/or an IPv6 group.
5. Select the **Inbound Interfaces** where the source sends, for example *IPTV*.
6. Select the **Outbound Interfaces** where receivers are, for example *LAN*.
7. Add a **Description** and click **Save**.
8. Back on the main page, check **Enable** and click **Save**.
9. Click **Apply Changes** in the banner. Changes are not applied until you do.
10. Add the firewall rules described below, then start a receiver on the outbound network.

## Settings reference

### Settings (main page)

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Runs the daemon. It only starts when at least one bridge is enabled. | Off |
| **CARP Status VHID** | In an HA pair, run only while the selected VHID is MASTER. | `none` |
| **IGMP Querier Mode** | When the bridge acts as IGMP querier (IPv4): **Never**, **Quick** (at startup), **Delay** (after 125 seconds if no other querier is present) or **Defer** (delay and always defer to other queriers). | Quick |
| **MLD Querier Mode** | The same choice for MLD (IPv6). | Quick |

Most networks have a switch or router acting as querier. Use **Delay** or **Defer** when another
querier exists, so they do not compete.

### Edit Bridge

| Field | What it does | Default |
| --- | --- | --- |
| **Disable** | Keep the bridge in the configuration but do not run it. | Off |
| **UDP Port** | Destination UDP port of the stream. Required, and unique across bridges. | Empty |
| **IPv4 Multicast Address** | IPv4 group to forward. Must be routable; groups in `224.0.0.0/24` are refused. | Empty |
| **IPv6 Multicast Address** | IPv6 group to forward. Must be routable; groups in `ff02::/16` are refused. At least one of the two addresses is required. | Empty |
| **Inbound Interfaces** | Interfaces the bridge receives from. It joins the group there only while a subscriber exists on an outbound interface. | None |
| **Static Inbound Interfaces** | Inbound interfaces where the bridge joins the group at startup and never leaves. | None |
| **Outbound Interfaces** | Interfaces the bridge forwards to, only while IGMP/MLD shows an active subscriber. | None |
| **Static Outbound Interfaces** | Interfaces that always receive the stream; IGMP/MLD is not used there. | None |
| **Description** | Free text for reference. | Empty |

At least one inbound and one outbound interface (normal or static) are required. An interface can
appear in both lists to make the bridge bidirectional, but a bridge with only one inbound
interface cannot use that same interface as its only outbound interface, and the reverse.

The main page also lets you toggle a bridge on or off and delete it. Each change asks you to
**Apply Changes**.

## Firewall rules and interfaces

The package adds no firewall rules.

- On each **inbound** interface, allow UDP from the source to the multicast group and port of
  the bridge, for example destination `239.1.1.10` port `5004`.
- On each **outbound** interface where IGMP or MLD is used, receivers send membership reports.
  IGMP packets carry an IP option (Router Alert), which the firewall blocks by default. Add a
  pass rule for protocol **IGMP** and enable **Allow IP options** in the rule's advanced options.
- Static interfaces do not need IGMP/MLD rules.

See [Firewall rules and aliases](/configure/firewall-rules-aliases/).

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service name | `mcast-bridge` (*Multicast Bridge* in **Status → Services**) |
| rc script | `/usr/local/etc/rc.d/mcast-bridge.sh` |
| Configuration file | `/usr/local/etc/mcast-bridge.conf` (generated, do not edit) |
| PID file | `/var/run/mcast-bridge.pid` |
| Logs | The daemon logs to syslog (`-s`); messages appear in **Status → System Logs → System → General**. |

## Upgrade, backup, and removal

- Settings are stored in `config.xml` under `installedpackages/mcast-bridge` and are included in
  configuration backups.
- Removing the package stops the daemon and deletes its config and rc files. The settings stay in
  `config.xml` for a later reinstall.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| *IPv4 Multicast Address is link local (non routable)* | Groups in `224.0.0.0/24` (and `ff02::/16` for IPv6) cannot be bridged. Use mDNS Bridge or UDP Broadcast Relay for link-local protocols. |
| *UDP Port is already in use by another bridge instance* | Each bridge needs a unique port. Combine the groups on that port into one bridge. |
| The service does not start | **Enable** is off, every bridge is disabled, or the changes were not applied. Click **Apply Changes**. |
| The stream reaches the firewall but not the receivers | IGMP reports are blocked. Add the IGMP rule with **Allow IP options**, or make the outbound interface static. |
| The stream stops after a few minutes | No querier is active, so memberships time out. Set **IGMP Querier Mode** / **MLD Querier Mode** to **Quick**, or enable a querier on the switch. |

:::note[Changes in FreeSense 1.1]
- **Multicast Bridge** is listed in the *Routing* group of the 1.1 Services menu
  (freesense-packages 4ae11df).
- Otherwise the package is unchanged from 1.0.x apart from the rebuild for the FreeBSD 16
  platform.
:::
