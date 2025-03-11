import React from 'react';

interface Step2Props {
  source: string;
  content: string;
  onChange: (content: string) => void;
}

export function Step2({ source, content, onChange }: Step2Props) {
  const getPlaceholder = () => {
    switch (source) {
      case 'sermon':
        return 'Paste your sermon text or provide a link to the audio file...';
      case 'bible':
        return 'Enter the Bible passage (e.g., John 3:16)...';
      case 'book':
        return 'Enter the book name and author...';
      default:
        return 'Enter your study topic...';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {source === 'sermon' ? 'Sermon Content' :
           source === 'bible' ? 'Bible Passage' :
           source === 'book' ? 'Book Details' :
           'Topic Details'}
        </label>
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}