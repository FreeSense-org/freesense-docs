---
title: Fleet status and known issues
description: An honest status of FreeSense Fleet on Development 1.2 - what was tested on real firewalls, what was fixed along the way, and what has not been tested yet.
---

This page says plainly what works in [FreeSense Fleet](/configure/fleet/) today and what has not
been proven yet. It is updated as things change.

:::caution[Development only]
Fleet is part of the Development line (FreeSense 1.2) and is experimental. Do not use it to
manage production firewalls yet.
:::

**Tested with:** FreeSense 1.2.0-DEVELOPMENT and the `FreeSense-pkg-Fleet` package (version
0.5.0_1, merged on 17 October 2026 and in Development builds from the nightly build of 18
October 2026), on a lab of one controller and seven firewalls: three branch firewalls (one of
them joined over Tailscale), two shops and an HA pair, all virtual machines on Proxmox.

## What was tested and works

- **Joining**: invitation, join key, the 6-digit approval code, the Fleet tunnel and the first
  backup, on all firewalls; and a new firewall joining over **Tailscale** from a pasted
  invitation, with Tailscale installed and connected by the join itself, then moved to the
  tailnet path by the controller. The **Add to fleet** guide's paste, check and review steps were
  checked in the browser; the join itself was run through the same backend from the shell.
- **Connection points and rules**: choosing WAN and Tailscale as connection points makes the
  controller listen only on those addresses, writes the locked rules under Floating, and removes
  them again; all tunnels stayed up while the rules changed.
- **HA pairs**: the wizard made a working CARP pair with state sync and configuration sync. When
  the MASTER lost power, the BACKUP took over within seconds and the MASTER took its role back
  when it returned. Fleet reported the pair as *member down*, not as split-brain.
- **Templates**: a Time and NTP template changed six firewalls in nine seconds. A firewall-rule
  template was applied under commit-confirm and the rule was loaded on both firewalls.
- **Schedules**: a rolling reboot restarted two firewalls one at a time; each was back online
  before the next one started.
- **Users**: a Fleet user and group reached only the firewalls of the targeted group, with their
  SSH key.
- **Monitoring and alerts**: a firewall that stops answering is shown as degraded after about a
  minute and offline after five minutes, counts as an outage and raises a Critical alert,
  followed by *back online* when it returns. A webhook alert was delivered to a receiver with a
  self-signed certificate by its SHA-256 fingerprint, and refused with a wrong one.
- **Internet monitoring**: a test outage (an ICMP block to a firewall's gateway monitor) showed as
  loss, then as down after the set number of checks, with the alert, the status ring, the list,
  the panels and the Internet view all following; recovery went down, poor, up with the matching
  alerts.
- **Live view**: all panels, the paged firewall list, grouping and a screen limited to two
  groups, and settings that save and reload.
- **Updates**: on 18 October 2026 seven firewalls (one over Tailscale) were updated from one
  Development build to the next: one firewall alone, then a rollout in three rings (a retail
  shop, the branch offices, then an HA pair with the secondary first) with no pause between
  rings. Every firewall ended on the new build with a fresh boot environment, the pair came back
  as MASTER and BACKUP with its state sync, and the controller itself was upgraded afterwards
  (System and the Fleet package from 0.2.0 to 0.5.0_1) with its database, tunnels and all seven
  firewalls intact. The firewalls took about six minutes each.

## Fixed during testing

These problems were found in the lab and are fixed in the current build:

- **Security:** *WebGUI login protection* checks the login protection (sshguard), and Fleet can
  no longer change the anti-lockout rule of a firewall. *Update channel* passes on Development
  firewalls.
- **HA pairs:** a firewall that loses power is reported as *member down*, not as split-brain,
  and a pair is never called healthy while a member is silent.
- **Alerts:** *Firewall back online* is sent only after an *offline* alert. Failing policy rules
  show in the headline, the top-bar icon and the live view, and a new alert reports a firewall
  that starts failing a High rule. A failed save of an alert channel shows its error.
- **Users:** never-synced users show as *waiting for the first sync*, not as a change on the
  firewall.
- **Cloud images:** the admin password set after the first boot is no longer reset when the image
  re-reads its cloud-init data (also fixed for Stable 1.1 in the cloud-init adapter).
- **Joining:** a WebUI join and a Tailscale link no longer fail with *wrong key*, Tailscale
  paths no longer drop when the device key expires, and the one-time Tailscale key is removed
  from the configuration backups after use.
- **Display:** the firewall Stats charts draw again, filters apply as you choose them, and many
  layout details were corrected.
- **Updates:** on Development builds, which share one version number and differ only in the
  build stamp, Fleet called every update done the moment it started. A rollout then did not wait
  for each firewall, and both members of an HA pair rebooted together. Fleet now reads the
  installed build from the firewall after its reboot and compares the full stamp, reports a
  firewall that rolled back as failed, and names the builds ("1.2.0 build 20261017.1403")
  instead of "from 1.2.0 to 1.2.0". The fix is in Development builds from the 19 October
  nightly and has been tested with unit tests only; it has not yet run against a real update.

## Not tested yet

- **The 390 px phone layout** of the Fleet pages. It was designed for, but never checked on a
  narrow screen.
- A firewall with **several WANs**: failover to a backup WAN, the *moved to another WAN* alert and
  the *default gateway down* state are covered by unit tests only.
- An **upstream outage** alert (many firewalls losing the internet at once) and the **unstable
  connection** alert were not triggered in the lab.
- The **Direct** connection method (the lab controller has no internal connection point), a
  second enrollment port, and several connection points on LAN.
- The **standby controller** on 1.2.
- A rollout through a **maintenance window** or with a pause between rings, an update that
  **rolls back** on the firewall, an update where a firewall **does not come back**, and an
  update between two Stable releases (their numbers differ, so the follower takes the other
  path).
- Alert delivery to e-mail, Slack or Teams, Telegram, ntfy and Gotify.
- **Deployment Factory** batches booting from a seed on 1.2.
- A complete join through the **Add to fleet** page of a brand-new firewall from start to finish
  in the browser.
- The first-run guide's **Switch on** step and finish screen on a controller that is not yet
  running (the guide was only viewed as a preview on a running controller).

## Known limits

- Fleet is experimental and unsupported until it ships in a stable release.
- The controller should run on ZFS: a failed update of the controller cannot roll back on UFS.
- Charts keep 48 hours at 5 minutes and 30 days hourly; internet history uses the same
  retention.
- A firewall in several groups is listed under only the first of them in a grouped live view.

## Related pages

- [FreeSense Fleet](/configure/fleet/)
- [Add a firewall to a Fleet](/configure/fleet-join/)
- [Fleet live view and NOC screens](/configure/fleet-live-view/)
- [Fleet internet connectivity and quality](/configure/fleet-internet/)
- [Fleet updates, templates and schedules](/configure/fleet-operations/)
- [Fleet policies](/configure/fleet-policies/)
- [Fleet HA pairs](/configure/fleet-ha/)
