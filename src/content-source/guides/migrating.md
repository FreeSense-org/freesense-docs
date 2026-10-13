---
title: Migrating from pfSense or OPNsense
description: Import a pfSense CE or OPNsense configuration into FreeSense, during installation or on a running system, and know what carries over.
---

FreeSense can import the configuration of an existing pfSense® CE or OPNsense® firewall, so you do not
have to rebuild it by hand. There are two ways in:

- **During installation**, with **Import config** in the installer menu. The importer reads
  `config.xml` from a USB stick or from the disk of the old installation.
- **On a running FreeSense system**, by restoring the file under **Diagnostics → Backup & Restore**.

Both use the same detection, conversion, and package mapping, so they produce the same result.

FreeSense is an independent project derived from pfSense CE. It is not affiliated with or endorsed by
the owners of the pfSense or OPNsense trademarks; the names are used here only to identify the
products you are migrating from.

## What carries over

The importer recognizes the source by the root element of `config.xml` (`<pfsense>` or `<opnsense>`).

| Configuration | From pfSense CE | From OPNsense |
| --- | --- | --- |
| System settings (hostname, domain, DNS, time zone) | Imported | Imported |
| Interfaces, VLANs, gateways, static routes | Imported | Imported |
| DHCP server settings | Imported | Imported |
| Users and groups | Imported | Imported |
| Certificate authorities and certificates | Imported | Imported |
| Firewall rules and NAT | Imported | Not imported |
| IPsec and OpenVPN | Imported | Not imported |
| Traffic shaper, DHCP relay, dashboard widgets | Imported | Not imported |
| DNS resolver settings | Imported | Not imported; the DNS Resolver is enabled with defaults |
| Package and plugin settings | Imported for packages that FreeSense offers | Not imported |

**From pfSense CE**, FreeSense keeps the whole configuration: the configuration format is shared, so
only the root element is renamed. Package settings stay in the file and apply once the matching
FreeSense packages are installed.

**From OPNsense**, the configuration format has diverged, so only the compatible sections are kept.
The OPNsense-specific configuration tree, firewall rules, NAT, traffic shaper, IPsec, OpenVPN, DHCP
relay, dashboard widgets, and installed plugin settings are dropped, as is the OPNsense version marker
so that FreeSense applies its own configuration upgrade. Because OPNsense keeps its resolver settings in
the dropped tree, the importer enables the FreeSense DNS Resolver so the firewall can resolve update
and package servers after import. Re-create firewall rules, NAT, and VPNs after the first boot.

## Packages

The importer reads the installed packages (pfSense) or plugins (OPNsense, with the `os-` prefix
removed) from the source configuration and maps each one to a FreeSense Optional Package using a
mapping table shared by the installer and the WebUI:

- In the installer, the **Packages to install** checklist pre-selects confident matches and shows
  uncertain suggestions unselected for you to confirm. A summary then lists functions that are built
  into FreeSense and packages with no FreeSense equivalent, so nothing is dropped silently.
- On a running system, the restore message lists the packages to reinstall (uncertain matches are
  marked with `?`) and the packages with no FreeSense equivalent.

After the first boot, open **System → Package Manager → Installed Packages**, install any mapped
package that is missing from **Available Packages**, and review each package's settings.
<!-- needs verification: whether the package selection staged by the installer (/tmp/recovered_config/import_packages) or by the WebUI restore (/conf/import_packages) is installed automatically after the first boot; no reader for either file was found in the 1.1.0 sources -->

## Before you start

On the old firewall, download the configuration as XML. Do not encrypt it if you will use the
installer: the installer importer reads only plain `config.xml` files. The WebUI restore can decrypt an
encrypted backup in the pfSense or FreeSense format if you provide its password.

## Import during installation

1. Copy `config.xml` to the root of a USB stick, or to a `conf/` folder on it. FAT and UFS sticks work.
   You can also skip the stick and read the file directly from the old installation's disk (UFS or
   ZFS) in the same machine.
2. Boot the FreeSense installer and accept the notice.
3. In the welcome menu, choose **Import config** (**Import basic config from pfSense or OPNsense**).
4. Select the partition that holds the configuration. The importer mounts it read-only and looks for
   `config.xml`, `conf/config.xml`, or `cf/conf/config.xml`.
5. Confirm the detected source (pfSense CE or OPNsense).
6. In **Packages to install**, tick the packages you want.
7. When the importer reports success, choose **Install** and complete the installation. The converted
   configuration is copied into the new system.

A FreeSense backup is recognized too and is copied unchanged. To reuse the configuration of an earlier
FreeSense installation on the same disk, **Recover config.xml** in the installer menu is the direct
route.

## Import on a running system

1. Install FreeSense and complete the [first boot](/getting-started/first-boot/).
2. Open **Diagnostics → Backup & Restore**.
3. Under **Restore Backup**, leave **Restore area** at all (a whole configuration), choose the
   **Configuration file**, and tick **Configuration file is encrypted.** with the password if needed.
4. Select **Review / Restore Configuration**, review the restore, and confirm. The message names the
   detected source, the sections that were dropped, and the package mapping. The firewall reboots with
   the converted configuration.

Conversion only happens for a full restore. Restoring a single area from a pfSense or OPNsense file is
not converted.

## After the first boot

1. Sign in to the WebUI and change any password that was carried over from the old system if it was
   shared or weak.
2. Check **Interfaces → Assignments**: the old port names may not exist on new hardware. Fix any
   interface mismatch at the console or on the assignments page.
3. Check **System → General Setup** for hostname, domain, and DNS.
4. Check **Status → Services** and **Status → System Logs** for errors.
5. Check **System → Package Manager → Installed Packages** and review each package's settings.
6. **From OPNsense:** re-create firewall rules, NAT, and VPN tunnels.

## Troubleshooting

- **"Could not recognize this config"** - the file's root element is not `<pfsense>`, `<opnsense>`, or
  `<freesense>`. Check that you downloaded the configuration XML and not an encrypted or compressed
  file.
- **"No readable config.xml was found"** - the file is not at `config.xml`, `conf/config.xml`, or
  `cf/conf/config.xml` on the selected partition, or the partition is not FAT, UFS, or ZFS.
- **No packages were detected** - the source had no packages recorded; only the base configuration is
  imported.
- **Interfaces do not come up** - the hardware differs from the old firewall. Use console option 1
  (**Assign Interfaces**) to map the interfaces to the new ports.
