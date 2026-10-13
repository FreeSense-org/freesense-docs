---
title: Built-in VPN
description: The VPN protocols in the FreeSense base system - IPsec, OpenVPN, and L2TP - and how to choose between them and the optional VPN packages.
---

IPsec, OpenVPN, and L2TP are part of the FreeSense base system and are updated with System updates.
WireGuard, Tailscale, and ZeroTier are Optional Packages; see
[VPN and private networking](/packages/vpn-and-private-networking/).

## Where VPN lives

| Menu path | Tabs | Use |
| --- | --- | --- |
| **VPN → IPsec** | Tunnels, Mobile Clients, Pre-Shared Keys, Advanced Settings | Site-to-site tunnels (IKEv1/IKEv2, policy-based or VTI) and remote-access clients |
| **VPN → OpenVPN** | Servers, Clients, Client Specific Overrides, Wizards | TLS-based remote access and site-to-site links |
| **VPN → L2TP** | Configuration, Users | Legacy clients that require L2TP; combine it with IPsec for encryption |
| **Status → IPsec**, **Status → OpenVPN** | - | Live tunnel and client state |
| **Status → System Logs → IPsec / OpenVPN** | - | Protocol logs |

The WireGuard, Tailscale, and ZeroTier packages add their pages to the same **VPN** menu, and the
[OpenVPN client export](/packages/openvpn-client-export/) package adds a **Client Export** tab to
**VPN → OpenVPN**.

## Choosing a protocol

| Need | Good fit |
| --- | --- |
| Site-to-site with third-party firewalls or cloud gateways | IPsec (IKEv2) |
| Remote-access clients with certificate identities and per-user overrides | OpenVPN |
| Native operating-system VPN clients | IPsec IKEv2 mobile clients |
| Simple, fast peer configuration | WireGuard (Optional Package) |
| Mesh or NAT-traversing overlays | Tailscale or ZeroTier (Optional Packages) |
| A layer 2 segment between sites | VXLAN inside an IPsec or WireGuard tunnel; see [VXLAN](/configure/interfaces-vlans-bridges/#vxlan) |

Whatever the protocol, every design needs an identity model, the protected networks on both sides,
return routing, firewall rules on the VPN interface or tab, DNS for clients, logging, and a
management path that does not depend on the tunnel.

## Identities and certificates

Create certificate authorities and certificates under **System → Certificates** before you configure
certificate-based IPsec or OpenVPN. Users for OpenVPN or IPsec authentication come from
**System → User Manager** or from an authentication server (LDAP or RADIUS). Revoke a lost client
certificate under **System → Certificates → Revocation** and select that revocation list on the server.

## Changes in 1.1

- Applying the settings of one interface no longer restarts every OpenVPN instance.
- The OpenVPN server's DNS default domain and NetBIOS scope are validated, and unsafe values are not
  pushed to clients.
- OpenVPN tunnel and remote networks, IPv4 and IPv6, are now included in the firewall's internal
  list of VPN networks (they were missing because of a wrong configuration path).

## Handling secrets

Private keys, pre-shared keys, and exported client profiles grant access. Keep them out of tickets,
chat, screenshots, and source control, and distribute client profiles over a secure channel.

## Related pages

- [VPN and private networking](/packages/vpn-and-private-networking/)
- [WireGuard](/packages/wireguard/)
- [Users, certificates, and backup](/configure/access-and-recovery/)
