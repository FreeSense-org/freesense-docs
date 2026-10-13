---
title: Configuration recipes
description: Original, reviewable patterns for common FreeSense deployments, with links to the procedures they use.
---

Recipes are patterns, not copy-and-paste production configuration. Validate each one in a lab or
maintenance window and adapt addressing, credentials, certificates, and change control to your
environment. Each recipe links to the task guides that hold the exact steps.

## Segmented office network

Create a management VLAN, a user VLAN, and an IoT VLAN. Assign each as an interface, give each an
address and a DHCP scope, then write narrow inter-VLAN rules. Start with deny-by-default access from
IoT to management and add only the service paths you need.

Uses: [VLANs](/configure/interfaces-vlans-bridges/#vlans), [DHCP](/configure/core-services/),
[firewall rules and aliases](/configure/firewall-rules-aliases/).

## Remote access with WireGuard

Allocate a tunnel network that does not overlap existing LANs. Add peers with narrow allowed networks,
route only the required internal prefixes, and write rules that restrict tunnel clients to approved
services. Test both tunnel establishment and return traffic.

Uses: [WireGuard](/packages/wireguard/), [firewall rules and aliases](/configure/firewall-rules-aliases/).

## Stretch a LAN segment to another site with VXLAN

Create a WireGuard or IPsec tunnel between the sites first. Add a VXLAN in unicast mode on each side
with the tunnel addresses as VTEPs and the same VNI, assign it, and bridge it with the LAN to extend.
Plan the MTU (the VXLAN overhead plus the VPN overhead), add rules on the VXLAN interface for traffic
from the remote site, and keep each site's management on a routed interface rather than on the
stretched segment.

Uses: [VXLAN](/configure/interfaces-vlans-bridges/#vxlan), [bridges](/configure/interfaces-vlans-bridges/#bridges),
[built-in VPN](/base-os/built-in-vpn/).

## Dual-WAN failover

Define both WAN gateways with independent monitor addresses, build a gateway group with the primary
on Tier 1 and the backup on Tier 2, set it as the default gateway or use it in LAN rules, and test by
disconnecting the primary uplink.

Uses: [routing and multi-WAN](/configure/routing-multiwan/).

## Public application behind HAProxy

Publish one narrow WAN listener, terminate TLS at the chosen layer, use health checks for each backend,
and place the application on a restricted internal network. Validate external DNS, certificate
renewal, backend failure, and log forwarding separately.

Uses: [HAProxy](/packages/haproxy/), [ACME](/packages/acme/), [NAT](/configure/nat/).

## Off-site configuration backups

Create a dedicated bucket, WebDAV folder, or SFTP account for the firewall with access limited to that
location, add it as a Remote Backup target with a daily schedule and **On change** enabled, store the
encryption passphrase in your password manager, and test a restore on a lab system.

Uses: [set up remote backups](/configure/access-and-recovery/#set-up-remote-backups).

## Suricata observation rollout

Enable detection on one representative interface, collect alerts, tune noise, document pass-list
decisions, and only then evaluate prevention. Keep a rollback path and measure the resource impact
throughout.

Uses: [Suricata](/packages/suricata/).

## Contributing a recipe

New recipes need a tested topology, prerequisites, ordered steps, verification, rollback steps, and an
owner for future maintenance. See the [documentation policy](/contributors/documentation-policy/).
