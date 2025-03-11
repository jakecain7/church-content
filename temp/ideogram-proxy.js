import fetch from "node-fetch";

export const handler = async (event) => {
  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
  
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const apiKey = process.env.VITE_IDEOGRAM_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "API key not configured" })
    };
  }

  try {
    const body = JSON.parse(event.body);
    
    console.log("Processing request with prompt:", body.prompt?.substring(0, 30) + "...");
    
    // Make the request to Ideogram API with the correct format
    const response = await fetch("https://api.ideogram.ai/generate", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        image_request: {
          prompt: body.prompt,
          aspect_ratio: body.aspect_ratio || "ASPECT_1_1",
          model: "V_2A_TURBO",
          magic_prompt_option": "ON",
          num_images: body.num_images || 4
        }
      })
    });
    
    console.log("Ideogram API response status:", response.status);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Ideogram API error:", data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: data.message || data.error || "Unknown error",
          details: data
        })
      };
    }
    
    console.log("Ideogram API response successful");
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("Error processing request:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || "Unknown error",
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined
      })
    };
  }
};
