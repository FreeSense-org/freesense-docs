---
title: LLDP (lldpd)
description: Advertise FreeSense to neighboring switches and discover them with LLDP, CDP, EDP, FDP, and NDP using lldpd.
---

The **lldpd** package (shown as **LLDP Service** in the Package Manager) runs
[lldpd](https://lldpd.github.io/), an implementation of the IEEE 802.1AB Link Layer Discovery
Protocol (LLDP). It lets the firewall announce itself to directly connected switches and other
devices, and shows what those neighbors announce in return: device names, port IDs, VLANs,
management addresses, and capabilities. lldpd also speaks several vendor discovery protocols: Cisco
Discovery Protocol (CDP), Extreme Discovery Protocol (EDP), Foundry Discovery Protocol (FDP), and
Nortel Discovery Protocol (NDP/SONMP).

At the 1.1.0 release lock the package (`FreeSense-pkg-lldpd` 0.9.13_2) depends on lldpd 1.0.21 from
the pinned FreeBSD ports tree.

Use it to document cabling ("which switch port is this firewall NIC on?"), help network management
systems build topology maps, or verify VLAN tagging on a trunk.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **LLDP Service** (category Services, lightweight) and select **Install package**, then
   **Confirm**.

Stable packages are published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64. See [Installing packages](/packages/installing-packages/).

## Where to find it

| Menu path | Page |
| --- | --- |
| **Services → LLDP** (Monitoring group) | **LLDP Status** tab: local chassis and neighbor details |
| **Services → LLDP → LLDP Settings** | Daemon, interface, and protocol settings |

The service appears as **lldpd** (*LLDP daemon*) under **Status → Services**.

<!-- needs verification: the Package Manager "Open configuration" button uses the catalog path /pkg_edit.php?xml=lldpd.xml; lldpd.xml defines no form fields (settings live in /lldpd_settings.php). Confirm what the button opens on a 1.1.0 system. -->

## First-time setup

1. Open **Services → LLDP** and select the **LLDP Settings** tab.
2. Select **Enable**.
3. In **Interfaces**, select the interfaces connected to switches, for example **LAN**. For VLAN,
   LAGG, and other virtual interfaces, lldpd runs on the parent physical port(s).
4. Set **Chassis Interface** and **IP Management Interface** (both usually **LAN**). The management
   interface must have an IPv4 or IPv6 address unless **Receive Only Mode** is selected.
5. Under **Protocol Support**, keep **Link Layer Discover Protocol (LLDP)** at **Active** and leave
   the vendor protocols **Disabled** unless your switches need them.
6. Select **Save**. You are taken to the **LLDP Status** tab.
7. After about 30 seconds (the default LLDP transmit interval), check that neighbors appear and,
   on the switch, that the firewall is listed as an LLDP neighbor.

## Settings reference

### General Settings

| Field | What it does | Default |
| --- | --- | --- |
| **Enable** | Starts the LLDP daemon. Clearing it stops lldpd and removes its rc script. | Off |
| **Receive Only Mode** | Only listens; never transmits discovery frames, even in response to received frames (`-r`). Protocol choices switch to **Enabled**/**Disabled**. | Off |
| **Enable AgentX** | Runs an SNMP AgentX subagent (`-x`) so an SNMP agent that supports AgentX can expose LLDP data. | Off |
| **Interfaces** | Interfaces lldpd listens and sends on (at least one required). Virtual interfaces are mapped to their parent physical interfaces. | LAN |
| **Chassis Interface** | Interface used for chassis identification, usually LAN (`-C`). Not used in receive-only mode. | LAN |
| **IP Management Interface** | Interface whose IPv4 and IPv6 addresses are advertised as management addresses (`-m`). Not used in receive-only mode. | LAN |

### Protocol Support

| Protocol | Options | Default |
| --- | --- | --- |
| **Link Layer Discover Protocol (LLDP)** | **Disabled**, **Passive**, **Active**. **Active** forces LLDP to be sent even when a neighbor only speaks another protocol (`-l`); **Disabled** turns LLDP off (`-ll`); **Passive** uses lldpd's default behavior. | Active |
| **Cisco Discovery Protocol (CDP)** | **Disabled**, **Passive V1 and V2**, **Passive V2 only**, **Active V1, Passive V2**, **Active V2, Passive V1**, **Active V2 only**. | Disabled |
| **Extreme Discovery Protocol (EDP)** | **Disabled**, **Passive**, **Active**. | Disabled |
| **Foundry Discovery Protocol (FDP)** | **Disabled**, **Passive**, **Active**. | Disabled |
| **Nortel Discovery Protocol (NDP)** | **Disabled**, **Passive**, **Active**. | Disabled |

In lldpd, *passive* for a vendor protocol means it is sent only after a neighbor speaking that
protocol has been detected; *active* sends it unconditionally. In **Receive Only Mode** the choices
are **Enabled** or **Disabled** (for CDP: **Enable V1 and V2** or **Enable V2 only**).

## Firewall rules and interfaces

No firewall rules are needed. LLDP and the vendor discovery protocols are layer-2 Ethernet
protocols that pf does not filter, and they are never forwarded beyond the directly connected
device.

Announcing the firewall's name, software version, and management address to every connected device
can be undesirable on untrusted segments; enable lldpd only on infrastructure-facing interfaces, or
use **Receive Only Mode** there.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service | `lldpd` (**Status → Services**) |
| rc script | `/usr/local/etc/rc.d/lldpd.sh` (generated while enabled) |
| Daemon / client | `/usr/local/sbin/lldpd`, `/usr/local/sbin/lldpcli` |
| Status page | **Services → LLDP** shows `lldpcli show chassis detail` and `lldpcli show neighbors detail`, or *The LLDP service is not running* |
| Logs | lldpd messages go to the system log (**Status → System Logs**); package messages use the `lldpd` prefix |

From a shell, `lldpcli show neighbors` and `lldpcli show statistics` give the same information.

## Upgrade, backup, and removal

- Settings are stored in `config.xml` under `installedpackages/lldpd` and are included in
  configuration backups.
- Saving the settings stops lldpd and starts it again with the new options.
- Removing the package stops lldpd and removes its rc script.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| *At least one interface must be selected* | Select one or more interfaces. |
| *The management interface must have an IP address* | Choose an interface with an address as **IP Management Interface**, or enable **Receive Only Mode**. |
| No neighbors listed | Confirm the switch has LLDP enabled on that port and wait at least one advertisement interval (often 30 seconds). If the switch speaks only CDP or another vendor protocol, enable that protocol in passive mode. |
| Firewall does not appear on the switch | Check that **Receive Only Mode** is off and LLDP is **Active**. Some switches only show LLDP neighbors on ports with LLDP receive enabled. |
| AgentX data missing in SNMP | The SNMP agent must have AgentX master support enabled. See [NET-SNMP](/packages/net-snmp/). |
| Neighbor shows on the wrong interface for a VLAN | lldpd runs on the parent physical port, so neighbors are reported per physical port. |

:::note[Changes in FreeSense 1.1]
- The menu entry carries the **Monitoring** group in the **Services** panel (freesense-packages
  `4ae11df`).
- Removing the package now stops lldpd in the Package Manager's own removal step as well
  (freesense `c767de3`).
:::
