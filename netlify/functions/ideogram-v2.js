import fetch from "node-fetch";

export const handler = async (event, context) => {
  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }
  
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const apiKey = process.env.VITE_IDEOGRAM_API_KEY;
    
    console.log('API Key available:', !!apiKey);
    
    if (!apiKey) {
      return { 
        statusCode: 500, 
        headers,
        body: JSON.stringify({ 
          error: 'API key not configured',
          env: {
            hasKey: !!apiKey,
            envVars: Object.keys(process.env).filter(key => key.startsWith('VITE_'))
          }
        })
      };
    }
    
    const requestData = body.image_request || body;
    
    console.log('Processing request for prompt:', requestData.prompt?.substring(0, 30) + '...');
    
    const response = await fetch('https://api.ideogram.ai/generate', {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_request: {
          prompt: requestData.prompt,
          aspect_ratio: requestData.aspect_ratio || "ASPECT_1_1",
          model: "V_2A_TURBO",
          magic_prompt_option: "ON",
          num_images: requestData.num_images || 4
        }
      })
    });
    
    console.log('Ideogram API response status:', response.status);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Ideogram API error:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: data.error || 'Unknown error',
          details: data
        })
      };
    }
    
    console.log('Ideogram API response successful');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        images: data.data?.map(img => ({
          url: img.url,
          prompt: img.prompt,
          seed: img.seed
        })) || []
      })
    };
  } catch (error) {
    console.error('Ideogram function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Unknown error',
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      })
    };
  }
};