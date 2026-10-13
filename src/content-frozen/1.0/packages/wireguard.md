---
title: WireGuard
description: Configure and operate FreeSense-managed WireGuard tunnels and peers safely.
packages: [WireGuard]
capabilities: [route-management, credential-storage]
last_verified_release: 1.0.5
---

The FreeSense WireGuard package manages WireGuard tunnels, peer keys, tunnel addresses, service
state, and status views. Use it for site-to-site or remote-access designs where you deliberately
own the peer relationships and routes. It does not automatically create the firewall policy or
return routing required for connected networks.

## Design before configuration

For each tunnel, record the local tunnel address, listen port, peer public key, endpoint, protected
prefixes, DNS behavior, and the firewall policy needed in both directions. Allocate tunnel and
protected-network prefixes that do not overlap any LAN, WAN, VPN, or remote site.

`Allowed IPs` is a peer's routing and traffic-selection boundary in WireGuard. It is not a
replacement for FreeSense firewall rules. Keep it minimal: a remote peer should receive only its
tunnel address and the remote networks it is actually entitled to reach.

:::caution[Keep a recovery path]
Changing routes or a tunnel used for administration can immediately cut off access. Save a
configuration backup and keep console or a separate management network available until the rollout
has been tested both ways.
:::

## Configure a tunnel and peer

1. Install **WireGuard** from **System → Package Manager** and open **VPN → WireGuard**.
2. In **Tunnels**, add a tunnel. Enter a description, enable it, choose a unique listen port, and
   generate a key pair in the UI or provide the private key through your approved secret-handling
   process. Copy only the public key to the remote peer.
3. Set the tunnel address or addresses. For an unassigned tunnel, these are configured in the
   tunnel form; once assigned to a FreeSense interface, use the interface configuration for the
   relevant addressing behavior.
4. Save the new tunnel before adding peers. The WebUI intentionally requires this because peers are
   attached to a saved tunnel.
5. Add a peer, selecting the saved tunnel. Enter its public key, endpoint when appropriate, and the
   narrow `Allowed IPs` set. Configure persistent keepalive only when it is needed to preserve NAT
   state for a reachable endpoint.
6. For routed site-to-site traffic, assign the enabled tunnel under **Interfaces → Assignments**,
   configure interface addressing as needed, then add explicit firewall rules and return routes.
7. Check **Status → WireGuard** for peer state and handshake information, then test the intended
   source, destination, DNS, and return path.

## Assigned tunnels are protected

FreeSense prevents disabling or deleting a WireGuard tunnel while it is assigned to a FreeSense
interface. It also prevents disabling WireGuard globally when one or more tunnels are assigned.
This avoids silently leaving an assigned interface without its tunnel, but it does not replace a
change plan. To retire a tunnel, first remove dependent routes and firewall rules, unassign the
interface, confirm no services use it, then disable or delete the tunnel and revoke the remote key.

## Verification checklist

- Confirm a recent handshake in **Status → WireGuard** for each expected peer.
- Confirm tunnel reachability with a test that uses the intended source and destination address.
- Confirm routes in both directions. A local route alone is insufficient when the remote side has
  no path back.
- Confirm interface firewall rules permit only intended networks and protocols.
- Test DNS separately. Do not infer correct name resolution from a successful ping to an address.
- Test failure recovery: stop or disconnect the tunnel in a maintenance window and verify that
  management stays available through the planned alternate path.

## Key and peer lifecycle

Treat private keys like administrative credentials. Do not paste them into tickets, chat, shell
history, screenshots, or exported documentation. A lost device, contractor departure, or suspected
key disclosure requires peer removal or key rotation—not merely waiting for a tunnel to go idle.

Keep an inventory of peer owner, public key fingerprint, allowed networks, endpoint ownership, and
review date. Remove stale peers and overly broad prefixes as part of normal access review.

## Common problems

| Symptom | Check |
| --- | --- |
| No handshake | Endpoint reachability, UDP port forwarding/firewall policy, peer public keys, clock and NAT behavior. |
| Handshake but no traffic | Narrow or incorrect `Allowed IPs`, missing routes, or firewall rules on the WireGuard and destination interfaces. |
| One-way reachability | The remote return route, NAT policy, or firewall policy; test from both sources. |
| Remote clients lose DNS | Which DNS server is advertised or reachable through the tunnel, and whether its rules permit the client subnet. |
| Tunnel cannot be disabled or removed | It is assigned to a FreeSense interface; remove dependent configuration and unassign it first. |

For selection and rollout guidance across managed and self-managed VPN options, see
[VPN and private networking](/packages/vpn-and-private-networking/).
