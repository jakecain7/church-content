export const handler = async () => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ 
      message: "Test function works!",
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasIdeogramKey: !!process.env.VITE_IDEOGRAM_API_KEY,
        apiKeyPrefix: process.env.VITE_IDEOGRAM_API_KEY ? process.env.VITE_IDEOGRAM_API_KEY.substring(0, 5) + '...' : null,
        envVars: Object.keys(process.env).filter(key => key.startsWith('VITE_')),
      }
    })
  };
};