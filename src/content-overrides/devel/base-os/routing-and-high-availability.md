---
title: Routing and high availability
description: Control gateways, static and dynamic paths, multi-WAN behavior, and failover safely.
---

Routing decides where permitted traffic goes. Define the source networks, gateways, static routes,
policy-routing needs, and return paths before changing a default gateway or advertising a route.
Keep console or independent management access during routing work.

Use **System → Routing** for gateways, gateway groups, and static routes. Use gateway monitoring to
distinguish a failed upstream from an unreachable monitoring target. Multi-WAN policy must account
for NAT, state handling, DNS, VPN paths, and services that require a stable source address.

High availability adds configuration synchronization and failover behavior. Treat it as a complete
design: peer addressing, state synchronization, virtual IP ownership, services, certificates,
failure tests, and split-brain recovery. Test a controlled failover before relying on it.

On the 1.1 Development line, which is experimental and unsupported, tunnels can be sent from a
virtual IP. GRE, GIF, and VXLAN tunnels follow the virtual IP's address when it is edited, also when
configuration synchronization applies the edit on the secondary. A VXLAN sent from a CARP virtual IP
runs only on the node that is MASTER for it and stops on the BACKUP node, so the remote VTEPs follow
a failover. See [VXLAN](/configure/interfaces-vlans-bridges/#vxlan).

See [routing and multi-WAN](/configure/routing-multiwan/) and [system administration](/base-os/system-administration/).
