---
title: Routing, services, and delivery packages
description: Understand the supported integrations that deliver routes, DNS, authentication, proxying, and discovery.
channels: [devel, stable]
last_verified_release: 1.0.5
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

## Package operating guides

### ACME Certificates and HAProxy

Use ACME Certificates to enroll and renew certificates used by FreeSense services. Before enabling
automation, decide certificate names, validation method, account owner, renewal notification, and
which service consumes each certificate. Account keys and DNS-validation credentials are secrets.
Test an initial issuance and renewal path before depending on automatic rotation.

HAProxy is the inbound reverse-proxy and load-balancing integration. Define each listener, backend,
health check, certificate, header behavior, and source-network policy. Test a healthy backend, a
failed backend, certificate renewal, and a request through the public NAT and firewall path. Do not
use Secure Web Gateway as a substitute for inbound publishing.

### BIND, FreeRADIUS, and FRRouting

BIND is an authoritative DNS service, not a general replacement for the firewall resolver. Publish
only zones you own, restrict zone transfer and updates, and bind listeners to the smallest required
interfaces. Verify delegation and authoritative answers from outside the protected network.

FreeRADIUS supplies network authentication. Define authorized clients, shared secrets, identity
source, and expected authentication and accounting flows. Restrict the listener by interface and
firewall policy; test both allowed and denied identity paths without recording credentials.

FRRouting controls dynamic routing, so a mistake can affect every reachable network. Start with one
protocol and a small explicit set of advertised and accepted prefixes. Define peer authentication,
filtering, route preference, failure behavior, and rollback before enabling the required daemons.

### Discovery, relay, and file services

Avahi publishes and discovers local services through multicast DNS. Multicast Bridge, mDNS Bridge,
and UDP Broadcast Relay forward selected discovery traffic between interfaces. Select interfaces and
protocols narrowly, then verify the intended discovery works while an unrelated VLAN does not see it.

TFTP has no built-in authentication. Limit it to a trusted management network, a dedicated file
tree, and the smallest required read/write behavior. Treat boot images and device configurations as
sensitive operational assets, and confirm the service is unreachable from untrusted interfaces.

## Service retirement

Before disabling or removing a service package, remove dependent firewall and NAT rules, route
references, certificate consumers, scheduled renewals, and external DNS or identity dependencies.
Confirm that clients fail over as designed, then stop the service and review its logs before removal.
