import React from 'react';
import { Book, FileText, BookOpen, Lightbulb } from 'lucide-react';

interface Step1Props {
  onSelect: (source: string) => void;
}

export function Step1({ onSelect }: Step1Props) {
  const sources = [
    { id: 'sermon', icon: FileText, label: 'Use a Sermon' },
    { id: 'bible', icon: BookOpen, label: 'Use a Bible Passage' },
    { id: 'book', icon: Book, label: 'Use a Christian Book' },
    { id: 'topic', icon: Lightbulb, label: 'Use Any Topic' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {sources.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className="flex items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-blue-500"
        >
          <Icon className="w-8 h-8 text-blue-600 mr-4" />
          <span className="text-lg font-medium text-gray-800">{label}</span>
        </button>
      ))}
    </div>
  );
}