---
title: FreeSense Fleet
description: Manage many FreeSense firewalls from one controller with FreeSense Fleet - guided joining, groups, a live dashboard and wall-screen view, internet monitoring, backups, updates, policies and HA pairs.
---

FreeSense Fleet is central management for FreeSense. One firewall runs the **Fleet controller**
(the optional package `FreeSense-pkg-Fleet`); every other firewall joins it with the **Fleet
agent**, which is part of FreeSense itself. From the controller you see every firewall on one
dashboard and on a wall screen, and can back them up, update them, check them against policies and
set up HA pairs. A new firewall joins from its own WebUI by pasting an invitation.

:::caution[Development only]
Fleet is part of the Development line (FreeSense 1.2). It is not in Stable 1.1. Development
builds are experimental and unsupported; do not manage production firewalls with them yet.
See [Fleet status and known issues](/packages/fleet-status/) for what was tested and what does not
work yet.
:::

What Fleet gives you:

- **One dashboard** for every firewall: state, availability over 24 hours, alerts and updates.
- **Groups** such as *Branch offices* or *Retail stores*, used to filter lists and to target
  backups, updates, schedules and policies.
- **Guided joining**: make an invitation on the controller, paste it into **Add to fleet** on the
  new firewall, and compare a 6-digit code before you approve. Fleet tunnel, Tailscale (installed
  for you) or a direct connection. See [Add a firewall to a Fleet](/packages/fleet-join/).
- **Connection points**: choose the interfaces and ports the controller listens on; Fleet opens
  and closes the ports with locked firewall rules. See
  [connection points and firewall rules](/packages/fleet-connect/).
- **A live view for a wall screen**: panels on one side, a paged firewall list on the other, per
  screen layout, groups and sound. See [Fleet live view](/packages/fleet-live-view/).
- **Internet monitoring**: packet loss, latency, jitter, a quality score and failover alerts for
  every firewall. See [internet connectivity](/packages/fleet-internet/).
- **Backups** of every firewall, kept on the controller, with retention rules.
- **Updates and rollouts** with maintenance windows, **templates** and **schedules**. See
  [Fleet updates, templates and schedules](/packages/fleet-operations/).
- **Policies** that check, fix or lock settings on every firewall. See
  [Fleet policies](/packages/fleet-policies/).
- **HA pairs** set up from two firewalls in a step-by-step guide. See
  [Fleet HA pairs](/packages/fleet-ha/).
- **Activity**: every action runs as an operation with live progress.
- **Settings** for everything, in sections. See [Fleet settings](/packages/fleet-settings/).

Firewalls open the connection to the controller, so they can sit behind NAT. Only the controller
must be reachable: on its enrollment port (TCP, 8443 by default) and tunnel port (UDP, 51830 by
default), or in a tailnet with no public port at all.

## Install the controller

1. On the firewall that becomes the controller, open **System → Package Manager → Available
   Packages**.
2. Install **FreeSense Fleet** (`FreeSense-pkg-Fleet`, category System).
3. Open **Status → FreeSense Fleet**, then **Settings → Controller**.
4. A step-by-step guide starts. **Switch on**, then choose **Where firewalls connect**: one row
   per interface firewalls reach this controller on (WAN for the internet, LAN for your own
   networks, Tailscale for a tailnet), with the port. Leave the address empty and Fleet finds it
   itself; enter a public address or DNS name when the controller sits behind NAT.
5. Let Fleet open the ports (**Firewall rules**), or manage them yourself.
6. Choose whether firewalls may also connect over **Tailscale**, review, and select **Switch
   on**.

See [connection points and firewall rules](/packages/fleet-connect/) for the details.

The page confirms *Saved. FreeSense Fleet is running.* A Fleet icon appears in the top bar; it
turns from green to a warning colour when something in the fleet needs attention, such as an
offline firewall, a failing policy rule or a firewall without internet. **Settings →
Self-check** tests that firewalls can reach and trust the controller.

The controller itself is listed first under **Firewalls** as *Fleet server*. It is not managed
by Fleet and keeps a self-backup.

## Create groups

Groups are optional, but they make a larger fleet much easier to read. A firewall can be in
several groups.

1. Open **Firewalls → Groups** and select **Add group**.
2. Enter a **Name** and a **Description**, and pick a **Colour**.
3. Optionally choose a **Maintenance window** (rollouts update the group only inside it) and a
   **Naming** pattern: new firewalls in the group are named by it when they join. Tokens:
   `{site}`, `{role}`, `{group}`, `{nn}`, `{nnn}`. Numbers are never used twice.
4. Select **Save group**.

