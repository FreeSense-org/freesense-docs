---
title: Interfaces and networking
description: How FreeSense models ports, interface types, link settings, and network segments, and where each lives in the WebUI.
---

An interface is where a physical or virtual link meets policy. Firewall rules, NAT, DHCP scopes,
gateways, and VPN routes all attach to interfaces, so the interface design is the foundation of every
other setting. This page explains the model; the rollout procedure is in
[interfaces, VLANs, bridges, and VXLAN](/configure/interfaces-vlans-bridges/).

## Ports, assignments, and interfaces

FreeSense separates three things:

- a **network port** is what the operating system sees: a NIC such as `igc0` or `vtnet1`, or a
  virtual device such as `vlan0`, `bridge0`, or `vxlan0`;
- an **assignment** binds a port to a named interface: WAN, LAN, or `OPTn`;
- the **interface** carries the description, addresses, link settings, and the firewall rule tab.

Only assigned interfaces get addresses and rules. Create a virtual device first, then assign it.

## Interface types

| Type | Where it is created | Typical use |
| --- | --- | --- |
| Physical port | Detected at boot | WAN, LAN, and other directly cabled networks |
| VLAN (802.1Q) | **Interfaces → Assignments → VLANs** | Separate segments over one tagged parent port |
| QinQ (802.1ad) | **Interfaces → Assignments → QinQs** | Stacked VLAN tags from a carrier or metro network |
| LAGG | **Interfaces → Assignments → LAGGs** | Link aggregation or failover across several ports |
| Bridge | **Interfaces → Assignments → Bridges** | Join interfaces into one Layer 2 segment |
| Wireless | **Interfaces → Assignments → Wireless** | Wireless clones of a supported radio |
| PPP (PPPoE, PPTP, L2TP, PPP) | **Interfaces → Assignments → PPPs** | ISP links that authenticate a session |
| GRE | **Interfaces → Assignments → GREs** | Routed point-to-point tunnel |
| GIF | **Interfaces → Assignments → GIFs** | IPv4/IPv6 in IP tunnel, for example an IPv6 tunnel broker |
| VXLAN | **Interfaces → Assignments → VXLANs** | An Ethernet segment carried over a routed network |
| Interface group | **Interfaces → Assignments → Interface Groups** | One rule tab shared by several interfaces |

OpenVPN, IPsec VTI, and WireGuard tunnels can also be assigned as interfaces when you want per-tunnel
rules, gateways, or services.

VXLAN is a FreeSense interface type that is not available in pfSense. A VXLAN tunnel is assigned,
addressed, and bridged like any other interface; see
[VXLAN](/configure/interfaces-vlans-bridges/#vxlan) for modes, ports, MTU, and firewall rules.

## The Interfaces menu in 1.1

**Interfaces → Assignments** opens the **Interface Assignments** page. In 1.1 it is a searchable
list: each row shows the interface (with a badge when it is disabled), a network-port selector, and
the configured addresses. Port changes that are not saved yet, and ports assigned twice, are marked
before you save. **Add interface** opens a dialog; the new interface is named `OPTn` and starts
disabled. Deleting an interface asks for confirmation first. Ports that are members of a LAGG are not
offered, and wireless interfaces must be created on the **Wireless** tab before they can be assigned.

The tab bar on these pages lists Interface Assignments, NIC Settings, Interface Groups, VLANs,
Bridges, LAGGs, Wireless, QinQs, PPPs, GREs, GIFs, and VXLANs. Tabs that do not fit move into a
**More** menu. Below the divider in the **Interfaces** menu, each assigned interface has its own
entry that opens its configuration page.

## Link settings

On each interface page, the rarely changed link options are in a collapsible **Link Settings**
section. It opens automatically when one of them is set or a save failed.

| Field | Effect |
| --- | --- |
| **MAC Address** | Overrides ("spoofs") the MAC address. A VLAN takes its MAC address from its parent, so set it there. |
| **MTU** | Blank uses the adapter default, typically 1500. A bridge member takes its MTU from the bridge. |
| **MSS** | Enables TCP MSS clamping to this value minus 40 (IPv4) or 60 (IPv6). |
| **Speed and Duplex** | Forces a media type offered by the driver. Leave it on autoselect unless the switch port is also forced. |

## NIC Settings (adapter hardware)

**Interfaces → NIC Settings** manages the hardware features of the network adapters themselves,
including adapters that are not assigned.

- The **Adapters** view is a searchable list showing each adapter's assignment, hardware and driver,
  the negotiated link speed and duplex (for example `1000baseT full-duplex`; tunnels and other
  adapters without media show **Virtual**), the MTU, and chips for each offload.
- **Configure** on an adapter sets checksum offload, TCP segmentation offload (TSO), large receive
  offload (LRO), VLAN hardware acceleration, and Wake-on-LAN to **On**, **Off**, or **Profile
  default**, and sets an adapter MTU between 576 and 16384. Only that adapter is saved and applied.
- **Details** shows the driver, MAC address, capabilities, and read-only driver tunables.
- The **Profile** view picks the default for every setting left at **Profile default**:
  **Firewall Balanced** (recommended and the default: LRO and TSO off, checksum and VLAN
  acceleration on), **Maximum Throughput**, **Low Latency**, or **Packet Capture / Troubleshooting**
  (every offload off). The same view enables ALTQ traffic shaping on `vtnet` and `hn` adapters,
  which turns off multiqueue and takes effect after a reboot.

Applying adapter settings can interrupt traffic on that adapter for a moment, including your WebUI
session if it runs over it.

## Verify before adding policy

After any topology change, confirm in **Status → Interfaces** that the interface is up, has the
expected address, and shows the expected media. Then test DNS, gateway reachability, and return
routing, and only then add firewall policy. Keep management on a known interface and retain console
access while you change assignments, parents, bridges, or tunnels.

## Related pages

- [Interfaces, VLANs, bridges, and VXLAN](/configure/interfaces-vlans-bridges/) - procedures
- [Firewall and NAT](/base-os/firewall-and-nat/)
- [Routing and high availability](/base-os/routing-and-high-availability/)
