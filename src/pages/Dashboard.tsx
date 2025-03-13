import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BibleStudyCreator } from '../modules/bible-study/BibleStudyCreator';
import { ImageCreator } from '../modules/image-creator/ImageCreator';
import { WritingAssistant } from '../modules/writing-assistant/WritingAssistant';
import { BookOpen, Image, PenTool } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

type Tool = 'bible-study' | 'images' | 'writing';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || 'bible-study';
  const [selectedTool, setSelectedTool] = React.useState<Tool>(currentPath as Tool);

  const tools = [
    { id: 'bible-study', name: 'Bible Study Creator', icon: BookOpen },
    { id: 'images', name: 'Image Creator', icon: Image },
    { id: 'writing', name: 'Writing Assistant', icon: PenTool },
  ] as const;

  const handleToolChange = (toolId: Tool) => {
    setSelectedTool(toolId);
    navigate(`/dashboard/${toolId}`);
  };

  const renderTool = () => {
    switch (selectedTool) {
      case 'bible-study':
        return <BibleStudyCreator />;
      case 'images':
        return <ImageCreator />;
      case 'writing':
        return <WritingAssistant />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Church Creator Suite</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">{user?.email}</span>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tool Selection */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolChange(tool.id as Tool)}
                    className={cn(
                      selectedTool === tool.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                      'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm'
                    )}
                  >
                    <Icon className={cn(
                      selectedTool === tool.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-2 h-5 w-5'
                    )} />
                    {tool.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tool Content */}
        <div className="mt-6">
          {renderTool()}
        </div>
      </div>
    </div>
  );
}