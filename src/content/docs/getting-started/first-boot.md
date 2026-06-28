---
title: First boot & setup
description: Assign interfaces, reach the web GUI, and secure your new FreeSense install.
---

After installation, FreeSense boots to a console menu and is ready to configure.

## 1. Assign interfaces

On first boot you'll be asked to assign network interfaces. At minimum set:

- **WAN** — the interface connected to your internet uplink (often gets an address via DHCP)
- **LAN** — the interface for your internal network

The console menu (option *Assign Interfaces*) lets you redo this at any time.

## 2. Default LAN address

By default the LAN interface uses:

- **IP:** `192.168.1.1/24`
- **DHCP server:** enabled, handing out addresses to LAN clients

Connect a computer to the LAN interface and you should receive an address automatically.

## 3. Reach the web GUI

Open a browser to the LAN address:

```
https://192.168.1.1
```

You'll get a certificate warning (the appliance uses a self-signed certificate by default) — this is
expected; proceed to the site.

## 4. Log in

Use the default credentials:

- **Username:** `admin`
- **Password:** `pfsense`

:::danger[Change the password immediately]
The default password is public knowledge. Change it right away under
**System → User Manager**, and consider restricting GUI access to the LAN.
:::

## 5. Run the setup wizard

The first login launches a setup wizard to set the hostname, time zone, WAN/LAN addresses, and the
admin password. You can re-run it later from **System → Setup Wizard**.

## Next

- Keep your system current: [Updates & release channels](/guides/updates-and-channels/)
- Add features: [Installing packages](/packages/installing-packages/)
