import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';

const VERSES = [
  {
    text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
    reference: "Jeremiah 29:11"
  },
  {
    text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
    reference: "Joshua 1:9"
  },
  {
    text: "I can do all things through him who strengthens me.",
    reference: "Philippians 4:13"
  },
  {
    text: "The Lord is my shepherd; I shall not want.",
    reference: "Psalm 23:1"
  },
  {
    text: "Trust in the Lord with all your heart, and do not lean on your own understanding.",
    reference: "Proverbs 3:5"
  },
  {
    text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
    reference: "Isaiah 40:31"
  }
];

const STAGES = [
  "Analyzing content...",
  "Gathering scriptural insights...",
  "Crafting discussion questions...",
  "Preparing teaching points...",
  "Adding biblical context...",
  "Finalizing your study guide..."
];

interface LoadingScreenProps {
  format: 'discussion' | 'teacher';
}

export function LoadingScreen({ format }: LoadingScreenProps) {
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const verseInterval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentVerseIndex((prev) => (prev + 1) % VERSES.length);
        setFadeIn(true);
      }, 500);
    }, 4000);

    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 3000);

    return () => {
      clearInterval(verseInterval);
      clearInterval(stageInterval);
    };
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="max-w-2xl w-full space-y-12 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Creating Your {format === 'teacher' ? 'Teacher-Led' : 'Discussion-Based'} Bible Study
            </h2>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-lg text-gray-600">{STAGES[currentStageIndex]}</p>
          </div>
        </div>

        <div 
          className={`transition-opacity duration-500 ${
            fadeIn ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="bg-white rounded-xl shadow-lg p-8 space-y-4">
            <blockquote className="text-2xl font-serif text-gray-700 leading-relaxed">
              "{VERSES[currentVerseIndex].text}"
            </blockquote>
            <p className="text-lg font-medium text-blue-600">
              {VERSES[currentVerseIndex].reference}
            </p>
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          {VERSES.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentVerseIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}