---
title: System administration
description: What the FreeSense control plane covers - identity, administrator access, backups, updates, boot environments, and outbound identification.
---

System administration is the control plane of a FreeSense appliance: who can manage it, how it is
identified, how its configuration is preserved, and how its software changes. Settle these before
you expose services or add packages. This page explains the concepts and where they live in the
WebUI; the step-by-step procedures are in
[users, certificates, and backup](/configure/access-and-recovery/).

## Where administration lives

| Area | Menu path | What it controls |
| --- | --- | --- |
| Identity and time | **System → General Setup** | Hostname and domain, DNS server settings, localization (time zone, NTP servers, language), WebUI appearance |
| Administrator access | **System → Advanced → Admin Access** | WebUI protocol and port, Secure Shell, Login Protection, serial and console options |
| Accounts | **System → User Manager** | Users, groups, privileges, authentication servers (LDAP, RADIUS) |
| Trust | **System → Certificates** | Certificate authorities, certificates, and revocation lists |
| API access | **System → REST API** | API settings, listeners, keys, and the API Explorer |
| Notifications | **System → Advanced → Notifications** | Where alerts such as failed backups and updates are sent |
| Backups | **Diagnostics → Backup & Restore** | Local backup and restore, Configuration History, Remote Backup |
| Software | **System → Update** and **System → Package Manager** | System updates, update settings, Optional Packages, custom repositories |
| Recovery points | **System → Boot Environments** | ZFS boot environments (ZFS installations only) |
| Clustering | **System → High Availability** | Configuration synchronization to a peer |

In the 1.1 top menu, **System** is a grouped panel: **General** (Advanced, Boot Environments, General
Setup, Package Manager, Setup Wizard, Update), **Access** (Certificates, REST API, User Manager, and the
password and user-settings pages your account may see), and **Network** (High Availability, Routing).
Items you have no privilege for are not shown. See the [WebUI menu reference](/reference/menu-guide/).

## Administrator accounts and privileges

Every WebUI page and REST API route is guarded by a privilege. Give each operator a named account,
place accounts in groups, and grant the smallest set of privileges that covers the job. Privileges
marked as root-equivalent in the User Manager allow a user to gain full control indirectly, so treat
them like the `admin` account.

FreeSense 1.1 adds one such privilege: editing the custom Kea JSON on the DHCP and DHCPv6 Server
pages now requires the `admin` account or **WebCfg - Services: DHCP Server: Edit Custom Kea
Configuration**. Custom Kea JSON can load hooks and choose file paths, so this privilege is
root-equivalent. Users who could edit DHCP settings in 1.0 keep their other DHCP access but can no
longer change the custom JSON fields without it.

The REST API uses the same privileges. A user with the **WebCfg - System: REST API access** privilege can create and revoke their own API keys and open the API
Explorer; the API still only allows what that user's other privileges allow. See the
[REST API overview](/api/overview/).

## Security fixes in 1.1 that affect administrators

FreeSense 1.1 includes fixes for the web interface issues that the upstream pfSense CE project
addressed in its 2.9.0 advisories, written for the FreeSense code base. Most need no action. The
ones an administrator can notice are:

- the Kea custom JSON privilege described above;
- proxy settings (**System → Advanced → Miscellaneous**) reject control characters;
- the OpenVPN DNS default domain and NetBIOS scope are validated, and unsafe values are dropped
  when the server configuration is written;
- the backup encryption passphrase is passed to `openssl` over a pipe rather than on the command
  line, and existing encrypted backups still decrypt;
- an LDAP group restriction now also denies shell (SSH) logins for users outside the group;
- **Wake All** on **Services → Wake-on-LAN** only acts on a submitted form.

## Outbound identification and privacy

FreeSense does not send a device identifier. Downloads made by the system, including package
operations, identify themselves only with the user agent `FreeSense/<version>`. The 1.0 option
**Do NOT send Device ID** under **System → Advanced → Miscellaneous** no longer exists, because there
is nothing left to turn off; saving that page removes the old setting from the configuration. The
system also no longer fetches a copyright notice from a remote server at boot, and the Captive Portal
default logo is the FreeSense logo.

