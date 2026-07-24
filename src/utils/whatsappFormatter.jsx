import React from 'react';

/**
 * Formats WhatsApp text containing markdown (*bold*, _italic_, ~strike~, code blocks)
 * and URLs into styled React JSX elements.
 * 
 * @param {string} text - Raw message string
 * @param {boolean} isAgent - Whether the message is sent by agent (for link contrast)
 * @returns {React.ReactNode} Formatted JSX element
 */
export const renderWhatsAppText = (text, isAgent = false) => {
  if (!text) return '';

  // 1. Process block elements & lines
  const lines = text.split('\n');

  return (
    <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
      {lines.map((line, lineIdx) => (
        <React.Fragment key={lineIdx}>
          {parseLineTokens(line, isAgent)}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </span>
  );
};

/**
 * Parses inline formatting tokens (*bold*, _italic_, ~strike~, URLs) for a single line of text.
 */
function parseLineTokens(line, isAgent) {
  if (!line) return null;

  // Regex matching URLs, *bold*, _italic_, ~strike~
  const tokenRegex = /(https?:\/\/[^\s]+|\*[^*]+\*|_[^_]+_|~[^~]+~)/g;
  const parts = line.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // 1. URL matching
    if (/^https?:\/\/[^\s]+$/.test(part)) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: isAgent ? '#A5F3FC' : '#0284C7',
            fontWeight: 600,
            textDecoration: 'underline',
            wordBreak: 'break-all'
          }}
        >
          {part}
        </a>
      );
    }

    // 2. Bold matching (*text*)
    if (/^\*[^*]+\*$/.test(part)) {
      const content = part.slice(1, -1);
      return (
        <strong key={idx} style={{ fontWeight: 700 }}>
          {content}
        </strong>
      );
    }

    // 3. Italic matching (_text_)
    if (/^_[^_]+_$/.test(part)) {
      const content = part.slice(1, -1);
      return (
        <em key={idx} style={{ fontStyle: 'italic' }}>
          {content}
        </em>
      );
    }

    // 4. Strikethrough matching (~text~)
    if (/^~[^~]+~$/.test(part)) {
      const content = part.slice(1, -1);
      return (
        <del key={idx} style={{ textDecoration: 'line-through', opacity: 0.85 }}>
          {content}
        </del>
      );
    }

    // Default plain text segment
    return <span key={idx}>{part}</span>;
  });
}
