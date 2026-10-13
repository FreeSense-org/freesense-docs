---
title: Built-in services
description: The network services that ship with the FreeSense base system - DNS, DHCP, router advertisements, NTP, and edge services - and how they fit together.
---

FreeSense ships a set of network services as part of the base system. They are updated with System
updates, not as Optional Packages. Design each one with an owner, the interfaces it serves, its data
sources, where it logs, and what happens when it fails. The procedures are in
[core services](/configure/core-services/).

## The built-in services

In the 1.1 top menu, **Services** is a grouped panel. The built-in entries are:

| Group | Service | Menu path | Daemon |
| --- | --- | --- | --- |
| Network | DNS Resolver | **Services → DNS Resolver** | Unbound |
| Network | DNS Forwarder | **Services → DNS Forwarder** | dnsmasq |
| Network | DHCP Server, DHCPv6 Server | **Services → DHCP Server**, **Services → DHCPv6 Server** | Kea |
| Network | DHCP Relay, DHCPv6 Relay | **Services → DHCP Relay**, **Services → DHCPv6 Relay** | `dhcrelay` (IPv4 and IPv6 instances) |
| Network | Router Advertisement | **Services → Router Advertisement** | `radvd` |
| Network | Dynamic DNS | **Services → Dynamic DNS** | Dynamic DNS and RFC 2136 clients |
| Network | NTP | **Services → NTP** | `ntpd` |
| Routing | IGMP Proxy | **Services → IGMP Proxy** | `igmpproxy` |
| Security | Captive Portal | **Services → Captive Portal** | Portal zones |
| Monitoring | SNMP | **Services → SNMP** | `bsnmpd` |
| Other | PPPoE Server, UPnP IGD & PCP, Wake-on-LAN | **Services → …** | - |

Optional Packages add their own entries to the same groups, for example BIND under Network, FRR under
Routing, Threat Shield and Suricata under Security, HAProxy and the Web Gateway under Proxy. **UPnP IGD
& PCP** is only listed when more than one interface is configured.

## Name resolution

Run one DNS service on the firewall unless you have a specific reason to run both: the DNS Resolver
(Unbound) resolves recursively or forwards, the DNS Forwarder (dnsmasq) only forwards. In 1.1 Unbound
is never bound to the same address twice, and DHCP lease registration in DNS is only active while the
DNS Resolver is enabled; turning the resolver on or off reconfigures the DHCP server.

## Address assignment

The DHCP and DHCPv6 servers use **Kea**; ISC DHCP is not used. Each interface with a static address
can have a DHCP scope with pools, static mappings, and options. 1.1 adds a **Log Level** setting on the
DHCP and DHCPv6 server settings pages.

Both settings pages also have a **Custom Configuration** section that takes raw Kea JSON. Because it
can load Kea hooks and choose file paths, editing it requires the `admin` account or the
root-equivalent privilege **WebCfg - Services: DHCP Server: Edit Custom Kea Configuration**; for other
users the field is read-only. See [system administration](/base-os/system-administration/#administrator-accounts-and-privileges).

Router Advertisement (`radvd`) announces IPv6 prefixes and controls whether clients use SLAAC, DHCPv6,
or both. Match it to the DHCPv6 design on the same interface.

## Time

NTP serves time to clients and keeps the firewall's own clock correct. Accurate time is required for
certificates, logs, VPN authentication, and updates, so make sure the time servers in
**System → General Setup** are reachable and permitted.

## Edge services

Captive Portal, PPPoE Server, IGMP Proxy, SNMP, UPnP IGD & PCP, and Wake-on-LAN are scope-sensitive.
Bind each one only to the interfaces that need it and restrict who can reach it: a service on the
wrong network is an exposure. The Captive Portal default logo and colours are the FreeSense design in
1.1; upload your own portal page under **Services → Captive Portal → File Manager** if needed.

## Checking service state

**Status → Services** lists every service with start, stop, and restart controls, and
**Status → System Logs** has tabs for DHCP, NTP, and other service logs. In 1.1 nginx (the WebUI web
server) logs only to its own log, not to the system log. See
[monitoring and logs](/operations/monitoring-and-logs/).

## Related pages

- [Core services](/configure/core-services/) - procedures
- [Built-in VPN](/base-os/built-in-vpn/)
- [Optional package catalog](/packages/catalog/)
