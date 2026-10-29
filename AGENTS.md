# Project overview

Retail Demo is a React ecommerce demo with catalog browsing, cart synchronization, Dynamic Yield personalization, Shopping Muse, and mock customer flows. Webpack builds the browser SPA from `src/`; Express in `api/` proxies external services and supplies the in-memory cart and WebSocket API. Vercel rewrites browser and API routes in production.

# Tech stack

- Runtime: Node.js `>=24.22.1`; ECMAScript modules.
- Package manager: npm with `package-lock.json`.
- Web: React 19, React Router 7, Webpack 5, Babel.
- UI: CSS Modules, global Tailwind-style utility classes and tokens from `src/index.css`, Motion, Lucide React, Embla.
- State: React Context, hooks, `localStorage`, and `sessionStorage`.
- Server: Express and `ws` WebSocket server.
- Integrations: Dynamic Yield, Contentstack, Firebase, Groq, Google Analytics, Microsoft Clarity, Amplience.
- Deployment: Vercel rewrites; `gh-pages` deploy script.

# Commands

```bash
npm install
npm run dev
npm run server
npm run client
npm run build
npm run preview
npm run deploy
npm run lint
```

`npm run build` is the production validation command. `npm run lint` currently prints a skip message; it does not lint. No test, focused-test, type-check, formatter, code-generation, database, or migration command is defined. Do not run `npm test` based only on documentation; no such package script exists.

# Repository map

- `src/` - browser application entry point, routing, UI, client integrations, and styling.
- `src/pages/` - route-level page composition.
- `src/components/` - reusable UI and feature components.
- `src/context/` - application state providers, including cart, auth, currency, Muse, session, wishlist, and content.
- `src/services/` - client-side service wrappers for APIs and external integrations.
- `src/hooks/` - reusable React hooks, including cart WebSocket synchronization.
- `src/helpers/` and `src/lib/` - shared browser helpers and integration utilities.
- `api/index.js` - Express routes, external-service proxies, in-memory carts, and WebSocket subscriptions.
- `public/` - static browser assets and the Firebase service worker.
- `res/` - catalog feed, media, and Muse configuration content.
- `exports/` - exported standalone HTML assets.
- `CART_API.md`, `EXPOSED_FUNCTIONS.md`, and `MUSE_V2_GUIDE.md` - external cart, browser-global, and Muse contracts.
- `webpack.config.cjs` - client bundle, development proxy, assets, and environment injection.
- `vercel.json` - production API and SPA rewrites.

# Architecture

Dependency direction: route pages and components -> contexts, hooks, services, helpers -> browser APIs or `/api/*`; `/api/*` -> external services or in-memory cart state.

- Route definitions and provider composition live in `src/App.jsx`; browser bootstrap happens in `src/main.jsx`.
- Pages compose components. Put reusable UI in `src/components/`; keep one-page behavior inside its page directory unless another consumer needs it.
- Context providers own shared browser state. Cart state owns `retail_cart` and `retail_cart_id` storage and synchronizes with the cart API and WebSocket hook.
- Client service modules call same-origin `/api/*` proxy routes for Dynamic Yield, Muse, and related server-backed integrations.
- `api/index.js` owns external credentials, upstream proxying, cart request validation, and cart synchronization. Cart data is process-memory only; it is not persistent.

Browser code MUST NOT call credentialed external services directly. Browser code MUST NOT import server-only code from `api/`. API routes MUST preserve input checks and upstream error-status forwarding. UI changes to carts, Muse, or exposed globals MUST keep the documented contracts synchronized with `CART_API.md`, `EXPOSED_FUNCTIONS.md`, or `MUSE_V2_GUIDE.md` when the contract changes.

# Web application rules

## Components

- Use PascalCase component directories and files, matching existing `ComponentName/ComponentName.jsx` and optional `ComponentName.module.css` structure.
- Reuse a component from `src/components/` before creating an equivalent one.
- Keep page composition in `src/pages/`. Keep shared state in the existing Context provider that owns it.
- Preserve the provider order in `src/App.jsx` unless the task needs a dependency change.
- Preserve global functions exposed on `window` in `src/App.jsx` and their documented behavior.

## State and data

- Use component state for local UI state. Use existing React Context for shared cart, auth, currency, content, Muse, session, or wishlist state.
- Use URL parameters for route and search/filter state where existing pages do so. Use `localStorage` and `sessionStorage` only through existing ownership patterns.
- Use existing service modules and same-origin `/api/*` calls. Do not create a second HTTP client layer.
- Preserve loading and error behavior around network requests. Do not duplicate Dynamic Yield calls when the existing service already serves the need.
- Cart changes MUST preserve complete-cart `PUT /api/carts/:id` semantics and avoid client/server/WebSocket synchronization loops.

## APIs

