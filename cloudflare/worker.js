import { handleApiRequest } from '../api/router.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname.startsWith('/api/')) {
      return handleApiRequest(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};