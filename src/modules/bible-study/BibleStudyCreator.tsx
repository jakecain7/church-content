import React, { useState } from 'react';
import { StepIndicator } from '../../components/StepIndicator';
import { Step1 } from './Step1';
import { Step2 } from './Step2';
import { Step3 } from './Step3';
import { BibleStudyViewer } from './BibleStudyViewer';
import { LoadingScreen } from '../../components/LoadingScreen';
import { generateBibleStudy, type BibleStudy } from '../../lib/openai';
import toast from 'react-hot-toast';

interface BibleStudyCreatorProps {
  initialStudy?: BibleStudy;
  onSave?: (study: BibleStudy, title?: string) => void;
}

export function BibleStudyCreator({ initialStudy, onSave }: BibleStudyCreatorProps) {
  const [currentStep, setCurrentStep] = useState(initialStudy ? 4 : 1);
  const [source, setSource] = useState('');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('');
  const [theme, setTheme] = useState('');
  const [format, setFormat] = useState<'discussion' | 'teacher'>('teacher');
  const [isMultiWeek, setIsMultiWeek] = useState(false);
  const [weekCount, setWeekCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [study, setStudy] = useState<BibleStudy | null>(initialStudy || null);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateInputs = () => {
    if (!source) {
      toast.error('Please select a starting point for your Bible study');
      return false;
    }
    if (!content.trim()) {
      toast.error('Please enter the content for your Bible study');
      return false;
    }
    if (!audience.trim()) {
      toast.error('Please specify the target audience');
      return false;
    }
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      toast.error('OpenAI API key is not configured. Please check your environment variables.');
      return false;
    }
    return true;
  };

  const generateStudy = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting Bible study generation...');
      const generatedStudy = await generateBibleStudy(
        source,
        content,
        audience,
        theme,
        isMultiWeek ? weekCount : undefined,
        format
      );
      console.log('Bible study generated successfully');
      setStudy(generatedStudy);
      setCurrentStep(4);
      
      if (onSave) {
        onSave(generatedStudy, generatedStudy.title);
      }
      
      toast.success('Bible study created successfully!');
    } catch (error) {
      console.error('Bible study generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestChanges = async (feedback: string) => {
    setIsLoading(true);
    const toastId = toast.loading('Updating your Bible study...');

    try {
      const updatedStudy = await generateBibleStudy(
        source,
        `${content}\n\nPlease update the Bible study with the following feedback: ${feedback}`,
        audience,
        theme,
        isMultiWeek ? weekCount : undefined,
        format
      );
      setStudy(updatedStudy);
      
      if (onSave && study) {
        onSave(updatedStudy, study.title);
      }
      
      toast.success('Bible study updated successfully!', { id: toastId });
    } catch (error) {
      console.error('Failed to update Bible study:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update Bible study';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingScreen format={format} />;
    }

    if (study && currentStep === 4) {
      return (
        <BibleStudyViewer 
          study={study} 
          onRequestChanges={handleRequestChanges}
          onNewStudy={() => {
            setStudy(null);
            setSource('');
            setContent('');
            setAudience('');
            setTheme('');
            setFormat('teacher');
            setIsMultiWeek(false);
            setWeekCount(2);
            setCurrentStep(1);
          }}
        />
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <StepIndicator currentStep={currentStep} totalSteps={3} />

        <div className="mt-8">
          {currentStep === 1 && (
            <Step1 onSelect={(selectedSource) => {
              setSource(selectedSource);
              handleNext();
            }} />
          )}

          {currentStep === 2 && (
            <Step2
              source={source}
              content={content}
              onChange={setContent}
            />
          )}

          {currentStep === 3 && (
            <Step3
              audience={audience}
              theme={theme}
              format={format}
              onAudienceChange={setAudience}
              onThemeChange={setTheme}
              onFormatChange={setFormat}
              isMultiWeek={isMultiWeek}
              weekCount={weekCount}
              onMultiWeekChange={setIsMultiWeek}
              onWeekCountChange={setWeekCount}
            />
          )}
        </div>

        <div className="mt-8 flex justify-between">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Back
            </button>
          )}
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentStep === 2 && !content.trim() || isLoading}
            >
              Next
            </button>
          ) : (
            <button
              onClick={generateStudy}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={!audience.trim() || isLoading}
            >
              Create Bible Study
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {renderContent()}
    </div>
  );
}