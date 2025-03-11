import React, { useState, useEffect } from 'react';
import { Loader2, Download, RefreshCw, Image as ImageIcon, Copy, Grid2X2, AlertTriangle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

interface ImageGeneratorProps {
  initialData?: {
    prompt: string;
    imageUrl: string;
    aspectRatio?: string;
    allImages?: string[];
  };
  onSave?: (data: { prompt: string; imageUrl: string; aspectRatio?: string; allImages?: string[] }, title?: string) => void;
}

export function ImageGenerator({ initialData, onSave }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState(initialData?.prompt || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [allImages, setAllImages] = useState<string[]>(initialData?.allImages || []);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<string>(initialData?.aspectRatio || 'ASPECT_1_1');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [apiKeyAvailable, setApiKeyAvailable] = useState<boolean | null>(null);
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if API key is available on component mount
    const checkApiKey = () => {
      const ideogramKey = import.meta.env.VITE_IDEOGRAM_API_KEY;
      
      setApiKeyAvailable(!!ideogramKey);
      
      if (!ideogramKey) {
        console.error('Ideogram API key is not configured. Please check your environment variables.');
      } else {
        console.log('Ideogram API key is configured:', ideogramKey.substring(0, 5) + '...' + ideogramKey.substring(ideogramKey.length - 5));
      }
    };
    
    // Check if server proxy is available
    const checkServerProxy = async () => {
      try {
        // Simple ping to check if the server is running
        const response = await fetch('/.netlify/functions/api/health', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setServerAvailable(true);
          console.log('Server proxy available:', data);
        } else {
          setServerAvailable(false);
          console.error('Server proxy returned error status:', response.status);
        }
      } catch (error) {
        console.error('Server proxy check failed:', error);
        setServerAvailable(false);
      }
    };
    
    checkApiKey();
    checkServerProxy();
  }, []);

  const examples = [
    "Design a youth group event flyer with a fun, energetic vibe, featuring neon colors and bold text saying 'Join Us for Youth Night!'",
    "Create a black and white coloring page of Noah's Ark, with animals boarding the ark in pairs and a rainbow outline in the background.",
    "Generate a minimalist sermon title slide for 'Overcoming Fear with Faith' using soft blues and a calm, hopeful aesthetic.",
    "Create an Instagram post for our Easter service featuring a glowing cross at sunrise with the text 'He is Risen!'",
    "Design a thank-you slide for volunteers with an image of raised hands and the text 'We Appreciate You!' in a celebratory style.",
    "Create a Thanksgiving gratitude-themed image with autumn leaves, a harvest table, and the verse 'Give thanks to the Lord' (Psalm 107:1)."
  ];

  const aspectRatioOptions = [
    { value: 'ASPECT_1_1', label: 'Square (1:1)', description: 'Perfect for social media posts', preview: 'w-16 h-16' },
    { value: 'ASPECT_16_9', label: 'Landscape (16:9)', description: 'Ideal for presentation slides', preview: 'w-16 h-9' },
    { value: 'ASPECT_9_16', label: 'Portrait (9:16)', description: 'Great for Instagram stories', preview: 'w-9 h-16' },
    { value: 'ASPECT_4_3', label: 'Standard (4:3)', description: 'Works well for printed materials', preview: 'w-16 h-12' },
    { value: 'ASPECT_3_2', label: 'Postcard (3:2)', description: 'Good for flyers and cards', preview: 'w-15 h-10' }
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Prompt copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy prompt');
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your image');
      return;
    }

    const ideogramKey = import.meta.env.VITE_IDEOGRAM_API_KEY;
    
    if (!ideogramKey) {
      const errorMsg = 'Ideogram API key is not configured. Please check your environment variables.';
      toast.error(errorMsg);
      setError(errorMsg);
      setDebugInfo(JSON.stringify({
        error: 'API key not found',
        env: {
          hasIdeogramKey: !!ideogramKey,
          envKeys: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
        }
      }, null, 2));
      return;
    }

    setIsLoading(true);
    setDebugInfo(null);
    setError(null);
    setAllImages([]);
    const toastId = toast.loading('Generating your images...');

    try {
      // Prepare request data
      const requestBody = {
        prompt: prompt,
        aspect_ratio: aspectRatio,
        model: "V_2",
        style_preset: "NONE",
        number_of_images: 4
      };
      
      console.log('Sending request to server proxy...');
      
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      // Make the API call through our Netlify function
      const response = await fetch('/.netlify/functions/api/ideogram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Log the response details for debugging
      const debugData = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers.entries()])
      };
      
      console.log('Server proxy response:', debugData);
      setDebugInfo(JSON.stringify(debugData, null, 2));
      
      // Check if the response is valid JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const errorMsg = `Server returned non-JSON response: ${contentType}`;
        console.error(errorMsg);
        setError(errorMsg);
        toast.error('Failed to generate images: Invalid server response', { id: toastId });
        return;
      }
      
      // Try to parse the response as JSON
      const responseData = await response.json();
      
      // Update debug info with response data
      debugData.data = responseData;
      setDebugInfo(JSON.stringify(debugData, null, 2));

      if (!response.ok) {
        const errorMessage = responseData?.error || responseData?.message || `API error: ${response.status} ${response.statusText}`;
        setError(errorMessage);
        toast.error(`Failed to generate images: ${errorMessage}`, { id: toastId });
        return;
      }
      
      if (!responseData.images || responseData.images.length === 0) {
        const errorMsg = 'No images were generated';
        setError(errorMsg);
        toast.error(errorMsg, { id: toastId });
        return;
      }

      // Extract image URLs from the response
      const generatedImages = responseData.images.map((img: any) => img.url);
      
      setAllImages(generatedImages);
      setImageUrl(generatedImages[0]);
      setSelectedImageIndex(0);
      
      if (onSave) {
        onSave({ 
          prompt, 
          imageUrl: generatedImages[0],
          aspectRatio,
          allImages: generatedImages
        }, `Image: ${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}`);
      }
      
      toast.success('Images generated successfully!', { id: toastId });
    } catch (error) {
      console.error('Image generation error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(`Failed to generate images: ${errorMessage}`, { id: toastId });
      
      // Set debug info to explain the situation
      setDebugInfo(JSON.stringify({
        error: "Image generation process failed",
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null,
        browserInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        }
      }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const selectImage = (index: number) => {
    if (allImages[index]) {
      setImageUrl(allImages[index]);
      setSelectedImageIndex(index);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Church Image Generator</h1>
        
        <p className="text-gray-600 mb-6 text-lg">
          Need eye-catching visuals? I can create sermon series graphics, event graphics, coloring pages for kids ministry, 
          and social media visuals that reflect your message beautifully. Just describe what you need, and I'll generate 
          stunning church-friendly designs!
        </p>
        
        {apiKeyAvailable === false && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">API Key Not Found</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  Ideogram API key is not configured. Please check your environment variables.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {serverAvailable === false && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Server Not Available</h3>
                <p className="mt-1 text-sm text-yellow-700">
                  The Netlify Functions API is not responding. This might be a temporary issue.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {allImages.length === 0 && !error && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-700 mb-3">Try one of these examples:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors shadow-sm"
                >
                  <span className="font-medium text-blue-800">{example}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe the image you want to create
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A serene illustration of Noah's Ark with animals boarding under a rainbow"
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {prompt && (
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600"
                  title="Copy prompt"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose an aspect ratio
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {aspectRatioOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAspectRatio(option.value)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg border transition-all",
                    aspectRatio === option.value
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  )}
                >
                  <div className={cn(
                    "bg-gray-200 mb-2 rounded flex items-center justify-center",
                    option.preview
                  )}>
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="font-medium text-sm text-gray-900">{option.label}</span>
                  <span className="text-xs text-gray-500 text-center mt-1">{option.description}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={generateImage}
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Grid2X2 className="w-4 h-4 mr-2" />
                  Generate Images
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-red-800 mb-2">Image Generation Failed</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <p className="text-sm text-red-600">
                Please try again or check the debug information below for more details.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {debugInfo && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 overflow-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96">
            {debugInfo}
          </pre>
        </div>
      )}
      
      {allImages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Generated Images</h2>
            <div className="flex gap-2">
              <a
                href={imageUrl}
                download="church-image.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
              <button
                onClick={generateImage}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            </div>
          </div>
          
          <div className="flex justify-center bg-gray-100 p-4 rounded-lg mb-4">
            <img 
              src={imageUrl} 
              alt={prompt}
              className="max-w-full rounded-lg shadow-md max-h-[600px] object-contain"
            />
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {allImages.map((img, index) => (
              <button
                key={index}
                onClick={() => selectImage(index)}
                className={cn(
                  "p-1 rounded-lg border-2 transition-all",
                  selectedImageIndex === index
                    ? "border-blue-500"
                    : "border-transparent hover:border-blue-300"
                )}
              >
                <img 
                  src={img} 
                  alt={`Option ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
              </button>
            ))}
          </div>
          
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Prompt used:</h3>
            <p className="text-gray-600 text-sm">{prompt}</p>
          </div>
        </div>
      )}
    </div>
  );
}