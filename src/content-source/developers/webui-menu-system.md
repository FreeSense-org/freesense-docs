---
title: WebUI menu system
description: How the FreeSense WebUI builds its navigation menu, filters it by privilege, and merges package entries.
channels: [devel, stable]
last_verified_release: development
---

The FreeSense WebUI navigation is assembled on every page load from base menu definitions plus
entries declared by installed packages. Each item is shown only if the signed-in user may open the
page it links to. This page is for contributors adding WebUI pages or packages. For finding your way
around as an operator, see the [WebUI menu reference](/reference/menu-guide/).

## Where the menu is defined

The menu is plain PHP in `src/usr/local/www/head.inc` in the
[`freesense`](https://github.com/FreeSense-org/freesense) repository. Each top-level section is an
array of `array(label, url)` pairs:

```php
$diagnostics_menu[] = array(gettext("Routes"), "/diag_routes.php");
$diagnostics_menu[] = array(gettext("Packet Capture"), "/diag_packet_capture.php");

$diagnostics_menu = msort(array_merge($diagnostics_menu, return_ext_menu("Diagnostics")), 0);
```

The top-level sections are fixed, in this order, each with an icon:

| Section | Icon | Package entries allowed |
| --- | --- | --- |
| System | gear | Yes |
| Interfaces | network | Yes |
| Firewall | shield | Yes |
| Services | server | Yes |
| VPN | lock | Yes |
| Status | chart | Yes |
| Diagnostics | stethoscope | Yes |
| Help | question mark | Yes |

There is no separate packages section: a package adds its pages to the section that matches the
operator's intent, such as **Services → TFTP Server** or **VPN → WireGuard**. A section that ends up
with no visible items is not rendered.

## Ordering

Within a section, base and package entries are merged and sorted alphabetically by label, so a
package does not choose its position. A few deliberate exceptions apply:

- **System → Logout** is appended after sorting so it is always last.
- **Interfaces** shows Assignments and NIC Settings first, then a divider, then each configured
  interface followed by package entries. The lower block is sorted only when the user enables
  interface sorting in their WebUI settings.
- Some base entries appear only when relevant, for example **Interfaces → Wireless** when a wireless
  interface exists.

Choose a short, distinctive label: it is both the menu text and its sort key.

## Privilege filtering

Before an item is rendered, `output_menu()` checks it with `isAllowedPage()` from
`src/etc/inc/priv.inc`. Administrators (uid 0) see everything. Other users see an item only if one
of their privileges, directly or through a local, LDAP, or RADIUS group, has a `match` pattern that
covers the item's URL. External `https://` links, such as those in the Help section, are always shown.

The same check protects the page itself when it is requested, so hiding a menu item and denying
the page are a single rule. Privileges come from two places:

- **Base pages** declare a privilege in a comment header, which
  `tools/scripts/generate-privdefs.php` compiles into `priv.defs.inc`:

  ```php
  ##|+PRIV
  ##|*IDENT=page-diagnostics-routingtables
  ##|*NAME=Diagnostics: Routing tables
  ##|*DESCR=Allow access to the 'Diagnostics: Routing tables' page.
  ##|*MATCH=diag_routes.php*
  ##|-PRIV
  ```

- **Packages** install a file in `/etc/inc/priv/` (or `/usr/local/pkg/priv/`) that appends to
  `$priv_list`. All such files are loaded automatically. See
  [package integration](/developers/package-integration/#privileges-shortcuts-widgets-and-help)
  for an example.

A page without a matching privilege works for administrators but is invisible and inaccessible to
everyone else. Add the privilege in the same change as the page.

## How package entries are merged

`return_ext_menu($section)` in `head.inc` collects package entries for one section from two
sources:

1. **Registered package menus** in `installedpackages/menu` in `config.xml`. The package framework
   writes these from each manifest's `<menu>` elements when the package is installed.
2. **Drop-in menu files**: any `*.xml` file in `/usr/local/share/FreeSense/menu/` containing
   `<menu>` elements in a `<packagegui>` document.

A package declares an entry in its manifest:

```xml
<menu>
	<name>TFTP Server</name>
	<section>Services</section>
	<url>/pkg_edit.php?xml=tftpd.xml</url>
</menu>
```

| Field | Meaning |
| --- | --- |
| `name` | The label shown in the menu. |
| `section` | One of `System`, `Interfaces`, `Firewall`, `Services`, `VPN`, `Status`, `Diagnostics`, or `Help`, exactly as written. Any other value is never displayed. |
| `url` | The page to open. `$myurl` is replaced with the host name the browser used, which lets an entry link to another service on the appliance. |
| `configfile` | Used only when `url` is empty; the entry then opens `/pkg.php?xml=<configfile>`. |

A manifest may declare several `<menu>` elements, for example a settings page under **Services** and
a dashboard under **Status**.

FreeSense records which package owns each generated entry. An entry from `installedpackages/menu` is
shown only while its owning package is still registered and its manifest still declares the same
name, section, and URL. A package that is removed, renamed, or changes its menu therefore never
leaves a stale item behind; reinstalling the package rebuilds its entries from the current manifest.

## Tabs and breadcrumbs

Menus lead to a page; tabs move between the pages of one feature. Generated package pages
(`pkg_edit.php` and `pkg.php`) render the manifest's `<tabs>`:

```xml
<tabs>
	<tab><text>Settings</text><url>/pkg_edit.php?xml=tftpd.xml</url><active/></tab>
	<tab><text>Files</text><url>/tftp_files.php</url></tab>
</tabs>
```

Each tab has `text` and either `url` or `xml` (shorthand for `pkg_edit.php?xml=<value>`). `active`
marks the current tab, and `tab_level` creates a second row of tabs. The active tab's text is added
to the page breadcrumb. Custom PHP pages build their own tab array and call
`display_top_tabs($tab_array)`, and should mark the same tab active so navigation stays consistent
across generated and custom pages.

## Title-bar shortcuts

The page title bar can show links to a feature's main, status, and log pages and a service control.
These come from `$shortcuts[<section>]`, loaded from `/usr/local/www/shortcuts/*.inc`:

```php
$shortcuts['tftpd'] = [];
$shortcuts['tftpd']['main'] = '/pkg_edit.php?xml=tftpd.xml';
$shortcuts['tftpd']['service'] = 'tftpd';
```

Generated pages use the manifest file name (`tftpd`) as the shortcut section unless the manifest
sets `<shortcut_section>`. Custom pages set `$shortcut_section` before including `head.inc`.

## Help menu and context help

The Help section contains **About this Page**, the project issue tracker, source, discussions, the
FreeSense documentation, and the FreeBSD Handbook, plus any package `Help` entries.

**About this Page** links to the documentation topic for the current screen.
`freesense_docs_url()` in `src/etc/inc/freesense-docs.inc` chooses the edition from the installed
version (Stable at the site root, Development under `/1.1/`) and the topic from an explicit map or
a path pattern. For generated package pages, the `xml=` value identifies the screen, so `tftpd.xml`
maps like a page named `tftpd`. Screens without a mapping open the
[WebUI menu reference](/reference/menu-guide/). The [WebUI context help](/reference/context-help/)
page describes the full contract.

## Adding a page to the menu

**In the base system**

1. Add the PHP page with a `##|+PRIV` header and regenerate `priv.defs.inc`.
2. Add an `array(gettext("Label"), "/page.php")` entry to the matching section array in `head.inc`.
3. Add a context-help mapping if the page starts a durable operator workflow.

**In a package**

1. Add a `<menu>` element to the package manifest with a valid `section`.
2. Cover the page URL with a privilege `match` in the package's `.priv.inc` file.
3. Add `<tabs>` and a shortcut file if the feature has several pages or a service.
4. Point the catalog entry's `configure_path` at the same page, so the menu and the Package Manager
   **Configure** action agree.
5. Reinstall the package on a test appliance, then confirm the entry appears for an administrator,
   appears for a non-admin user with only the package privilege, and is absent without it.
