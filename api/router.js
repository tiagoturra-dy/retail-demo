const NO_CONTENT_MESSAGE = 'No content from API';

const getEnvValue = (env, key) => {
  if (env?.[key] !== undefined) {
    return env[key];
  }

  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }

  return undefined;
};

const readJsonBody = async (request) => {
  try {
    return await request.json();
  } catch {
    return {};
  }
};

const jsonResponse = (data, status = 200) => Response.json(data, { status });

const textResponse = (body, status = 200, headers = {}) => new Response(body, { status, headers });

const errorResponse = (error) => {
  const message = error instanceof Error ? error.message : String(error);
  return jsonResponse({ error: message }, 500);
};

const relayResponse = async (response, successMessage) => {
  if (successMessage && response.ok) {
    return textResponse(successMessage, 200, { 'content-type': 'text/plain; charset=utf-8' });
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const data = await response.json().catch(() => ({}));
    return jsonResponse(data, response.status);
  }

  const text = await response.text();
  return textResponse(text || NO_CONTENT_MESSAGE, response.status, contentType ? { 'content-type': contentType } : {});
};

const buildJsonPostInit = (apiKey, body) => ({
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
    'dy-api-key': apiKey,
  },
  body,
});

const proxyDyServeRequest = async (path, request, env) => {
  const { bodyData } = await readJsonBody(request);
  const body = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);

  const response = await fetch(`https://direct.dy-api.com/v2/serve/user/${path}`, buildJsonPostInit(getEnvValue(env, 'DY_API_KEY'), body));
  return relayResponse(response);
};

const proxyDyCollectRequest = async (path, request, env, successMessage) => {
  const { bodyData } = await readJsonBody(request);
  const body = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);

  const response = await fetch(`https://direct-collect.dy-api.com/v2/collect/user/${path}`, buildJsonPostInit(getEnvValue(env, 'DY_API_KEY'), body));
  return relayResponse(response, successMessage);
};

const handleSingleContent = async (request, env) => {
  const { contentType, entryId } = await readJsonBody(request);
  const response = await fetch(
    `https://cdn.contentstack.io/v3/content_types/${contentType}/entries/${entryId}?environment=production`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Accept-Charset': 'utf-8',
        api_key: getEnvValue(env, 'CS_API_KEY'),
        access_token: getEnvValue(env, 'CS_ACCESS_TOKEN'),
      },
    }
  );

  return relayResponse(response);
};

const handleMultipleContent = async (request, env) => {
  const { contentType, entryIdList } = await readJsonBody(request);
  const query = encodeURI(
    `https://cdn.contentstack.io/v3/content_types/${contentType}/entries/?environment=production&query={"uid": {"$in" : ["${entryIdList.join('","')}"]}}`
  );

  const response = await fetch(query, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Charset': 'utf-8',
      api_key: getEnvValue(env, 'CS_API_KEY'),
      access_token: getEnvValue(env, 'CS_ACCESS_TOKEN'),
    },
  });

  return relayResponse(response);
};

const handleProfile = async (request, env) => {
  const { cuid } = await readJsonBody(request);
  const response = await fetch(`https://dy-api.com/v2/userprofile?cuidType=id&cuid=${encodeURIComponent(cuid ?? '')}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Charset': 'utf-8',
      'dy-api-key': getEnvValue(env, 'PROFILE_API_KEY'),
    },
  });

  return relayResponse(response);
};

const handleGroq = async (request, env) => {
  try {
    const { messages, model } = await readJsonBody(request);
    const groqModel = model || getEnvValue(env, 'GROQ_MODEL') || 'llama-3.3-70b-versatile';
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getEnvValue(env, 'GROQ_API_KEY')}`,
      },
      body: JSON.stringify({
        messages,
        model: groqModel,
        temperature: 1,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false,
        stop: null,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return jsonResponse({ error: `Groq API failed: ${response.status}`, details: errorBody }, 400);
    }

    return relayResponse(response);
  } catch (error) {
    return jsonResponse({ error: 'Groq request failed', details: error.message }, 400);
  }
};

const handleWebPushOpt = async (request, env, action) => {
  const { dyid, token } = await readJsonBody(request);
  const response = await fetch(`https://direct-collect.dy-api.com/v2/userdata/channels/web-push/${action}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'dy-api-key': getEnvValue(env, 'DY_API_KEY'),
    },
    body: JSON.stringify({
      associatedDevice: { dyid: dyid || '' },
      identifier: { type: 'pushID', value: token },
    }),
  });

  return relayResponse(response);
};

const handlePushClick = async (request, env) => {
  const { tracking } = await readJsonBody(request);
  const response = await fetch('https://direct-collect.dy-api.com/v2/userdata/engagements', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'dy-api-key': getEnvValue(env, 'DY_API_KEY'),
    },
    body: JSON.stringify({
      type: 'PN_CLICK',
      trackingData: {
        rri: tracking?.rri,
        sectionID: tracking?.sectionID,
        reqTs: tracking?.reqTs,
        userID: tracking?.userID,
        version: tracking?.version,
        events: tracking?.events,
      },
    }),
  });

  return relayResponse(response);
};

export const handleApiRequest = async (request, env = {}) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  const { pathname } = new URL(request.url);

  try {
    switch (pathname) {
      case '/api/health':
        return jsonResponse({ ok: true }, 200);
      case '/api/choose':
        return await proxyDyServeRequest('choose', request, env);
      case '/api/suggest':
        return await proxyDyServeRequest('suggest', request, env);
      case '/api/search':
        return await proxyDyServeRequest('search', request, env);
      case '/api/browse':
        return await proxyDyServeRequest('browse', request, env);
      case '/api/csSingleContent':
        return await handleSingleContent(request, env);
      case '/api/csMultipleContent':
        return await handleMultipleContent(request, env);
      case '/api/profile':
        return await handleProfile(request, env);
      case '/api/engage':
        return await proxyDyCollectRequest('engagement', request, env, 'Engagements reported successfully.');
      case '/api/muse':
        return await proxyDyServeRequest('agent-assistant', request, env);
      case '/api/event':
        return await proxyDyCollectRequest('event', request, env, 'Engagements reported successfully.');
      case '/api/groq':
        return await handleGroq(request, env);
      case '/api/webpush/opt-in':
        return await handleWebPushOpt(request, env, 'opt-in');
      case '/api/webpush/opt-out':
        return await handleWebPushOpt(request, env, 'opt-out');
      case '/api/webpush/pn-click':
        return await handlePushClick(request, env);
      default:
        return jsonResponse({ error: 'Not Found' }, 404);
    }
  } catch (error) {
    return errorResponse(error);
  }
};