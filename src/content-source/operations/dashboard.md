---
title: Dashboard
description: The FreeSense 1.2 dashboard - widgets that update live, the default layout, adding, moving, resizing and resetting widgets, the interface details, live charts and the system statistics behind them.
---

:::caution[Development only]
This dashboard is part of the Development line (FreeSense 1.2). Stable 1.1 keeps the 1.x dashboard.
:::

The dashboard is the first page after you sign in (**Dashboard** in the top menu bar). It is
a grid of widgets. Each widget shows one part of the firewall and keeps itself up to date: a
small dot in its title turns green while the data is current, orange when it is out of date
and red when the firewall did not answer.

## The default layout

A new dashboard follows the layout of earlier FreeSense versions, in two halves:

| Left | Right |
|---|---|
| System | Interfaces |
| Traffic (WAN) | Gateways |
| Services | |

Every user has their own dashboard. The layout is stored on the firewall per user (in
`/conf/webui`, not in `config.xml`), so arranging widgets does not create configuration
revisions.

## Arranging widgets

- **Add widget** (top right) opens the catalogue, grouped by category. Widgets that allow it
  can be added more than once, for example two **Traffic** widgets for WAN and LAN.
- **Edit layout** shows an edit bar. Drag a widget by its title to move it. **Reset to default**
  in the edit bar puts back the default layout and settings; **Done** ends editing.
- Each widget's **⋯** menu sets how often it refreshes, its size (small to full width),
  **Settings…** (title and the widget's own options), **Move earlier / Move later** (for the
  keyboard), **Collapse** and **Remove widget**.
- **Live** (top right) pauses and resumes every widget at once.

Widgets only update while you can see them: they pause in a hidden browser tab, while they are
collapsed and while they are scrolled out of view, so an open dashboard costs the firewall
little.

The catalogue only offers widgets whose page you are allowed to open. A user with access to
**Status > Interfaces** but not to **Status > Services**, for example, sees the Interfaces
widget but not the Services widget.

## Widgets

**System**: host name, version and whether an update is available, CPU load (overall and per
core), load average, memory, swap, state table and mbuf use, hardware, CPU and crypto
acceleration, DNS servers and uptime. **Settings** chooses between the essentials and every row.

**Interfaces**: one row per interface with the link state, speed and duplex (for example
`2.5 Gbit/s`), how it gets its address (DHCP, PPPoE, static), its VLAN or LAGG, the IPv4 and
IPv6 addresses, MAC address and vendor, gateway, MTU and the live traffic. A red **errors**
tag appears while the error or drop counters are climbing. Click a row for the details: the
network card's driver and chip, PCI ids and queues, SFP module data (vendor, temperature,
optical power), wireless data, every counter and a live chart.

**Interface detail** shows the same details for one interface without opening the drawer.

**Traffic** charts one interface's throughput. It opens with the recent history and then adds
a sample every two seconds; in is drawn above the line, out below it. **Settings** chooses the
interface, the time span (2 minutes to 24 hours) and bits or packets per second.

The other widgets: **Resources** (CPU, memory, swap, states and mbufs as rings), **Gateways**,
**Services** (with start, restart and stop), **Thermal sensors**, **Storage**, **ZFS**,
**Notices**, **Firewall log** (a live tail), **State table**, **Top talkers**, **DHCP leases**,
**VPN tunnels** (WireGuard, OpenVPN and IPsec together), **High availability** (CARP),
**NTP**, **Dynamic DNS**, **Disk health** (SMART), **Wake on LAN**, **Captive portal**,
**Packages** and **Quick actions**.

Installed packages can add their own widgets: BIND, Suricata alerts, Threat Shield and its
threat map, FreeSense Fleet, HAProxy and UPS (NUT).

## Where the numbers come from

- System figures come from the statistics sampler `freesense-sysstatd`. It starts when the
  dashboard first asks for figures, reads the kernel once a second (CPU of every core, load,
  frequency) and the slower figures every few seconds, and stops after ten minutes without a
  viewer. A dashboard request never waits for a command.
- Interface details come from one `ifconfig` run for all interfaces; the network card details
  are cached for five minutes.
- Charts open with the firewall's RRD history (one point a minute) and continue with live
  samples. After a hidden tab or a pause the history is fetched again, so the gap fills.
- ZFS pool problems are reported as notices by a check that runs every five minutes, whether
  or not anyone looks at the dashboard.

Everything the dashboard shows is also available from the REST API under
`/api/v1/status/...`; see the [route reference](/api/reference/).
