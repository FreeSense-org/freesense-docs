---
title: Upgrading from 1.0
description: How to upgrade a FreeSense 1.0.x firewall to the 1.1 Stable line, what the updater does on ZFS and UFS, and what to check afterwards.
---

FreeSense 1.1.0 replaces 1.0.x as the supported Stable line. A firewall on the Stable channel is
offered the current 1.1.x release as a normal system update. The 1.0.x releases stay published, but ordinary fixes are
no longer backported to them.

:::caution[The upgrade is one-way]
After a firewall runs 1.1, the updater never offers 1.0 again. On ZFS the pre-upgrade boot
environment is kept as an emergency recovery point for the moments right after a failed upgrade. It
is not a supported way to go back to 1.0. Take a configuration backup before you start.
:::

## Before you start

1. **Back up the configuration.** Download it from **Diagnostics → Backup & Restore**. Encrypt it if
   it leaves the firewall, and keep it somewhere other than the firewall itself.
2. **Check your packages.** Compare **System → Package Manager → Installed Packages** with the
   [1.1 package catalog](/packages/catalog/):
   - **pfBlockerNG is not available in 1.1.** Write down its lists and settings and plan to use
     [Threat Shield](/packages/threat-shield/) for DNS filtering. From Threat Shield package
     1.1.0 it also loads IP block lists and enforces GeoIP country blocking (package 1.0.0 does
     not load those rules). A URL table alias with a firewall rule is a built-in alternative for
     plain IP block lists.
     Removing pfBlockerNG before the upgrade is the predictable path.
     <!-- needs verification: behaviour of an installed pfBlockerNG package during the 1.0 -> 1.1 upgrade (left installed, removed, or reinstall error) -->
   - **Prometheus Node Exporter** renames its interface metrics from `node_pfsense_*` to
     `node_freesense_*`. Update dashboards and alerts that use the old names.
3. **Know your file system.** **System → Boot Environments** lists boot environments only on a ZFS
   installation. ZFS installations get the protected upgrade described below; UFS installations are
   upgraded in place.
4. **On ZFS, check free pool space.** The updater requires at least 2 GiB or 15 % of the pool size,
   whichever is larger, and stops with "Not enough ZFS pool space for a safe boot environment
   upgrade." otherwise. Deleting old manual boot environments frees space.
