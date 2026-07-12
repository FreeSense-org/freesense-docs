---
title: Configuration recipes
description: Original, reviewable patterns for common FreeSense deployments.
channels: [devel, candidate, stable]
last_verified_release: development
---

Recipes are patterns, not copy-and-paste production configuration. Validate each one in a lab or maintenance window and adapt addressing, credentials, certificates, and change control to your environment.

## Segmented office network

Create a management VLAN, a user VLAN, and an IoT VLAN. Assign each as an interface, give each an explicit address and DHCP scope, then write narrow inter-VLAN rules. Start with deny-by-default access from IoT to management and add only required service paths.

## Remote access with WireGuard

Allocate a dedicated tunnel network that does not overlap existing LANs. Add peers with narrow allowed networks, route only the required internal prefixes, and write policy that restricts tunnel clients to approved services. Test both tunnel establishment and return traffic.

## Public application behind HAProxy

Publish one narrow WAN listener, terminate TLS at the chosen layer, use health checks for each backend, and place the application on a restricted internal network. Validate external DNS, certificate renewal, backend failure, and log forwarding separately.

## Suricata observation rollout

Enable detection on one representative interface, collect alerts, tune noise, document pass-list decisions, and only then evaluate prevention. Keep a rollback path and measure the appliance resource impact throughout.

More recipes will be accepted only with a tested topology, prerequisites, verification steps, rollback steps, and an owner for future maintenance.
