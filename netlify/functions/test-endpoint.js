export const handler = async (event) => {
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

  // Log request details
  console.log('Test endpoint called:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    functionDir: process.env.LAMBDA_FUNCTION_NAME || 'unknown'
  });

  try {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Netlify Functions are working!",
        timestamp: new Date().toISOString(),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasIdeogramKey: !!process.env.VITE_IDEOGRAM_API_KEY,
          functionPath: event.path,
          netlifyContext: process.env.CONTEXT || 'unknown',
          functionName: process.env.LAMBDA_FUNCTION_NAME || 'unknown',
          availableEnvVars: Object.keys(process.env)
            .filter(key => !key.toLowerCase().includes('key') && 
                          !key.toLowerCase().includes('secret') && 
                          !key.toLowerCase().includes('token'))
        }
      })
    };
  } catch (error) {
    console.error('Test endpoint error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};