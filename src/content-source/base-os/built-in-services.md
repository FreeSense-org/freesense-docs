---
title: Built-in services
description: Operate DNS, DHCP, time, discovery, portal, and local network services as Base OS functions.
---

FreeSense includes network services that should be designed as part of the Base OS, not installed as
optional packages. Assign each service an owner, interface scope, data source, log destination, and
failure behavior.

## Name, address, and time services

Use DNS Resolver or DNS Forwarder deliberately; do not run both without a clear division of work.
DHCP, DHCPv6, relays, and Router Advertisements must match the addressing plan and firewall policy.
NTP requires correct upstream reachability and access rules because time affects authentication,
certificates, logs, VPNs, and updates.

## Local and edge services

Captive Portal, Dynamic DNS, IGMP Proxy, PPPoE Server, SNMP, UPnP/PCP, and Wake-on-LAN are powerful
but scope-sensitive. Bind them only to intended interfaces, restrict management or client access,
and test failure and removal behavior. A service enabled on the wrong network is an exposure, not a
convenience.

Use **Services** to configure and **Status → Services** and system logs to verify runtime state.
