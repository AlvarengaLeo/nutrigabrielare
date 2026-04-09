import React from 'react';

/**
 * Renders a simple subset of Markdown as styled HTML.
 * Supports: **bold**, *italic*, ## headings, - bullet lists, and line breaks.
 */
export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let listItems = [];
  let listKey = 0;

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="list-disc list-inside space-y-1.5 my-3">
          {listItems.map((item, i) => (
            <li key={i} className="leading-relaxed">{formatInline(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  }

  function formatInline(text) {
    // Split by **bold** and *italic* markers
    const parts = [];
    let remaining = text;
    let partKey = 0;

    while (remaining.length > 0) {
      // Bold: **text**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Italic: *text*
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

      const firstMatch = [boldMatch, italicMatch]
        .filter(Boolean)
        .sort((a, b) => a.index - b.index)[0];

      if (!firstMatch) {
        parts.push(<span key={partKey++}>{remaining}</span>);
        break;
      }

      // Text before the match
      if (firstMatch.index > 0) {
        parts.push(<span key={partKey++}>{remaining.substring(0, firstMatch.index)}</span>);
      }

      if (firstMatch === boldMatch) {
        parts.push(<strong key={partKey++} className="font-bold">{boldMatch[1]}</strong>);
      } else {
        parts.push(<em key={partKey++} className="italic">{italicMatch[1]}</em>);
      }

      remaining = remaining.substring(firstMatch.index + firstMatch[0].length);
    }

    return parts;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (trimmed === '') {
      flushList();
      continue;
    }

    // Heading ##
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`h-${i}`} className="font-heading font-bold text-lg text-primary mt-4 mb-2">
          {formatInline(trimmed.substring(3))}
        </h3>
      );
      continue;
    }

    // Heading #
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={`h-${i}`} className="font-heading font-bold text-xl text-primary mt-4 mb-2">
          {formatInline(trimmed.substring(2))}
        </h2>
      );
      continue;
    }

    // Bullet list: - item or * item or • item
    if (/^[-*•]\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={`p-${i}`} className="leading-relaxed">
        {formatInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-2 ${className}`}>{elements}</div>;
}
