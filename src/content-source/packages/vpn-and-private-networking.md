---
title: VPN and private networking
description: Choose WireGuard, Tailscale, ZeroTier, or OpenVPN export based on ownership and route-control requirements.
channels: [devel, stable]
last_verified_release: 1.0.5
---

FreeSense supports several private-networking integrations. Select one based on who controls peers,
routes, DNS, identity, and the operating model—not only encryption performance.

| Package | Best fit | Operational boundary |
| --- | --- | --- |
| WireGuard | Direct site-to-site or remote access | You own peer keys, tunnels, and routes |
| Tailscale | Managed WireGuard mesh | The Tailscale control plane manages identity and coordination |
| ZeroTier | Virtual network overlays | Managed routes and DNS require explicit administrator consent |
| OpenVPN Client Export | Client configuration delivery | Exports profiles and credentials for existing OpenVPN service design |

## Choose the ownership model first

- Use [WireGuard](/packages/wireguard/) when FreeSense should own tunnel interfaces, peer keys,
  allowed networks, and the firewall policy around them.
- Use Tailscale when its identity-aware control plane and managed mesh are a deliberate part of the
  design. Document the identity provider and who may advertise or approve routes.
- Use ZeroTier only after explicitly deciding which controller-supplied routes, default routes, and
  DNS settings may affect the appliance.
- Use OpenVPN Client Export when an existing FreeSense OpenVPN design needs distributable client
  profiles. It is an export tool, not a replacement VPN server.

Every choice still needs three independent controls: tunnel authentication, a return route, and a
firewall rule that permits only the intended traffic. A successful connection alone does not grant
reachability through the firewall.

## ZeroTier route consent

FreeSense does not silently accept managed routes or DNS from ZeroTier. Review and explicitly
enable managed routes, global routes, default routes, and DNS behavior according to the network
design. Confirm that return routes and firewall rules exist before exposing an internal network.

## Tailscale and ZeroTier operations

Tailscale and ZeroTier use a controller-managed identity and membership model. Before joining an
appliance, identify the account or controller owner, authentication and device-approval process,
route-advertisement authority, DNS policy, key or token expiry, and offboarding process. Restrict
which local networks may be advertised or accepted, then verify that controller changes cannot
silently broaden access beyond the approved design.

For both systems, validate node identity, peer state, accepted routes, and return routing before
allowing production traffic. Treat an overlay route as a routing change: protect the assigned
interface with explicit firewall policy and retain a non-overlay management path during rollout.

## OpenVPN Client Export

OpenVPN Client Export produces client configuration and credential material for an existing OpenVPN
service design. Before exporting, confirm the client identity, certificate lifecycle, permitted
networks, DNS behavior, and profile distribution method. Exported profiles and private keys are
secrets; deliver them through an approved channel and revoke or reissue them when a device is lost
or an operator leaves. Test import and connection with one non-administrative client before broad
distribution.

## Rollout checklist

1. Allocate tunnel addresses that do not overlap LAN, WAN, remote-site, or client networks.
2. Define each side's protected prefixes and decide which peer is permitted to originate a route.
3. Create or verify firewall rules on the assigned tunnel interface and destination interfaces.
4. Preserve a non-tunnel management path until bidirectional tests and recovery tests succeed.
5. Test DNS behavior separately from IP reachability; avoid unintentionally making a remote DNS
   server authoritative for local clients.
6. Document key rotation, peer revocation, and who removes a lost device or former site.

VPN configuration changes affect reachability quickly. Save a configuration backup and retain
console or local-LAN access during rollout.
