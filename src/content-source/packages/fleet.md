---
title: FreeSense Fleet
description: Manage many FreeSense firewalls from one controller with FreeSense Fleet - groups, joining, a live dashboard, backups, updates, policies and HA pairs.
---

FreeSense Fleet is central management for FreeSense. One firewall runs the **Fleet controller**
(the optional package `FreeSense-pkg-Fleet`); every other firewall joins it with the **Fleet
agent**, which is part of FreeSense itself. From the controller you see every firewall on one
dashboard and can back them up, update them, check them against policies and set up HA pairs.

:::caution[Development only]
Fleet is part of the Development line (FreeSense 1.2). It is not in Stable 1.1. Development
builds are experimental and unsupported; do not manage production firewalls with them yet.
:::

What Fleet gives you:

- **One dashboard** for every firewall: state, availability over 24 hours, alerts and updates.
- **Groups** such as *Branch offices* or *Retail stores*, used to filter lists and to target
  backups, updates, schedules and policies.
- **Joining with an approval code**: a join link plus a separate join key, and a 6-digit code you
  compare before you approve.
- **Backups** of every firewall, kept on the controller, with retention rules.
- **Updates and rollouts** with maintenance windows, **templates** and **schedules**. See
  [Fleet updates, templates and schedules](/packages/fleet-operations/).
- **Policies** that check, fix or lock settings on every firewall. See
  [Fleet policies](/packages/fleet-policies/).
- **HA pairs** set up from two firewalls in one wizard. See [Fleet HA pairs](/packages/fleet-ha/).
- **Activity**: every action runs as an operation with live progress.

Firewalls open the connection to the controller, so they can sit behind NAT. Only the controller
must be reachable on its enrollment port (TCP 8443) and tunnel port (UDP 51830).

## Install the controller

1. On the firewall that becomes the controller, open **System → Package Manager → Available
   Packages**.
2. Install **FreeSense Fleet** (`FreeSense-pkg-Fleet`, category System).
3. Open **Status → FreeSense Fleet**, then **Settings → Controller**.
4. Turn on **Run this firewall as a FreeSense Fleet controller**.
5. In **Address firewalls use to reach this controller**, enter the public address or DNS name
   of this firewall (or the address of a port forward to it).
6. Keep the default ports unless they clash with something else, and select **Save**.

The page confirms *Saved. FreeSense Fleet is running.* A Fleet icon appears in the top bar; it
turns from green to a warning colour when something in the fleet needs attention.

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

1. Open **Firewalls → Add and approve**.
2. Under **The new firewall reaches this controller**, keep **Over the internet** (the Fleet
   tunnel) or choose **Over Tailscale** when the controller is in a tailnet.
3. Fill in:
   - **Name**: how the firewall is shown in Fleet, for example *Aarhus branch*.
   - **Access**: **Monitor only** (Fleet reads status and backups) or **Managed** (Fleet may also
     change the configuration).
   - **Group** and **Site**: the group it joins, and the site token for its naming pattern.
   - **Hostname**: leave empty to use the group's pattern.
   - **Its public address** (optional): the enrollment port accepts this address until the
     invitation expires, even when **Settings → Access** allows only a list.
   - **Valid for**: 1 hour to 30 days.
4. Select **Create invitation**.

![The Add a firewall form filled in for a managed branch firewall](__ASSET_ROOT__/screenshots/packages/fleet-invite.png)

The page shows a **Join link** and a **Join key**. The key is shown only once: copy it and send it
by a different channel than the link.

### Join from the new firewall

On the new firewall, open the console and choose option **17**, or run:

```sh
freesense-join join '<link>'
```

Paste the link, then type the join key when asked. The firewall checks the controller's
certificate, proves the key and then shows a 6-digit code:

```text
OK      Connecting to the controller
OK      Checking the controller's certificate
OK      Proving the join key
WAITING Waiting for approval. Ask the administrator to approve this box and compare the code: 138090
```

### Approve

Back on the controller, **Add and approve** lists the firewall under **Waiting for approval**
with the same code. Approve it **only when the codes match**; a different code means someone else
is using the invitation. Select **Reject** in that case.

![A firewall waiting for approval with its 6-digit code](__ASSET_ROOT__/screenshots/packages/fleet-approve.png)

After approval the firewall sets up the tunnel, sends its first heartbeat and appears in the list:

```text
OK      Setting up the tunnel
OK      First heartbeat

Joined https://fleet.example.net:8443 as node-a7359b57fba68155 (managed).
```

An open invitation can be withdrawn with **Revoke** under **Open invitations**.

For many firewalls at once, use **Deployment Factory** (seed disks and cloud-init seeds that join
by themselves).

## The firewall list

**Firewalls → All firewalls** lists every firewall with its state, version, groups, last contact
and last backup. Search by name, address or version, and filter by state, group or version. The
quick filters at the top show firewalls waiting to join, needing attention, with an update, with
policy problems or without rollback protection.

![All firewalls with the controller, six online firewalls and their groups](__ASSET_ROOT__/screenshots/packages/fleet-firewalls.png)

Select a firewall to open its own page: **Overview**, **System**, **Stats**, **Updates**,
**Policies**, **Backups**, **Manage** and **Events**. **Groups → Change** on the Overview moves it
between groups.

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

**Open live view** and **NOC screens** show the same data full screen for a wall display.

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

On the firewall, run `freesense-join leave`. It leaves the fleet and keeps its last configuration.

## Related pages

- [Fleet HA pairs](/packages/fleet-ha/)
- [Fleet policies](/packages/fleet-policies/)
- [Fleet updates, templates and schedules](/packages/fleet-operations/)
- [Tailscale](/packages/tailscale/)
- [Install and manage packages](/packages/installing-packages/)
