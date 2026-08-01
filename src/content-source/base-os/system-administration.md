---
title: System administration
description: Establish the identity, access, update, recovery, and lifecycle controls of a FreeSense appliance.
---

System administration is the control plane for a FreeSense appliance. Configure it before exposing
services or adding packages: an administrator needs a known management path, correct time, a usable
backup, and a tested update and recovery process.

## Set the appliance baseline

Use **System → General Setup** to establish hostname, domain, DNS behavior, timezone, and trusted
time sources. Use **System → User Manager** and **System → Certificates** to create named operator
accounts, least-privilege groups, trusted authorities, and service certificates. Do not share the
default administrator account or use a browser warning as a normal operating state.

## Protect administration

Use **System → Advanced** to set WebUI and SSH exposure deliberately. Restrict administration to a
management network, require strong credentials, and retain console access while changing access,
networking, or authentication settings. Configure notifications before a maintenance window so
failed updates and service events have a route to an operator.

## Update and recover

Use **System → Update** only with the intended release channel. Stable is the supported production
line; 1.1 Development is experimental and an upgrade from 1.0 to 1.1 is one-way. Save a
configuration backup before a significant change and store it outside the appliance. A backup can
contain sensitive configuration, so protect it accordingly.

For ZFS installations, **System → Boot Environments** provides a system-image rollback boundary.
It does not replace configuration backups. Review [ZFS boot environments](/operations/zfs-boot-environments/)
and [updates and release channels](/guides/updates-and-channels/) before using rollback as a
maintenance procedure.

## Related screens

- General Setup, Advanced, User Manager, Certificates, Update, Boot Environments, High Availability
- [Access, certificates, and recovery](/configure/access-and-recovery/)
- [Release process and provenance](/guides/release-process/)
