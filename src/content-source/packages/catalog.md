---
title: Package catalog
description: Every Optional Package in the FreeSense 1.1 catalog, with category, resource profile, services and what changed since 1.0.
---

FreeSense 1.1 offers **34 supported Optional Packages**. This page lists all of them. To install
one, see [Installing and managing packages](/packages/installing-packages/).

## System and Optional Packages

FreeSense software comes in two package sets that are built and published independently:

- **System** packages are the firewall itself: base OS, kernel, WebUI and built-in services such
  as the firewall, routing, DHCP, DNS Resolver, IPsec and OpenVPN. You update them through
  **System → Update**.
- **Optional Packages** are the integrations listed below. Each one is a `FreeSense-pkg-<name>`
  package from the signed **FreeSense-packages** repository, installed with **System → Package
  Manager**.

A System-only change doesn't rebuild Optional Packages. Optional Packages are rebuilt when their
own sources or build configuration change, or when the pinned FreeBSD platform changes. Your
release channel decides which set you get: Stable 1.1 systems get Stable packages.

## What the catalog records

The catalog (`/etc/freesense-package-catalog.json` on the firewall) is the product contract
behind the Package Manager. It records these fields for each package:

| Field | Shown in the WebUI as |
| --- | --- |
| `display_name` | Package name in the lists, the review page and Manage |
| `category` | Category filter and the subtitle under the name |
| `resource_profile` | **Lightweight**, **Moderate** or **Intensive**, a planning hint for CPU, memory and storage use |
| `capabilities` | Capability chips and **What it adds** on the review page, for example *packet inspection*, *firewall modification* or *credential storage* |
| `services` | **Background services** on the review page, and the service controls on **Manage** |
| `configure_path`, `status_path` | **Open configuration** on Manage, and the **Status** row action |
| `support`, `last_tested_release` | **Support** and **Tested on** tiles on the review page |

Every package below has the support state `supported`. The catalog has no description field.
The descriptions here summarize each package's own package description.

## All packages

Every package below is available for **amd64**. Starting with [1.1.1](/releases/1.1.1/), Stable
also publishes Optional Packages for **arm64** (1.1.0 itself was amd64 only). The Optional Packages
architecture policy leaves two packages out of arm64 builds: Suricata and Web Gateway Local Antivirus. Both depend on Rust code that can't yet
be built for arm64 in the build environment. Raspberry Pi images are only available on the
[Development line](/1.2/getting-started/raspberry-pi/).

