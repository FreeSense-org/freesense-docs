---
title: Interfaces, VLANs, and bridges
description: Build a recoverable network foundation before adding policy and services.
channels: [devel]
last_verified_release: development
---

Interfaces define the trust boundaries that every firewall rule, NAT mapping, DHCP scope, and VPN route depends on. Assign and test them before importing complex configuration or adding packages.

## Recommended order

1. Assign a trusted LAN and confirm WebUI access through it.
2. Configure WAN addressing and a default gateway.
3. Create VLANs and assign them as interfaces.
4. Add interface addresses, DHCP scopes, and DNS settings.
5. Apply firewall policy per interface.

## VLANs

A VLAN is an isolated Layer 2 segment carried over a tagged parent interface. Give each VLAN its own interface assignment, address plan, DHCP scope where needed, and explicit firewall policy. Do not rely on a switch VLAN alone to express security policy.

## Bridges

Bridges are useful when FreeSense must join interfaces at Layer 2, but they change where packets are filtered and can make troubleshooting harder. Prefer routing between interfaces where a Layer 3 boundary is possible. Document the bridge purpose, member interfaces, spanning-tree behavior, and management path before deployment.

## VXLAN

VXLAN interfaces are part of the 1.1 Development line, which is experimental and unsupported. Test a VXLAN design in a lab before relying on it, and do not expect it on a 1.0 Stable system.

A VXLAN interface carries an Ethernet segment inside UDP packets between two or more VXLAN tunnel endpoints (VTEPs). Use it to stretch a Layer 2 segment across a routed network, for example to join a site LAN with a segment in a data centre or a cloud network. Every VTEP of a segment must use the same VXLAN Network Identifier (VNI).

Create tunnels under **Interfaces > Assignments > VXLANs**. Each tunnel has:

- **Parent interface**: the interface, or IP Alias or CARP virtual IP, the tunnel is sent from. Its address of the chosen family becomes the local VTEP address. The tunnel follows that address when it changes: a new DHCP or DHCPv6 lease, a new tracked IPv6 prefix, or an edited virtual IP, also when High Availability sync applies the edit on the secondary. A bridge that the VXLAN itself is a member of cannot be the parent.
- **Mode**: *Unicast* sends to one remote VTEP address, which must be the address of another host: unspecified, loopback, broadcast, IPv6 link-local and the firewall's own address are rejected. *Multicast* joins a group on the parent interface and floods to every VTEP in that group. IPv4 groups must be 224.0.1.0 or higher, and IPv6 groups must have site scope or wider, because link-local groups do not cross a router.
- **VNI**: 0 to 16777215.
- **Ports**: FreeSense listens on and sends to UDP 4789 by default. Linux VTEPs use 8472 unless they are created with `dstport 4789`, so set both ports to 8472 for a default Linux peer.
  All multicast tunnels of one address family share a single socket per local port, so their VNIs must differ even on different parents, and unicast and multicast tunnels of one family need different local ports. The edit page enforces both.
- **TTL**: hop limit of the outer packets, 1 to 255, default 64.
- **MAC learning**: on by default. With learning, frames for a known MAC address go directly to the VTEP it was learned from.
- **Firewall rule**: optional automatic pass rule for the outer traffic; see [Firewall rules](#firewall-rules).

FreeSense names the interface (`vxlan0`, `vxlan1`, …) when the tunnel is first saved and never reuses a name that another tunnel owns.

A VXLAN keeps the same MAC address for its whole life, so switches and neighbours do not see a new address when the tunnel is recreated after a WAN address change. The edit page shows it. To use a different address, set it in the **MAC Address** field of the assigned interface.

If the kernel cannot start a tunnel, for example because the port is already in use, saving fails with an error and the previous settings stay in place. The reason is in the system log.

With a CARP virtual IP as the parent, the tunnel also runs on the backup node. In a bridged design, the backup then floods its own LAN broadcasts to the remote VTEPs as well. Prefer routing over the tunnel in high-availability pairs, or test the failover behaviour before relying on it.

### Assign, address, or bridge the tunnel

Assign the VXLAN under **Interfaces > Assignments** like any other interface. You can then give it an address and route over it, or add it to a bridge with a LAN interface to extend that segment. The VXLANs list shows which interface each tunnel is assigned as.

### Removing a tunnel or its parent

A VXLAN cannot be deleted while it is assigned, a bridge or interface group member, a LAGG member, or the parent of a VLAN or QinQ. Remove those uses first. Likewise, an interface cannot be unassigned while a VXLAN is sent from it.

A virtual IP that a VXLAN, GRE, or GIF tunnel is sent from cannot be deleted, and it must remain an IP Alias or CARP address of the tunnel's address family when it is edited. Changing its address is allowed; the tunnels follow it.

### MTU

Encapsulation adds 50 bytes over IPv4 and 70 bytes over IPv6. Without an explicit MTU, the VXLAN interface uses the parent MTU minus that overhead, for example 1450 on a 1500-byte IPv4 WAN.

All members of a bridge share one MTU, so bridging a 1450-byte VXLAN with a LAN interface lowers the LAN to 1450 as well. Hosts on that segment then need the same MTU. To keep 1500 bytes inside the tunnel, the underlay path must carry at least 1550 bytes (1570 over IPv6): raise the parent MTU and set 1500 on the assigned VXLAN interface.

### Firewall rules

Two sets of rules apply:

- **Outer traffic** on the parent interface: the UDP packets between VTEPs. Enable **Allow the VXLAN traffic in on the parent interface** on the tunnel, or add your own pass rule. The automatic rule passes UDP from the remote VTEP to the local address on the local port, and it comes before the parent's **Block private networks** and **Block bogon networks** rules. A peer in a private range therefore still works with those options enabled. In multicast mode the rule passes the group and the firewall's own address on the local port from any source, and also passes IGMP or MLD so the group membership stays up. On an internet-facing parent this lets any host that can reach that UDP port inject frames into the segment, so use multicast mode only on a trusted parent network.
- **Inner traffic**: the frames inside the tunnel are filtered by the rules of the assigned VXLAN interface. These rules are always required, even with the automatic outer rule. When the VXLAN is a bridge member, FreeSense filters bridged traffic on the member interfaces, so add rules on the VXLAN interface for traffic arriving from the remote site.

VXLAN has no encryption or authentication. Carry it over a trusted network, or inside an IPsec or WireGuard tunnel, when the path crosses the internet.

### Troubleshooting

- Check the tunnel parameters with `ifconfig vxlan0` from **Diagnostics > Command Prompt**, and confirm the local address matches the parent address.
- Use **Diagnostics > Packet Capture** on the parent interface with UDP port 4789 (or 8472) to confirm that encapsulated traffic arrives. Select the VXLAN view to decode the inner frames.
- If small packets pass but large transfers stall, the MTU is too large for the underlay path.
- **Interfaces > Assignments > VXLANs** marks a tunnel that does not currently exist. This usually means the parent has no address of the selected family yet; the tunnel is created as soon as it gets one. Otherwise the system log and `dmesg` show why the kernel rejected it.

## Recovery rule

Always retain a tested local console path while changing interface assignment, VLAN parents, bridges, or tunnels. A configuration backup and console access turn a lockout into a quick rollback.
