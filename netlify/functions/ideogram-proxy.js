import fetch from "node-fetch";

// Helper function for structured logging
const log = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    function: 'ideogram-proxy',
    ...data
  };
  
  // Use appropriate console method based on level
  switch (level) {
    case 'error':
      console.error(JSON.stringify(logEntry));
      break;
    case 'warn':
      console.warn(JSON.stringify(logEntry));
      break;
    default:
      console.log(JSON.stringify(logEntry));
  }
};

export const handler = async (event) => {
  const requestId = event.headers['x-request-id'] || Date.now().toString();
  
  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  // Log request received
  log('info', 'Request received', {
    requestId,
    method: event.httpMethod,
    path: event.path
  });

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    log('info', 'Handling OPTIONS request', { requestId });
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }
  
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    log('warn', 'Invalid HTTP method', { 
      requestId,
      method: event.httpMethod 
    });
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  // Validate API key
  const apiKey = process.env.VITE_IDEOGRAM_API_KEY;
  if (!apiKey) {
    log('error', 'API key missing', { requestId });
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "API key not configured",
        details: "Environment variable VITE_IDEOGRAM_API_KEY is missing"
      })
    };
  }

  try {
    // Parse and validate request body
    let body;
    try {
      body = JSON.parse(event.body);
      log('info', 'Request parsed', {
        requestId,
        prompt: body.prompt?.substring(0, 30) + "...",
        aspect_ratio: body.aspect_ratio,
        num_images: body.num_images
      });
    } catch (parseError) {
      log('error', 'Failed to parse request body', {
        requestId,
        error: parseError.message
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid request body" })
      };
    }

    // Validate required fields
    if (!body.prompt) {
      log('warn', 'Missing prompt', { requestId });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Prompt is required" })
      };
    }

    // Validate aspect ratio
    const validAspectRatios = [
      "ASPECT_1_1",
      "ASPECT_16_9",
      "ASPECT_9_16",
      "ASPECT_16_10",
      "ASPECT_10_16",
      "ASPECT_3_2",
      "ASPECT_2_3",
      "ASPECT_4_3",
      "ASPECT_3_4",
      "ASPECT_1_3",
      "ASPECT_3_1"
    ];
    
    const aspectRatio = body.aspect_ratio || "ASPECT_1_1";
    if (!validAspectRatios.includes(aspectRatio)) {
      log('warn', 'Invalid aspect ratio', {
        requestId,
        received: aspectRatio,
        valid: validAspectRatios
      });
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: "Invalid aspect ratio",
          valid_options: validAspectRatios
        })
      };
    }

    // Prepare request to Ideogram API
    const requestBody = {
      image_request: {
        prompt: body.prompt,
        aspect_ratio: aspectRatio,
        model: "V_2A_TURBO",
        magic_prompt_option: "OFF",
        num_images: body.num_images || 4
      }
    };
    
    log('info', 'Calling Ideogram API', {
      requestId,
      endpoint: 'https://api.ideogram.ai/generate'
    });

    // Make the request to Ideogram API
    const response = await fetch("https://api.ideogram.ai/generate", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
    
    log('info', 'Ideogram API responded', {
      requestId,
      status: response.status,
      statusText: response.statusText
    });

    // Get response data
    let data;
    try {
      const responseText = await response.text();
      data = JSON.parse(responseText);
    } catch (parseError) {
      log('error', 'Failed to parse Ideogram API response', {
        requestId,
        error: parseError.message
      });
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ 
          error: "Failed to parse Ideogram API response",
          details: parseError.message
        })
      };
    }
    
    // Handle API errors
    if (!response.ok) {
      log('error', 'Ideogram API error', {
        requestId,
        status: response.status,
        error: data.error || data.message
      });
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: data.message || data.error || "Unknown API error",
          details: data
        })
      };
    }

    // Validate response data
    if (!data.data || !Array.isArray(data.data)) {
      log('error', 'Invalid response format', {
        requestId,
        received: typeof data.data
      });
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ 
          error: "Invalid response format from Ideogram API",
          details: "Expected data array in response"
        })
      };
    }

    // Transform and validate images
    const images = data.data
      .filter(img => img && typeof img === 'object' && typeof img.url === 'string')
      .map(img => ({
        url: img.url,
        prompt: img.prompt,
        seed: img.seed
      }));

    if (images.length === 0) {
      log('error', 'No valid images in response', { requestId });
      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ 
          error: "No valid images generated",
          details: "Response contained no valid image data"
        })
      };
    }

    log('info', 'Successfully processed images', {
      requestId,
      imageCount: images.length
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ images })
    };
  } catch (error) {
    log('error', 'Unexpected error', {
      requestId,
      error: error.message,
      stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
    });
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
      })
    };
  }
};