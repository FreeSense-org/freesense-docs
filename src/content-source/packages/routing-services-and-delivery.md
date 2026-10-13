---
title: Routing, services, and delivery packages
description: Choose between the FreeSense Optional Packages for dynamic routing, authoritative DNS, RADIUS, reverse proxying, discovery relays and TFTP.
---

These Optional Packages add network services that the base firewall does not run on its own:
dynamic routing, authoritative DNS, RADIUS authentication, inbound reverse proxying, service
discovery across VLANs, broadcast and multicast relaying, and TFTP file delivery. Each one is
installed from **System → Package Manager → Available Packages** and configured under the
**Services** menu. See [Installing packages](/packages/installing-packages/) for the general
procedure and the [package catalog](/packages/catalog/) for every package.

## Packages in this group

| Package | Package name | Upstream at 1.1.0 | Use it to | Menu |
| --- | --- | --- | --- | --- |
| [FRRouting](/packages/frr/) | `FreeSense-pkg-frr` | FRR 10.7.1 | Run BGP, OSPF, OSPF6, RIP and BFD | **Services → FRR ...**, **Status → FRR** |
| [HAProxy](/packages/haproxy/) | `FreeSense-pkg-haproxy` | HAProxy 3.4.2 | Publish internal web and TCP services, terminate TLS, load balance | **Services → HAProxy**, **Status → HAProxy Stats** |
| [BIND DNS Server](/packages/bind/) | `FreeSense-pkg-bind` | BIND 9.20.29 | Host authoritative zones, views, DNSSEC signing, secondary zones | **Services → BIND DNS Server** |
| [FreeRADIUS](/packages/freeradius/) | `FreeSense-pkg-freeradius3` | FreeRADIUS 3.2.10 | Authenticate Wi-Fi, switch, VPN and captive portal users with RADIUS and EAP | **Services → FreeRADIUS** |
| [Avahi](/packages/avahi/) | `FreeSense-pkg-Avahi` | avahi-app | Reflect mDNS/DNS-SD between interfaces, publish the firewall | **Services → Avahi** |
| [mDNS Bridge](/packages/mdns-bridge/) | `FreeSense-pkg-mDNS-Bridge` | mdns-bridge 2.2 or later | Forward mDNS between interfaces with per-interface filters | **Services → mDNS Bridge** |
| [Multicast Bridge](/packages/mcast-bridge/) | `FreeSense-pkg-mcast-bridge` | mcast-bridge 1.3 or later | Forward routable UDP multicast streams using IGMP/MLD or static forwarding | **Services → Multicast Bridge** |
| [UDP Broadcast Relay](/packages/udpbroadcastrelay/) | `FreeSense-pkg-udpbroadcastrelay` | udpbroadcastrelay | Relay UDP broadcasts (and one multicast group) on a port between interfaces | **Services → UDP Broadcast Relay** |
| [TFTP Server](/packages/tftpd/) | `FreeSense-pkg-tftpd` | tftp-hpa | Serve PXE boot images and device configuration files | **Services → TFTP Server** |

Versions for FRR, HAProxy, BIND and FreeRADIUS are those in the 1.1.0 Stable Optional Packages
repository. The smaller daemons come from the FreeBSD package set for the pinned platform. Stable
packages are published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64.

Related packages documented elsewhere: [ACME Certificates](/packages/acme/) issues the
certificates HAProxy and FreeRADIUS use, and the [Secure Web Gateway](/packages/web-gateway/)
handles outbound proxying and filtering.

## How to choose

### Routing

- **A few fixed routes:** use static routes in **System → Routing**, not a package. See
  [Routing and multi-WAN](/configure/routing-multiwan/).
- **Routes learned from or advertised to other routers:** use [FRRouting](/packages/frr/). OSPF
  suits routers you control in one organization; BGP suits upstream providers, multi-site
  designs with explicit policy, and large tables. Add BFD for fast failure detection.

### Publishing services and DNS

- **Inbound web or TCP services behind the firewall:** [HAProxy](/packages/haproxy/). A plain
  port forward is enough for a single service without TLS termination, health checks or
  host-based routing; see [NAT](/configure/nat/).
- **Outbound proxying of client traffic:** the [Secure Web Gateway](/packages/web-gateway/), not
  HAProxy.
- **Authoritative DNS for zones you own:** [BIND](/packages/bind/). For recursive DNS for your
  clients, and local host overrides, the built-in DNS Resolver is the right tool; see
  [Core services](/configure/core-services/). If both run, plan which addresses each listens on.

### Authentication

- **802.1X / WPA-Enterprise, switch port authentication, VPN or captive portal RADIUS:**
  [FreeRADIUS](/packages/freeradius/). It can use local users, SQL databases or LDAP directories.

### Discovery and relays across VLANs

| Traffic | Package |
| --- | --- |
| mDNS / Bonjour (printers, AirPlay, Chromecast, HomeKit) with filtering | [mDNS Bridge](/packages/mdns-bridge/) |
| mDNS reflection plus publishing records for the firewall itself | [Avahi](/packages/avahi/) |
| Routable multicast streams (IPTV, audio, sensors) to subscribed interfaces | [Multicast Bridge](/packages/mcast-bridge/) |
| UDP broadcasts on a specific port (game, media and device discovery) | [UDP Broadcast Relay](/packages/udpbroadcastrelay/) |
| DHCP requests to a server on another network | Built-in **Services → DHCP Relay** |
| IGMP proxying toward an upstream multicast router | Built-in **Services → IGMP Proxy** |

Run **either** mDNS Bridge **or** Avahi reflection, not both: each package refuses to save while
the other is active.

### File delivery

- **PXE boot, IP phone and switch provisioning:** [TFTP Server](/packages/tftpd/), on a trusted
  provisioning network only. TFTP has no authentication.

## Rules that apply to every package here

- **Firewall rules are your job.** None of these packages opens its own ports (HAProxy's
  transparent mode is the only exception, for return traffic). Each page lists the ports to allow.
- **Keep listeners narrow.** Bind services to the interfaces or addresses that need them, and keep
  relays to the interfaces and service names that need them. Never expose TFTP, RADIUS or relays
  to WAN.
- **Settings live in `config.xml`.** They are part of configuration backups and stay after package
  removal, so a reinstall restores them. Files outside `config.xml` (TFTP files, RADIUS
  accounting data, BIND DNSSEC keys unless **Backup Keys** is set) need their own backup.
- **Removal stops the service.** In FreeSense 1.1 the Package Manager stops a package's services
  before it removes them. Remove dependent firewall rules, NAT, routes, certificate consumers and
  DNS delegations first.
- **High availability.** FRR, HAProxy, Avahi, mDNS Bridge, Multicast Bridge and UDP Broadcast
  Relay can follow a CARP VIP so they run only on the MASTER node. BIND, FreeRADIUS and HAProxy
  can sync their configuration to peers over XMLRPC.
