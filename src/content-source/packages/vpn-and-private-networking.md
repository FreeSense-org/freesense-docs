---
title: VPN and private networking
description: Compare the WireGuard, Tailscale, ZeroTier, and OpenVPN Client Export packages with the built-in IPsec, OpenVPN, and L2TP VPNs.
---

FreeSense has two kinds of VPN support. **IPsec**, **OpenVPN** and **L2TP** are built into the
System and are always available under the **VPN** menu; see [Built-in VPN](/base-os/built-in-vpn/).
The packages on this page are **Optional Packages**: you install them from
**System → Package Manager → Available Packages** when you need them, and they are built and
published separately from the System.

| Package | What it adds | Who controls keys and routes | Menu after install |
| --- | --- | --- | --- |
| [WireGuard](/packages/wireguard/) | Kernel WireGuard tunnels and peers | You, on the firewall | **VPN → WireGuard**, **Status → WireGuard** |
| [Tailscale](/packages/tailscale/) | Membership in a Tailscale tailnet: subnet router, exit node | The Tailscale control server (or your own compatible server) | **VPN → Tailscale**, **Status → Tailscale** |
| [ZeroTier](/packages/zerotier/) | Membership in ZeroTier virtual networks | The ZeroTier network controller; FreeSense accepts routes and DNS only with your consent | **VPN → ZeroTier**, **Status → ZeroTier Peers** |
| [OpenVPN Client Export](/packages/openvpn-client-export/) | Client configs and Windows installers for the built-in OpenVPN server | You, through the built-in OpenVPN server and certificate manager | **VPN → OpenVPN → Client Export** |

All four are lightweight packages. Stable publishes them for amd64 and, starting with [1.1.1](/releases/previous-1.1/#freesense-111), arm64.

## How to choose

Start with who should own identity, keys, and routes.

- **Site-to-site tunnel to a device you manage, or a few road-warrior clients:** use
  [WireGuard](/packages/wireguard/). It is simple and fast, and everything lives in the FreeSense
  configuration. You exchange public keys and write the firewall rules yourself.
- **Standards-based site-to-site with third-party firewalls or cloud gateways:** use the built-in
  **IPsec**.
- **Remote access with user names, passwords, and certificates from the FreeSense user manager:**
  use the built-in **OpenVPN** server and add [OpenVPN Client Export](/packages/openvpn-client-export/)
  to hand out ready-made client profiles.
- **Devices already in a Tailscale tailnet, with no inbound ports to open:** use
  [Tailscale](/packages/tailscale/). Identity and device approval happen in the Tailscale admin
  console.
- **A flat virtual network across many sites run by a ZeroTier controller:** use
  [ZeroTier](/packages/zerotier/).

Tailscale and ZeroTier depend on an outside control plane. Before you join a firewall, know who
owns the account or controller, who can approve devices and advertise routes, and how a device is
removed. You can run several of these side by side, but give each one non-overlapping address
ranges.

## What every VPN still needs

A working tunnel does not mean traffic flows. For every option above, check:

1. **Inbound access** to the VPN's port on WAN, where it needs one: the WireGuard listen port, the
   OpenVPN server port, IPsec IKE and NAT-T. Tailscale and ZeroTier work through NAT but connect
   directly more often with their UDP port open (41641 and 9993).
2. **Firewall rules** on the VPN's interface or interface group: **WireGuard** and **Tailscale**
   groups, the **OpenVPN** and **IPsec** tabs, or the assigned ZeroTier interface.
3. **Routes in both directions.** The remote side needs a route back to your networks.
4. **DNS**, tested separately from reachability. Tailscale's **Accept DNS** and ZeroTier's **DNS**
   consent can change the firewall's own resolver settings.
5. **Address planning.** Tunnel and remote networks must not overlap LAN, WAN or other VPNs.

## Roll out safely

1. Save a configuration backup before you start.
2. Keep console or LAN access that does not depend on the new tunnel until it works both ways.
3. Test with one non-administrative client or one remote site first.
4. Record who owns each key, peer, or device, and how to revoke it when a device is lost or a
   person leaves.

Interface types that can carry these networks, including VXLAN, are covered in
[Interfaces, VLANs and bridges](/configure/interfaces-vlans-bridges/).
