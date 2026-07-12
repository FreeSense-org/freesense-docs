---
title: VPN and private networking
description: Choose WireGuard, Tailscale, ZeroTier, or OpenVPN export based on ownership and route-control requirements.
channels: [devel, candidate, stable]
last_verified_release: development
---

FreeSense supports several private-networking integrations. Select one based on who controls peers, routes, DNS, identity, and the operating model—not only encryption performance.

| Package | Best fit | Operational boundary |
| --- | --- | --- |
| WireGuard | Direct site-to-site or remote access | You own peer keys, tunnels, and routes |
| Tailscale | Managed WireGuard mesh | The Tailscale control plane manages identity and coordination |
| ZeroTier | Virtual network overlays | Managed routes and DNS require explicit administrator consent |
| OpenVPN Client Export | Client configuration delivery | Exports profiles and credentials for existing OpenVPN service design |

## ZeroTier route consent

FreeSense does not silently accept managed routes or DNS from ZeroTier. Review and explicitly enable managed routes, global routes, default routes, and DNS behavior according to the network design. Confirm that return routes and firewall rules exist before exposing an internal network.

## Common checks

- Confirm peer identity and allowed networks.
- Avoid overlapping tunnel and LAN address ranges.
- Define DNS ownership for connected clients.
- Test failure and recovery without relying on an existing tunnel for administration.
- Restrict management access by interface and source network.

VPN configuration changes affect reachability quickly. Save a configuration backup and retain console or local-LAN access during rollout.
