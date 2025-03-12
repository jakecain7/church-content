import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Download,
  RefreshCw,
  Image as ImageIcon,
  Copy,
  Grid2X2,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { fetchWithCorsProxy } from '../../lib/cors-proxy';

interface ImageCreatorProps {
  initialData?: {
    prompt: string;
    imageUrl?: string;
    aspectRatio?: string;
    allImages?: string[];
  };
  onSave?: (
    data: {
      prompt: string;
      imageUrl?: string;
      aspectRatio?: string;
      allImages?: string[];
    },
    title?: string
  ) => void;
}

export function ImageCreator({ initialData, onSave }: ImageCreatorProps) {
  const [prompt, setPrompt] = useState(initialData?.prompt || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [allImages, setAllImages] = useState<string[]>(
    initialData?.allImages || []
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<string>(
    initialData?.aspectRatio || 'ASPECT_1_1'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if API key is available
    const ideogramKey = import.meta.env.VITE_IDEOGRAM_API_KEY;
    if (!ideogramKey) {
      setError(
        'Ideogram API key is not configured. Please check your environment variables.'
      );
      console.warn('Ideogram API key is not configured');
    }
  }, []);

  const examples = [
    "Design a youth group event flyer with a fun, energetic vibe, featuring neon colors and bold text saying 'Join Us for Youth Night!'",
    "Create a black and white coloring page of Noah's Ark, with animals boarding the ark in pairs and a rainbow outline in the background.",
    "Generate a minimalist sermon title slide for 'Overcoming Fear with Faith' using soft blues and a calm, hopeful aesthetic.",
    "Create an Instagram post for our Easter service featuring a glowing cross at sunrise with the text 'He is Risen!'",
    "Design a thank-you slide for volunteers with an image of raised hands and the text 'We Appreciate You!' in a celebratory style.",
    "Create a Thanksgiving gratitude-themed image with autumn leaves, a harvest table, and the verse 'Give thanks to the Lord' (Psalm 107:1).",
  ];

  const aspectRatioOptions = [
    {
      value: 'ASPECT_1_1',
      label: 'Square (1:1)',
      description: 'Perfect for social media posts',
      preview: 'w-16 h-16',
    },
    {
      value: 'ASPECT_16_9',
      label: 'Landscape (16:9)',
      description: 'Ideal for presentation slides',
      preview: 'w-16 h-9',
    },
    {
      value: 'ASPECT_9_16',
      label: 'Portrait (9:16)',
      description: 'Great for Instagram stories',
      preview: 'w-9 h-16',
    },
    {
      value: 'ASPECT_16_10',
      label: 'Widescreen (16:10)',
      description: 'Good for desktop wallpapers',
      preview: 'w-16 h-10',
    },
    {
      value: 'ASPECT_10_16',
      label: 'Vertical (10:16)',
      description: 'Perfect for Pinterest',
      preview: 'w-10 h-16',
    },
    {
      value: 'ASPECT_3_2',
      label: 'Landscape (3:2)',
      description: 'Classic photo ratio',
      preview: 'w-15 h-10',
    },
    {
      value: 'ASPECT_2_3',
      label: 'Portrait (2:3)',
      description: 'Vertical photo ratio',
      preview: 'w-10 h-15',
    },
    {
      value: 'ASPECT_4_3',
      label: 'Standard (4:3)',
      description: 'Traditional screen ratio',
      preview: 'w-16 h-12',
    },
    {
      value: 'ASPECT_3_4',
      label: 'Portrait (3:4)',
      description: 'Vertical screen ratio',
      preview: 'w-12 h-16',
    },
    {
      value: 'ASPECT_1_3',
      label: 'Banner (1:3)',
      description: 'Tall vertical banners',
      preview: 'w-8 h-24',
    },
    {
      value: 'ASPECT_3_1',
      label: 'Banner (3:1)',
      description: 'Wide horizontal banners',
      preview: 'w-24 h-8',
    },
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

    const apiKey = import.meta.env.VITE_IDEOGRAM_API_KEY;
    if (!apiKey) {
      toast.error('API key is not configured');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAllImages([]);
    const toastId = toast.loading('Generating your images...');

    try {
      // Make request to Ideogram API through CORS proxy
      const response = await fetch('/api/ideogram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': apiKey,
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio: aspectRatio,
          model: 'V_2A_TURBO',
          magic_prompt_option: 'ON',
          num_images: 4,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            errorData.message ||
            `API error: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.images || !Array.isArray(data.images)) {
        throw new Error('Invalid response format from API');
      }

      const images = data.images.map((img: { url: string }) => img.url);

      if (images.length === 0) {
        throw new Error('No images were generated');
      }

      setAllImages(images);
      setImageUrl(images[0]);
      setSelectedImageIndex(0);

      if (onSave) {
        onSave(
          {
            prompt,
            imageUrl: images[0],
            aspectRatio,
            allImages: images,
          },
          `Image: ${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}`
        );
      }

      toast.success('Images generated successfully!', { id: toastId });
    } catch (error) {
      console.error('Image generation error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(`Failed to generate images: ${errorMessage}`, {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `church-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download image');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Create Church Images
        </h1>

        <p className="text-gray-600 mb-6 text-lg">
          Need eye-catching visuals? Create sermon series graphics, event
          graphics, coloring pages for kids ministry, and social media visuals
          that reflect your message beautifully. Just describe what you need,
          and we'll generate stunning church-friendly designs!
        </p>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {allImages.length === 0 && !error && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-700 mb-3">
              Try one of these examples:
            </h2>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {aspectRatioOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAspectRatio(option.value)}
                  className={cn(
                    'flex flex-col items-center p-3 rounded-lg border transition-all',
                    aspectRatio === option.value
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  )}
                >
                  <div
                    className={cn(
                      'bg-gray-200 mb-2 rounded flex items-center justify-center',
                      option.preview
                    )}
                  >
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="font-medium text-sm text-gray-900">
                    {option.label}
                  </span>
                  <span className="text-xs text-gray-500 text-center mt-1">
                    {option.description}
                  </span>
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

      {allImages.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Generated Images
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(imageUrl)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={generateImage}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                />
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
                  'p-1 rounded-lg border-2 transition-all',
                  selectedImageIndex === index
                    ? 'border-blue-500'
                    : 'border-transparent hover:border-blue-300'
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