import React, { useState, useEffect } from 'react';
import { BookOpen, PenTool, Menu, X, ChevronRight, Clock, Image } from 'lucide-react';
import { BibleStudyCreator } from './modules/bible-study/BibleStudyCreator';
import { WritingAssistant } from './modules/writing-assistant/WritingAssistant';
import { ImageCreator } from './modules/image-creator/ImageCreator';
import { cn } from './lib/utils';
import { Toaster } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export type Module = 'study-guides' | 'writing-assistant' | 'create-images';

export interface HistoryItem {
  id: string;
  module: Module;
  title: string;
  createdAt: string;
  content: any;
}

export default function App() {
  const [activeModule, setActiveModule] = useState<Module>('study-guides');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load history from Supabase
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('history')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setHistory(data || []);
      } catch (error) {
        console.error('Error fetching history:', error);
        // Initialize with empty history if we can't fetch
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const addToHistory = async (item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    try {
      // Add to Supabase
      const { error } = await supabase
        .from('history')
        .insert([{
          id: newItem.id,
          module: newItem.module,
          title: newItem.title,
          content: newItem.content,
          created_at: newItem.createdAt,
          user_id: null // Set user_id to null for unauthenticated users
        }]);
      
      if (error) throw error;
      
      // Update local state
      setHistory(prev => [newItem, ...prev]);
      return newItem.id;
    } catch (error) {
      console.error('Error adding to history:', error);
      // Still update local state even if Supabase fails
      setHistory(prev => [newItem, ...prev]);
      return newItem.id;
    }
  };

  const updateHistoryItem = async (id: string, updates: Partial<Omit<HistoryItem, 'id' | 'createdAt'>>) => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('history')
        .update({
          title: updates.title,
          content: updates.content
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setHistory(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
    } catch (error) {
      console.error('Error updating history item:', error);
      // Still update local state even if Supabase fails
      setHistory(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedHistoryItem?.id === id) {
        setSelectedHistoryItem(null);
      }
    } catch (error) {
      console.error('Error deleting history item:', error);
      // Still update local state even if Supabase fails
      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedHistoryItem?.id === id) {
        setSelectedHistoryItem(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const modules = [
    { id: 'study-guides', name: 'Study Guides', icon: BookOpen },
    { id: 'create-images', name: 'Create Images', icon: Image },
    { id: 'writing-assistant', name: 'Writing Assistant', icon: PenTool },
  ];

  const renderModule = () => {
    if (selectedHistoryItem) {
      switch (selectedHistoryItem.module) {
        case 'study-guides':
          return <BibleStudyCreator 
            initialStudy={selectedHistoryItem.content} 
            onSave={(study) => updateHistoryItem(selectedHistoryItem.id, { content: study })}
          />;
        case 'writing-assistant':
          return <WritingAssistant 
            initialData={selectedHistoryItem.content}
            onSave={(data) => updateHistoryItem(selectedHistoryItem.id, { content: data })}
          />;
        case 'create-images':
          return <ImageCreator 
            initialData={selectedHistoryItem.content}
            onSave={(data) => updateHistoryItem(selectedHistoryItem.id, { content: data })}
          />;
        default:
          return null;
      }
    }

    switch (activeModule) {
      case 'study-guides':
        return <BibleStudyCreator 
          onSave={(study, title) => addToHistory({ 
            module: 'study-guides', 
            title: title || 'Untitled Study Guide', 
            content: study 
          })}
        />;
      case 'writing-assistant':
        return <WritingAssistant 
          onSave={(data, title) => addToHistory({ 
            module: 'writing-assistant', 
            title: title || 'Untitled Writing', 
            content: data 
          })}
        />;
      case 'create-images':
        return <ImageCreator 
          onSave={(data, title) => addToHistory({ 
            module: 'create-images', 
            title: title || 'Untitled Image', 
            content: data 
          })}
        />;
      default:
        return null;
    }
  };

  const filteredHistory = history.filter(item => 
    selectedHistoryItem ? true : item.module === activeModule
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:text-gray-900"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:h-screen",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Bible Tools</h1>
            </div>
          </div>

          {/* Modules */}
          <div className="p-4 border-b">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Modules
            </h2>
            <nav className="space-y-1">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => {
                      setActiveModule(module.id as Module);
                      setSelectedHistoryItem(null);
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={cn(
                      "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md",
                      activeModule === module.id && !selectedHistoryItem
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {module.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                History
              </h2>
              <button 
                onClick={() => {
                  setSelectedHistoryItem(null);
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                New
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredHistory.length > 0 ? (
              <ul className="space-y-2">
                {filteredHistory.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setSelectedHistoryItem(item);
                        setActiveModule(item.module);
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 flex items-center justify-between group",
                        selectedHistoryItem?.id === item.id ? "bg-blue-50 text-blue-700" : "text-gray-700"
                      )}
                    >
                      <div className="flex-1 truncate">
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity",
                        selectedHistoryItem?.id === item.id ? "opacity-100 text-blue-600" : "text-gray-400"
                      )} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                No history found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
          {renderModule()}
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}