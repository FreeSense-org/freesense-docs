---
title: WebUI menu system
description: How the FreeSense 1.1 WebUI builds its grouped top menu and Ctrl+K search, filters items by privilege, merges package entries, and links pages to the documentation.
---

The FreeSense WebUI navigation is assembled on every page load from the base menu definitions plus
the entries that installed packages declare. Each item appears only if the signed-in user may open
the page it links to. This page is for contributors who add WebUI pages or packages. For finding
your way around as an operator, see the [WebUI menu reference](/reference/menu-guide/).

## What the operator sees

The top menu bar, from left to right:

- **Home**: the dashboard. Shown when the user may open `index.php`. There is no separate
  Status → Dashboard item.
- **System**, **Interfaces**, **Firewall**, **Services**, **VPN**, **Status**, **Diagnostics**, and
  **Help**, each with an icon.
- On the right: **Search** (also opened with **Ctrl+K**), the notices bell when there are notices,
  and the logout button.

**System**, **Services**, **Status**, and **Diagnostics** open as grouped panels (a megamenu) with
a filter box. **Interfaces**, **Firewall**, **VPN**, and **Help** open as single-column menus with
the same styling. The menu and item for the current page are highlighted and marked with
`aria-current`. On phones, the collapsed menu bar becomes a scrollable panel that keeps the group
labels and the filter box.

The Help menu's title can show the hostname or FQDN instead of "Help", depending on the user's
WebUI settings.

## Where the menu is defined

