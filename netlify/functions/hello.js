export const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: "Hello from Netlify function",
      timestamp: new Date().toISOString()
    }),
    headers: { 'Content-Type': 'application/json' }
  };
};