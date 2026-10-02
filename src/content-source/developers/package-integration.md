---
title: Package integration
description: How an optional package registers with FreeSense, stores configuration, runs services, and hooks into system events.
channels: [devel, stable]
last_verified_release: development
---

An optional package is more than the files it installs. When `pkg(8)` installs a
`FreeSense-pkg-*` port, the FreeSense package framework reads the package's manifest and registers
its WebUI menus, services, tabs, plugin hooks, and configuration with the appliance. This page
follows that lifecycle and describes the manifest fields the framework uses. To produce the package
itself, see [building optional packages](/developers/building-optional-packages/).

## Repositories and the Package Manager

Each appliance has two signed `pkg(8)` repositories for its release channel:

| Repository | Contents | Priority |
| --- | --- | --- |
| `FreeSense` | The System repository: base OS, WebUI, and System ports | 100 |
| `FreeSense-packages` | Optional packages for the same release train | 50 |

`FreeSense-repoc` writes these repository definitions from the signed channel manifest on
`pkg.freesense.org`, verified with the channel public key shipped in the base system. The Package
Manager only lists and manages packages that come from `FreeSense-packages`, which keeps optional
integrations separate from System updates.

The Package Manager combines two sources:

- **`pkg(8)`** supplies package names, versions, and installation state.
- **The product catalog** (`/etc/freesense-package-catalog.json`, read by
  `src/etc/inc/package_catalog.inc`) supplies the display name, category, support state, resource
  profile, capability badges, services, and the **Configure** and **Status** destinations.

The catalog ships with the base system, not with the package, so product metadata is reviewed and
versioned with the release. The per-package control page `pkg_control.php` offers start, stop, and
restart only for the services the catalog lists for that package.

## Install lifecycle

1. **System → Package Manager** runs `FreeSense-upgrade` to install, remove, or reinstall the
   package through `pkg(8)`.
2. After `pkg(8)` places the files, the package's `pkg-install` script runs
   `php -f /etc/rc.packages <PORTNAME> POST-INSTALL`.
3. `rc.packages` strips the `FreeSense-pkg-` prefix and calls `install_package_xml()` in
   `src/etc/inc/pkg-utils.inc`, which:
   1. reads the registration file `/usr/local/share/FreeSense-pkg-<name>/info.xml` and records it in
      `installedpackages/package` in `config.xml`;
   2. parses the manifest named by its `<configurationfile>` from `/usr/local/pkg/`;
   3. loads the manifest's `<include_file>` (installation stops and is rolled back if it is
      missing);
   4. runs `custom_php_global_functions`, `custom_php_install_command`, then
      `custom_php_resync_config_command`;
   5. writes the package's menu and service entries, each tagged with the owning package; and
   6. saves the configuration and, if the package declares `<logging>`, restarts the system logger.
4. The WebUI picks up the new menu entries on the next page load.

Removal runs the same script with `DEINSTALL` and `POST-DEINSTALL`. `delete_package_xml()` stops the
package's services, removes its rc scripts, runs `custom_php_pre_deinstall_command` and
`custom_php_deinstall_command`, removes the menu and service entries that the package owns, and
finally removes its `installedpackages/package` record.

At boot, `/etc/rc.start_packages` calls `sync_package()` (which runs the resync hook unless the
manifest sets `<nosync>`) and starts each registered service. After an upgrade or configuration
restore, the framework refreshes the generated menu and service metadata for every installed
package instead of re-running install hooks.

:::note[FreeSense ownership tracking]
Every generated menu and service entry records the package that created it, and the WebUI only
shows an entry while its owner's manifest still declares it. Removing, renaming, or replacing a
package therefore cannot leave orphaned menu items or services behind. Legacy entries without an
owner are shown only while some installed manifest still declares them.
:::

## The registration file: `info.xml`