| Package | Category | Resources | Description |
| --- | --- | --- | --- |
| [ACME Certificates](/packages/acme/) | Security | Lightweight | Automatically issues and renews certificates from ACME services such as Let's Encrypt. |
| [CrowdSec](/packages/crowdsec/) | Security | Moderate | Behavior-based threat detection whose decisions are enforced through a FreeSense-managed firewall alias and rule. |
| [Secure Web Gateway](/packages/web-gateway/) | Security | Intensive | Outbound web security gateway based on Squid 7: explicit and transparent proxying, TLS inspection modes, web policy, user authentication and logging. |
| [Web Gateway Local Antivirus](/packages/web-gateway/) | Security | Intensive | Optional companion to the Secure Web Gateway that adds local malware scanning with ClamAV through c-icap. Scanning stays off until you enable it. |
| [Suricata IDS/IPS](/packages/suricata/) | Security | Intensive | Network intrusion detection and prevention engine with ruleset management and event browsing. |
| [Threat Shield & DNS Protection](/packages/threat-shield/) | Security | Moderate | Network-wide DNS filtering with AdGuard Home, IP threat lists, country blocking, inbound reputation checks and a live threat map. GeoIP blocking takes effect from package 1.1.0. |
| [OpenVPN Client Export](/packages/openvpn-client-export/) | VPN | Lightweight | Exports ready-to-use client configurations and bundles for the built-in OpenVPN servers. |
| [Tailscale](/packages/tailscale/) | VPN | Lightweight | Joins the firewall to a Tailscale mesh network, which is built on WireGuard. |
| [WireGuard](/packages/wireguard/) | VPN | Lightweight | Fast, modern site-to-site and remote-access VPN tunnels. |
| [ZeroTier](/packages/zerotier/) | VPN | Lightweight | ZeroTier network membership, with explicit consent for managed routes and DNS, plus interface and peer status. |
| [FRRouting](/packages/frr/) | Routing | Moderate | Dynamic routing daemons: BGP, OSPF, OSPFv3, RIP and BFD. |
| [Multicast Bridge](/packages/mcast-bridge/) | Routing | Lightweight | Forwards IPv4 and IPv6 UDP multicast between interfaces, statically or on demand through IGMP and MLD. |
| [UDP Broadcast Relay](/packages/udpbroadcastrelay/) | Routing | Lightweight | Relays UDP broadcast packets from one interface to others. |
| [Avahi Service Discovery](/packages/avahi/) | Services | Lightweight | mDNS/DNS-SD (Bonjour) service discovery across LAN segments. |
| [BIND Authoritative DNS](/packages/bind/) | Services | Moderate | BIND DNS server for authoritative zones, with DNSSEC and DNS64 support. |
| [HAProxy](/packages/haproxy/) | Services | Moderate | TCP and HTTP(S) load balancer and reverse proxy with ACL-based backend selection. |
| [LLDP Service](/packages/lldpd/) | Services | Lightweight | Announces and discovers neighbors with LLDP and related discovery protocols such as CDP. |
| [mDNS Bridge](/packages/mdns-bridge/) | Services | Lightweight | Shares Multicast DNS information between interfaces so service discovery works across segments. |
| [TFTP Server](/packages/tftpd/) | Services | Lightweight | TFTP server (tftp-hpa) for network boot and device configuration files. |
| [FreeRADIUS](/packages/freeradius/) | Authentication | Moderate | RADIUS server for network access authentication, with SQL, LDAP and Kerberos back ends. |
| [Neighbor Watch](/packages/andwatch/) | Monitoring | Lightweight | Monitors ARP and IPv6 Neighbor Discovery, and reports when IP-to-MAC mappings change. |
| [Flow Exporter](/packages/softflowd/) | Monitoring | Lightweight | Exports traffic flows as NetFlow to an external collector (softflowd). |
| [ntopng Traffic Analysis](/packages/ntopng/) | Monitoring | Intensive | Real-time traffic analysis with a web interface, flow inspection and traffic history. |
| [Prometheus Node Exporter](/packages/node-exporter/) | Monitoring | Lightweight | Exposes system metrics for Prometheus to scrape. |
| [SNMP Agent](/packages/net-snmp/) | Monitoring | Lightweight | Net-SNMP agent and trap daemon for SNMP-based monitoring. |
| [syslog-ng](/packages/syslog-ng/) | Monitoring | Moderate | A separate syslog server that receives, stores and forwards logs alongside the built-in logging. |
| [Telegraf](/packages/telegraf/) | Monitoring | Moderate | Agent that collects system metrics and sends them to time-series databases. |
| [Traffic Totals](/packages/traffic-totals/) | Monitoring | Lightweight | Hourly, daily and monthly traffic totals per interface, using vnStat. |
| [Zabbix 7.0 Agent](/packages/zabbix/) | Monitoring | Lightweight | Zabbix agent that reports local metrics to a Zabbix server or proxy. |
| [Zabbix 7.0 Proxy](/packages/zabbix/) | Monitoring | Moderate | Zabbix proxy that collects monitoring data on behalf of a Zabbix server. |
| [Automation](/packages/automation/) | System | Lightweight | Scheduled commands and service-health watchdog, managed from one audited interface. |
| [Network UPS Tools](/packages/nut/) | System | Lightweight | Monitors local USB or serial UPS units, and remote ones over SNMP, apcupsd or NUT, and shuts down cleanly. |
| [Open VM Tools](/packages/open-vm-tools/) | System | Lightweight | VMware guest integration for FreeSense running as a VMware virtual machine. |
| [Network Diagnostics](/packages/diagnostics/) | Diagnostics | Lightweight | Allow-listed MTR, Nmap, iperf3 and ARP tools with strict input validation. |

## Package names, services and pages