## Configuration backups

The whole appliance configuration is one file, `/conf/config.xml`. Every saved change also keeps
the previous version, which you can compare and restore from
**Diagnostics → Backup & Restore → Configuration History** (paged 25, 50, 100, or all revisions).

A backup can contain password hashes, private keys, VPN secrets, and API key material. Download
encrypted backups whenever they leave the appliance, and store the passphrase somewhere other than
the firewall.

### Remote backups (new in 1.1)

**Diagnostics → Backup & Restore → Remote Backup** uploads encrypted configuration backups to one
or more off-box targets:

| Target type | Typical services | Authentication |
| --- | --- | --- |
| S3-compatible storage | AWS S3, Cloudflare R2, MinIO, Backblaze B2 | Access key ID and secret access key |
| WebDAV | Any WebDAV folder URL | Username and password (an app password limited to that folder is recommended) |
| SFTP | Any OpenSSH server | An SSH key pair generated on the firewall, with a pinned server host key |

Key properties:

- Each backup is encrypted on the firewall with one passphrase (at least 12 characters) in the same
  format as an encrypted download, so it restores on **Backup & Restore** or with `openssl` and the
  passphrase. A SHA-256 manifest is uploaded next to each file.
- Uploads can run on a schedule (hourly, daily, or weekly), within five minutes after each
  configuration change, or on demand. Scheduled runs skip a target whose configuration has not
  changed since its last upload. Saving a setting never waits for the network: a cron job does the
  upload.
- **Keep** sets how many backups of this firewall are retained on a target (default 30). Older
  backups of this firewall are deleted after each upload; other files on the target are never
  touched.
- A failed upload raises a WebUI notice and uses the channels configured under
  **System → Advanced → Notifications**; the next successful upload clears it.
- Backups on a target can be browsed, downloaded, and restored from the WebUI. A restore goes
  through the normal restore review on the **Backup & Restore** tab.
- Access to these pages requires **WebCfg - Diagnostics: Backup & Restore: Remote Backup**, which
  is root-equivalent.

The same functions are available from the shell (**Diagnostics → Command Prompt** or SSH):

| Command | Purpose |
| --- | --- |
| `freesense-remote-backup run [--target <id>] [--force]` | Upload now to all enabled targets, or to one target; `--force` uploads even when nothing changed |
| `freesense-remote-backup test <id>` | Test the connection and credentials of one target |
| `freesense-remote-backup list <id>` | List the backups of this firewall on one target |
| `freesense-remote-backup status` | Print the last result for each target as JSON |

The step-by-step setup is in [users, certificates, and backup](/configure/access-and-recovery/#set-up-remote-backups).

## Updates and release lines

**System → Update** shows the installed version and available updates; the **Update Settings** tab
selects the release channel in the **Branch** field. Stable is the supported 1.1.x line and replaces 1.0.x. Development is
the rolling 1.2 line, experimental and unsupported. Upgrading from 1.0 to 1.1 is one-way, and so is
moving from Stable to Development: the updater never offers a downgrade. System updates and Optional
Packages are published independently, so a package update can arrive without a System update and the
other way round. See [updates and release channels](/guides/updates-and-channels/) and
[upgrading from 1.0](/guides/upgrading-from-1.0/).

## Boot environments

On a ZFS installation the upgrader clones the current boot environment and upgrades the clone, so
the previous system remains on disk. **System → Boot Environments** lists them. After a failed
1.0 → 1.1 upgrade, the pre-upgrade 1.0 boot environment is an emergency recovery point that you can
select from the loader menu. It is not a supported downgrade path, and a boot environment never
replaces a configuration backup. See [ZFS boot environments](/operations/zfs-boot-environments/).

## Related pages

- [Users, certificates, and backup](/configure/access-and-recovery/) - procedures
- [Release process and provenance](/guides/release-process/)
- [Monitoring and logs](/operations/monitoring-and-logs/)
