import React from 'react';

// A simple component to render basic markdown (bold, lists).
const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const renderInline = (line: string) => {
    // Split by bold markers, keeping the delimiters
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2 pl-2">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      const content = trimmedLine.substring(2);
      listItems.push(<li key={`li-${index}`}>{renderInline(content)}</li>);
    } else {
      flushList();
      // Avoid creating empty paragraphs for empty lines
      if (line) {
        elements.push(<p key={`p-${index}`} className="my-1">{renderInline(line)}</p>);
      }
    }
  });

  flushList();

  return <div className="text-gray-200">{elements}</div>;
};

export default MarkdownRenderer;