Use this table to find the exact package name, the services the package registers, and where it
is configured. You need the package name for the API and the shell, for example
`FreeSense-pkg-nut`.

| Package | Package name | Services | Configuration page |
| --- | --- | --- | --- |
| ACME Certificates | `FreeSense-pkg-acme` | none | `/acme/acme_accountkeys.php` |
| CrowdSec | `FreeSense-pkg-CrowdSec` | `crowdsec` | `/crowdsec/crowdsec.php` |
| Secure Web Gateway | `FreeSense-pkg-WebGateway` | `freesense_webgateway` | `/webgateway/webgateway.php` |
| Web Gateway Local Antivirus | `FreeSense-pkg-WebGateway-AV` | `clamav_clamd`, `clamav_freshclam`, `c_icap` | `/webgateway/webgateway_threat.php` |
| Suricata IDS/IPS | `FreeSense-pkg-suricata` | `suricata` | `/suricata/suricata_overview.php` |
| Threat Shield & DNS Protection | `FreeSense-pkg-ThreatShield` | `threatshield` | `/threatshield/threatshield.php` |
| OpenVPN Client Export | `FreeSense-pkg-openvpn-client-export` | none | `/vpn_openvpn_export.php` |
| Tailscale | `FreeSense-pkg-Tailscale` | `tailscale` | `/pkg_edit.php?xml=tailscale.xml` |
| WireGuard | `FreeSense-pkg-WireGuard` | `wireguard` | `/wg/vpn_wg_tunnels.php` |
| ZeroTier | `FreeSense-pkg-ZeroTier` | `zerotier` | `/zerotier/zerotier.php` |
| FRRouting | `FreeSense-pkg-frr` | `FRR zebra`, `staticd`, `mgmtd`, `bfdd`, `bgpd`, `ospfd`, `ospf6d`, `ripd`, `watchfrr` | `/pkg_edit.php?xml=frr.xml` |
| Multicast Bridge | `FreeSense-pkg-mcast-bridge` | `mcast-bridge` | `/mcast_bridge.php` |
| UDP Broadcast Relay | `FreeSense-pkg-udpbroadcastrelay` | `udpbroadcastrelay` | `/pkg_edit.php?xml=udpbroadcastrelay.xml` |
| Avahi Service Discovery | `FreeSense-pkg-Avahi` | `avahi` | `/pkg_edit.php?xml=avahi.xml` |
| BIND Authoritative DNS | `FreeSense-pkg-bind` | `named` | `/pkg_edit.php?xml=bind.xml` |
| HAProxy | `FreeSense-pkg-haproxy` | `haproxy` | `/haproxy/haproxy_listeners.php` |
| LLDP Service | `FreeSense-pkg-lldpd` | `lldpd` | `/pkg_edit.php?xml=lldpd.xml` |
| mDNS Bridge | `FreeSense-pkg-mDNS-Bridge` | `mdns-bridge` | `/mdns-bridge.php` |
| TFTP Server | `FreeSense-pkg-tftpd` | `tftpd` | `/tftp_files.php` |
| FreeRADIUS | `FreeSense-pkg-freeradius3` | `radiusd` | `/pkg_edit.php?xml=freeradius.xml` |
| Neighbor Watch | `FreeSense-pkg-ANDwatch` | `andwatchd` | `/andwatch.php` |
| Flow Exporter | `FreeSense-pkg-softflowd` | `softflowd` | `/pkg_edit.php?xml=softflowd.xml` |
| ntopng Traffic Analysis | `FreeSense-pkg-ntopng` | `ntopng` | `/pkg_edit.php?xml=ntopng.xml` |
| Prometheus Node Exporter | `FreeSense-pkg-node_exporter` | `node_exporter` | `/pkg_edit.php?xml=node_exporter.xml` |
| SNMP Agent | `FreeSense-pkg-net-snmp` | `net-snmpd`, `net-snmptrapd` | `/pkg_edit.php?xml=net-snmp.xml` |
| syslog-ng | `FreeSense-pkg-syslog-ng` | `syslog-ng` | `/pkg_edit.php?xml=syslog-ng.xml` |
| Telegraf | `FreeSense-pkg-Telegraf` | `telegraf` | `/pkg_edit.php?xml=telegraf.xml` |
| Traffic Totals | `FreeSense-pkg-Status_Traffic_Totals` | `vnstatd` | `/status_traffic_totals.php` |
| Zabbix 7.0 Agent | `FreeSense-pkg-zabbix-agent7` | `zabbix_agentd` | `/pkg_edit.php?xml=zabbixagent.xml` |
| Zabbix 7.0 Proxy | `FreeSense-pkg-zabbix-proxy7` | `zabbix_proxy` | `/pkg_edit.php?xml=zabbixproxy.xml` |
| Automation | `FreeSense-pkg-Automation` | none | `/automation/automation.php` |
| Network UPS Tools | `FreeSense-pkg-nut` | `nut` | `/nut_settings.php` |
| Open VM Tools | `FreeSense-pkg-Open-VM-Tools` | `vmware-guestd` | `/pkg_edit.php?xml=open-vm-tools.xml` |
| Network Diagnostics | `FreeSense-pkg-Diagnostics` | none | `/diagnostics/network_tools.php` |