- Add or change Express routes only in `api/index.js` unless the repository gains a dedicated API module structure.
- Validate request bodies before use. Keep upstream non-success statuses visible to callers.
- Preserve the cart API request and response shapes in `CART_API.md`.
- Treat browser-global functions in `EXPOSED_FUNCTIONS.md` as public integrations. Update the document with intentional signature or behavior changes.

## Styling and accessibility

- Use `src/index.css` tokens and existing CSS Modules or utility-class conventions. Do not add a new styling framework.
- CSS Modules SHOULD use native CSS nesting for pseudo-classes, states, and component media queries. Keep variables on the top-level selector when needed.
- Preserve responsive behavior at existing breakpoints.
- Use semantic HTML. Interactive controls MUST support keyboard use, have accessible names, and retain visible focus. Use ARIA only when native semantics cannot express the behavior.

# Dependency rules

Before adding a package, MUST check `package.json` and platform APIs for an existing solution. MUST use npm and update `package-lock.json` with dependency changes. MUST NOT replace established libraries or add a large dependency for trivial work without an explicit task.

# Code conventions

- Use JavaScript or JSX; no TypeScript configuration exists.
- Use the `@` alias only as configured by `webpack.config.cjs`; relative imports are also established.
- Follow the nearby module export pattern. Do not reformat unrelated files.
- Preserve existing async error handling when modifying service or API calls.
- Production code SHOULD use the existing scoped `console` conventions only where operational output is already needed; MUST NOT log passwords, tokens, API keys, or personal data.
- `authService` is a demo mock. Do not treat it as production authentication without an explicit task.

# Testing and validation

Behavior changes SHOULD add a focused automated test when test tooling is introduced or already present in the changed area. Do not weaken tests to pass a change.

No automated test runner, accessibility test runner, type checker, or formatter configuration is present. For every code change, MUST run `npm run build`; for browser or API behavior, SHOULD also manually exercise the affected path with `npm run dev`. Report any skipped validation.

# Performance

SHOULD avoid duplicate network requests, unnecessary shared-state updates, and unnecessary browser JavaScript. Preserve existing lazy-loading, caching, and synchronization safeguards. Do not add speculative optimization without evidence.

# Error handling and observability

The repository uses `console` logging and error responses; no separate logging, metrics, tracing, or error-reporting system is configured. API changes MUST return meaningful non-success responses and MUST NOT expose secrets or sensitive input in logs or JSON errors.

# Generated files

No generated source directory or regeneration command is identified. `dist/` is Webpack build output and MUST NOT be edited manually; regenerate it with `npm run build`.

# Database and migrations

No database, ORM, schema, migration directory, or migration command is identified. Cart data in `api/index.js` is in memory. MUST NOT introduce destructive data operations without explicit user approval.

# Security and environment variables

- Never commit `.env`, `.dev.vars`, credentials, tokens, or real secrets. Use `.env.example` for new documented variable names without values.
- `api/index.js` MUST own server credentials such as Dynamic Yield, Contentstack, Groq, and object-detection keys. Browser files under `src/` MUST NOT reference server-only secrets.
- Webpack loads environment values for browser builds. Treat every value referenced in `src/` as client-exposed.
- Preserve validation and authorization-related behavior in cart and API routes. Never disable checks to make a request or test pass.
- Treat all request, upstream, browser-global, and uploaded data as untrusted.
- Never modify production data or run destructive production operations unless the user explicitly requests it.

# Git and change safety

MUST inspect `git diff` and `git status --short` before finishing. MUST preserve user changes and keep edits scoped. MUST NOT use `git reset --hard`, force-push, rewrite history, or delete unrelated files unless explicitly instructed.

# PR expectations

Report commands actually run and their outcome. Report skipped checks. UI changes SHOULD include manual verification notes. Contract changes MUST identify updated API or browser-global documentation. Deployment changes MUST mention Vercel or GitHub Pages impact.

# Definition of Done

1. Implement requested behavior through existing architecture.
2. Update relevant public contracts and documentation.
3. Run `npm run build` successfully, unless blocked; state the block.
4. Manually verify affected user-visible or API behavior when practical.
5. Confirm no secrets, debug artifacts, generated-output edits, or unrelated changes entered the diff.
6. Report remaining limitations and skipped validation.

# Agent behavior

Before editing, read this file, inspect the target implementation and nearby patterns, inspect nearby tests when they exist, and plan the smallest change. While editing, reuse existing abstractions, preserve backwards compatibility unless the task changes it, and fix root causes without unrelated refactoring. Before finishing, review the diff, run focused checks before broader checks, run `npm run build`, and report only checks actually completed.

# Nested AGENTS.md

No nested `AGENTS.md` is needed now. `src/` and `api/` share root commands, environment setup, and the same externally documented contracts.