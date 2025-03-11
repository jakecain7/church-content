import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API proxy endpoint for Ideogram
app.post('/ideogram', async (req, res) => {
  try {
    const apiKey = process.env.VITE_IDEOGRAM_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Ideogram API key not configured on the server' 
      });
    }
    
    const requestData = req.body.image_request || req.body;
    
    console.log('Proxying request to Ideogram API:', {
      prompt: requestData.prompt,
      aspect_ratio: requestData.aspect_ratio,
      number_of_images: requestData.num_images || 4
    });
    
    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      const response = await fetch('https://api.ideogram.ai/generate', {
        method: 'POST',
        headers: {
          'Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_request: {
            prompt: requestData.prompt,
            aspect_ratio: requestData.aspect_ratio,
            model: "V_2A_TURBO",
            magic_prompt_option: "ON",
            num_images: requestData.num_images || 4
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Log response details for debugging
      console.log('Ideogram API response status:', response.status);
      console.log('Ideogram API response headers:', Object.fromEntries([...response.headers.entries()]));
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Ideogram API returned non-JSON response:', contentType);
        return res.status(500).json({ 
          error: 'Ideogram API returned non-JSON response',
          contentType: contentType
        });
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Ideogram API error:', data);
        return res.status(response.status).json(data);
      }
      
      console.log('Ideogram API response successful');
      return res.json({
        images: data.data?.map(img => ({
          url: img.url,
          prompt: img.prompt,
          seed: img.seed
        })) || []
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle abort errors specifically
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({
          error: 'Request to Ideogram API timed out',
          message: 'The request took too long to complete'
        });
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error('Server proxy error:', error);
    
    return res.status(500).json({ 
      error: 'Failed to proxy request to Ideogram API',
      message: error.message
    });
  }
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: {
      hasIdeogramKey: !!process.env.VITE_IDEOGRAM_API_KEY
    }
  });
});

// Export the serverless function
export const handler = serverless(app);