The packages with a separate status page are CrowdSec (`/crowdsec/crowdsec_decisions.php`),
both Web Gateway packages (`/webgateway/webgateway_status.php`), Suricata
(`/suricata/suricata_events.php`), Threat Shield (`/threatshield/threatshield_status.php`),
ZeroTier (`/zerotier/zerotier_peers.php`) and Network UPS Tools (`/nut_status.php`).

For guides grouped by purpose, see [security and filtering](/packages/security-and-filtering/),
[VPN and private networking](/packages/vpn-and-private-networking/),
[routing, services and delivery](/packages/routing-services-and-delivery/),
[monitoring and automation](/packages/monitoring-and-automation/), and
[system and diagnostics](/packages/system-and-diagnostics/).

## Changes in 1.1

### Threat Shield added

[Threat Shield & DNS Protection](/packages/threat-shield/) (`FreeSense-pkg-ThreatShield`) is new in
1.1. It combines DNS filtering and automatic threat-feed updates in one package, with its own
status page. In package 1.0.0 its GeoIP country policy does not take effect; package 1.1.0 fixes
that and adds IP threat lists, inbound protection and a [threat map](/packages/threat-shield-map/).

### pfBlockerNG removed

pfBlockerNG (catalog name *DNS and IP Blocklists*) is no longer in the catalog. Its wrapper is
retired, and the package build checks prevent it from coming back. For DNS and IP blocking in
1.1, use [Threat Shield](/packages/threat-shield/).

When you restore a configuration that contains pfBlockerNG settings, those settings are moved
to a quarantine record. They are never loaded into the active configuration. You can download
the record from **Diagnostics → Backup & Restore** to rebuild your lists in Threat Shield. See
[restoring packages](/packages/installing-packages/#restoring-packages-after-a-configuration-restore).
<!-- needs verification: what happens to an installed pfBlockerNG package on a 1.0.x system during the in-place upgrade to 1.1.0 (left installed as "Not in repository", or removed). -->

### ntopng now follows the FreeBSD port

FreeSense used to pin ntopng to an older 6.6 stable-branch overlay. The ntopng package is now
built from FreeBSD's own `net/ntopng` port, against the matching nDPI library. As a result, the
ntopng version follows the FreeBSD ports tree at the pinned platform snapshot, which can be a
dated development snapshot of ntopng (for example `6.6.d20260829`) rather than a numbered
release. Check the version on **Installed Packages** after updates.

### Other catalog rules

- Suricata is the only IDS/IPS integration. Snort and Zeek are retired.
- **Automation** and **Network Diagnostics** replace several small single-command wrappers.
- Only the versioned Zabbix 7.0 agent and proxy are published.

## Adding a package to the catalog

Contributors add a catalog entry in the same change as the package port. The build checks
reject a published package that has no catalog entry, is missing required catalog fields, or
doesn't give an absolute WebUI path for its pages. See
[Building optional packages](/developers/building-optional-packages/).

Next: [install and manage packages](/packages/installing-packages/).
