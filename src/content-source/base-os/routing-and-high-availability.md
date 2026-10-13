---
title: Routing and high availability
description: How FreeSense chooses paths - gateways, gateway groups, static and policy routes, dynamic routing - and how CARP high availability and tunnels interact.
---

Routing decides where permitted traffic goes. FreeSense routes with the FreeBSD kernel routing table,
adds policy routing through firewall rules, and adds dynamic routing through an optional package.
This page explains the model; the procedures are in [routing and multi-WAN](/configure/routing-multiwan/).

## Where routing lives

| Menu path | Purpose |
| --- | --- |
| **System → Routing → Gateways** | Next hops, the default gateway for IPv4 and IPv6, and gateway monitoring |
| **System → Routing → Static Routes** | Fixed routes to remote networks |
| **System → Routing → Gateway Groups** | Failover and load-sharing sets of gateways, used by policy routing |
| **System → High Availability** | Configuration synchronization (XMLRPC) and state synchronization (`pfsync`) |
| **Firewall → Virtual IPs** | CARP addresses that move between cluster nodes |
| **Status → Gateways** | Live gateway status, latency, and loss |
| **Status → CARP (failover)** | Which node is MASTER or BACKUP for each CARP address |
| **Diagnostics → Routes** | The kernel routing table |

## Gateways and monitoring

Each gateway is monitored with ICMP probes (`dpinger`) to a monitor address. Latency and loss
thresholds decide whether the gateway is up, warning, or down, and gateway groups react to those
states. Unless you enter an alternative **Monitor IP**, the gateway address itself is probed, which
only proves that the first hop is alive; choose a monitor address that reflects real upstream
reachability.

In 1.1, monitoring for OpenVPN gateways is pinned to the tunnel interface, and the monitor route is
removed when **Do not add static route for gateway monitor IP address via the chosen interface** is
enabled on the gateway. A DHCP WAN renews its lease
through the WAN that holds the lease, which matters on multi-WAN systems with several DHCP uplinks.

## Policy routing and multi-WAN

A firewall rule can set a gateway or gateway group, which sends matching traffic to that next hop
instead of the routing table's choice. A gateway group with several tiers fails over; members on the
same tier share connections. Multi-WAN design must also cover outbound NAT on each WAN, DNS servers
per WAN, VPN endpoints, and services that need a stable source address.

## Dynamic routing

OSPF, BGP, and other routing protocols are provided by the [FRR](/packages/frr/) Optional Package, not
by the base system. A learned route can change much more of the network than a static route, so keep
route filters and redistribution under change control.

## High availability

A FreeSense high-availability pair shares CARP virtual IPs. The MASTER node answers on them; the
BACKUP node takes over when the MASTER stops advertising. **System → High Availability** synchronizes
the firewall states between nodes over a dedicated sync interface and pushes selected configuration
areas from the primary to the secondary. Treat HA as one design: sync interface, peer addresses,
which areas are synchronized, services that must follow the MASTER, and a tested failover.

### Tunnels sent from a virtual IP

GRE, GIF, and VXLAN tunnels can be sent from an IP Alias or CARP virtual IP.

- The tunnel follows the virtual IP's address when the virtual IP is edited, including when
  configuration synchronization applies the edit on the secondary.
- While a tunnel uses it, the virtual IP cannot be deleted and must stay an IP Alias or CARP address
  of the tunnel's address family.
- A VXLAN sent from a CARP virtual IP, or from an IP Alias on one, runs only on the node that is
  MASTER for it. The BACKUP node keeps it down and starts it on failover, so remote VTEPs follow
  the active node.

See [VXLAN](/configure/interfaces-vlans-bridges/#vxlan) for the tunnel settings.

## Related pages

- [Routing and multi-WAN](/configure/routing-multiwan/) - procedures
- [Interfaces and networking](/base-os/interfaces-and-networking/)
- [FRR](/packages/frr/)
