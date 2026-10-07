# Retail Demo

A premium e-commerce experience built with React, featuring a mega menu, category browsing, product search, a shopping cart, and an AI-powered "Shopping Muse" assistant (Dynamic Yield integration).

## Tech Stack

- React 19 + React Router
- Webpack (build/dev server, see [webpack.config.cjs](webpack.config.cjs))
- Express API server ([api/index.js](api/index.js))
- Dynamic Yield (`dc-delivery-sdk-js`), ContentStack, Firebase, GROQ SDK, Google Analytics, Microsoft Clarity

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy [.env.example](.env.example) to `.env` and fill in the required credentials (DY, ContentStack, Firebase, GROQ, Amplience, etc.)
3. Run the app (client + API server concurrently):
   `npm run dev`

## Scripts

- `npm run dev` – run the API server and the webpack dev server together
- `npm run server` – run only the Express API server
- `npm run client` – run only the webpack dev server
- `npm run build` – production build to `dist/`
- `npm run preview` – serve the production build locally
- `npm run deploy` – build and publish to GitHub Pages

## Documentation

- [CART_API.md](CART_API.md) – cart management API for Shopping Muse integration
- [MUSE_V2_GUIDE.md](MUSE_V2_GUIDE.md) – Shopping Muse V1/V2 configuration
- [EXPOSED_FUNCTIONS.md](EXPOSED_FUNCTIONS.md) – window-exposed functions for external integrations