![The Add a group dialog with name, description, maintenance window, naming and colour](__ASSET_ROOT__/screenshots/packages/fleet-group-add.png)

Deleting a group never changes its firewalls. A group that a policy, backup set or update ring
uses cannot be deleted.

![The Groups list with four groups](__ASSET_ROOT__/screenshots/packages/fleet-groups.png)

## Add a firewall

Each new firewall needs an invitation.

1. On the controller, open **Firewalls → Add and approve** and select **Add a firewall**. The
   guide asks for a name and access, how the firewall connects, and how long the invitation is
   valid, then gives you **one text** to paste. It is shown once.
2. On the new firewall, open **System → Central Management → Add to fleet**, paste the text and
   follow the steps. A 6-digit code appears.
3. Back on the controller, approve the firewall **only when the code matches**.

![The invitation guide on the controller: how the new firewall connects](__ASSET_ROOT__/screenshots/packages/fleet-invite-guide.png)

All the details, the console route (`freesense-join join`), Tailscale and many firewalls at once
with the Deployment Factory are on
[Add a firewall to a Fleet](/packages/fleet-join/).

## The firewall list

**Firewalls → All firewalls** lists every firewall with its state, version, groups, last contact
and last backup. Search by name, address or version, and filter by state, group or version. The
quick filters at the top show firewalls waiting to join, needing attention, with an update, with
policy problems or without rollback protection.

![All firewalls with the controller, six online firewalls and their groups](__ASSET_ROOT__/screenshots/packages/fleet-firewalls.png)

Select a firewall to open its own page: **Overview**, **System**, **Stats**, **Updates**,
**Policies**, **Backups**, **Manage** and **Events**. **Groups → Change** on the Overview moves it
between groups. **Stats** has one range picker (1 hour to 30 days) and four groups of charts:
availability and load, network, internet and activity. Lists filter as soon as you choose a
state, group or version.

![The page of one firewall with its version, rollback protection, tunnel address and groups](__ASSET_ROOT__/screenshots/packages/fleet-firewall.png)

**Open WebUI** signs you in to the firewall's own WebUI through the controller. It is off until a
local administrator allows it, for chosen users, on the firewall's console:

```sh
freesense-join handoff-users admin
```

## Dashboard

**Dashboard → Overview** sums up the fleet: how many firewalls are online, availability over the
last 24 hours, updates waiting, alerts and firewalls waiting for approval. **Fleet pulse** shows
every firewall over the last 24 hours, half an hour per cell, with the ones that had trouble
first. **Needs attention** lists only firewalls with a problem. Choose a **Group** to narrow the
whole dashboard.

![The Fleet dashboard with six online firewalls, fleet pulse and needs attention](__ASSET_ROOT__/screenshots/packages/fleet-dashboard.png)

**Open live view** and **NOC screens** show the same data full screen for a wall display. See
[Fleet live view and NOC screens](/packages/fleet-live-view/).

## Backups

Every firewall is backed up when it joins and then nightly. **Backups → Overview** shows the last
backup, number of backups and space per firewall, and the retention that keeps them (default: last
10, 14 daily, 8 weekly, 12 monthly). **Sets**, **Copies** and **Recover fleet** add backup sets
with their own schedules, copies on other firewalls and recovery of the controller.

![Backups by firewall with retention](__ASSET_ROOT__/screenshots/packages/fleet-backups.png)

## Activity

Every action - an HA setup, a group reboot, a rollout, a restore - is an **operation** under
**Activity → Operations**, with its state, progress, who started it and how long it took. Open
one to follow each firewall live. **Alerts** and **Alert channels** send problems to webhooks.

![Activity with a finished HA pair setup](__ASSET_ROOT__/screenshots/packages/fleet-activity.png)

## Remove a firewall

On the firewall, open **System → Central Management** and select **Leave the fleet**, or run
`freesense-join leave`. It leaves the fleet and keeps its last configuration.

## Related pages

- [Add a firewall to a Fleet](/packages/fleet-join/)
- [Fleet connection points and firewall rules](/packages/fleet-connect/)
- [Fleet live view and NOC screens](/packages/fleet-live-view/)
- [Fleet internet connectivity and quality](/packages/fleet-internet/)
- [Fleet HA pairs](/packages/fleet-ha/)
- [Fleet policies](/packages/fleet-policies/)
- [Fleet updates, templates and schedules](/packages/fleet-operations/)
- [Fleet settings](/packages/fleet-settings/)
- [Fleet status and known issues](/packages/fleet-status/)
- [Tailscale](/packages/tailscale/)
- [Install and manage packages](/packages/installing-packages/)
