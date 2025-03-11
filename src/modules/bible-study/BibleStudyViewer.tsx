import React from 'react';
import { Copy, FileText, Download, Printer, MessageSquare, Loader2, ChevronLeft, ChevronRight, LayoutGrid, PlusCircle } from 'lucide-react';
import type { BibleStudy } from '../../lib/openai';
import { cn } from '../../lib/utils';
import { jsPDF } from 'jspdf';

interface BibleStudyViewerProps {
  study: BibleStudy;
  onRequestChanges: (feedback: string) => void;
  onNewStudy?: () => void;
}

export function BibleStudyViewer({ study, onRequestChanges, onNewStudy }: BibleStudyViewerProps) {
  const [feedback, setFeedback] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'all' | number>('all');
  const shareUrl = window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Simple PDF generation - in a real app, you'd want more formatting
    let y = 20;
    
    // Title
    doc.setFontSize(20);
    doc.text(study.title, 20, y);
    y += 15;
    
    // Key Scriptures
    doc.setFontSize(16);
    doc.text("Key Scriptures", 20, y);
    y += 10;
    doc.setFontSize(12);
    study.keyScriptures.forEach(scripture => {
      const lines = doc.splitTextToSize(scripture, 170);
      doc.text(lines, 20, y);
      y += lines.length * 7;
    });
    y += 10;
    
    // Introduction
    doc.setFontSize(16);
    doc.text("Introduction", 20, y);
    y += 10;
    doc.setFontSize(12);
    const introLines = doc.splitTextToSize(study.introduction, 170);
    doc.text(introLines, 20, y);
    
    // Save the PDF
    doc.save(`${study.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  };

  const handleSubmitFeedback = async () => {
    if (feedback.trim()) {
      setIsSubmitting(true);
      try {
        await onRequestChanges(feedback);
        setFeedback('');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const mainPointsByWeek = study.mainPoints.reduce((acc, point) => {
    const week = point.weekNumber || 1;
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(point);
    return acc;
  }, {} as Record<number, typeof study.mainPoints>);

  const weeks = Object.keys(mainPointsByWeek).map(Number).sort((a, b) => a - b);
  const isMultiWeek = weeks.length > 1;

  const handleNextWeek = () => {
    if (typeof viewMode === 'number' && viewMode < weeks.length) {
      setViewMode(viewMode + 1);
    }
  };

  const handlePrevWeek = () => {
    if (typeof viewMode === 'number' && viewMode > 1) {
      setViewMode(viewMode - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center print:hidden">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-gray-900">Your Bible Study</h1>
          {onNewStudy && (
            <button
              onClick={onNewStudy}
              className="ml-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Study</span>
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Copy link"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Download as PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            title="Print"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 print:hidden">
        <div className="flex items-start gap-4">
          <MessageSquare className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Need Changes?</h2>
            <div className="space-y-4">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what you'd like to change and we'll update the Bible study..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedback.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Bible Study'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bible Study Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center">
          {study.title}
        </h1>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Key Scriptures</h2>
          {study.keyScriptures.map((scripture, index) => (
            <p key={index} className="text-gray-600 bg-gray-50 p-4 rounded-lg">
              {scripture}
            </p>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Introduction</h2>
          <p className="text-gray-600">{study.introduction}</p>
        </div>

        {isMultiWeek && (
          <div className="flex items-center justify-between gap-4 print:hidden">
            <button
              onClick={() => setViewMode('all')}
              className={cn(
                "px-4 py-2 rounded-lg border",
                viewMode === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              )}
            >
              <LayoutGrid className="w-4 h-4 inline-block mr-2" />
              View All Weeks
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevWeek}
                disabled={typeof viewMode !== 'number' || viewMode <= 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                {weeks.map((week) => (
                  <button
                    key={week}
                    onClick={() => setViewMode(week)}
                    className={cn(
                      "w-8 h-8 rounded-lg border text-sm font-medium",
                      viewMode === week
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    {week}
                  </button>
                ))}
              </div>
              <button
                onClick={handleNextWeek}
                disabled={typeof viewMode !== 'number' || viewMode >= weeks.length}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-12">
          {weeks.map((week) => {
            if (viewMode !== 'all' && viewMode !== week) return null;
            
            const weekPoints = mainPointsByWeek[week];
            const firstPoint = weekPoints[0];
            
            return (
              <div key={week} className="space-y-8 print:break-before-page">
                <div className="border-b-2 border-blue-100 pb-4">
                  <h2 className="text-2xl font-bold text-blue-600">
                    Week {week}: {firstPoint.weekTitle}
                  </h2>
                  {firstPoint.weekFocus && (
                    <p className="mt-2 text-gray-600 italic">
                      Focus: {firstPoint.weekFocus}
                    </p>
                  )}
                </div>

                {weekPoints.map((point, index) => (
                  <div key={index} className="space-y-6 bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {point.title}
                    </h3>

                    <div className="space-y-4">
                      <div className="prose max-w-none">
                        <p className="text-gray-600 mb-4">{point.content.overview}</p>
                        <ul className="space-y-3 list-disc pl-6">
                          {point.content.keyPoints.map((keyPoint, kIndex) => (
                            <li key={kIndex} className="text-gray-600">{keyPoint}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded-lg border-l-4 border-blue-600">
                        <h4 className="font-medium text-gray-900 mb-2">Scripture Focus</h4>
                        <p className="text-gray-600 font-medium">{point.scripture.reference}</p>
                        <p className="text-gray-600 italic mt-2">{point.scripture.text}</p>
                      </div>

                      <div className="pl-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Discussion Questions</h4>
                        <ul className="list-disc space-y-3">
                          {point.questions.map((question, qIndex) => (
                            <li key={qIndex} className="text-gray-600">{question}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Application</h4>
                        <p className="text-blue-800">{point.content.application}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="space-y-6 bg-gray-50 p-6 rounded-lg print:break-before-page">
          <h2 className="text-xl font-semibold text-gray-900">Overall Application</h2>
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">For Reflection</h3>
              <p className="text-gray-600">{study.application.reflection}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Action Steps</h3>
              <p className="text-gray-600">{study.application.action}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}