The code lives in the [`freesense`](https://github.com/FreeSense-org/freesense) repository:

| File | Role |
| --- | --- |
| `src/usr/local/www/head.inc` | Defines the base items of each menu, merges package entries with `return_ext_menu()`, and renders the menu bar. |
| `src/usr/local/www/includes/fs_menu.inc` | Group definitions, the fallback grouping for package entries, current-page detection, and the renderer `fs_render_nav_menu()`. |
| `src/usr/local/www/js/freesense-ui.js` | The menu filter boxes and the Ctrl+K command palette. |

Each base item is the classic `array(label, url)` pair with an optional `group` key:

```php
$diagnostics_menu[] = array(gettext("Routes"), "/diag_routes.php", 'group' => 'tables');
$diagnostics_menu[] = array(gettext("Packet Capture"), "/diag_packet_capture.php", 'group' => 'tools');

$diagnostics_menu = msort(array_merge($diagnostics_menu, return_ext_menu("Diagnostics")), 0);
```

`return_ext_menu()` and `output_menu()` are kept in `head.inc` for compatibility with code that
still calls them.

## Groups

Items never move to a different top-level menu; groups only arrange them inside a grouped panel.
Groups appear in this order:

| Menu | Group keys (label) |
| --- | --- |
| System | `general` (General), `access` (Access), `network` (Network), `other` (Other) |
| Services | `network` (Network), `routing` (Routing), `security` (Security), `proxy` (Proxy), `monitoring` (Monitoring), `other` (Other) |
| Status | `overview` (Overview), `network` (Network), `vpn` (VPN), `security` (Security), `traffic` (Traffic), `other` (Other) |
| Diagnostics | `tools` (Network Tools), `tables` (Tables & State), `system` (System), `power` (Power & Reset), `other` (Other) |

Firewall, VPN, Interfaces, and Help have no groups. A `group` value on an entry in those menus is
ignored.

Inside each group, items are sorted alphabetically by label (natural, case-insensitive order).
Empty groups aren't shown. **Logout** stays at the foot of the System panel, outside the groups.

### Placing package entries

A package chooses its group with a `<group>` element in its manifest's `<menu>` block. If an entry
has no `<group>`, or names a group that doesn't exist in that menu, `fs_menu_fallback_group()`
places it by matching its label. For example, a Services entry whose label contains "haproxy" or
"proxy" goes to **Proxy**, and a Status entry containing "wireguard" goes to **VPN**. Anything still
unmatched lands in **Other**, so third-party packages always appear. The fallback rules are kept
only until every package declares its own group. Always set `<group>` in new packages.

## Ordering in single-column menus

- **Firewall**, **VPN**, and **Help**: base and package entries are merged and sorted
  alphabetically by label.
- **Interfaces**: **Assignments** and **NIC Settings** come first, then a divider, then each
  configured interface followed by package entries. The lower block is sorted only when the user
  enables interface sorting in their WebUI settings.
- Some base entries appear only when relevant, for example **Status → Wireless** when a wireless
  interface exists.

Choose a short, distinctive label. It is the menu text, the sort key, and what users type in the
search palette.

## Ctrl+K search

**Ctrl+K** (or **Cmd+K** on macOS), or the **Search** button in the menu bar, opens a command
palette that searches every menu the user can see:

- Each result shows its location as **Menu › Group**, or only the menu name for single-column
  menus. Matching includes the menu and group names as well as the label.
- Label matches rank before other matches.
- **Enter** opens the result through its original link, so **Logout** still sends its POST request
  and Help links still open in a new tab.
- **Home** can be found in the palette like any other page.

Because the palette is built from the rendered menu, a page that isn't in a menu can't be found
there. If users need to reach a page directly, give it a menu entry.

## Privilege filtering

Before an item is rendered, it is checked with `isAllowedPage()` from `src/etc/inc/priv.inc`.
Administrators see everything. Other users see an item only if one of their privileges, granted
directly or through a local, LDAP, or RADIUS group, has a `match` pattern that covers the item's URL.
External `https://` links, such as those in the Help menu, are always shown. A menu with no visible
items isn't rendered.

The same check protects the page itself when it is requested, so hiding a menu item and denying the
page are one rule. Privileges come from two places:

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

`return_ext_menu($section)` in `head.inc` collects package entries for one menu from two sources:

1. **Registered package menus** in `installedpackages/menu` in `config.xml`. The package framework
   writes these from each manifest's `<menu>` elements when the package is installed.
2. **Drop-in menu files**: any `*.xml` file in `/usr/local/share/FreeSense/menu/` that contains
   `<menu>` elements in a `<packagegui>` document. System ports use this, for example **Status →
   Monitoring**.

Parsed package XML is cached under the temporary directory and reused while the source files keep
their size and modification time.

A package declares an entry in its manifest:

```xml
<menu>
	<name>TFTP Server</name>
	<section>Services</section>
	<group>network</group>
	<url>/pkg_edit.php?xml=tftpd.xml</url>
</menu>
```

| Field | Meaning |
| --- | --- |
| `name` | The label shown in the menu and found by search. |
| `section` | The top-level menu: `System`, `Interfaces`, `Firewall`, `Services`, `VPN`, `Status`, `Diagnostics`, or `Help`, exactly as written. Any other value is never displayed. |
| `group` | The group key inside a grouped menu (see [Groups](#groups)). Case-insensitive. Optional, but recommended. |
| `url` | The page to open. `$myurl` is replaced with the host name the browser used, which lets an entry link to another service on the appliance. |
| `configfile` | Used only when `url` is empty; the entry then opens `/pkg.php?xml=<configfile>`. |

A manifest may declare several `<menu>` elements, for example a settings page under **Services**
and a status page under **Status**.

FreeSense records which package owns each generated entry. An entry from `installedpackages/menu` is
shown only while its owning package is still registered and its manifest still declares the same
name, section, and URL. A package that is removed, renamed, or changes its menu never leaves a stale
item behind. Reinstalling the package rebuilds its entries from the current manifest.

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
`display_top_tabs($tab_array)`. Mark the same tab active on generated and custom pages so navigation
stays consistent.

Base pages register their tab sets centrally in `src/usr/local/www/includes/tabs/*.inc`
(`$fs_tab_groups`) and render them with `fs_tabs()`.

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

The Help menu contains **About this Page**, **Bug Database**, **Source Code**, **User Forum**,
**Documentation**, and the **FreeBSD Handbook**, plus any package `Help` entries.

**About this Page** opens the documentation topic for the current screen.
`freesense_docs_url()` in `src/etc/inc/freesense-docs.inc` builds the link from two parts:

- **Topic**: an explicit map for important pages (for example `system_bootenvironments` →
  `/operations/zfs-boot-environments/`, `interfaces_vxlan` →
  `/configure/interfaces-vlans-bridges/#vxlan`), then path patterns by area (for example `diag*` →
  `/operations/diagnostics-and-troubleshooting/`). For generated package pages, the `xml=` value
  identifies the screen, so `tftpd.xml` maps like a page named `tftpd`. Screens without a mapping
  open the [WebUI menu reference](/reference/menu-guide/).
- **Edition**: chosen from the installed version by `freesense_docs_edition_prefix()`.

| Installed version | Edition prefix in 1.1.0 | Edition prefix on `main` (1.2 Development) |
| --- | --- | --- |
| 1.0.x | none (site root) | `/1.0` |
| 1.1.x | `/1.1` | none (site root) |
| 1.2.x | none (site root) | `/1.2` |

FreeSense 1.1.0 was released with the mapping from the period when 1.1 was the Development line, so its help links
point to `docs.freesense.org/1.1/...`. The documentation site redirects `/1.1/*` permanently to the
site root, where the Stable 1.1 documentation now lives, so the links still open the right pages.
The `main` branch, which builds Development 1.2, maps 1.0 to `/1.0`, 1.2 to `/1.2`, and everything
else, including 1.1, to the site root. 1.1.1 is built from the same FreeSense source as 1.1.0, so
it keeps the 1.1.0 mapping; the corrected mapping reaches Stable appliances only in a later 1.1.x
release built from newer source.

<!-- needs verification: whether the corrected mapping (freesense commit 9fb89ee on main) will be
included in a later 1.1.x patch release. -->

The [WebUI context help](/reference/context-help/) page describes the full contract.

## Add a page to the menu

**In the base system**

1. Add the PHP page with a `##|+PRIV` header and regenerate `priv.defs.inc`.
2. Add an `array(gettext("Label"), "/page.php", 'group' => '<key>')` entry to the matching menu
   array in `head.inc`. The `group` key matters only for grouped menus.
3. Add a context-help mapping in `freesense-docs.inc` if the page starts a durable operator
   workflow.

**In a package**

1. Add a `<menu>` element with a valid `section` and, for grouped menus, a `group`.
2. Cover the page URL with a privilege `match` in the package's `.priv.inc` file.
3. Add `<tabs>` and a shortcut file if the feature has several pages or a service.
4. Point the catalog entry's `configure_path` at the same page, so the menu and the Package Manager
   **Configure** action agree.
5. Reinstall the package on a test appliance. Confirm that the entry appears in the intended group
   for an administrator, is found by Ctrl+K, appears for a non-admin user with only the package
   privilege, and is absent without it.
