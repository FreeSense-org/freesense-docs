---
title: Fleet settings
description: Where every FreeSense Fleet setting lives - controller, monitoring, actions and notices, backups, updates, schedules, access, standby server, self-check and advanced values - and how the settings pages are laid out.
---

**Status → FreeSense Fleet → Settings** holds every setting of the controller. Every tunable
value in Fleet is a setting, with its allowed range and default in the help text under it.

:::caution[Development only]
Fleet is part of the Development line (FreeSense 1.2). See [FreeSense Fleet](/configure/fleet/).
:::

## The sections

| Section | What it holds |
| --- | --- |
| **Controller** | Switches the controller on and sets where firewalls connect. See [connection points and firewall rules](/configure/fleet-connect/). |
| **Monitoring** | How often the controller asks each firewall for its status (15 seconds by default), when a silent firewall counts as **degraded** (1 minute) or **offline** (5 minutes), and the [internet monitoring](/configure/fleet-internet/) option with its thresholds. |
| **Actions and notices** | Reboots, backups and restores started from Fleet: whether you are told when an action is done or fails, how long a failed action shows in the top bar and how long a result stays on the firewall's tile, and when a reboot counts as failed. |
| **Backups** | When a changed configuration is backed up, how long backups are kept, how many firewalls are backed up at once, and how long a restored firewall waits before it goes back by itself. |
| **Updates** | How often the controller checks for updates, when an update counts as done or failed, how long rollouts wait between rings, and whether firewalls without rollback protection (UFS) are included in group updates. See [updates, templates and schedules](/configure/fleet-operations/). |
| **Schedules** | How late a missed schedule may still run (15 minutes by default). |
| **Access** | Who may reach the enrollment port: **Exposure** (open for joining, or only an allowed list) and the **Allowed list**, and whether Fleet turns off the key expiry of firewalls on a Tailscale path. |
| **Standby server** | A second FreeSense with the Fleet package keeps a verified, encrypted copy of this controller and can take over. Firewalls learn its address automatically and move to it by themselves. |
| **Self-check** | Everything firewalls need to reach and trust the controller, checked now, with repair buttons. See [Self-check](/configure/fleet-connect/#self-check). |
| **Advanced** | Values you rarely change: how long invitations are valid, how many wrong join keys burn an invitation, and rows per page in lists. |

![Settings, Backups: one setting per row and retention as one sentence](__ASSET_ROOT__/screenshots/packages/fleet-settings-backups.png)

## How a settings page reads

Each setting is one row: its name and a short help text on the left, the control on the right.
Numbers show their unit next to the field ("minutes", "days", "firewalls"), and the help text
says the allowed range and the default. A setting that only matters when another is on, such as
the internet thresholds, appears only while that one is on. **Save** is always the last button on
the right.

**Backups → how long backups are kept** is one sentence you fill in: *Keep the newest 10 backups,
plus one a day for 14 days, one a week for 8 weeks and one a month for 12 months.* A 0 keeps none
by the day, week or month. Pinned backups and each firewall's newest backup are never removed.

## Guides and windows

Where something takes several steps, Fleet uses a **step-by-step guide**: a bar shows the steps,
one step is shown at a time, **Back** is on the left and the forward button on the right, and a
**Review** step lists what will happen before anything changes. Short guides open in a window,
such as **Add a firewall** and **Add template**; longer ones are a page, such as
[Add to fleet](/configure/fleet-join/) on a new firewall, the
[HA pair wizard](/configure/fleet-ha/) and the first-run guide of the controller. Buttons in
windows, guides and forms are always in one row on the right, with **Cancel** or **Back** first
and the main button last.

Lists filter as you choose: pick a state or a group and the list updates at once, and the filter
is kept in the address so you can bookmark it.

## Related pages

- [FreeSense Fleet](/configure/fleet/)
- [Fleet connection points and firewall rules](/configure/fleet-connect/)
- [Fleet internet connectivity and quality](/configure/fleet-internet/)
- [Fleet status and known issues](/configure/fleet-status/)
