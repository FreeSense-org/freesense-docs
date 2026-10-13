---
title: OpenVPN Client Export
description: Export ready-to-use client configurations and Windows installers for FreeSense OpenVPN remote access servers.
---

The **OpenVPN Client Export** package adds a **Client Export** tab to the built-in OpenVPN pages.
It builds client configuration files, archives, and Windows installers for users and certificates
of a FreeSense OpenVPN remote access server. In FreeSense 1.1.0 the package is
`FreeSense-pkg-openvpn-client-export` 1.9.10. It installs `openvpn` 2.7.7, the
`openvpn-client-export` installer templates 2.6.17, `zip` and `7-zip`.

Use it after you have a working remote access server under **VPN → OpenVPN → Servers**. It is an
export tool only: it does not create servers, users, or certificates, and it runs no service. For
the server side see [Built-in VPN](/base-os/built-in-vpn/).

## Install

1. Open **System → Package Manager → Available Packages**.
2. Find **OpenVPN Client Export** (package `FreeSense-pkg-openvpn-client-export`) and select
   **Install**.

When it is installed over an older configuration, the installer converts the old
"random local port" option to the newer **Bind mode** setting.

Stable packages are published for amd64 and, starting with [1.1.1](/releases/1.1.1/), arm64. The Windows installers it produces are for Windows
clients, independent of the firewall's architecture.

## Where to find it

**VPN → OpenVPN → Client Export**. The tab sits next to **Servers**, **Clients**,
**Client Specific Overrides** and **Wizards**. The page links to **Edit server** and to
**Status → OpenVPN**.

## First-time setup

1. Make sure a remote access server exists and is enabled: server mode **Remote Access ( SSL/TLS )**,
   **Remote Access ( User Auth )** or **Remote Access ( SSL/TLS + User Auth )**. Without one, the page
   says that there is no enabled remote access OpenVPN server.
2. For certificate-based modes, create a user certificate signed by the same CA as the server. With
   the local user database, add the certificate to the user under **System → User Manager**.
3. Open **VPN → OpenVPN → Client Export** and pick the server under **Remote access server**.
4. Set **Host name resolution** to the address clients should connect to: the interface address, a
   dynamic DNS name, or **Other** with a **Host name**.
5. Review the other options (see the reference below) and select **Save as default** if you want
   them stored for this server.
6. In the **Clients** list, find the user or certificate and select the export type. The browser
   downloads the file.
7. Import the file in the client and test with one non-administrative account before you hand out
   profiles more widely.

## Settings reference

Options are saved per server with **Save as default**.

### Server

| Field | What it does | Default |
| --- | --- | --- |
| **Remote access server** | Server to export clients for. | First remote access server |

### Connection

| Field | What it does | Default |
| --- | --- | --- |
| **Host name resolution** | Address written into the client config: **Interface IP Address**, **Automagic Multi-WAN IPs (port forward targets)**, **Automagic Multi-WAN DDNS Hostnames (port forward targets)**, **Installation hostname**, each configured dynamic DNS host, or **Other**. | Interface IP Address |
| **Host name** | Host name or IP address used with **Other**. | Empty |
| **Verify server CN** | **Automatic - Use verify-x509-name where possible**, or **Do not verify the server CN**. | Automatic |
| **Bind mode** | **Do not bind to the local port**, **Use a random local source port**, or **Bind to the default OpenVPN port**. A client bound to port 1194 cannot run twice at the same time. | Do not bind |
| **Block outside DNS** | Makes Windows 10 and later clients use only the VPN DNS servers while connected. Other clients ignore it. | Off |
| **Legacy client** | Leaves out OpenVPN 2.5 and later settings, for OpenVPN 2.4 clients. | Off |

### Certificate and Windows installer

