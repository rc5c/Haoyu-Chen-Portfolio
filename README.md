# Haoyu Chen’s Portfolio

Repository: https://github.com/rc5c/Haoyu-Chen-Portfolio

Source branch: `main`

Expected Pages address after a successful deployment: https://rc5c.github.io/Haoyu-Chen-Portfolio/

Frontend-only React/Vite portfolio. The final source and public deployment belong on GitHub and GitHub Pages, not ChatGPT Sites or Vercel. No CMS, authentication, database, or production server is required.

## Local development

Node.js 22 and npm are used by the deployment workflow.

```sh
npm ci
npm run dev
```

## Production validation

```sh
npm run build
npm test
PAGES_BASE_PATH=/Haoyu-Chen-Portfolio/ npm run build
PAGES_BASE_PATH=/Haoyu-Chen-Portfolio/ npm test
PAGES_BASE_PATH=/Haoyu-Chen-Portfolio/ node scripts/serve-static.mjs
```

The last command serves the built files at `http://localhost:4185/Haoyu-Chen-Portfolio/`, with real static-directory routing and byte-range media responses (no SPA rewrite fallback). It is local QA tooling, not a deployed backend.

## GitHub Pages

The `.github/workflows/pages.yml` workflow runs on pushes to the repository's actual default branch. It builds `dist/`, runs tests, and publishes through GitHub Pages Actions. It does not assume that the default branch is named `main`.

In the repository, select **Settings → Pages → Build and deployment → Source → GitHub Actions**. Then open **Actions → Publish portfolio to GitHub Pages → Run workflow** if needed. If Actions is disabled, a repository administrator must allow it under **Settings → Actions → General**. Do not enable private Pages access or introduce a sign-in requirement.

The workflow reads the base path and origin from `actions/configure-pages`, covering both `/repository/` project sites and root/custom-domain hosting. For local builds, set `PAGES_BASE_PATH` to the intended prefix. `PAGES_ORIGIN` optionally supplies the origin for absolute social-preview URLs. Do not put a URL in `PAGES_BASE_PATH`.

The final repository, actual default branch, Pages enablement, and live URL must be verified on GitHub before they are reported as active. A prepared local workflow alone does not mean publication has succeeded.

## Content and assets

- `src/content/*.json` contains the source-backed projects and Communication fields.
- `public/media/` contains real Gallery and Sound assets.
- `public/projects/` contains complete standalone HTML works with their relative dependencies intact.
- `public/assets/` contains the approved book/interface visuals, not sample project entries.
- Local references in content use root-relative source paths; `src/urls.js` adds the deployment prefix once at runtime. YouTube and other external URLs remain unchanged.
- `scripts/prepare-pages-build.mjs` generates a static entry for every published category/project, plus `404.html` and `.nojekyll`. Direct visits and refreshes work without server rewrites.
- Do not restore design-only sample projects or invent missing contact information, descriptions, roles, or years.

Official setup references: [Vite GitHub Pages guide](https://vite.dev/guide/static-deploy.html#github-pages) and [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