```xml
<?xml version="1.0"?>
<freesensepkgs>
	<package>
		<name>tftpd</name>
		<descr><![CDATA[Installs a TFTP server, used for thin client booting and more.]]></descr>
		<website>http://freecode.com/projects/tftp-hpa/</website>
		<version>%%PKGVERSION%%</version>
		<configurationfile>tftpd.xml</configurationfile>
	</package>
</freesensepkgs>
```

`<configurationfile>` names the manifest in `/usr/local/pkg/`. Optional elements include
`<internal_name>`, `<after_install_info>`, and `<logging>`. A legacy `<pfsensepkgs>` root is still
accepted so imported third-party packages can register.

## The package manifest

The manifest (`/usr/local/pkg/<name>.xml`, root element `<packagegui>`) declares everything the
framework needs. A package can describe its whole settings form in XML, or point its menu at custom
PHP pages and keep only the registration parts.

```xml
<packagegui>
	<name>tftpd</name>                       <!-- settings live in installedpackages/tftpd/config -->
	<version>%%PKGVERSION%%</version>
	<title>Services/TFTP Server</title>
	<include_file>/usr/local/pkg/tftpd.inc</include_file>
	<menu>
		<name>TFTP Server</name>
		<section>Services</section>
		<url>/pkg_edit.php?xml=tftpd.xml</url>
	</menu>
	<service>
		<name>tftpd</name>
		<rcfile>tftpd.sh</rcfile>
		<executable>in.tftpd</executable>
		<description>TFTP Daemon</description>
	</service>
	<tabs>
		<tab><text>Settings</text><url>/pkg_edit.php?xml=tftpd.xml</url><active/></tab>
		<tab><text>Files</text><url>/tftp_files.php</url></tab>
	</tabs>
	<fields>
		<field>
			<fielddescr>Enable TFTP service</fielddescr>
			<fieldname>enable</fieldname>
			<type>checkbox</type>
		</field>
		<!-- ... -->
	</fields>
	<custom_php_install_command>install_package_tftpd();</custom_php_install_command>
	<custom_php_deinstall_command>deinstall_package_tftpd();</custom_php_deinstall_command>
	<custom_php_resync_config_command>sync_package_tftpd();</custom_php_resync_config_command>
	<custom_php_validation_command>validate_form_tftpd($_POST, $input_errors);</custom_php_validation_command>
</packagegui>
```

| Element | Purpose |
| --- | --- |
| `name` | Configuration key. Settings saved by generated forms live under `installedpackages/<name>/config`. |
| `include_file` | PHP file loaded before any hook runs; holds the hook functions. |
| `menu` | One or more WebUI menu entries. See the [WebUI menu system](/developers/webui-menu-system/). |
| `tabs` | Tab bar for generated pages (`text`, `url` or `xml`, `active`, `tab_level`). |
| `service` | Service registration for **Status → Services** and service controls. |
| `fields`, `adddeleteeditpagefields` | Generated settings form rendered by `pkg_edit.php`, or list view rendered by `pkg.php`. |
| `plugins` | System events the package subscribes to (see below). |
| `custom_php_install_command` | Runs once at install time. |
| `custom_php_resync_config_command` | Applies saved settings: writes daemon configuration, rc scripts, and restarts services. Runs at install, after saves, and at boot. |
| `custom_php_validation_command` | Validates submitted form input before it is saved. |
| `custom_php_pre_deinstall_command`, `custom_php_deinstall_command` | Clean up services and generated files at removal. |
| `nosync` | Skip the resync hook at boot. |
| `shortcut_section` | Selects which title-bar shortcuts apply to generated pages. |

Keep hooks idempotent. The resync hook in particular runs repeatedly and must converge on the saved
configuration rather than append to previous output.

## Configuration storage

Package configuration is part of `config.xml`, so it is included in backups, restore points, and
high-availability synchronization:

- `installedpackages/<name>/config` — package settings (generated forms use entry `0` for a single
  settings page, and one entry per row for list views);
- `installedpackages/package` — registration records;
- `installedpackages/menu` and `installedpackages/service` — generated, owner-tagged metadata.

