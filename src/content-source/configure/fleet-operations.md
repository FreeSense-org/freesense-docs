---
title: Fleet updates, templates and schedules
description: Run many FreeSense firewalls day to day with Fleet - maintenance windows and rollouts, configuration templates, schedules, users and alert channels.
---

This page covers the day-to-day tools of [FreeSense Fleet](/configure/fleet/): updating firewalls
in safe steps, pushing the same settings to many firewalls, running jobs on a schedule, keeping
the same users on many firewalls and sending alerts. The wall-screen view and internet monitoring
have their own pages: [live view](/configure/fleet-live-view/) and
[internet connectivity](/configure/fleet-internet/).

:::caution[Development only]
Fleet is part of the Development line (FreeSense 1.2). See [FreeSense Fleet](/configure/fleet/).
:::

## Updates

**Updates → Overview** shows the newest version offered, how many firewalls can update, and every
version running in the fleet with the firewalls on it.

### Maintenance windows

A maintenance window is a weekly time when a group may be updated, for example weeknights at
01:00 for three hours.

1. Open **Updates → Maintenance windows** and select **Add window**.
2. Enter a **Name**, choose the **Days**, the start time (**Starts at**) and the **Length** in
   minutes.
3. Select **Save window**.
4. Give a group the window under **Firewalls → Groups → Change → Maintenance window**.

![The Add a window dialog: weeknights from 01:00 for 180 minutes](__ASSET_ROOT__/screenshots/packages/fleet-window-add.png)

Times are in the controller's time zone. A window may run past midnight. A rollout does not start
an update when less than 60 minutes of the window are left.

### Rollouts

**Updates → Rollouts** updates firewalls ring by ring, each group inside its maintenance window.
The tab lists something only when at least one firewall has an update available. Firewalls without
rollback protection (UFS) are left out unless you allow them in the update settings. Pinned and
allowed version [policies](/configure/fleet-policies/) also stop updates that would break them.

## Templates

A template pushes the same configuration to many firewalls. Fleet shows what would change on each
firewall before anything is applied.

| Kind | What it sets |
| --- | --- |
| Aliases | Lists of servers, networks or ports. Fleet only ever changes aliases it pushed itself. |
| Firewall rules | Pass and block rules, first on their interface. |
| Port forwards | NAT port forwards with their firewall rule. |
| Time and NTP | Time zone and NTP servers. |
| DNS servers | The DNS servers the firewall itself uses. |
| SNMP | SNMP on or off, location, contact and community. |
| Remote logging | Central syslog servers. |

Rules and port forwards are applied under commit-confirm: if a change cuts Fleet off from a
firewall, the firewall puts its previous rules back by itself. They need FreeSense with API level
11 or later; older firewalls are skipped with `FLEET-E401`. A firewall can have one settings
template of each kind.

![The Templates page with rule and settings template kinds](__ASSET_ROOT__/screenshots/packages/fleet-templates.png)

### Add and apply a template

1. Open **Templates** and select **Add template**. In the window that opens, choose a kind, for
   example **Time and NTP** (for aliases there are also ready-made starters).
2. Enter a **Name** and **Description**, choose **For** (all firewalls, groups or single
   firewalls) and fill in the settings. Rule and port-forward rows start empty, with hints in the
   fields.
3. Select **Save and preview**. Saving changes nothing on the firewalls.
4. Check **What applying changes**: each firewall with its changes, read from its newest backup.
   Open a row to see each change, for example `NTP servers pool.ntp.org → 0.dk.pool.ntp.org, …`.
   Select **Read the firewalls now** to read them again first.
5. Apply per firewall with **Apply here**, or to all with **Apply to N firewalls**. **Ignore**
   leaves one firewall as it is.

![The preview: six firewalls with one change each, with Apply here and Ignore](__ASSET_ROOT__/screenshots/packages/fleet-template-preview.png)

Applying runs as an operation in **Activity**:

![The template applied to all six firewalls in nine seconds](__ASSET_ROOT__/screenshots/packages/fleet-template-applied.png)

### Example: a firewall rule for one group

A **Firewall rules** template for *Branch offices* that blocks and logs Telnet to the WAN address.
The preview lists one rule to create on each of the two branch firewalls:

![The rule template preview: one rule to create on each branch firewall](__ASSET_ROOT__/screenshots/packages/fleet-rules-preview.png)

Each firewall gets a safety backup and a commit-confirm window first. The result says
*1 created, 0 changed, 0 removed; confirmed*:

