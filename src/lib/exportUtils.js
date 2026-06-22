import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

export const exportToTXT = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `${filename}.txt`);
};

export const exportToMarkdown = (content, filename) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${filename}.md`);
};

export const exportToPDF = (content, filename, title = 'Agent Output') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  const maxLineWidth = pageWidth - margin * 2;

  // Set title
  doc.setFontSize(18);
  doc.text(title, margin, 20);

  // Set content
  doc.setFontSize(12);
  const splitContent = doc.splitTextToSize(content, maxLineWidth);
  
  // Add content to PDF, handling multiple pages if necessary
  let y = 30;
  splitContent.forEach((line) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += 7;
  });

  doc.save(`${filename}.pdf`);
};

export const formatWorkflowContent = (workflowTitle, steps) => {
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const stepContent = steps
    .filter((s) => s.status === 'done' && s.output)
    .map((s, i) => `## Step ${i + 1} — ${s.agentName}\n\n${s.output}`)
    .join('\n\n---\n\n');

  return `# ${workflowTitle} — Workflow Output\nGenerated on ${date}\n\n${stepContent}`;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      console.error('Fallback copy failed: ', fallbackErr);
      return false;
    }
  }
};
