---
title: Interfaces, VLANs, and bridges
description: Build a recoverable network foundation before adding policy and services.
channels: [devel, stable]
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

## Recovery rule

Always retain a tested local console path while changing interface assignment, VLAN parents, or bridges. A configuration backup and console access turn a lockout into a quick rollback.