Custom PHP pages should read and write settings with `config_get_path()` and `config_set_path()`,
call `write_config()` with a change description, and then call the package's resync function.

## Services

A `<service>` entry makes the daemon visible in **Status → Services**, the dashboard services
widget, and the page title-bar controls. The framework starts and stops it with the rc script named
by `<rcfile>` (relative to `/usr/local/etc/rc.d/`) or with `startcmd`/`stopcmd`/`restartcmd` when
provided. Running state is detected with `custom_php_service_status_command` or by matching
`<executable>`. Packages typically generate their rc script in the resync hook with `write_rcfile()`.

List the same service names in the package's catalog entry so `pkg_control.php` offers controls for
them.

## Plugin hooks

A package subscribes to system events by listing them in its manifest:

```xml
<plugins>
	<item><type>plugin_carp</type></item>
</plugins>
```

When the event occurs, `pkg_call_plugins()` loads the package's `include_file` and calls a function
named after the manifest file plus the hook type. For `avahi.xml` and `plugin_carp`, that is
`avahi_plugin_carp($params)`.

| Hook | Raised when |
| --- | --- |
| `plugin_carp` | A CARP VIP becomes master or backup |
| `plugin_certificates` | Certificate, CA, or CRL usage is checked or changed |
| `plugin_xmlrpc_send`, `plugin_xmlrpc_recv`, `plugin_xmlrpc_recv_done` | High-availability configuration synchronization sends or receives package settings |
| `plugin_gateway` | A monitored gateway changes status |
| `plugin_periodic` | Periodic maintenance runs |
| `plugin_nginx` | The WebUI web server configuration is generated |
| `plugin_statusoutput` | The diagnostic status report (`/status.php`) is generated |

Packages can also drop scripts into directory hooks: `/usr/local/pkg/pf/` for firewall rule
generation, and `/usr/local/pkg/write_config/` or `/usr/local/pkg/parse_config/` for configuration
events.

## Privileges, shortcuts, widgets, and help

| Integration | Where the package installs it | Effect |
| --- | --- | --- |
| Privileges | `/etc/inc/priv/<name>.priv.inc` | Defines `page-*` privileges whose `match` patterns grant access to the package's pages and make its menu entries visible to non-admin users. |
| Shortcuts | `/usr/local/www/shortcuts/pkg_<name>.inc` | Adds title-bar links to the package's main, status, and log pages and a service start/stop control. |
| Dashboard widgets | `/usr/local/www/widgets/widgets/<name>.widget.php` and `/usr/local/www/widgets/include/<name>.inc` | Makes the widget available on the dashboard. No manifest entry is needed. |
| Context help | `src/etc/inc/freesense-docs.inc` in `freesense` | Maps the package's pages to its documentation guide for **About this Page**. |

A privilege file for the TFTP package grants both its generated settings page and its custom page:

```php
$priv_list['page-services-tftpd'] = array();
$priv_list['page-services-tftpd']['name'] = "WebCfg - Services: tftpd package";
$priv_list['page-services-tftpd']['descr'] = "Allow access to tftpd package GUI";
$priv_list['page-services-tftpd']['match'] = array();
$priv_list['page-services-tftpd']['match'][] = "pkg_edit.php?xml=tftpd.xml*";
$priv_list['page-services-tftpd']['match'][] = "tftp_files.php*";
```

Every page a package adds must be covered by a privilege, or only administrators can reach it.

## Integration checklist

- `info.xml` names the manifest, and the manifest names an existing `include_file`.
- Each menu entry uses a valid section and a URL covered by a privilege `match`.
- Services declare an rc script or start/stop commands and a way to detect running state.
- The resync hook is idempotent and the deinstall hooks stop services and remove generated files.
- The catalog entry lists the same services and points `configure_path`/`status_path` at real pages.
- The package is documented and, if it has a dedicated guide, mapped for context help.
