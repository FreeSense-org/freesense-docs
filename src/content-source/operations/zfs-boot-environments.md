---
title: ZFS boot environments
description: Create, activate, verify, and recover complete FreeSense system states on ZFS installations.
---

FreeSense uses ZFS boot environments to preserve complete operating-system states. A boot environment contains the root filesystem, including the base system and installed packages. It complements configuration backups: restoring `config.xml` restores configuration, while activating a boot environment restores the system files that run that configuration.

This feature is available only when FreeSense is installed with a compatible ZFS root pool. UFS installations continue to update in place.

## Automatic protection during updates

When automatic boot environments are enabled under **System > Boot Environments**, the updater:

1. checks that the ZFS pool has sufficient free space;
2. creates an inactive environment from the running system;
3. installs the update into that environment;
4. schedules it for the next boot; and
5. retains the configured number of older automatic environments.

The running environment is not modified by the package transaction. If preparation fails, FreeSense leaves the current environment active and reports the update failure.

## First-boot verification and rollback

An updated environment starts in a **pending** state. During its first boot, FreeSense checks the configuration file, WebUI service, packet-filter rules, and completion of deferred package work. These checks are deliberately local: WAN connectivity, DNS, gateways, CARP state, and optional package services do not determine whether a boot succeeds.

Three consecutive successful checks mark the environment healthy and make it the persistent default. If the checks do not pass before the configured timeout, FreeSense marks the environment failed, activates the previous environment, and reboots. A rollback is attempted at most once, preventing a reboot loop.

Disabling automatic rollback accepts the new environment after it starts without waiting for health verification. Use that setting only when diagnosing first-boot behavior.

## Managing environments

Open **System > Boot Environments** to:

- create or clone an environment;
- add a description or rename an inactive environment;
- select the persistent next boot;
- activate an environment for one boot, optionally rebooting immediately; and
- delete an inactive, non-pending environment.

The current, next, one-time, and pending environments are protected from deletion. Before destructive maintenance, create a clearly named manual environment and keep a current configuration backup separately.

## ZFS Storage dashboard widget

Add **ZFS Storage** from the dashboard's available widgets. It shows pool health, capacity, fragmentation, scrub or resilver status, device error counters, and the current boot environment. Unhealthy pools and device errors create a persistent WebUI notice.

Investigate a degraded pool before updating or deleting boot environments. Boot environments share the same pool and are not a substitute for backups stored on another device.

## Bootloader recovery

If the WebUI is unavailable, select a known-good ZFS boot environment from the bootloader menu. After the system starts, inspect the failed environment and pool health before making it the default again. Do not destroy the last known-good environment until the replacement has completed first-boot verification.

## Release channels

Boot-environment handling is independent of the selected Stable or Development channel. The
environment metadata records the installed FreeSense version, which makes it easier to identify a
recovery target. Moving from 1.0.x to 1.1 remains a one-way updater transition: selecting Stable on
a running 1.1 system does not make a package downgrade safe. To return to 1.0, boot a previously
verified intact 1.0 environment or reinstall a tagged 1.0.x image.
