---
title: Add a firewall to a Fleet
description: Join a FreeSense firewall to a Fleet controller with a guided invitation - the Add a firewall guide on the controller, the Add to fleet guide on the new firewall, Tailscale, approval and the console route.
---

A firewall joins a [FreeSense Fleet](/configure/fleet/) in two steps: the controller makes an
**invitation**, and the new firewall pastes it into **Add to fleet**. The invitation says how the
firewall will connect (Fleet tunnel, Tailscale or direct), so there is nothing else to configure
on the new firewall. Both sides are step-by-step guides, and the console route stays available.

:::caution[Development only]
Fleet is part of the Development line (FreeSense 1.2). See [FreeSense Fleet](/configure/fleet/).
:::

## Before you start

- The controller is running and has at least one connection point. See
  [Fleet connection points and firewall rules](/configure/fleet-connect/).
- The new firewall runs FreeSense 1.2 (Development) and can reach the controller. With the
  **Tailscale** method it only needs internet access; no port has to be opened.
- You can sign in to the WebUI of both firewalls.

## Step 1: make the invitation on the controller

Open **Firewalls → Add and approve** and select **Add a firewall**. A guide with four steps opens
in a window.

1. **Name and access.** Enter a **Name** (how the firewall is shown in Fleet), choose **Monitor
   only** (Fleet reads status and backups) or **Managed** (Fleet may also change the
   configuration, for example with templates, users and updates), and optionally a **Group**, a
   **Site** and a **Hostname**. An empty hostname follows the group's naming pattern.
2. **How it connects.** Choose how the new firewall reaches the controller:

   | Method | What happens |
   | --- | --- |
   | **Fleet tunnel (WireGuard)** | The firewall builds an encrypted tunnel to the controller's public address and port. It only connects out. |
   | **Tailscale** | The firewall installs Tailscale if it is missing, joins your tailnet with a one-time key from the invitation and reaches the controller there. No public port is needed. |
   | **Direct** | The controller reaches the firewall on an internal network both share. A tunnel is built as well, as the fallback. |

   A method without a matching **connection point** is greyed out, with a hint about what to add.
   The method that suits the controller best is marked **Recommended**: Tailscale when the
   controller is in a tailnet, otherwise the Fleet tunnel.
3. **Validity.** Choose how long the invitation works (1 hour to 30 days). For the Fleet tunnel
   and Direct you can also enter **Its public address**: the enrollment port accepts that address
   until the invitation expires, even when **Settings → Access** allows only a list.
4. **Review.** Nothing is made until you select **Create invitation**.

![The invitation guide on the controller: how the new firewall connects](__ASSET_ROOT__/screenshots/packages/fleet-invite-guide.png)

The last step shows **Copy for the firewall**: one text with the link and the join key. It is
shown **only once**. Copy it and send it to whoever sets up the firewall the way you would send a
password. An invitation works once and only until it expires. Under **Open invitations** you can
**Revoke** it, or select **New key** to withdraw it and make a fresh text with the same settings.

## Step 2: paste it on the new firewall

On the new firewall, open **System → Central Management**. A firewall that is in no fleet shows
**Add to fleet** (and a dismissable notice on its dashboard points there). The guide has these
steps:

1. **Paste.** Paste the whole text. A link alone works too; you then type the key in step 3.
2. **Check.** The firewall asks the controller for its certificate and compares it with the one
   the invitation names. It shows the controller, whether it answers, how it will connect and
   whether the join key came with the invitation. Nothing is changed yet. Over Tailscale the
   firewall can reach the controller only after it is in the tailnet, so that check happens
   during the join.
3. **Join key.** Type the key if it was not in the pasted text. The step is struck through when
   it is not needed.
4. **Review.** It lists what **Join** does: a WireGuard key is made, a 6-digit code is shown,
   and the controller gets access and takes a first backup. If any step fails, everything is
   undone.
5. **Join.** The steps run in the background with live progress. With the Tailscale method this
   includes installing Tailscale and logging in. The key is handed to the join through a file
   that only the administrator can read, and it is deleted before the join starts.
6. **Approve.** A large **6-digit code** appears.
7. **Done.**

![The Add to fleet guide on the new firewall: paste the invitation](__ASSET_ROOT__/screenshots/packages/fleet-guide-paste.png)

![The Check step: the controller answers and its certificate matches](__ASSET_ROOT__/screenshots/packages/fleet-guide-check.png)

![The Review step lists what Join does](__ASSET_ROOT__/screenshots/packages/fleet-guide-review.png)

The **Manual** tab takes the link and the key in separate fields. A firewall that is already in a
fleet shows its membership instead, with **Leave the fleet**.

## Step 3: approve on the controller

On the controller, **Firewalls → Add and approve** lists the firewall under **Waiting for
approval** with the same 6-digit code. Approve it **only when the codes match**; a different code
means someone else is using the invitation. Select **Reject** in that case.

![A firewall waiting for approval with its 6-digit code](__ASSET_ROOT__/screenshots/packages/fleet-approve.png)

After approval the firewall sets up its tunnel, sends its first heartbeat and appears in the
firewall list, in the group you chose. When the method is Tailscale, the controller moves the
connection to the tailnet by itself and keeps the Fleet tunnel as the fallback. For Tailscale
paths, Fleet also turns off the key expiry of that device (**Settings → Access**), so the path
does not drop after the key's usual six months.

## Without the web interface

At the console choose option **17**, or run:

```sh
freesense-join join '<link>'
```

Paste the link and type the join key when asked. The console shows the same steps and the same
6-digit code as the guide, and it installs Tailscale in the same way when the invitation asks for
it. The invitation's last step also lists the link and the key separately under **Without the web
interface**.

## Many firewalls at once

**Firewalls → Deployment Factory** makes seed disks and cloud-init seeds that join by
themselves. Every firewall in a batch also gets a `paste-on-the-firewall.txt` with the same
one-paste text, for an administrator who prefers the guide. It holds the join key: keep it like a
password.

## Leave a fleet

On the firewall, open **System → Central Management** and select **Leave the fleet**, or run
`freesense-join leave`. The firewall keeps its last configuration.

## Related pages

- [FreeSense Fleet](/configure/fleet/)
- [Fleet connection points and firewall rules](/configure/fleet-connect/)
- [Fleet status and known issues](/configure/fleet-status/)
- [Tailscale](/packages/tailscale/)
