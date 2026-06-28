# FreeSense Docs

Documentation for [FreeSense](https://freesense.org) — the open-source firewall & router OS.
Live at **[docs.freesense.org](https://docs.freesense.org)**.

Built with [Astro Starlight](https://starlight.astro.build), deployed on **Cloudflare Pages**.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # -> dist/
npm run preview
```

## Writing docs

Pages live in `src/content/docs/` as Markdown / MDX. The sidebar is defined in
`astro.config.mjs`. To add a page:

1. Create `src/content/docs/<section>/<page>.md` with frontmatter (`title`, `description`).
2. Add it to the `sidebar` in `astro.config.mjs`.

## Deploy

Pushes to `main` auto-deploy via `.github/workflows/deploy.yml` (Cloudflare Pages project
`freesense-docs`). Requires repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## Roadmap

- **Versioned docs** — per-release documentation (e.g. via `starlight-versions`) once releases
  stabilize.
- **Generated package reference** — auto-build package pages from the `freesense-ports` overlay.
- **In-product help** — map GUI help links to stable `docs.freesense.org/...` URLs.

## License

Apache-2.0. FreeSense is an independent open-source derivative of pfSense® CE; not affiliated with
Netgate.
