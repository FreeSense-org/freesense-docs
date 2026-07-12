# FreeSense Docs

Documentation for [FreeSense](https://freesense.org) — the open-source firewall & router OS.
Live at **[docs.freesense.org](https://docs.freesense.org)**.

Built with [Astro Starlight](https://starlight.astro.build), deployed on **Cloudflare Pages**.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run validate # verifies catalog coverage against ../freesense-src by default
npm run build    # -> dist/
npm run preview
```

## Writing docs

Pages live in `src/content/docs/` as Markdown / MDX. The sidebar is defined in
`astro.config.mjs`. To add a page:

1. Create `src/content/docs/<section>/<page>.md` with frontmatter (`title`, `description`).
2. Add it to the `sidebar` in `astro.config.mjs`.

Package guidance is grouped by capability, but every package published in
`freesense/src/etc/freesense-package-catalog.json` must have an entry in
`src/data/package-coverage.json`. The validation command rejects missing and stale mappings.

## Release-aware documentation

The public channel endpoints are `/devel/`, `/candidate/`, and `/stable/`. They point to the
current documentation contract for each lifecycle tier. Candidate and Stable release notes must
identify the sealed artifact set and link to a frozen documentation snapshot before publication.
See [the documentation policy](src/content/docs/contributors/documentation-policy.md) for the
evidence and review standard.

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
