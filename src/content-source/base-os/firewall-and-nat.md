---
title: Firewall and NAT
description: How FreeSense evaluates rules, aliases, address translation, shaping, schedules, and virtual IPs, and where each is configured.
---

The firewall decides which traffic may cross an interface; NAT decides which addresses that traffic
carries. Both are built on FreeBSD `pf`. This page explains how the pieces fit together; the
procedures are in [firewall rules and aliases](/configure/firewall-rules-aliases/) and
[NAT](/configure/nat/).

## Where firewall policy lives

| Menu path | Tabs | Purpose |
| --- | --- | --- |
| **Firewall → Rules** | One tab per interface, plus Floating and interface groups | Pass, block, and reject policy |
| **Firewall → Aliases** | IP, Ports, URLs, All | Named, reusable addresses, networks, ports, and URL lists |
| **Firewall → NAT** | Port Forward, 1:1, Outbound, NPt | Address and port translation |
| **Firewall → Schedules** | - | Time ranges that rules can reference |
| **Firewall → Traffic Shaper** | By Interface, By Queue, Limiters, Wizards | ALTQ queues and limiters |
| **Firewall → Virtual IPs** | - | IP Alias, CARP, Proxy ARP, and Other addresses |

The **Firewall** menu is a single column; packages that add firewall pages appear in the same list.

## How rules are evaluated

- Rules on an interface tab match traffic **entering** the firewall on that interface. Write a rule
  on the interface where a connection starts.
- Rules are evaluated top to bottom and the first match wins. Floating rules can match in either
  direction and on several interfaces; they are evaluated before interface rules.
- Traffic that matches no pass rule is blocked by the default deny.
- The firewall is stateful: once a connection is passed, its return traffic is allowed by the state
  entry, not by a second rule.
- **Block private networks** and **Block bogon networks** on an interface page create block rules
  that are evaluated before that interface's own rules.

In 1.1, a rule's protocol can also be **IPIP** (IP-in-IP encapsulation). When a new ruleset fails to
load, FreeSense keeps the rejected ruleset as `/tmp/rules.debug.failed` for diagnosis alongside the
error notice.

## Aliases

An alias is a named object that rules and NAT entries reference. Changing an alias updates every rule
that uses it.

| Alias type | Contents |
| --- | --- |
| Host(s), Network(s) | Addresses, ranges, and CIDR networks, or host names that are resolved periodically |
| Port(s) | Ports and port ranges |
| URL (IPs), URL (Ports) | A list downloaded once and stored in the configuration |
| URL Table (IPs), URL Table (Ports) | A list refreshed on an interval and loaded into a `pf` table |

URL and URL Table aliases can also download `.tgz` or `.tar.gz` archives in 1.1. On the alias edit
page, an alias with more than 20 entries gets a filter field above the entry grid with an "n of m
shown" count; filtering only hides rows, so saving still keeps every entry.

Some tables are owned by integrations rather than by you, for example the CrowdSec decision table.
Manage those through the integration, not as aliases. See [CrowdSec](/packages/crowdsec/).

## Address translation

| NAT type | Translates | Notes |
| --- | --- | --- |
| Port forward | Destination of inbound connections | Usually creates a linked pass rule on the WAN |
| 1:1 | A whole external address to an internal one, both directions | Still needs pass rules |
| Outbound | Source of connections leaving an interface | Automatic, hybrid, manual, or disabled mode |
| NPt | IPv6 prefix to prefix | Stateless, one prefix per mapping |

NAT happens before filtering for inbound traffic: rules on the WAN tab see the translated (internal)
destination of a port forward. In 1.1, **Add unassociated filter rule** on a port forward creates an
independent rule again, and NAT64 rules no longer receive a `reply-to`.

## Traffic control, schedules, and virtual IPs

The Traffic Shaper (ALTQ queues), limiters (dummynet pipes), and schedules all change how matching
traffic is treated, so introduce one mechanism at a time and watch **Status → Queues**,
**Diagnostics → Limiter Info**, and **Status → Traffic Graph** before combining them. On `vtnet` and
`hn` virtual adapters ALTQ must first be enabled under **Interfaces → NIC Settings → Profile**.

Virtual IPs add addresses for NAT, services, and high availability. A virtual IP that a GRE, GIF, or
VXLAN tunnel is sent from cannot be deleted, and the tunnel follows it when its address changes; see
[routing and high availability](/base-os/routing-and-high-availability/).

## Related pages

- [Firewall rules and aliases](/configure/firewall-rules-aliases/) - procedures
- [NAT](/configure/nat/) - procedures
- [Monitoring and logs](/operations/monitoring-and-logs/) - firewall log
