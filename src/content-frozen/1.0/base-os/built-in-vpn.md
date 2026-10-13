---
title: Built-in VPN
description: Design and operate the Base OS IPsec, OpenVPN, and L2TP capabilities.
---

IPsec, OpenVPN, and L2TP are Base OS VPN functions. Choose the protocol from interoperability,
identity, topology, client-management, and route-control requirements—not only encryption choices.
Every VPN design needs authentication, protected prefixes, return routing, interface policy, DNS,
logging, and a non-VPN management path.

Use **VPN → IPsec** for tunnels and mobile clients, **VPN → OpenVPN** for servers, clients, and
client-specific overrides, and **VPN → L2TP** only where the compatibility requirement is explicit.
Create certificates and authorities under System before deploying certificate-based access.

Start with one test peer or client. Verify authentication, a handshake, both-direction reachability,
DNS, firewall restrictions, and revocation or disablement. Keep private keys and exported client
profiles out of tickets, screenshots, and source control.

For optional overlay and WireGuard choices, see [VPN and private networking](/packages/vpn-and-private-networking/).
