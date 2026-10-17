---
title: Network Diagnostics
description: Run MTR, Nmap, iperf3, and ARP probes from the FreeSense WebUI with the Network Diagnostics package.
---

The **Network Diagnostics** package (`FreeSense-pkg-Diagnostics`) adds a **Network Tools** page that
runs a small, fixed set of diagnostic commands from the WebUI: an MTR path report, an Nmap top-ports
scan, an iperf3 throughput test, and an ARP probe. In FreeSense 1.1.0 the package is version 1.0.0
and installs `mtr-nox11` 0.96, `nmap` 7.991, `iperf3` 3.22 and `arping` 2.25 (versions as listed in
the 1.1 package repository).

Use it when the built-in tools under **Diagnostics** (**Ping**, **Traceroute**, **DNS Lookup**,
**Test Port**, **Packet Capture**) are not enough: to see loss per hop, to check which common ports
a host answers on, to measure throughput to an iperf3 server, or to check that a host answers ARP
on a local segment. Each tool runs with fixed options; the page does not accept free-form
command lines.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **Network Diagnostics** (package `FreeSense-pkg-Diagnostics`) and select **Install**.

Stable packages are published for amd64 and, starting with [1.1.1](/releases/previous-1.1/#freesense-111), arm64.

## Where to find it

**Diagnostics → Network Tools**, in the tools group of the Diagnostics menu next to **Ping**,
**Traceroute** and **Test Port**.

Access is controlled by the **WebCfg - Diagnostics: Network Tools** privilege. Give it only to
administrators who are allowed to scan and load the network.

## First-time setup

There is nothing to configure. To run a test:

1. Open **Diagnostics → Network Tools**.
2. Choose a **Tool**.
3. Enter the **Target**: an IP address or a DNS host name.
4. For iperf3, set **iperf3 port** if the server does not use 5201. For the ARP probe, enter the
   **ARP interface**.
5. Select **Run** and wait. The page shows the output and the exit code when the command finishes.

## Settings reference

### Form fields

| Field | What it does | Default |
| --- | --- | --- |
| **Tool** | **Route and loss (MTR)**, **Top ports (Nmap)**, **Throughput client (iperf3)** or **Local ARP probe**. | Route and loss (MTR) |
| **Target** | IPv4 or IPv6 address, or a DNS host name. Anything else is refused. | Empty (required) |
| **iperf3 port** | Port of the iperf3 server, 1 to 65535. Used only by iperf3. | 5201 |
| **ARP interface** | Operating system interface name, for example `em0`, `igc1` or `vtnet0` (not the FreeSense name such as LAN). Required for the ARP probe. | Empty |

### What each tool runs

| Tool | Command | Notes |
| --- | --- | --- |
| Route and loss (MTR) | `mtr --report --report-cycles 5 -- <target>` | Five probes per hop, then a report of loss and latency per hop. |
| Top ports (Nmap) | `nmap -Pn --top-ports 100 -- <target>` | Scans the 100 most common TCP ports and skips host discovery. |
| Throughput client (iperf3) | `iperf3 --client <target> --port <port> --time 5` | A 5-second test from the firewall to an iperf3 server. |
| Local ARP probe | `arping -c 5 -i <interface> -- <target>` | Five ARP requests on one local segment. |

Output is limited to the first 2,000 lines.

## Firewall rules and interfaces

- All tests start from the firewall itself, so they use the firewall's routing table and source
  address selection. Outbound traffic from the firewall is normally allowed.
- iperf3 runs only as a client. The target must run an iperf3 server (`iperf3 -s`) and accept the
  port you chose. To test through the firewall instead of from it, run iperf3 on hosts on both
  sides.
- The ARP probe works only for targets on a segment directly attached to the chosen interface.
- Nmap scans can trigger intrusion detection, rate limits, or blocks on the target or on upstream
  networks. Scan only systems you are authorised to test.

## Service, logs, and status

The package runs no service and writes no log of its own. Each run's output is shown on the page
only and is not stored. Copy anything you need to keep as evidence.

## Upgrade, backup, and removal

The package stores nothing in `config.xml`. Removing it removes the **Network Tools** page and the
privilege. The tool packages it pulled in (`mtr-nox11`, `nmap`, `iperf3`, `arping`) may stay
installed as dependencies until pkg removes unused packages.
<!-- needs verification: whether the Package Manager removes the mtr/nmap/iperf3/arping dependencies when FreeSense-pkg-Diagnostics is removed. -->

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| "Enter a valid IP address or DNS hostname." | The target contains spaces, a URL, a port, or other characters. Enter only the address or name. |
| "Select or enter a valid interface name for ARP probing." | Enter the OS interface name (see **Interfaces → Assignments**), not the FreeSense description. |
| iperf3 exits with an error at once | No iperf3 server is listening on the target and port, or a firewall on the way blocks it. |
| MTR shows loss on middle hops only | Many routers rate-limit replies to probes. Loss that does not continue to the last hop is usually not real loss. |
| The page takes a long time or times out | Nmap against a filtered host can be slow. Try a closer target or use the built-in **Test Port** for a single port. |
| Exit code is not 0 | The tool reported an error; read the output on the page. |

For the built-in tools and a general troubleshooting method, see
[Diagnostics and troubleshooting](/operations/diagnostics-and-troubleshooting/).

:::note[Changes in FreeSense 1.1]
- **Network Tools** is listed in the tools group of the 1.1 Diagnostics menu (`4ae11df`).
- Otherwise the package is unchanged from 1.0.x apart from the rebuild for the FreeBSD 16
  platform.
:::
