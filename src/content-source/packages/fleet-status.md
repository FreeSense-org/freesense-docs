---
title: Fleet status and known issues
description: An honest status of FreeSense Fleet on Development 1.2 - what was tested on real firewalls, what does not work yet, and which fixes are planned.
---

This page says plainly what works in [FreeSense Fleet](/packages/fleet/) today and what does not.
It is updated as fixes land.

:::caution[Development only]
Fleet is part of the Development line (FreeSense 1.2) and is experimental. Do not use it to
manage production firewalls yet.
:::

**Tested with:** FreeSense 1.2.0-DEVELOPMENT (build of 17 October 2026) and Fleet package
`FreeSense-pkg-Fleet` 0.2.0_1 (fixes: 0.2.1), on a lab of one controller and six firewalls (two branch offices,
two shops and an HA pair) on Proxmox.

## What was tested and works

- **Joining**: invitation link + join key + 6-digit approval code, the Fleet tunnel, and the first
  backup, on all six firewalls.
- **HA pairs**: the setup wizard made a working CARP pair with state sync and configuration sync.
  When the MASTER lost power, the BACKUP took over within seconds, and the MASTER took its role
  back when it returned.
- **Templates**: a Time and NTP template changed six firewalls in nine seconds (checked in each
  firewall's NTP configuration). A firewall-rule template was applied under commit-confirm and the
  rule was loaded on both firewalls.
- **Schedules**: a rolling reboot restarted two firewalls one at a time; each was back online
  before the next one started.
- **Users**: a Fleet user and user group reached only the firewalls of the targeted group, with
  their SSH key.
- **Monitoring**: a firewall that stops answering is shown as degraded after about a minute and
  offline after five minutes (the default), counts as an outage, and raises a Critical
  *Firewall offline* alert, followed by *Firewall back online* when it returns. Failed alert
  deliveries are retried every minute.
- **Webhook alerts** check the receiver's HTTPS certificate.

## Fixed in Fleet 0.2.1

The issues found in this test are fixed in `FreeSense-pkg-Fleet` 0.2.1 and a small FreeSense
system change. They were checked on the lab firewalls, but **they are not in a published
Development build yet**; they arrive with the next nightly build after they are merged. Until
then, 0.2.0_1 still has them.

- **Security:** *WebGUI login protection (SEC-003)* now checks login protection (sshguard), and
  Fleet can no longer change the anti-lockout rule on a firewall.
- **Update channel (VER-004)** passes on Development firewalls.
- **HA pairs:** a firewall that loses power is reported as *member down*, not as split-brain.
- **Policy failures** show in the headline, the top-bar icon and the NOC view, and a new alert
  reports a firewall that starts failing a High rule.
- *Firewall back online* is sent only after an *offline* alert.
- **Users → Sync** shows never-synced users as waiting for sync, and points out SSH keys without
  the shell privilege.
- **Schedules → Run now** asks before a reboot or update.
- **Alert channels** show save errors, send only the chosen type's fields, and can trust one
  certificate per webhook, ntfy or Gotify channel by its SHA-256 fingerprint.
- Smaller fixes: template hints, the HA wizard (moves to the review, warns about two interfaces on
  one network card), the activity progress bar, the newest-version tile, invitations (**New key**),
  and group list colours.

- **Cloud images:** the admin password set after the first boot is no longer reset when the
  image re-reads its cloud-init data (fixed in the cloud-init adapter, also for Stable 1.1).

## Not tested yet on 1.2

- A real **rollout** of an update through a maintenance window (no newer build existed during the
  test).
- Delivery of an alert to a webhook end to end on 1.2 (now possible with a trusted fingerprint), and the e-mail, Slack/Teams, Telegram, ntfy and Gotify channels.
- **Deployment Factory** batches booting from a seed, and joining over **Tailscale**, on 1.2.
- The **standby controller** on 1.2.

## Related pages

- [FreeSense Fleet](/packages/fleet/)
- [Fleet updates, templates and schedules](/packages/fleet-operations/)
- [Fleet policies](/packages/fleet-policies/)
- [Fleet HA pairs](/packages/fleet-ha/)
