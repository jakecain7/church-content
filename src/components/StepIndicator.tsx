import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2",
                index + 1 <= currentStep
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 text-gray-500"
              )}
            >
              {index + 1 < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className="ml-2 text-sm font-medium text-gray-600">
              {index === 0 ? "Starting Point" : index === 1 ? "Content" : "Customize"}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5",
                index + 1 < currentStep ? "bg-blue-600" : "bg-gray-300"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}