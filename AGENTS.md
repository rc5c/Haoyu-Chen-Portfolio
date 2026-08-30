# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. The user has replaced Sites hosting with GitHub Pages. The confirmed GitHub source of truth is `rc5c/Haoyu-Chen-Portfolio`, default branch `main`. Do not deploy to ChatGPT Sites or Vercel. Build a frontend-only static `dist/`, with no worker, editing API, authentication, or server runtime. Keep GitHub Pages public; do not change repository visibility without explicit authorization.

Use the shared base-path helpers for all app navigation and public content assets. Test both `/` and a repository subpath such as `/portfolio/`. Preserve relative dependencies inside each standalone website project. Generate static entry documents for each published category/project so refreshed deep links work without SPA server rewrites. Run production build and tests before pushing or deploying.

## Prototype source of truth

- Design specification: `PORTFOLIO_REDESIGN_PROMPT.md` supplied by the user on 2026-08-28.
- Engineering specification: `PORTFOLIO_ENGINEERING_GUIDE.md` supplied by the user on 2026-08-28.
- Preserve the exact user-facing navigation labels `HOME`, `GALLERY`, `SOUND`, `VIDEO`, `WEBSITE`, and `COMMUNICATION`.
- The first visit must begin with only the closed white book; internal HOME navigation should return directly to the open-book hub after the first visit.
- Keep the visual language quiet, editorial, tactile, light-toned, and restrained.
- Use one centralized project data model and shared category/project templates.
- Keep editable portfolio copy and project metadata in `src/content/*.json`; public pages must render from those shared files.
- Editor Mode has been removed at the user's request. Do not reintroduce an editor, write API, CMS, or content backend. Future changes belong in the frontend and `src/content/*.json` files; preserve every non-editor area and its existing functionality.
- Homepage motion should remain subtle: transform/opacity-first breathing, shadow drift, bookmark shimmer, hover lift, and the SVG stroke handwriting sequence before the book opens.
- Initial landing hint is required: after 2 seconds once the cover is ready, show a large RED downward arrow centered ABOVE the book. It bobs downward twice, then reveals clear Click Me / Tap Me text above it. Only book activation cancels it, not background pointer motion. Remove and stop it immediately during writing/opening; never replay it on the open HOME hub. Reduced motion still shows a static faded-in hint.
- Gallery detail artwork and fullscreen images must use contain behavior, preserve the entire original image, and keep controls outside the artwork. Fullscreen supports series navigation, Escape, focus containment, touch-friendly controls, and background-scroll locking.
- Sound controls must operate real supplied audio with seeking while playing or paused and actual elapsed/duration display. Do not restore fake waveform screenshots, simulated oscillators, or simulated video playback.
- Keep only source-backed projects and metadata. The supplied package has no Communication biography/contact/CV material; those fields stay empty until confirmed. Do not invent academic identity, contact URLs, years, descriptions, or authorship roles.
