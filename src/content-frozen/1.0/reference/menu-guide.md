---
title: WebUI menu reference
description: Navigate FreeSense by operational intent while the full generated menu reference is expanded.
channels: [devel, stable]
last_verified_release: development
---

The WebUI is organized around configuration, status, diagnostics, services, VPN, firewall, and packages. Names may evolve as the Bootstrap 5 modernization continues, so documentation links should prefer the operational destination over a screenshot of a transient navigation layout.

| Intent | Primary area |
| --- | --- |
| Install, update, and manage packages | System and Package Manager |
| Define interfaces, VLANs, gateways, and routes | Interfaces and Routing |
| Create policy and translation | Firewall |
| Configure resolver, DHCP, certificates, and local services | Services |
| Create tunnels and remote access | VPN |
| Review events, logs, traffic, and health | Status and Diagnostics |

Packages add their own Configure and Status paths. The package catalog exposes those paths along with services and capabilities so operators can find an integration without memorizing old menu locations.

A menu item appears only when your account has a privilege for the page it opens, so users with
restricted privileges see a shorter menu than administrators. Package pages are listed
alphabetically inside the section that matches their purpose, such as Services or VPN; there is no
separate packages menu. Contributors can find how entries are defined, ordered, and filtered in the
[WebUI menu system](/developers/webui-menu-system/).

Use **About this Page** or the question-mark icon in the WebUI for the relevant direct guide. See
the [WebUI context-help map](/reference/context-help/) for the edition and topic-selection contract.
