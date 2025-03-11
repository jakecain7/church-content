import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;

async function createServer() {
  const app = express();
  
  // Basic middleware
  app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://stackblitz.com'],
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  
  // Increase the timeout for the server
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API proxy available at http://localhost:${PORT}/api/ideogram`);
  });
  
  // Set timeout to 2 minutes
  server.timeout = 120000;
  
  // API proxy endpoint for Ideogram
  app.post('/api/ideogram', async (req, res) => {
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
      
      // Set a longer timeout for the fetch request
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
        throw fetchError;
      }
    } catch (error) {
      console.error('Server proxy error:', error);
      
      // Handle abort errors specifically
      if (error.name === 'AbortError') {
        return res.status(504).json({
          error: 'Request to Ideogram API timed out',
          message: 'The request took too long to complete'
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to proxy request to Ideogram API',
        message: error.message
      });
    }
  });
  
  // Add a test endpoint to check if the server is running
  app.get('/api/ideogram', (req, res) => {
    res.json({ status: 'Server is running' });
  });
  
  // Add a health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      env: {
        hasIdeogramKey: !!process.env.VITE_IDEOGRAM_API_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    });
  });
  
  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(join(__dirname, 'dist')));
    
    app.get('*', (req, res) => {
      res.sendFile(join(__dirname, 'dist', 'index.html'));
    });
  }
}

createServer().catch(err => {
  console.error('Failed to start server:', err);
});