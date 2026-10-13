---
title: TFTP Server
description: Serve boot images and device configuration files over TFTP from a FreeSense firewall with the tftpd package.
---

The **TFTP Server** package (`FreeSense-pkg-tftpd` 0.1.3) runs the tftp-hpa server
(`in.tftpd`) on the firewall. Network boot clients (PXE), IP phones, switches and other embedded
devices use it to fetch boot images and configuration files. TFTP has no authentication and no
encryption, so use it only on trusted management or provisioning networks.

All files are served from one fixed directory, `/tftpboot`. You can manage the files from the
WebUI.

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **TFTP Server** (package `FreeSense-pkg-tftpd`) and click **Install**.
3. Confirm the review page and wait for the installer to finish.

The tftp-hpa server is installed as a dependency. On Stable 1.1 the package is available for
amd64. For general package handling see [Installing packages](/packages/installing-packages/).

## Where to find it

**Services → TFTP Server** (in the *Network* group of the Services menu). The page has two tabs:

| Tab | Page | Purpose |
| --- | --- | --- |
| **Settings** | `pkg_edit.php?xml=tftpd.xml` | Turn the service on and set its options |
| **Files** | `tftp_files.php` | Upload, download, delete, back up and restore the files in `/tftpboot` |

## First-time setup

1. Open **Services → TFTP Server → Settings**.
2. Check **Enable TFTP service**.
3. In **TFTP Server Bind IP**, enter the firewall address on the provisioning network, for
   example `192.168.1.1`. If you leave it empty, the server listens on every local address.
4. Leave **Write Access** unchecked unless devices must upload files (for example, switches that
   back up their configuration over TFTP).
5. Check **Logging** while you test, so each read and write request is logged.
6. Click **Save**. The service starts right away.
7. Open the **Files** tab, click **Upload** and add the boot image or configuration file.
8. Add a firewall rule on the client interface that allows UDP port 69 to the address from
   step 3 (see below).
9. From a client, fetch a file, for example `tftp 192.168.1.1 -c get pxelinux.0`.

## Settings reference

| Field | What it does | Default |
| --- | --- | --- |
| **Enable TFTP service** | Starts the server. When unchecked, the service is stopped and its rc script is removed. | Off |
| **TFTP Server Bind IP** | Limits the server to one local IPv4 or IPv6 address. The address must be configured on the firewall, or the save is refused. | Empty (all local addresses) |
| **IPv4 Only** | Accept IPv4 clients only (`-4`). When set, the bind IP must be an IPv4 address. | Off |
| **Max Block Size** | Largest block size a client may negotiate (`-B`), 512 to 65464. For clients that cannot handle fragmented packets, use the smallest MTU on the path minus 32, for example 1468 on a 1500-byte Ethernet. | Empty (server default) |
| **Write Access** | Lets clients upload files and create new ones (`-c -p`). | Off |
| **Logging** | Logs each read (RRQ) and write (WRQ) request (`-v`). | Off |

### Files tab

| Action | What it does |
| --- | --- |
| **Upload** | Uploads one file into `/tftpboot`. Names may contain letters, digits, `.`, `_` and `-`, must start with a letter or digit and be at most 128 characters. The file size limit is 64 MB. Uploaded files get mode `0640` and owner `nobody`. |
| Download icon | Downloads one file from `/tftpboot`. |
| Delete icon | Deletes one file. |
| **Backup & Download** | Writes all of `/tftpboot` to `/root/backup/tftp.bak.tgz` and downloads the archive. |
| **Backup** | Writes the archive to `/root/backup/tftp.bak.tgz` only. |
| **Restore** | Extracts `/root/backup/tftp.bak.tgz` over `/tftpboot`. Shown only when a backup exists. |

The files directory is fixed to `/tftpboot`. If an older configuration has a different data
directory, the package shows a notice asking you to move the files and removes the old setting.

## Firewall rules and interfaces

- The package does not add any firewall rules. On each interface where clients send requests,
  add a **pass** rule for **UDP** to the firewall address (or **This Firewall**) on port **69**.
- After the first request, the server sends the file from a new UDP port. That traffic leaves
  the firewall itself and is covered by the state of the outbound packet, so only port 69 needs a
  rule. <!-- needs verification: confirm a PXE transfer works with only the UDP 69 pass rule on a 1.1 system -->
- Never allow TFTP from WAN or other untrusted interfaces. Set **TFTP Server Bind IP** so the
  server does not listen on other networks.

See [Firewall rules and aliases](/configure/firewall-rules-aliases/) for creating rules.

## Service, logs, and status

| Item | Value |
| --- | --- |
| Service name | `tftpd` (shown as *TFTP Daemon* in **Status → Services**) |
| rc script | `/usr/local/etc/rc.d/tftpd.sh` (written by the package) |
| Process | `/usr/local/libexec/in.tftpd -l -s /tftpboot ...` |
| PID file | `/var/run/tftpd-hpa.pid` |
| Logs | The server logs through syslog. With **Logging** checked, requests appear in **Status → System Logs → System → General**. |

Start, stop and restart the service from **Status → Services**.

## Upgrade, backup, and removal

- The settings live in `config.xml` and are part of a normal configuration backup.
- The files in `/tftpboot` are **not** part of `config.xml`. Use **Backup & Download** on the
  **Files** tab, and keep that archive with your configuration backup. The local archive in
  `/root/backup` does not survive a reinstall of the firewall.
- Removing the package stops the server. In FreeSense 1.1 the Package Manager stops a package's
  services before it removes their entries; in 1.0 a removed package could leave its daemon
  running until the next reboot.
- On removal, `/tftpboot` is deleted only when it is empty. Files you uploaded stay on disk.
- The package settings stay in `config.xml`, so a later reinstall picks them up again.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Save fails with *must be a valid, locally configured IP address* | The **TFTP Server Bind IP** is not on any interface. Use an interface address or a virtual IP that exists. |
| Save fails with *must be a valid IPv4 address* | **IPv4 Only** is checked but the bind IP is IPv6. |
| Clients time out | Check the UDP 69 pass rule on the client interface, and that the client uses the bind address. Check **Status → Services** that `tftpd` is running. |
| Large files stop partway or embedded clients hang | The client negotiated a block size that fragments. Set **Max Block Size** to the path MTU minus 32. |
| Uploads from devices fail | **Write Access** is off. Enable it only for the time you need it. |
| Upload in the WebUI fails with *The upload filename or size is invalid* | The file name contains spaces or other characters, or the file is larger than 64 MB. Rename it or copy it to `/tftpboot` over SSH. |

:::note[Changes in FreeSense 1.1]
- **TFTP Server** is listed in the *Network* group of the 1.1 Services menu (freesense-packages
  4ae11df).
- Removing the package now stops `in.tftpd`. The Package Manager stops a package's services
  before deleting them (freesense c767de3).
- Otherwise the package is unchanged from 1.0.x apart from the rebuild for the FreeBSD 16
  platform.
:::
