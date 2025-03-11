import { jsPDF } from 'jspdf';
import type { BibleStudy } from './openai';

export function generatePDF(study: BibleStudy, coloringPageUrl?: string): string {
  const doc = new jsPDF();
  let yPosition = 20;
  const lineHeight = 7;
  const margin = 20;
  const pageWidth = 210;
  const contentWidth = pageWidth - (2 * margin);

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach(line => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += lineHeight;
  };

  // Title
  doc.setFontSize(24);
  doc.text(study.title, margin, yPosition);
  yPosition += lineHeight * 2;

  // Key Scriptures
  doc.setFontSize(12);
  doc.text('Key Scriptures:', margin, yPosition);
  yPosition += lineHeight;
  study.keyScriptures.forEach(scripture => {
    addWrappedText(`• ${scripture}`);
  });
  yPosition += lineHeight;

  // Introduction
  doc.text('Introduction:', margin, yPosition);
  yPosition += lineHeight;
  addWrappedText(study.introduction);
  yPosition += lineHeight;

  // Main Points
  study.mainPoints.forEach((point, index) => {
    doc.setFontSize(16);
    doc.text(`${index + 1}. ${point.title}`, margin, yPosition);
    yPosition += lineHeight;

    doc.setFontSize(12);
    addWrappedText(point.content);
    addWrappedText(`Scripture: ${point.scripture}`);

    doc.text('Discussion Questions:', margin, yPosition);
    yPosition += lineHeight;
    point.questions.forEach(question => {
      addWrappedText(`• ${question}`);
    });
    yPosition += lineHeight;
  });

  // Application
  doc.setFontSize(16);
  doc.text('Application', margin, yPosition);
  yPosition += lineHeight;

  doc.setFontSize(12);
  addWrappedText(`For Reflection: ${study.application.reflection}`);
  addWrappedText(`This Week's Action: ${study.application.action}`);

  // Add coloring page if provided
  if (coloringPageUrl) {
    doc.addPage();
    doc.addImage(coloringPageUrl, 'JPEG', margin, 20, contentWidth, contentWidth);
  }

  return doc.output('datauristring');
}