5. **Have recovery media ready.** Keep a verified installer for the release you run (see the
   [download center](https://freesense.org/download)) in case the system must be reinstalled.
6. **Plan for a reboot.** The upgrade always ends with at least one reboot. Schedule a maintenance
   window and keep console access (serial, VGA, or the hypervisor console).
7. **Read the [known issues](/releases/previous-1.1/#known-issues-in-119).**

## Run the upgrade

You can start the upgrade from the WebUI or from the console. Both run the same updater,
`FreeSense-upgrade`. Before it upgrades the system, the updater first updates itself if a newer
version is available, so the 1.1 updater logic performs the upgrade.

### From the WebUI

1. Open **System → Update**.
2. On the **Update Settings** tab, confirm that **Branch** is the Stable channel.
3. On the **System Update** tab, wait for the check to finish. **Installed system** shows the
   running 1.0.x version and **Available system** shows the current 1.1.x release.
4. Select **Install update**. The page is locked behind a progress overlay that shows the from and
   to versions and an elapsed timer; **Show details** opens the updater output. Do not close the
   browser tab or reboot the firewall by hand.
5. The firewall reboots when the update is installed. Log in again after it comes back.

:::note
On 1.0.x systems the dashboard's update check could report "up to date" even when an update
existed. This was fixed in 1.1. Use **System → Update** or the console on 1.0.x rather than relying
on the dashboard.
:::

### From the console

1. Log in on the console or over SSH as `admin`.
2. Choose **13) Update from console** in the console menu.
3. The updater lists the packages it will upgrade and asks `Proceed with upgrade? (y/N)`. Answer
   `y`.
4. Wait for the reboot.

## What happens on ZFS

When the root file system is ZFS, `bectl check` passes, and `/cf` and `/var/db/pkg` live on the
root dataset, the updater uses a boot environment upgrade:

1. Automatically created boot environments beyond the configured number to keep (default 3) are
   removed, oldest first. Manual, active, next-boot, and pending environments are never removed.
2. The current boot environment is renamed with a timestamp suffix, for example `default` becomes
   `default_20261013120000`. This renamed environment is the pre-upgrade system.
3. A clone is created under the original name and mounted. All packages are upgraded inside the
   clone; the running system is not changed.
4. Package install scripts are deferred to the first boot, the boot code is updated, and the clone
   is marked `pending` for its health check.
5. The clone is activated for the **next boot only** and the firewall reboots.

On the first boot of the upgraded environment, the `freesense_be_health` service checks every 20
seconds that `config.xml` is valid XML, PHP-FPM is running, `pfctl` can list the ruleset, and the
deferred package install scripts have finished. Three passing checks in a row make the upgrade
permanent: the upgraded environment is activated for good and marked `healthy`.

If the checks do not pass within the health timeout (default 300 seconds, adjustable from 60 to 900
on **System → Boot Environments**), the environment is marked `failed`, the pre-upgrade environment
is activated, and the firewall reboots into it. This automatic rollback happens **at most once** per
upgrade. Because the upgraded environment was activated for one boot only, a system that crashes or
hangs before the check also returns to the pre-upgrade environment on the next boot.

The automatic rollback can be switched off with **Rollback: Automatically roll back failed first
boots** on **System → Boot Environments**. With it off, the upgraded environment is made permanent
on its first boot without the health check.

See [ZFS boot environments](/operations/zfs-boot-environments/) for the boot environment page
itself.

## What happens on UFS

On UFS, or when boot environments are disabled, the updater upgrades the installed system in place.
It may reboot more than once while it upgrades the kernel and then the rest of the system. There is
no clone and no automatic rollback. If a UFS upgrade fails, recovery means reinstalling from
installer media and restoring the configuration backup.

## If the upgrade fails

- **The automatic rollback brought back 1.0.** The firewall is running the pre-upgrade environment.
  Check **System → Boot Environments**, where the upgraded environment shows as failed, and the
  upgrade log, then retry the upgrade once the cause is fixed. Report the failure with the upgrade
  log.
- **Emergency recovery from the loader menu.** If the upgraded system is unusable right after the
  upgrade and did not roll back on its own, the pre-upgrade environment (the one with the timestamp
  suffix) can be selected from the boot loader menu. Use this only to recover from a failed upgrade:
  running 1.0 again from that environment is **not a supported downgrade**, the updater will not
  maintain it as a 1.0 system, and configuration changes made on 1.1 are not in it. Retry the
  upgrade or reinstall.
- **Known issue.** The REST API refuses to activate a boot environment that holds an older release
  (HTTP 409, `locked`), but **System → Boot Environments**, `freesense-be`, and the loader menu do
  not yet enforce this. Do not use them to return a healthy 1.1 system to 1.0.
- **UFS.** Reinstall the current 1.1.x release from the installer and restore the configuration backup.

## After the upgrade

1. **Version.** The dashboard and **System → Update** show the 1.1.x release you upgraded to. On
   1.1.0 the dashboard's "built on" time shows the current time, a
   [known issue](/releases/previous-1.1/#known-issues-in-110) fixed in 1.1.1.
2. **Channel.** **System → Update → Update Settings** still shows the Stable channel, and the update
   check reports the system as up to date. Development is listed as an option, but switching to it
   is one-way and unsupported.
3. **Packages.** Installed optional packages are upgraded to their 1.1 versions together with the
   system, and their install scripts run during the first boot. Check **System → Package Manager → Installed Packages** and **Status →
   Services**. If **Secure Web Gateway** is installed, check that its service is running and start
   it if needed (a [known issue](/releases/previous-1.1/#known-issues-in-110)).
4. **Boot environments (ZFS).** **System → Boot Environments** shows the upgraded environment as
   active and healthy, and the pre-upgrade environment with its timestamp suffix. Keep it for a
   short time as a recovery point, then delete it when you no longer need it.
5. **Logs.** Review **Status → System Logs** for errors from packages or services.
6. **Take a fresh backup** of the 1.1 configuration.

## What was tested

| Path | Status |
| --- | --- |
| Stable 1.0.6 → 1.1.0 with the console updater (option 13) | Tested: upgraded, stayed on the Stable channel, reported up to date afterwards, Package Manager worked |
| Stable 1.0.7 → 1.1.0 | Not tested separately |
| Upgrade from **System → Update** in the WebUI | Same updater; not covered by the test above <!-- needs verification: WebUI-initiated 1.0 -> 1.1 upgrade --> |
| UFS in-place upgrade 1.0 → 1.1 | Not covered by the test above <!-- needs verification: UFS 1.0 -> 1.1 upgrade --> |
| Automatic rollback after a failed 1.0 → 1.1 first boot | Not covered by the test above <!-- needs verification: forced health-check failure during 1.0 -> 1.1 upgrade --> |

See also [Updates and release channels](/guides/updates-and-channels/) and the
[1.1.0 release notes](/releases/previous-1.1/#freesense-110).
