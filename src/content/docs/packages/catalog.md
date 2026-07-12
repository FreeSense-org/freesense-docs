---
title: Package catalog
description: The curated FreeSense package platform, its categories, and the information shown before installation.
---

FreeSense publishes a focused catalog of **32 supported package integrations**. The catalog is a
product contract shared by the WebUI, build list, and CI—not a loose directory of optional ports.

Each entry declares:

- its category and support state;
- the FreeSense release against which it was last tested;
- a lightweight, moderate, or intensive resource profile;
- sensitive capabilities such as packet inspection, firewall changes, credentials, or route management;
- registered services and direct Configure or Status destinations.

The Package Manager shows these details before installation so an administrator can understand the
operational and security impact first.

## Catalog coverage

All published integrations are covered by this documentation set. Use the focused guides for
[security](/security/suricata/), [VPN and private networking](/packages/vpn-and-private-networking/),
[routing and services](/packages/routing-services-and-delivery/), and
[monitoring and automation](/packages/monitoring-and-automation/).

| Category | Supported integrations |
| --- | --- |
| Security | ACME Certificates, CrowdSec, pfBlockerNG, Suricata 8 |
| VPN | WireGuard, Tailscale, ZeroTier, OpenVPN Client Export |
| Routing and services | BIND, FreeRADIUS, FRRouting, HAProxy, Avahi, TFTP, Multicast Bridge, mDNS Bridge, UDP Broadcast Relay |
| Monitoring | ANDwatch, LLDP, SNMP, softflowd, Telegraf, Zabbix 7 agent/proxy, node_exporter, ntopng, NUT, syslog-ng, Traffic Totals |
| System and diagnostics | Automation, Network Diagnostics, Open VM Tools |

## Security and filtering

| Package | Primary role |
| --- | --- |
| Suricata 8 | IDS/IPS, validated configuration, EVE event browsing, and ruleset management |
| CrowdSec | Behavioral decisions synchronized into a FreeSense-owned firewall table |
| pfBlockerNG | DNS and IP reputation feeds and scheduled blocklist updates |
| ACME Certificates | Automated certificate enrollment and renewal |

Suricata is the supported IDS/IPS integration. The obsolete Snort and Zeek wrappers are not part of
the new catalog.

## VPN and private networking

| Package | Primary role |
| --- | --- |
| WireGuard | High-performance site-to-site and remote-access VPN |
| Tailscale | Managed WireGuard mesh connectivity |
| ZeroTier | Virtual networking with explicit consent for managed routes and DNS |
| OpenVPN Client Export | Client configuration and credential export |

## Routing, services, and delivery

The catalog includes FRRouting, HAProxy, BIND, FreeRADIUS, Avahi, TFTP, multicast and mDNS bridges,
and UDP broadcast relay. HAProxy uses the maintained stable integration; duplicate development
wrappers have been removed.

## Monitoring and operations

Available integrations include Telegraf, Zabbix 7 agent and proxy, node_exporter, ntopng, SNMP,
softflowd, LLDP, syslog-ng, Traffic Totals, Neighbor Watch, NUT, and Open VM Tools.

## Consolidated tools

Two packages replace several small legacy wrappers:

- **Automation** manages scheduled tasks and service-watchdog behavior from one guarded interface.
- **Network Diagnostics** exposes allow-listed MTR, Nmap, iperf3, and ARP diagnostics with strict
  target, interface, and port validation.

This keeps runtime tools available without maintaining a separate administrative package and menu
entry for every command.

## Package lifecycle

The release catalog audit requires every published wrapper to have matching product metadata and a
real WebUI target. Retired wrappers are explicitly blocked from returning accidentally. Stable
runtime overrides must use maintained versions rather than development snapshots.

Next: [install and manage packages](/packages/installing-packages/).
