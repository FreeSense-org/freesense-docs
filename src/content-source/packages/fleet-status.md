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
`FreeSense-pkg-Fleet` 0.2.0_1, on a lab of one controller and six firewalls (two branch offices,
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

## Known issues

None of the fixes below is in a published build yet. They are planned for a coming Development
build, most important first. Until then, use the workaround.

### Security

| Issue | Workaround |
| --- | --- |
| The policy rule **WebGUI login protection (SEC-003)** checks the wrong setting: it tests the *anti-lockout rule*, not login protection. On a firewall with only a WAN interface it reports a failure, and **Fix** would turn the anti-lockout rule back on, which opens the WebUI and SSH on that interface. | Do not switch on SEC-003, and never use **Fix** for it. |

### Wrong or misleading results

| Issue | Workaround |
| --- | --- |
| The policy rule **Update channel (VER-004)** can never pass on Development: firewalls report the channel as `devel`, the rule expects `development`. | Leave VER-004 off on Development firewalls. |
| **HA pairs**: when one firewall of a pair loses power, Fleet briefly reports a *split-brain* (both MASTER) and then *healthy again*, while one firewall is still down. It compares the live state of one firewall with the last report of the other. | Check the firewall list: the firewall that is really down shows as degraded, then offline. |
| **Users → Sync** shows users and groups that were never synced as *changed on the firewall*, with **Adopt** and **Ignore**. They are only waiting for the first sync. | Select **Sync** instead of Adopt or Ignore. |
| The headline, the top-bar icon and the NOC summary do not count **policy failures**; only **Needs attention** lists them, and there is no alert for a failing rule. | Check **Policies → Compliance**. |
| A planned reboot sends *Firewall back online* although no *offline* alert was sent before it. | Ignore *back online* alerts without an *offline* alert. |

### Usability

| Issue | Workaround |
| --- | --- |
| **Schedules → Run now** starts a reboot or update at once, without asking. | Be sure before you select it. |
| **Alert channels**: when a channel cannot be saved (for example a webhook address that does not start with `https://`), the dialog closes without an error. | Use an `https://` address and check that the channel appears in the list. |
| **Alert channels**: a webhook receiver with a self-signed or private-CA certificate cannot be used; there is no way to trust a certificate per channel. | Use a receiver with a publicly trusted certificate. |
| **Templates → Firewall rules** opens with an example rule whose values are real text, not hints; typing adds to them. | Clear each field before typing. |
| The **HA pair** wizard shows the review below the fold after **Review**, without moving to it. | Scroll down to *3. Review*. |
| An operation's overall progress bar can stay at *Starting* while its firewalls already show progress. | Follow the rows per firewall. |
| An SSH key for a Fleet user has no effect unless one of the user's groups has the shell privilege. | Add *User - System: Shell account access* to the group when the users need SSH. |

Smaller cosmetic issues (wording, colours, placeholders) are tracked too and fixed with the
items above.

## Not tested yet on 1.2

- A real **rollout** of an update through a maintenance window (no newer build existed during the
  test).
- Delivery of an alert to a webhook end to end on 1.2 (blocked by the certificate limitation
  above), and the e-mail, Slack/Teams, Telegram, ntfy and Gotify channels.
- **Deployment Factory** batches booting from a seed, and joining over **Tailscale**, on 1.2.
- The **standby controller** on 1.2.

## Related pages

- [FreeSense Fleet](/packages/fleet/)
- [Fleet updates, templates and schedules](/packages/fleet-operations/)
- [Fleet policies](/packages/fleet-policies/)
- [Fleet HA pairs](/packages/fleet-ha/)
