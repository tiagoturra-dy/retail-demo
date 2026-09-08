<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Retail Demo

This app builds a React storefront and proxies external API calls through local Node dev routes or a Cloudflare Worker in production.

## Run Locally

Prerequisite: Node.js

1. Install dependencies: `npm install`
2. Populate local env values in `.env`
3. Run the frontend and local API proxy: `npm run dev`

## Deploy To Cloudflare

This repo now targets one Cloudflare Worker that serves the built SPA from `dist/` and handles all `/api/*` routes from `cloudflare/worker.js`.

Full step-by-step guide: [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md)

1. Build the app: `npm run build`
2. Authenticate Wrangler: `npx wrangler login`
3. Set Worker secrets:
   - `npx wrangler secret put DY_API_KEY`
   - `npx wrangler secret put PROFILE_API_KEY`
   - `npx wrangler secret put CS_API_KEY`
   - `npx wrangler secret put CS_ACCESS_TOKEN`
   - `npx wrangler secret put GROQ_API_KEY`
4. Deploy: `npm run cf:deploy`

## Cloudflare Dev

Use `npm run cf:dev` to build the app and run the Worker with the static asset binding from `wrangler.toml`.

Copy `.dev.vars.example` to `.dev.vars` for local Wrangler secrets.

## Notes

- `vercel.json` is now legacy config and not used by the Cloudflare path.
- Frontend service calls still use `/api/*`, so no client API URL rewrite was required.
