import React from 'react';

interface Step3Props {
  audience: string;
  theme: string;
  format: 'discussion' | 'teacher';
  onAudienceChange: (value: string) => void;
  onThemeChange: (value: string) => void;
  onFormatChange: (value: 'discussion' | 'teacher') => void;
  isMultiWeek: boolean;
  weekCount: number;
  onMultiWeekChange: (value: boolean) => void;
  onWeekCountChange: (value: number) => void;
}

export function Step3({
  audience,
  theme,
  format,
  onAudienceChange,
  onThemeChange,
  onFormatChange,
  isMultiWeek,
  weekCount,
  onMultiWeekChange,
  onWeekCountChange,
}: Step3Props) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Audience
        </label>
        <input
          type="text"
          value={audience}
          onChange={(e) => onAudienceChange(e.target.value)}
          placeholder="e.g., youth group, women's ministry"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Theme (Optional)
        </label>
        <input
          type="text"
          value={theme}
          onChange={(e) => onThemeChange(e.target.value)}
          placeholder="e.g., prayer, faith, love"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Which is your preferred format?
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => onFormatChange('discussion')}
            className={`px-4 py-2 rounded-lg border ${
              format === 'discussion'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Discussion Based
            <span className="block text-sm opacity-75">
              Mostly Group Discussion Questions
            </span>
          </button>
          <button
            onClick={() => onFormatChange('teacher')}
            className={`px-4 py-2 rounded-lg border ${
              format === 'teacher'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Teacher Led
            <span className="block text-sm opacity-75">
              Talking Points + Discussion Questions
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Would You Like To Make This A Multi-Week Study?
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => onMultiWeekChange(true)}
              className={`px-4 py-2 rounded-lg border ${
                isMultiWeek
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => onMultiWeekChange(false)}
              className={`px-4 py-2 rounded-lg border ${
                !isMultiWeek
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              No
            </button>
          </div>
        </div>

        {isMultiWeek && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How Many Weeks Should It Last?
            </label>
            <select
              value={weekCount}
              onChange={(e) => onWeekCountChange(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 11 }, (_, i) => i + 2).map((num) => (
                <option key={num} value={num}>
                  {num} Weeks
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}