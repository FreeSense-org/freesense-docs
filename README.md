# FreeSense Docs

Documentation for [FreeSense](https://freesense.org) — the open-source firewall & router OS.
Live at **[docs.freesense.org](https://docs.freesense.org)**.

Built with [Astro Starlight](https://starlight.astro.build), deployed on **Cloudflare Pages**.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run validate # verifies editions and catalog coverage against ../freesense-src by default
npm run build    # -> dist/
npm run preview
```

## Writing docs

Write shared pages in `src/content-source/` as Markdown / MDX. Navigation lives in
`src/data/navigation.mjs`, which both the sidebar (`astro.config.mjs`) and the edition generator read.
To add a page:

1. Create `src/content-source/<section>/<page>.md` with frontmatter (`title`, `description`).
2. Add it to `navigation` in `src/data/navigation.mjs`. Add `['devel']` as the third element only
   when the page documents something that exists solely on the Development line.

Every package published in `freesense/src/etc/freesense-package-catalog.json` has its own guide
under `packages/`, mapped in `src/data/package-coverage.json`; category pages are hubs that link
to them. The validation command rejects missing and stale mappings.

## Release-aware documentation

The site publishes three editions, described in `src/data/editions.json`:

| Edition | Route | Content |
| --- | --- | --- |
| Stable 1.1 | `/` | The supported, immutable 1.1.x line. |
| Development 1.2 | `/1.2/` | The rolling 1.2 line: experimental and unsupported. |
| 1.0 (frozen) | `/1.0/` | Snapshot of the 1.0.x documentation, no longer maintained. |

These routes match the WebUI help links in `freesense/src/etc/inc/freesense-docs.inc`
(1.0.x → `/1.0`, 1.1.x → `/`, 1.2.x → `/1.2`). Old `/1.1/` and Candidate addresses redirect via
`public/_redirects`. See [the documentation policy](src/content-source/contributors/documentation-policy.md)
for the evidence and review standard.

### Edition authoring

Write common Stable/Development content in `src/content-source/`. Before preview, validation, and
build, `scripts/generate-editions.mjs` creates the Starlight pages under `src/content/docs/`
(Stable root), `src/content/docs/1.2/` (Development), and `src/content/docs/1.0/` (frozen). Do not
edit those generated copies.

When a page differs in Development, add a complete replacement with the same relative path under
`src/content-overrides/devel/`; Stable keeps the shared source. The frozen edition is built only
from `src/content-frozen/1.0/` and never inherits shared-source edits.

When a new Stable train is promoted, snapshot the outgoing Stable edition into
`src/content-frozen/<train>/`, point the `frozen` entry in `editions.json` at it, and run
`npm run sync-editions -- ../freesense-os-base`. Then run
`npm run validate -- <product-catalog> <os-base-checkout>`.

### Checks

```sh
npm run validate -- <freesense>/src/etc/freesense-package-catalog.json <freesense-os-base>
npm run check-versions                 # version wording matches editions.json
npm run api-reference -- <freesense-at-stable-sha> --check   # REST API reference is current
npm run build && npm run check-links   # every internal link resolves
```

FreeSense documentation is original work. Other vendor documentation may be used only as a private
coverage checklist; never copy prose, images, tables, diagrams, branding, or navigation structure.

## Deploy

Pushes to `main` auto-deploy via `.github/workflows/deploy.yml` (Cloudflare Pages project
`freesense-docs`). Requires repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Automation

The documentation quality workflow checks the static build, the live package catalog contract, and
the documentation source policy on every pull request and `main` push. Cloudflare Pages deployment
remains separate in `.github/workflows/deploy.yml`.

## License

Apache-2.0. FreeSense is an independent open-source derivative of pfSense® CE; not affiliated with
Netgate.
