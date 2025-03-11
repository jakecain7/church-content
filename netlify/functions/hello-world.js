export const handler = async (event) => {
  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Log request details for debugging
  console.log('Hello World function called:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: "Hello from Netlify function!",
      timestamp: new Date().toISOString(),
      path: event.path,
      method: event.httpMethod
    })
  };
};