---
title: WebUI context-help map
description: How every FreeSense WebUI help action selects a direct documentation topic and the correct edition.
---

The **About this Page** menu item and question-mark icon open the documentation topic that matches
the current WebUI screen. They do not open a generic help page or a redirect chain.

## Edition selection

The resolver checks the installed product version:

| Installed line | Documentation destination |
| --- | --- |
| 1.0.x and other supported releases | Stable documentation at the site root |
| 1.1.x | Development documentation under `/1.1/` |

The help control never chooses Development for a Stable appliance. This protects production
operators from following an experimental procedure by accident.

## Topic selection

The map groups every WebUI path by operational intent. Named package pages have explicit entries;
the remaining paths use the following durable groups rather than fragile implementation filenames.

| WebUI area | Documentation topic |
| --- | --- |
| Interfaces, VLANs, bridges, wireless, assignments | Interfaces and networking |
| Firewall, aliases, NAT, virtual IPs, shaping | Firewall and NAT |
| Gateways, routes, multi-WAN, CARP | Routing and high availability |
| DHCP, DNS, NTP, captive portal and Services | Built-in services |
| IPsec, OpenVPN and VPN controls | Built-in VPN |
| Status, logs, graphs and reporting | Monitoring and logs |
| Diagnostics | Diagnostics and troubleshooting |
| System, users, certificates, backups and wizards | System administration |
| Package Manager and package integrations | Optional package catalog or its dedicated package profile |

An unmapped or newly added screen opens the [WebUI menu reference](/reference/menu-guide/) rather
than a blank or generic help endpoint. New WebUI screens must add a more specific map entry when a
durable operator workflow exists.

## Maintenance contract

The resolver lives in the FreeSense core source at
`src/etc/inc/freesense-docs.inc`. A documentation link must use a route that exists in both
editions unless the feature is explicitly Development-only. Update the map and this reference in
the same pull request as a new top-level WebUI workflow or package integration.
