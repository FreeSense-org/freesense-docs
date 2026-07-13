---
title: Routing, services, and delivery packages
description: Understand the supported integrations that deliver routes, DNS, authentication, proxying, and discovery.
channels: [devel, candidate, stable]
last_verified_release: development
---

This group contains focused services that extend the core firewall without duplicating it.

## Routing and discovery

- **FRRouting** provides dynamic routing protocols.
- **mcast-bridge**, **mDNS Bridge**, and **UDP Broadcast Relay** selectively forward multicast or discovery traffic.
- **Avahi** publishes or discovers local services where multicast DNS is appropriate.

## Service delivery

- **HAProxy** is the maintained reverse-proxy and load-balancing integration.
- **Secure Web Gateway** provides outbound explicit/transparent proxying, TLS policy, identity, filtering, feeds, ICAP, and optional local malware scanning. It does not replace HAProxy for inbound publishing.
- **BIND** provides authoritative DNS service.
- **FreeRADIUS** provides network authentication.
- **TFTP Server** supplies simple local file delivery.
- **ACME Certificates** automates certificate issuance and renewal.

## Design rules

Give each service an owner, a listening interface, a credential lifecycle, log destination, backup plan, and removal procedure. Place public listeners behind narrow firewall policy. Keep discovery bridges scoped to the interfaces and protocols that need them.

HAProxy and certificate automation often depend on the same public DNS and NAT design. Test certificate issuance, listener health checks, and a backend failure separately before calling the service ready.
