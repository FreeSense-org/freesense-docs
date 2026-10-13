---
title: Diagnostics and troubleshooting
description: Troubleshoot FreeSense from evidence with the built-in diagnostics tools, the Network Diagnostics package, logs, and a recoverable change path.
---

Troubleshooting is safest when it starts from an expected path and observable evidence. Before you
change configuration, write down the interface, source, destination, protocol, time, and the last
change made before the problem started.

## A useful sequence

1. Check link state, interface addresses, gateway status, and time (**Status → Interfaces**,
   **Status → Gateways**).
2. Read the relevant firewall, service, or package log (**Status → System Logs**).
3. Check DNS resolution separately from reachability (**Diagnostics → DNS Lookup**).
4. Test the route and path with a bounded tool (**Diagnostics → Ping**, **Traceroute**, or
   **Test Port**).
5. Make one reversible change, then repeat the same observation.

## Built-in diagnostics

The **Diagnostics** menu is grouped by task. Press **Ctrl+K** and type a tool name to open it
directly.

| Group | Tools |
| --- | --- |
| Network Tools | DNS Lookup, Packet Capture, Ping, Test Port, Traceroute |
| Tables & State | ARP Table, Limiter Info, NDP Table, pfInfo, pfTop, Routes, Sockets, States, States Summary, Tables |
| System | Authentication, Backup & Restore, Command Prompt, Edit File, S.M.A.R.T. Status, System Activity, GEOM Mirrors (when present) |
| Power & Reset | Factory Defaults, Halt System, Reboot |

Common tasks:

- **Is a rule matching?** Watch **Status → System Logs → Firewall** in the **Dynamic** view, and
  check rule counters and states under **Diagnostics → States**.
- **Is traffic leaving the right interface?** Use **Diagnostics → Packet Capture** on that
  interface with a host or port filter. Keep captures short and filtered.
- **Is the routing table right?** Check **Diagnostics → Routes**.
- **Is a service listening?** Check **Diagnostics → Sockets**.
- **Does an authentication server answer?** Test it with **Diagnostics → Authentication**.

**Diagnostics → Command Prompt** and **Edit File** give full shell and file access. Use them
carefully and restrict them to administrators.

## Network Diagnostics package

The **Network Diagnostics** Optional Package adds **Diagnostics → Network Tools** with four
allow-listed tools:

| Tool | Runs |
| --- | --- |
| Route and loss (MTR) | `mtr` report with 5 cycles |
| Top ports (Nmap) | `nmap` scan of the top 100 TCP ports, without host discovery |
| Throughput client (iperf3) | `iperf3` client test for 5 seconds against a server you choose |
| Local ARP probe | `arping` with 5 probes on a selected interface |

The page validates targets, ports, and interfaces instead of accepting arbitrary shell input. Use it
to test a specific hypothesis, not as a replacement for a scanning policy. Only scan systems you are
allowed to scan. See [Network Diagnostics](/packages/diagnostics/).

## REST API

The REST API offers the same bounded tools for scripts and monitoring systems, for example
`POST /api/v1/diagnostics/ping`, `POST /api/v1/diagnostics/traceroute`,
`POST /api/v1/diagnostics/dns-lookup`, and `GET /api/v1/diagnostics/states`. See the
[REST API overview](/api/overview/).

## Updates and packages

| Symptom | Where to look |
| --- | --- |
| The dashboard reports that it was unable to check for updates | The system log has the reason. Check DNS, the default gateway, and access to `pkg.freesense.org`. |
| An update or package operation reports that the package catalogue can't be read | The package repository isn't reachable. Check DNS and network access, then try again. |
| A package's page or service misbehaves | **Status → System Logs → Packages**, then **Status → Services** |
| An upgrade on ZFS didn't come back | See [ZFS boot environments](/operations/zfs-boot-environments/#recovering-from-a-failed-upgrade) |

:::note[Known issue in 1.1.0]
In one upgrade test, the **Secure Web Gateway** service was stopped after the reboot and had to be
started by hand from **Status → Services**. The cause hasn't been confirmed. After an upgrade, check
that the services you rely on are running.
:::

## Recovery

- Keep console access available for interface, firewall, and routing changes. The console menu can
  reassign interfaces, set addresses, reset the administrator account, and restore a recent
  configuration. See [First boot and setup](/getting-started/first-boot/#if-you-lose-management-access).
- Export the configuration before maintenance (**Diagnostics → Backup & Restore**). Earlier
  configurations are listed on the **Configuration History** tab.
- If an incident involves a package, capture its service state and logs before you restart it. A
  restart can erase the most useful evidence.
- On ZFS, create a boot environment before risky system-level work.

For more recovery procedures, see [Access and recovery](/configure/access-and-recovery/).
