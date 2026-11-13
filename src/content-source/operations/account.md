---
title: Account
description: Your own account in FreeSense 1.2 - the avatar menu, appearance (mode, accent, density, menu layout, language), start page, dashboard updates, sessions and API keys, in the top menu bar and the sidebar.
---

:::caution[Development only]
The account menu and the Account page are part of the Development line (FreeSense 1.2). Stable 1.1 keeps
**System > User Settings**.
:::

Everything that belongs to the user you are signed in as is in one place. It works the same in the
top menu bar and in the sidebar layout.

## The avatar menu

The avatar at the top right shows your initials, your user name and the firewall's host name. It opens:

- **Account settings**: the Account page below.
- **Change password**: User Password Manager (for users the firewall authenticates itself).
- **Command palette** (Ctrl K): search every page and action.
- **Sign out**.

The **palette button** next to it changes how the WebUI looks for you, at once:

| Setting | Choices |
|---|---|
| Mode | Light, Dark, Auto (follows the browser) |
| Accent | Coral, Blue, Teal, Green, Violet, Amber |
| Density | Comfortable, Compact (tighter tables, cards and dashboard) |
| Menu | Top bar, Sidebar |

Mode and Menu reload the page; accent and density change without one.

## The Account page

- **Profile**: display name and email address. Users who sign in through an authentication server
  (LDAP or RADIUS) see a note instead: their profile is managed there.
- **Appearance**: the same choices as the palette button, plus **Language**, the language of the WebUI for
  you only. The system default is set in **System > General Setup**.
- **Preferences**: the **start page** that opens after you sign in (unless you were sent to another page), whether the
  dashboard keeps updating (**Live**) or loads once and waits for **Live**, the page options of earlier versions
  (fixed top navigation, host name in the menu, interface sort order, filter panels, alias pop-ups, page name in the browser tab)
  and **Reset my dashboard**.
- **Security**: change password, your signed-in sessions (sign out any session but the one you use) and
  **Revoke all my API keys**.

## Where it is stored

Name and email are part of the user in the configuration. Appearance, language, start page and the dashboard
default are small per-user files in `/conf/webui`, so changing them does not create configuration revisions and
does not need a filter reload. They are also available to scripts as `GET` and `PUT` on `/api/v1/me/preferences`
and `/api/v1/me/profile`; see the [route reference](/api/reference/).

A user who never chose a mode keeps the light or dark look of the theme set for them in earlier versions.
