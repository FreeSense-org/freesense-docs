---
title: WebUI context-help map
description: How the FreeSense WebUI help action picks the documentation edition and topic for the current screen.
---

**Help → About this Page** opens the documentation topic that matches the current WebUI screen,
in the documentation edition that matches the installed release. It links directly to the topic
rather than to a generic help page.

## Edition selection

The resolver reads the installed product version and adds the matching edition prefix:

| Installed release | Documentation edition | Link prefix |
| --- | --- | --- |
| 1.0.x | Frozen 1.0 documentation | `https://docs.freesense.org/1.0/` |
| 1.1.x | Stable 1.1 documentation | `https://docs.freesense.org/` |
| 1.2.x (Development) | Development documentation | `https://docs.freesense.org/1.2/` |

A Stable appliance is never sent to the Development edition, so production operators do not follow
an experimental procedure by accident.

Two transitional cases apply to systems installed before this map:

- FreeSense 1.1.0 itself still links to the former `/1.1/` Development path. The documentation site
  redirects `/1.1/` permanently to the root, so those links open the Stable 1.1 pages.
- 1.0.x releases link to the documentation root, which is now the 1.1 edition. Operators still on
  1.0 should open the [frozen 1.0 documentation](/1.0/) directly.

## Topic selection

The resolver turns the page name into a key (for example `firewall_rules`, or the package XML name
for generated package pages) and looks it up in two steps.

**Exact entries** come first:

| WebUI page | Documentation topic |
| --- | --- |
| Dashboard | Documentation home |
| Package Manager (installed, available, install, settings) | [Installing packages](/packages/installing-packages/) |
| Package Manager → Repositories | [Custom repositories](/packages/custom-repositories/) |
| System → Update | [Updates and release channels](/guides/updates-and-channels/) |
| System → Boot Environments | [ZFS boot environments](/operations/zfs-boot-environments/) |
| Interfaces → Assignments → VXLANs | [VXLAN](/configure/interfaces-vlans-bridges/#vxlan) |
| WireGuard | [WireGuard](/packages/wireguard/) |
| CrowdSec, Suricata | [Security and filtering packages](/packages/security-and-filtering/) |
| Web Gateway | [Web Gateway](/packages/web-gateway/) |
| OpenVPN client export | [VPN and private networking](/packages/vpn-and-private-networking/) |

**Prefix groups** cover the remaining pages by the start of the page name:

| Page name starts with | Documentation topic |
| --- | --- |
| `interfaces`, `vlan`, `bridge`, `lagg`, `wireless`, `assign` | [Interfaces and networking](/base-os/interfaces-and-networking/) |
| `firewall`, `alias`, `nat`, `virtual_ip`, `shaper` | [Firewall and NAT](/base-os/firewall-and-nat/) |
| `gateway`, `route`, `static_routes`, `multiwan`, `carp` | [Routing and high availability](/base-os/routing-and-high-availability/) |
| `services`, `dhcp`, `dns`, `unbound`, `dnsmasq`, `ntp`, `captiveportal` | [Built-in services](/base-os/built-in-services/) |
| `vpn`, `openvpn`, `ipsec`, `pptp`, `l2tp` | [Built-in VPN](/base-os/built-in-vpn/) |
| `status`, `logs`, `graph`, `rrd` | [Monitoring and logs](/operations/monitoring-and-logs/) |
| `diag` | [Diagnostics and troubleshooting](/operations/diagnostics-and-troubleshooting/) |
| `pkg`, `package`, and names of several network packages (ACME, FreeRADIUS, FRR, HAProxy, BIND, Avahi, TFTP, mDNS, multicast and UDP broadcast relays) | [Optional package catalog](/packages/catalog/) |
| `system`, `user`, `auth`, `cert`, `ca`, `backup`, `config`, `wizard` | [System administration](/base-os/system-administration/) |

The groups are checked in this order, and pages are matched by their file name rather than their
menu. The built-in routing pages are named `system_gateways`, `system_routes`, and so on, so the routing
group does not catch them: **System → Routing** and **System → High Availability** open System
administration, **Status → Gateways** opens Monitoring and logs, and **Diagnostics → Backup &
Restore** (`diag_backup…`) opens Diagnostics and troubleshooting. Use the links on those pages to
reach [routing and high availability](/base-os/routing-and-high-availability/) or
[users, certificates, and backup](/configure/access-and-recovery/).

A page that matches nothing, including package pages without an entry, opens this manual's
[WebUI menu reference](/reference/menu-guide/).

## Maintenance contract

The resolver is `src/etc/inc/freesense-docs.inc` in the FreeSense core repository; the WebUI calls it
from `head.inc` (the **About this Page** link) and `help.php`. Rules for contributors:

- A topic link must exist in every edition that can receive it, unless the feature exists only in
  Development.
- Add or change a map entry in the same pull request as a new top-level WebUI workflow or package
  integration, and update this page with it.
- When the Stable line moves on, update the edition prefixes in the resolver and add a redirect for
  the retired path on the documentation site.

See [the WebUI menu system](/developers/webui-menu-system/#help-menu-and-context-help) for how
generated package pages are identified.
