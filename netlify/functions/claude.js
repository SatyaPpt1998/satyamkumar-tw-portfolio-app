// netlify/functions/claude.js
const https = require('https');

exports.handler = async (event) => {

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API key not configured on server' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  const postData = JSON.stringify({
    model:      body.model      || 'claude-haiku-4-5',
    max_tokens: body.max_tokens || 1000,
    system:     body.system     || '',
    messages:   body.messages   || []
  });

  try {
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.anthropic.com',
        path:     '/v1/messages',
        method:   'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Length':    Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body: data }));
      });

      req.on('error', err => reject(err));
      req.write(postData);
      req.end();
    });

    let parsed;
    try {
      parsed = JSON.parse(result.body);
    } catch (e) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Bad response from Anthropic: ' + result.body.substring(0, 100) })
      };
    }

    if (result.status !== 200) {
      return {
        statusCode: result.status,
        headers,
        body: JSON.stringify({ error: parsed.error?.message || JSON.stringify(parsed.error) || 'Anthropic error' })
      };
    }

    return { statusCode: 200, headers, body: JSON.stringify(parsed) };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Request failed: ' + err.message })
    };
  }
};
