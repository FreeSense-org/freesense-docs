---
title: Interfaces and networking
description: Assign ports, build network segments, and verify connectivity before applying policy.
---

FreeSense interfaces are the boundary between physical or virtual links and policy. Start by
identifying WAN, LAN, and management connectivity at the console. Record port labels, VLAN IDs,
addressing, upstream ownership, and the rollback path before making remote changes.

## Build the network deliberately

Use **Interfaces → Assignments** to assign ports and create interface instances. Configure the
interface address, gateway, and link-specific behavior on the resulting interface page. Use VLANs,
LAGGs, bridges, interface groups, and PPP only where their topology and failure behavior are
understood; each can alter where policy is evaluated.

On the 1.1 Development line, which is experimental and unsupported, **Interfaces → Assignments → VXLANs**
also creates VXLAN tunnels that carry an Ethernet segment across a routed network. A VXLAN is
assigned, addressed, and bridged like any other interface; see
[VXLAN](/configure/interfaces-vlans-bridges/#vxlan) for modes, MTU, and firewall rules.

Keep management on a known interface and test link state, address assignment, DNS, gateway
reachability, and return routing after every topology change. Do not bridge WAN and LAN merely to
make a test work.

## Verify before policy expansion

Confirm the configured interface appears in **Status → Interfaces**, has the expected address and
link state, and reaches only its intended upstream. Then add firewall policy. For VLAN and bridge
designs, test one host from each segment and verify that untrusted segments cannot reach management.

See [interfaces, VLANs, bridges, and VXLAN](/configure/interfaces-vlans-bridges/) for a rollout checklist.