| Field | What it does | Default |
| --- | --- | --- |
| **Password protect certificate** | Protects the PKCS#12 file, or the key in a Viscosity bundle, with a password. | Off |
| **Certificate password** | The password used for that protection. | Empty |
| **PKCS#12 encryption** | Encryption level of an exported PKCS#12 archive. Older clients may not support the highest level. | High |
| **Microsoft certificate storage** | Uses the Windows certificate store instead of local files. | Off |
| **PKCS#11 certificate storage** | Uses a PKCS#11 device (token, HSM, smart card) instead of local files. | Off |
| **PKCS#11 providers** | Path(s) of the PKCS#11 provider module on the client, separated by spaces. | Empty |
| **PKCS#11 ID** | ID of the object on the PKCS#11 device. | Empty |
| **Silent installer** | Builds a Windows installer for unattended deployment. It must run elevated and is not signed. | Off |

### Proxy

| Field | What it does | Default |
| --- | --- | --- |
| **Use a proxy** | Connects to the server through a proxy. | Off |
| **Proxy type** | **HTTP** or **SOCKS**. | HTTP |
| **Proxy address** / **Proxy port** | Proxy server and port. | Empty |
| **Proxy authentication** | **None**, **Basic** or **NTLM**. | None |
| **Proxy username** / **Proxy password** | Proxy credentials. | Empty |

### Advanced

| Field | What it does | Default |
| --- | --- | --- |
| **Additional configuration options** | Extra lines added to every exported client config, one per line or separated by semicolons. | Empty |

### Export types

| Group | Choices |
| --- | --- |
| **Inline configuration** | Most clients, Android, OpenVPN Connect (iOS/Android) |
| **Bundled configuration** | Archive (zip), Config file only |
| **Windows installer** | 64-bit, 32-bit (OpenVPN 2.6.17) |
| **Legacy Windows installer** | 10/2016/2019, 7/8/8.1/2012r2 (OpenVPN 2.4.12) |
| **Viscosity (macOS and Windows)** | Viscosity bundle, Viscosity inline config |
| **Yealink SIP handsets** | T28, T38G (1), T38G (2) / V83 |
| **Snom SIP handsets** | SNOM |

Only certificates that are signed by the server's CA, are not server certificates, and use a key
type OpenVPN supports are listed.

## Firewall rules and interfaces

The package needs no rules of its own. The OpenVPN server still needs a WAN rule for its port, and
rules on the OpenVPN tab for the client traffic. With an **Automagic Multi-WAN** option, the
exported addresses come from port forwards that point at the server.

## Service, logs, and status

There is no service. Connected clients appear under **Status → OpenVPN**, and connection logs are
under **Status → System Logs → OpenVPN**.

## Upgrade, backup, and removal

- Saved defaults are stored in `config.xml` under `installedpackages/vpn_openvpn_export`. The
  **Certificate password** and **Proxy password** are stored there in plain text if you save them.
- Removing the package removes the tab. The OpenVPN servers, users and certificates belong to the
  base system and are not touched.
- Exported files contain private keys. Deliver them through a secure channel. When a device is lost
  or a user leaves, revoke the certificate (add it to the server's CRL) or disable the user; deleting
  the file is not enough.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| "There is no enabled remote access OpenVPN server" | The server is disabled or in a site-to-site mode. |
| A user or certificate is missing from the list | The certificate is signed by a different CA than the server, does not exist on this firewall, or (local database) is not attached to the user. |
| Client rejects the CA or certificate | Clients built on OpenSSL 3 may refuse old or weak algorithms such as SHA-1, also in the CA. Reissue with current algorithms. |
| "The Fallback Data Encryption Algorithm for the selected server is not compatible with Legacy clients" | Change the server's fallback cipher, or do not use **Legacy client**. |
| "Please specify an IP address or hostname" | **Host name resolution** is **Other** and **Host name** is empty. |
| Windows 7 installer does not run | OpenVPN 2.4.8 and later need Windows 7 or later; use the legacy installer that matches the OS. |

:::note[Changes in FreeSense 1.1]
- The Client Export page was rebuilt in the FreeSense 1.1 WebUI style, with a server summary and a
  searchable client list (`81c7963`). Saved defaults are confirmed with the standard success
  message (`5768939`).
- A call to a redirect helper that was renamed in the System was updated; the old name caused a
  PHP fatal error on export requests (`8312aa4`).
:::
