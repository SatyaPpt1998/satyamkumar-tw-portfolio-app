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

  try {
    const body = JSON.parse(event.body);

    const postData = JSON.stringify({
      model:      'claude-sonnet-4-5',
      max_tokens: body.max_tokens || 1000,
      system:     body.system     || '',
      messages:   body.messages   || []
    });

    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.anthropic.com',
        path:     '/v1/messages',
        method:   'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length':    Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          resolve({ status: res.statusCode, body: data });
        });
      });

      req.on('error', (err) => reject(err));
      req.write(postData);
      req.end();
    });

    let parsed;
    try {
      parsed = JSON.parse(result.body);
    } catch (parseErr) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to parse API response: ' + result.body })
      };
    }

    if (result.status !== 200) {
      return {
        statusCode: result.status,
        headers,
        body: JSON.stringify({ error: parsed.error?.message || 'Anthropic API error' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Function error: ' + err.message })
    };
  }
};
