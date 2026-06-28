---
title: Migrating from pfSense or OPNsense
description: Import your existing pfSense CE or OPNsense configuration into FreeSense during installation.
---

The FreeSense installer can import the **basic configuration** from an existing
**pfSense® CE** or **OPNsense®** firewall, so you don't have to rebuild everything by hand.

:::caution[Packages are never imported]
Only core configuration is imported — add-on **packages/plugins are not**. Reinstall those from
**System → Package Manager** after the first boot, and review your settings.
:::

## What gets imported

| | pfSense CE | OPNsense |
| --- | --- | --- |
| System (hostname, domain, DNS, time zone) | ✅ | ✅ |
| Interface assignments + addresses | ✅ | ✅ |
| VLANs, DHCP, gateways, static routes | ✅ | ✅ |
| Firewall rules / NAT | ✅ | ⚠️ **not imported** |
| Users, certificates | ✅ | ⚠️ **not imported** |
| Packages / plugins | ❌ | ❌ |

- **pfSense CE** is a high-fidelity import — FreeSense *is* a rebuild of pfSense CE, so the
  configuration schema is identical. Everything except packages carries over.
- **OPNsense** is a **basic, best-effort** import. OPNsense's configuration diverged from the shared
  lineage, so FreeSense imports only the parts that are still compatible (interfaces, system basics,
  DHCP, gateways, routes, VLANs). Firewall rules, NAT, VPN, certificates and OPNsense-specific
  settings are intentionally skipped — importing them blindly could lock you out. Re-create those
  after the first boot.

## Before you start

1. On your existing firewall, export the configuration:
   - **pfSense:** Diagnostics → Backup & Restore → Download configuration as XML.
   - **OPNsense:** System → Configuration → Backups → Download.
2. Copy the resulting **`config.xml`** onto a USB stick. Put it in the root of the stick, or in a
   `conf/` folder (`config.xml` or `conf/config.xml`). FAT or UFS formatted sticks both work.
3. Do **not** encrypt the backup (encrypted pfSense backups aren't supported by the importer).

## Import during installation

1. Boot the FreeSense installer.
2. At the welcome menu, choose **Import config**.
3. Pick **pfSense** or **OPNsense**.
4. Insert the USB stick and confirm — the installer scans for `config.xml`, converts it, and stages
   it for the install.
5. Choose **Install** and complete the installation as normal. The imported configuration is applied
   to the new system automatically.

:::note[The brand must match]
If you choose **pfSense** but the file isn't a pfSense config (or vice-versa), the importer shows an
error and imports nothing. A FreeSense backup (`<freesense>`) is not a "foreign" config — restore it
with **Recover config.xml** instead.
:::

## After the first boot

1. Log in to the web GUI (`https://192.168.1.1`, `admin` / `pfsense` — change the password
   immediately).
2. Check **Interfaces** — confirm WAN/LAN assignments and addresses.
3. Check **System → General** — hostname, domain, DNS.
4. Re-add any **packages** you need (System → Package Manager).
5. **OPNsense migrants:** re-create your **firewall rules, NAT, and VPNs** — these were not imported.

## Troubleshooting

- **"Not a valid pfSense/OPNsense config"** — the file's root element didn't match the brand you
  picked. Make sure you downloaded the right backup and selected the matching brand.
- **No `config.xml` found** — check the file is named exactly `config.xml` and is in the stick's root
  or a `conf/` folder, and that the stick is FAT or UFS formatted.
