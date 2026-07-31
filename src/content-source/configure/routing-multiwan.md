---
title: Routing and multi-WAN
description: Control gateways, static routes, policy routing, and failover without losing observability.
channels: [devel, stable]
last_verified_release: development
---

Routing chooses the next hop for traffic. Keep ordinary default-gateway routing separate from policy-routing exceptions so a future operator can explain why a flow takes a particular path.

## Gateways and groups

Define a gateway for each WAN and monitor it with an address that reflects real reachability. A gateway group expresses failover or load-distribution intent. Test both normal operation and a simulated WAN failure before relying on the policy.

## Static and policy routes

Use static routes for known remote networks. Use policy routing only for selected source networks, services, or destinations that intentionally need a non-default gateway. Document the purpose and the expected return path for every exception.

## Dynamic routing

The supported **FRRouting** package is the place for dynamic routing protocols. Keep routing daemon configuration, filter policy, and redistribution choices under change control. A route learned by a daemon can change far more of the network than a manual static route.

## Multicast and discovery

The multicast bridge, mDNS bridge, UDP broadcast relay, and Avahi packages solve specific discovery or forwarding cases. Enable only the protocol path required; broad Layer 2 or broadcast forwarding can defeat intended segmentation.
