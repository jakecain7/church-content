import React, { useState } from 'react';
import { Loader2, FileText, Copy, RefreshCw, PenTool, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';
import OpenAI from 'openai';

interface WritingAssistantProps {
  initialData?: {
    prompt: string;
    content: string;
    type: string;
  };
  onSave?: (data: { prompt: string; content: string; type: string }, title?: string) => void;
}

export function WritingAssistant({ initialData, onSave }: WritingAssistantProps) {
  const [prompt, setPrompt] = useState(initialData?.prompt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [conversation, setConversation] = useState<{role: 'user' | 'assistant', content: string}[]>(
    initialData?.prompt && initialData?.content 
      ? [
          { role: 'user', content: initialData.prompt },
          { role: 'assistant', content: initialData.content }
        ] 
      : []
  );

  const examples = [
    "Generate a short Instagram caption with a scripture about gratitude for Thanksgiving.",
    "Write a thank-you email to volunteers who helped with last weekend's community outreach event.",
    "Write a script for a Sunday morning announcement inviting members to our Christmas Eve candlelight service.",
    "Write a Facebook post promoting this Sunday's sermon on 'Finding Strength in God's Word' (Psalm 119:105). Include a thought-provoking question to encourage engagement.",
    "Write an email to our congregation inviting them to this Sunday's service. The sermon is titled 'Walking by Faith' and focuses on Hebrews 11:1. Include a warm introduction, a brief summary of the topic, and service times.",
    "Write a follow-up email to small group leaders thanking them for leading their groups this week and reminding them to review the next lesson on forgiveness."
  ];

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description for your content');
      return;
    }

    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      toast.error('OpenAI API key is not configured. Please check your environment variables.');
      return;
    }

    // Add user message to conversation immediately
    const userMessage = prompt;
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Clear prompt input after sending
    setPrompt('');
    
    // Add loading message
    setConversation(prev => [...prev, { role: 'assistant', content: '...' }]);
    
    setIsLoading(true);

    try {
      const openai = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      // Get all messages except the loading one
      const messagesForAPI = conversation.concat({ role: 'user', content: userMessage });

      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert Christian writer specializing in church and ministry content. Create content that is biblically sound, engaging, and appropriate for a church context. Always end your responses with "Let me know if you want me to make any changes."`
          },
          ...messagesForAPI.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ]
      });

      const generatedContent = completion.choices[0]?.message?.content || '';
      
      // Replace loading message with actual content
      setConversation(prev => {
        const newConversation = [...prev];
        newConversation[newConversation.length - 1] = { 
          role: 'assistant', 
          content: generatedContent 
        };
        return newConversation;
      });
      
      if (onSave && messagesForAPI.length === 1) {
        onSave({ 
          prompt: userMessage, 
          content: generatedContent,
          type: 'custom'
        }, `Writing: ${userMessage.slice(0, 30)}${userMessage.length > 30 ? '...' : ''}`);
      }
    } catch (error) {
      console.error('Content generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Replace loading message with error
      setConversation(prev => {
        const newConversation = [...prev];
        newConversation[newConversation.length - 1] = { 
          role: 'assistant', 
          content: `I'm sorry, I encountered an error: ${errorMessage}. Please try again.` 
        };
        return newConversation;
      });
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Content copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy content');
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Christian Writing Assistant</h1>
        
        <p className="text-gray-600 mb-6 text-lg">
          Need help with writing? I can generate emails, discussion guides, bulletins, and more in seconds! 
          Just tell me what you need, and I'll craft clear, engaging content to help you communicate effectively with your church.
        </p>
        
        {conversation.length === 0 && (
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
          {conversation.length > 0 && (
            <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto p-2">
              {conversation.map((message, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-4 rounded-lg max-w-[85%]",
                    message.role === 'user' 
                      ? "bg-blue-500 text-white ml-auto" 
                      : message.content === '...' 
                        ? "bg-gray-200 text-gray-500"
                        : "bg-gray-200 text-gray-800 mr-auto"
                  )}
                >
                  {message.content === '...' ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.role === 'assistant' && message.content !== '...' && (
                        <button
                          onClick={() => handleCopy(message.content)}
                          className="absolute top-0 right-0 -mt-2 -mr-2 bg-white p-1 rounded-full shadow-md text-gray-500 hover:text-gray-700"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-2 bg-gray-100 p-3 rounded-lg">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What would you like me to write for you?"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-16"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
                  e.preventDefault();
                  generateContent();
                }
              }}
            />
            <button
              onClick={generateContent}
              disabled={isLoading || !prompt.trim()}
              className="px-4 py-3 h-16 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}