![The rule template applied and confirmed on both branch firewalls](__ASSET_ROOT__/screenshots/packages/fleet-rules-applied.png)

On the firewall, the rule's description starts with `[Fleet:T<id>:<rule name>]`, so you can see
which template it came from.

When a firewall later drifts from its template, Fleet shows it, and you can adopt the firewall's
value, ignore it or put the template's value back.

## Schedules

A schedule backs up, reboots or updates firewalls at a set time.

1. Open **Schedules** and select **Add schedule**.
2. Enter a **Name** and choose what it **Does**: **Back up**, **Reboot one at a time** or
   **Update one at a time**.
3. Under **For**, choose any mix of groups and firewalls. A firewall in two chosen groups is done
   once.
4. Choose the **Days** and the time (**At**). Leave **On (runs at its times)** ticked.
5. Select **Save schedule**.

![A schedule that reboots the Retail stores group every Sunday at 06:00](__ASSET_ROOT__/screenshots/packages/fleet-schedule-add.png)

The list shows each schedule's next run and last result, with **Run now**, **Pause**, **Change**
and **Delete**. **Run now** asks first for a reboot or update, and starts it at once when you confirm.

![The Schedules list](__ASSET_ROOT__/screenshots/packages/fleet-schedules.png)

Reboots and updates go one firewall at a time and stop at the first failure. Each firewall must
come back online before the next one starts:

![A rolling reboot: Shop Nyhavn back online after 1 min 51 s, Shop Strøget restarting](__ASSET_ROOT__/screenshots/packages/fleet-rolling-reboot.png)

Times are in the controller's time zone. A run the controller misses by more than 15 minutes is
recorded as missed, not run late.

## Users

Fleet can keep the same accounts on many firewalls. Local accounts on a firewall (such as
`admin`) are never changed.

1. Open **Users → Groups → Add group**. Enter a name, choose **For** (the firewall groups or
   firewalls the group is for) and the **Privileges** its members get.
2. Open **Users → Users → Add user**. Enter a user name, choose the groups, and a password and/or
   SSH public keys. With no password the user can sign in with SSH keys only. SSH needs a group
   with the *User - System: Shell account access* privilege.
3. Open **Users → Sync** and select **Sync N firewalls**. Each firewall gets a safety backup first,
   and only accounts Fleet made are changed or removed. A firewall that was never synced shows
   *Waiting for the first sync*; only a difference that appears after a sync is shown as a change
   on the firewall, with **Adopt** and **Ignore**.

![Adding a user with an SSH key to the shop-support group](__ASSET_ROOT__/screenshots/packages/fleet-user-add.png)

![The sync: two users and groups added on each shop firewall](__ASSET_ROOT__/screenshots/packages/fleet-user-sync.png)

**Lock Fleet users on the firewalls** makes the firewalls refuse local edits to the accounts Fleet
manages. A firewall that is updated is synced again by itself.

## Alerts and outages

Fleet asks each firewall for its status every 15 seconds (**Settings → Monitoring**). A firewall
that does not answer is marked **degraded** after 1 minute and **offline** after 5 minutes; both
times can be changed. An offline firewall counts as an outage in the availability figure.

![Two firewalls offline after a power cut, shown first under Needs attention](__ASSET_ROOT__/screenshots/packages/fleet-outage.png)

**Activity → Alerts** lists every alert with its severity and where it was sent:

![Firewall offline and back online alerts, with delivery retries](__ASSET_ROOT__/screenshots/packages/fleet-alerts.png)

To send alerts somewhere, add a channel under **Activity → Alert channels**: e-mail (it uses
**System → Advanced → Notifications**), a webhook, Slack or Teams, Telegram, ntfy or Gotify. Pick
the alerts the channel wants, the lowest severity, and an optional daily report, then select
**Send test**. Webhook addresses use `https://` (`http://` is accepted for a lab, but alerts then travel
unencrypted). For a receiver with a self-signed or private-CA
certificate, enter its SHA-256 fingerprint under **Trust this certificate**. A delivery that
fails is retried every minute.

## Related pages

- [FreeSense Fleet](/configure/fleet/)
- [Fleet live view and NOC screens](/configure/fleet-live-view/)
- [Fleet internet connectivity and quality](/configure/fleet-internet/)
- [Fleet connection points and firewall rules](/configure/fleet-connect/)
- [Fleet policies](/configure/fleet-policies/)
- [Fleet HA pairs](/configure/fleet-ha/)
- [Fleet status and known issues](/configure/fleet-status/)
