import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// DY personalization API 
app.post('/api/choose', async (req, res) => {
  try {
    const { bodyData } = req.body
    const dataToSend = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);

    const response = await fetch(
      `https://direct.dy-api.com/v2/serve/user/choose`, 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'dy-api-key': process.env.DY_API_KEY,
          'Content-Length': Buffer.byteLength(dataToSend)
        },
        body: dataToSend
      }
    );

    const responseContentType = response.headers.get("content-type");
    if (response.ok && responseContentType && responseContentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }

  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/suggest', async (req, res) => {
  try {
    const { bodyData } = req.body
    const dataToSend = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);

    const response = await fetch(
      `https://direct.dy-api.com/v2/serve/user/suggest`, 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'dy-api-key': process.env.DY_API_KEY,
          'Content-Length': Buffer.byteLength(dataToSend)
        },
        body: dataToSend
      }
    );

    const responseContentType = response.headers.get("content-type");
    if (response.ok && responseContentType && responseContentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }

  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/search', async (req, res) => {
  try {
    const { bodyData } = req.body
    const dataToSend = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);

    const response = await fetch(
      `https://direct.dy-api.com/v2/serve/user/search`, 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'dy-api-key': process.env.DY_API_KEY,
          'Content-Length': Buffer.byteLength(dataToSend)
        },
        body: dataToSend
      }
    );

    const responseContentType = response.headers.get("content-type");
    if (response.ok && responseContentType && responseContentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }
    
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/csSingleContent', async (req, res) => {
  try {
    const { contentType, entryId } = req.body;

    const response = await fetch(
      `https://cdn.contentstack.io/v3/content_types/${contentType}/entries/${entryId}?environment=production`, 
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8',
          'api_key': process.env.CS_API_KEY,
          'access_token': process.env.CS_ACCESS_TOKEN
        }
      }
    );

    const responseContentType = response.headers.get("content-type");
    if (response.ok && responseContentType && responseContentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }

  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/csMultipleContent', async (req, res) => {
  try {
    const { contentType, entryIdList } = req.body;

    const response = await fetch(
      encodeURI(`https://cdn.contentstack.io/v3/content_types/${contentType}/entries/?environment=production&query={"uid": {"$in" : ["${entryIdList.join('","')}"]}}`), 
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8',
          'api_key': process.env.CS_API_KEY,
          'access_token': process.env.CS_ACCESS_TOKEN
        }
      }
    );

    const responseContentType = response.headers.get("content-type");
    if (response.ok && responseContentType && responseContentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }

  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/profile', async (req, res) => {
  try {
    const { cuid } = req.body;

    const response = await fetch(`https://dy-api.com/v2/userprofile?cuidType=id&cuid=${cuid}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
        'dy-api-key': process.env.PROFILE_ANYWHERE_KEY
      }
    });

    const contentType = response.headers.get("content-type");
    if (response.ok && contentType && contentType.includes("application/json")) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text(); 
      res.status(response.status).send(text || "No content from API");
    }

  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

app.post('/api/engage', async (req, res) => {
  try {
    const { bodyData } = req.body
    const dataToSend = typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData);

    const response = await fetch(
      `https://direct-collect.dy-api.com/v2/collect/user/engagement`, 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'dy-api-key': process.env.DY_API_KEY,
          'Content-Length': Buffer.byteLength(dataToSend)
        },
        body: dataToSend
      }
    );

    if (response.status === 204) {
      // Operation was successful, but there is no body.
      res.status(response.status).send("Engagements reported successfully."); 
    }

  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
})

// Serve the Webpack 'dist' folder (Production)
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all to support React Router
app.get('*', (req, res) => {
  res.status(500).json({ error: "Internal Server Error" });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = 5000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

export default app;