---
title: Building optional packages
description: Create, validate, build, and publish a FreeSense optional package port.
channels: [devel, stable]
last_verified_release: development
---

Optional packages are FreeBSD ports that wrap a runtime (for example `tftp-hpa` or `haproxy`)
with the FreeSense WebUI pages, configuration hooks, privileges, and service registration that
make it a managed integration. This page explains where a package lives, how to build it, and how
an accepted change reaches appliances. For what the package does once it is installed, see
[package integration](/developers/package-integration/) and the
[WebUI menu system](/developers/webui-menu-system/).

Contributions target the `main` branches, which feed the rolling **Development 1.1** line. A
package reaches Stable 1.0.x only through a new, explicitly sealed patch release.

## Where package sources live

An optional package touches up to three repositories:

| Repository | What it contributes |
| --- | --- |
| [`freesense-packages`](https://github.com/FreeSense-org/freesense-packages) | The package port (`<category>/FreeSense-pkg-<name>/`), shared package framework (`Mk/bsd.freesense-package.mk`), architecture policy, and CI audits. Also holds plain-named overrides of stock ports that a package needs, such as `net/haproxy`. |
| [`freesense`](https://github.com/FreeSense-org/freesense) | The build list `tools/conf/pfPorts/poudriere_packages`, port options in `tools/conf/pfPorts/make.conf`, and the product catalog `src/etc/freesense-package-catalog.json` that the Package Manager reads. |
| [`freesense-system-ports`](https://github.com/FreeSense-org/freesense-system-ports) | System-only ports, including `sysutils/FreeSense-platform-abi`, which every optional package depends on. Optional package ports never go here. |

System-image ports must not be added to `freesense-packages`; `tools/boundary_audit.py` rejects
them. This boundary is what lets a System-only change ship without rebuilding Optional Packages.

## Anatomy of a package port

Package ports use the `FreeSense-pkg-<name>` naming convention. The part after the prefix is the
package's short name, used by the catalog and by the WebUI. The TFTP server is a compact example:

```text
ftp/FreeSense-pkg-tftpd/
├── Makefile
├── pkg-descr
├── pkg-plist
└── files/
    ├── pkg-install.in
    ├── pkg-deinstall.in
    ├── etc/inc/priv/tftpd.priv.inc          # WebUI privilege definitions
    └── usr/local/
        ├── pkg/tftpd.xml                    # package manifest (menu, service, form, hooks)
        ├── pkg/tftpd.inc                    # PHP hook implementations
        ├── share/FreeSense-pkg-tftpd/info.xml   # registration metadata
        └── www/
            ├── shortcuts/pkg_tftpd.inc      # title-bar shortcuts and service control
            └── tftp_files.php               # custom WebUI page
```

`files/` mirrors the target filesystem, so a file's path under `files/` is where it is installed.

### Makefile

Wrapper ports have no distfile and no build step. They install the files above into the staging
directory and substitute the package version into the manifests:

```make
PORTNAME=	FreeSense-pkg-tftpd
PORTVERSION=	0.1.3
PORTREVISION=	13
CATEGORIES=	ftp
MASTER_SITES=	# empty
DISTFILES=	# empty
EXTRACT_ONLY=	# empty

MAINTAINER=	dev@freesense.org
COMMENT=	FreeSense package for tftp server
LICENSE=	APACHE20

RUN_DEPENDS=	${LOCALBASE}/libexec/in.tftpd:ftp/tftp-hpa

NO_BUILD=	yes
NO_MTREE=	yes

SUB_FILES=	pkg-install pkg-deinstall
SUB_LIST=	PORTNAME=${PORTNAME}

do-extract:
	${MKDIR} ${WRKSRC}

do-install:
	${MKDIR} ${STAGEDIR}${PREFIX}/pkg
	${INSTALL_DATA} -m 0644 ${FILESDIR}${PREFIX}/pkg/tftpd.xml ${STAGEDIR}${PREFIX}/pkg
	# ... remaining files ...
	@${REINPLACE_CMD} -i '' -e "s|%%PKGVERSION%%|${PKGVERSION}|" \
		${STAGEDIR}${PREFIX}/pkg/tftpd.xml \
		${STAGEDIR}${DATADIR}/info.xml

.include <bsd.port.mk>
```

Rules that CI enforces:

- `MAINTAINER` must be an `@freesense.org` address.
- `NO_CHECKSUM=yes` is not allowed.
- Privilege files are listed in `pkg-plist` with their absolute path, for example
  `/etc/inc/priv/tftpd.priv.inc`, followed by `@dir /etc/inc/priv` and `@dir /etc/inc`.
- Do not include `Mk/bsd.freesense-package.mk` yourself; the build injects it (see below).
- Do not reference Netgate infrastructure URLs or commit credential material.

Variant ports can reuse a template directory with `MASTERDIR`, as
`net-mgmt/FreeSense-pkg-zabbix-agent7` does. Template directories are listed in
`policy/catalog-templates.txt` and are not published on their own.

### Install and deinstall scripts

`pkg(8)` runs `files/pkg-install.in` and `files/pkg-deinstall.in`. Both hand control to the
FreeSense package framework rather than doing work themselves:

```sh
#!/bin/sh

if [ "${2}" != "POST-INSTALL" ]; then
	exit 0
fi

${PKG_ROOTDIR}/usr/local/bin/php -f ${PKG_ROOTDIR}/etc/rc.packages %%PORTNAME%% ${2}
```

`/etc/rc.packages` registers or unregisters the package's menus, services, and configuration. The
[package integration](/developers/package-integration/) page describes that lifecycle.

### Platform compatibility binding

Every optional package must declare which release train it was built for, so a 1.0 appliance
cannot install a package built for 1.1. `Mk/bsd.freesense-package.mk` adds:

```make
FREESENSE_PACKAGE_TRAIN?=	0.0
RUN_DEPENDS+=	FreeSense-platform-abi=${FREESENSE_PACKAGE_TRAIN}.0:sysutils/FreeSense-platform-abi
```

The ports-overlay helper (`freesense/tools/ci/freesense-ports-overlay.sh`) inserts the include into
every `FreeSense-pkg-*` Makefile when it assembles the build tree, so a new package cannot forget
it. Official builds set the train from the release policy (for example `1.1`). An ad-hoc build that
does not set `FREESENSE_PACKAGE_TRAIN` falls back to `0.0` and deliberately produces a package that
no real appliance accepts.

## Building locally

Official package builds run in FreeBSD 16 Poudriere jails on the project build runner. A local build
uses the same scripts. You need a FreeBSD 16 build host with Poudriere and checkouts of
`freesense`, `freesense-packages`, and `freesense-system-ports`.

:::note
There is no packaged local-build script yet. The sequence below mirrors the CI stage
`freesense-os-base/scripts/runner/stages/packages.sh`; adjust paths to your host.
:::

1. Place the overlays where the helper expects them, or export their locations:

   ```sh
   export REPO_KIND=packages
   export OVERLAY_DIR=/root/freesense-packages
   export FREESENSE_SYSTEM_OVERLAY_DIR=/root/freesense-system-ports
   ```

2. In the `freesense` checkout, create the build configuration and set the train you are targeting:

   ```sh
   cp build.conf.sample build.conf
   echo 'export FREESENSE_PACKAGE_TRAIN=1.1' >> build.conf
   ```

3. Create the Poudriere jail and ports tree, then assemble the overlay. The overlay merges
   `freesense-system-ports`, then `freesense-packages`, file by file over the pinned upstream
   FreeBSD ports tree:

   ```sh
   ./build.sh --setup-poudriere
   ./build.sh --update-poudriere-ports
   ```

4. Build one package with Poudriere's test mode, which also checks the plist and staging:

   ```sh
   poudriere testport -j FreeSense_main_amd64 -p FreeSense_main -o ftp/FreeSense-pkg-tftpd
   ```

   To build a set the way CI does, list origins in `tools/conf/pfPorts/poudriere_bulk` and run
   `./build.sh --update-pkg-repo`. Setting `FREESENSE_PORT_TESTS=1` adds Poudriere's `-t` test flag.

Jails are named `FreeSense_main_<arch>` (`amd64` or `aarch64`) and the ports tree `FreeSense_main`.
Package origins use `%%PRODUCT_NAME%%` in the build list, which expands to `FreeSense`.

To try the result on a lab appliance, install the package file with `pkg add` on a disposable
Development system and confirm that its menu entries, service, and catalog details appear. Never
side-load a test build onto a production appliance.

## Adding a new package

1. **Create the port** in `freesense-packages/<category>/FreeSense-pkg-<name>/` following the
   anatomy above. If the runtime needs a changed third-party port, add a plain-named override in
   the same repository.
2. **Add it to the build list** in `freesense/tools/conf/pfPorts/poudriere_packages` as
   `<category>/%%PRODUCT_NAME%%-pkg-<name>`. Third-party ports are pulled in as dependencies and
   are never listed as roots. Port options belong in `tools/conf/pfPorts/make.conf`.
3. **Add a catalog entry** keyed by the short name in
   `freesense/src/etc/freesense-package-catalog.json`:

   ```json
   "tftpd": {
     "display_name": "TFTP Server",
     "support": "supported",
     "last_tested_release": "development",
     "category": "Services",
     "resource_profile": "lightweight",
     "capabilities": ["file-service"],
     "configure_path": "/tftp_files.php",
     "services": ["tftpd"]
   }
   ```

   `resource_profile` is `lightweight`, `moderate`, or `intensive`. `configure_path` and
   `status_path` must be absolute WebUI paths that exist in the base system or in a package's
   `files/usr/local/www`. The [catalog](/packages/catalog/) explains how operators see these fields.
4. **Handle architectures.** If the package cannot build on ARM64 yet, add an exclusion to
   `freesense-packages/architecture-policy.json` with the `origin`, a meaningful `reason`, an HTTPS
   `issue` link, and a near-term `review_date`. `tools/validate-architecture-policy.py` rejects
   vague or stale exclusions.
5. **Document it.** Add the package to `src/data/package-coverage.json` in `freesense-docs` and
   cover it in the matching package guide; the documentation validator fails on an uncovered
   catalog entry. If the package has a dedicated guide, add a context-help mapping in
   `freesense/src/etc/inc/freesense-docs.inc`
   (see [WebUI context help](/reference/context-help/)).
6. **Open matching pull requests.** Use the same branch name in `freesense` and
   `freesense-packages`: package CI checks out the `freesense` branch with the same name, falling
   back to `main`, so the catalog and the port are validated together.

## Validation

Run these from the `freesense-packages` checkout before opening a pull request:

```sh
python3 tools/boundary_audit.py
python3 tools/catalog_audit.py --source ../freesense
python3 tools/validate-architecture-policy.py
php -l <each new .php and .inc file>
sh -n files/pkg-install.in files/pkg-deinstall.in
```

`catalog_audit.py` checks that every published `FreeSense-pkg-*` origin exists, is in the build list,
has a complete `supported` catalog entry with real WebUI destinations, and is not a retired wrapper
returning by accident. On `RELENG_*` branches it runs with `--release`, which also forbids any
remaining exclusion.

In the `freesense` checkout, validate the catalog and the package framework:

```sh
python3 -m json.tool src/etc/freesense-package-catalog.json > /dev/null
php tests/PackageCatalogSmokeTest.php
php tests/PackageRegistrationSmokeTest.php
```

The same checks run in GitHub Actions on every pull request (`quality.yml` and
`architecture-policy.yml` in `freesense-packages`, `quality.yml` in `freesense`).

## Versioning

Raise `PORTREVISION` whenever you change a package's files without changing the upstream runtime,
and reset it when `PORTVERSION` changes. Appliances upgrade only to a higher package version, so an
unchanged version means an installed system will not receive your fix. The version is substituted
into `<version>` in the manifest and `info.xml` at staging time; do not hard-code it there.

## From merge to appliance

Optional Packages are planned, built, and signed independently of the System repository:

1. The Development multi-architecture cycle (`freesense-os-base/.github/workflows/development-multiarch.yml`)
   computes an Optional Packages fingerprint for each architecture. It combines the
   `freesense-packages` commit, the package build options in `make.conf`, the architecture policy,
   the package train, the pinned FreeBSD platform, the signing public key, and the build recipe.
2. If the fingerprint is new, the packages stage builds the set in parallel shards against the
   matching System repository, checks that every dependency resolves within the System plus
   Optional set, and signs the repository.
3. The repository is published to an immutable, fingerprint-addressed path under
   `pkg.freesense.org/v1/artifacts/packages/<train>/`. The signed channel manifest then points the
   `devel` channel at the verified System and Optional Packages pair.
4. Appliances on the Development channel see the new version in **System → Package Manager**.

What triggers a rebuild:

| Change | Optional Packages rebuild? |
| --- | --- |
| A commit to `freesense-packages` | Yes |
| `tools/conf/pfPorts/make.conf` in `freesense` | Yes |
| `architecture-policy.json` | Yes |
| The 14-day FreeBSD platform pin advances | Yes |
| Only System code, including `freesense-system-ports` | No; the existing repository is reused |
| Only `poudriere_packages` or the catalog JSON in `freesense` | No; these change the System fingerprint only |

Because the build list and catalog live in `freesense`, adding a package to `poudriere_packages`
does not by itself start an Optional Packages build. Merge the `freesense` change first and the
`freesense-packages` port second, so the port commit produces the new fingerprint that builds it.

Stable is different: a 1.0.x release lock in `freesense-os-base/config/releases/` pins an exact
`packages_sha`, and Stable is published manually from a sealed lock. A package change reaches Stable
only through a new tagged patch release. See the [release process](/guides/release-process/).
