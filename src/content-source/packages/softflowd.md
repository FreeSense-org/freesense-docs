---
title: softflowd
description: Export NetFlow v1/v5/v9, IPFIX, or PSAMP flow records from FreeSense interfaces to a flow collector with softflowd.
---

The **softflowd** package (shown as **Flow Exporter** in the Package Manager) runs
[softflowd](https://github.com/irino/softflowd), a flow exporter that watches traffic on selected
interfaces and sends flow records to a NetFlow or IPFIX collector. It supports NetFlow versions 1, 5,
and 9, IPFIX (version 10), and PSAMP, and can export over IPv4 or IPv6.

At the 1.1.0 release lock the package (`FreeSense-pkg-softflowd` 1.2.6_5) depends on softflowd 1.0.0.
FreeSense builds softflowd 1.0.0_2 from source with a patch that makes it export promptly on quiet
interfaces (see the *Changes in FreeSense 1.1* note at the end of this page).

<!-- needs verification: confirm `pkg info softflowd` on a 1.1.0 system reports 1.0.0_2 (the patched overlay build). -->

Use softflowd when you already run a flow collector (for example nfdump/nfsen, ntopng on another
host, Elastic, or a commercial NetFlow analyzer) and want per-conversation traffic accounting from
the firewall. If you want flow analysis on the firewall itself, see [ntopng](/packages/ntopng/); for
simple per-interface totals, see [Traffic Totals](/packages/traffic-totals/).

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **Flow Exporter** (category Monitoring, lightweight) and select **Install package**, then
   **Confirm**.

Stable packages are published for amd64 and, starting with [1.1.1](/releases/previous-1.1/#freesense-111), arm64. See [Installing packages](/packages/installing-packages/).

## Where to find it

| Menu path | Page |
| --- | --- |
| **Services → softflowd** (Monitoring group) | *softflowd: Settings* - the single settings page |

The service appears as **softflowd** (*Netflow export daemon*) under **Status → Services**. When
softflowd is active, the settings page shows an info box listing the interface index assigned to each
selected interface.

## First-time setup

1. Confirm your collector's IP address, UDP port, and supported NetFlow version.
2. Open **Services → softflowd**.
3. Leave **Enable softflowd** set to **Enabled**.
4. In **Interface**, select the interfaces to monitor, for example **LAN**. Each interface gets its
   own softflowd process.
5. Enter the collector in **Host** (an IPv4 or IPv6 address; host names are not accepted) and
   **Port** (for example `2055`).
6. Choose the **Netflow version**. Use **10** (IPFIX) or **9** for modern collectors; use **5** only
   for collectors that require it (IPv4 only).
7. Choose **Flow Tracking Level** and **Flow Timestamp Precision**. These have no preselected
   value; **Full** and **Seconds** are typical choices.
8. Select **Save**. softflowd starts immediately.
9. Generate some traffic and confirm the collector receives flows.

## Settings reference

### General Settings

| Field | What it does | Default |
| --- | --- | --- |
| **Enable softflowd** | **Enabled** or **Disabled**. Disabled stops softflowd and removes its rc script. | Enabled |
| **Interface** | Interfaces to capture on (multiple). One softflowd instance per interface; flows are tagged with an interface index starting at 1 in the order shown in the list. | - |
| **Host** | Collector IP address (required; must be an IP address). IPv6 addresses are bracketed automatically. | - |
| **Port** | Collector UDP port (required). | - |
| **Sample** | Sampling rate denominator (`-s`). Empty or `0` disables sampling. | `0` |
| **Max Flows** | Maximum concurrently tracked flows before older flows are expired (`-m`). | softflowd default 8192 |
| **Hop Limit** | IPv4 TTL / IPv6 hop limit of export packets, 1-255 (`-L`). Unicast export uses the system default; multicast export defaults to 1. | Empty |
| **Netflow version** | **PSAMP**, **10** (IPFIX), **9**, **5**, or **1** (`-v`). | 10 |
| **Birectional Flow** | Export bidirectional flows (`-b`). Only valid with version 10. | Off |
| **Flow Tracking Level** | Fields that define a flow (`-T`): **MAC Address** (`ether`), **VLAN**, **Full**, **Proto**, **IP**. Coarser levels produce fewer, less detailed flows and less CPU load. | No preselection (required) |
| **Flow Timestamp Precision** | **Seconds**, **Milliseconds**, **Microseconds**, **Nanoseconds**, or **None**. **None** timestamps every flow with the system boot time. | No preselection (required) |

### Timeout Values

All timeouts are in seconds and optional; empty fields use softflowd's built-in defaults.

| Field | softflowd option | What it does |
| --- | --- | --- |
| **General** | `-t general=` | Timeout for all traffic unless a more specific timeout applies. |
| **Maximum Lifetime** | `-t maxlife=` | Forcibly expire flows older than this; `0` disables. |
| **Expire Interval** | `-t expint=` | Interval between expiry checks; larger values group more flows per export packet. `0` disables. |
| **TCP** | `-t tcp=` | Timeout for open TCP connections. |
| **TCP RST** | `-t tcp.rst=` | Timeout after a RST from either side. |
| **TCP FIN** | `-t tcp.fin=` | Timeout after FIN from both sides. |
| **UDP** | `-t udp=` | Timeout for UDP flows. |

## Firewall rules and interfaces

- Flow export is traffic generated by the firewall itself, so no inbound pass rule is needed on the
  firewall. Make sure the path to the collector allows UDP to the collector port (for example
  across a VPN or a downstream firewall).
- softflowd captures packets on the real interface with BPF. On a WAN interface with outbound NAT
  the exported flows show the translated (public) addresses; monitor internal interfaces to see
  internal hosts.
- Monitoring the same traffic on two interfaces (for example LAN and WAN) produces duplicate flows
  at the collector. Use the interface index to tell them apart, or monitor one side only.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service | `softflowd` (**Status → Services**) |
| rc script | `/usr/local/etc/rc.d/softflowd.sh` (generated; restarting it kills and restarts every instance) |
| Binary | `/usr/local/bin/softflowd` |
| Per-interface files | `/var/run/softflowd.<if>.pid` and control socket `/var/run/softflowd.<if>.ctl` |
| Logs | softflowd messages go to the system log (**Status → System Logs**) |

To inspect a running instance from a shell, use the control socket, for example
`softflowctl -c /var/run/softflowd.em1.ctl statistics` or `... dump-flows`.

## Upgrade, backup, and removal

- Settings are stored in `config.xml` under `installedpackages/softflowd` and are included in
  configuration backups.
- Removing the package stops softflowd and removes its rc script. In 1.1 the Package Manager stops a
  package's services before deleting their entries, so exporters no longer keep running after
  removal.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| *You must specify a valid ip address in the 'Host' field* | Enter the collector's IP address, not a host name. |
| *You must specify IPFIX(10) netflow version for using bidirectional flows* | Set **Netflow version** to **10** or clear **Birectional Flow**. |
| Service shows stopped after saving | No interface is selected, or the selected interface has no real device. Select at least one interface and save again. |
| Collector receives nothing | Check the collector's IP and port, that the collector listens for the selected version, and the route from the firewall to the collector. Use **Diagnostics → Packet Capture** on the outgoing interface with the collector port to confirm export packets leave. |
| Flows arrive late or in large bursts | Before 1.1, softflowd on FreeBSD only processed packets once the capture buffer filled. This is fixed in 1.1.0; if you still see bursts, lower **Expire Interval** and check the **General** and **Maximum Lifetime** timeouts. |
| Collector shows no IPv6 flows | NetFlow v1 and v5 are IPv4 only. Use version 9 or 10. |

:::note[Changes in FreeSense 1.1]
- softflowd now exports flows promptly on quiet interfaces. softflowd 1.0.0 opened the capture
  with a read timeout of 0, which FreeBSD's `bpf(4)` treats as "wait until the buffer is full", so on
  a lightly loaded interface thousands of packets could queue before any flow was processed and
  exported. FreeSense now builds softflowd with a 1-second read timeout (freesense-packages
  `5e5b5ce`).
- The menu entry carries the **Monitoring** group in the **Services** panel (freesense-packages
  `4ae11df`).
- The settings page uses the rebuilt 1.1 package form (freesense `cdc1221`).
- Removing the package now stops softflowd (freesense `c767de3`).
:::
