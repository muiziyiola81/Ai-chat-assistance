import React, { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { GroundingSource } from '../types';

interface MarkdownRendererProps {
  content: string;
  sources?: GroundingSource[];
  isStreaming?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  sources = [],
  isStreaming = false,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  // Split content by code blocks: ```lang ... ```
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let blockCounter = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      parts.push(
        <TextSection
          key={`text-${lastIndex}`}
          text={textBefore}
          sources={sources}
        />
      );
    }

    const language = match[1] || 'code';
    const codeSnippet = match[2];
    const currentIndex = blockCounter++;

    parts.push(
      <div
        key={`code-${currentIndex}`}
        className="my-3.5 rounded-xl border border-emerald-900/40 bg-[#070d09] overflow-hidden shadow-lg"
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-900/30 bg-[#0a140e] text-xs text-emerald-400/80 font-mono">
          <span className="uppercase tracking-wider font-semibold text-[11px] text-emerald-400">
            {language}
          </span>
          <button
            onClick={() => handleCopyCode(codeSnippet, currentIndex)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 transition-colors border border-emerald-800/30 active:scale-95"
            title="Copy code"
            aria-label="Copy code"
          >
            {copiedIndex === currentIndex ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-emerald-400/80" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 overflow-x-auto text-[13.5px] leading-relaxed font-mono text-emerald-100/90 selection:bg-emerald-500/30">
          <pre className="m-0 whitespace-pre">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  // Trailing text
  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    parts.push(
      <TextSection
        key={`text-${lastIndex}`}
        text={remainingText}
        sources={sources}
      />
    );
  }

  return (
    <div className="text-[15px] leading-[1.7] text-[#dfe8e1] space-y-2.5 selection:bg-emerald-500/30 selection:text-emerald-100">
      {parts}
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse rounded-xs align-middle" />
      )}
    </div>
  );
};

const TextSection: React.FC<{
  text: string;
  sources: GroundingSource[];
}> = ({ text, sources }) => {
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentListItems: React.ReactNode[] = [];
  let isNumberedList = false;
  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = (key: string) => {
    if (currentListItems.length > 0) {
      if (isNumberedList) {
        renderedElements.push(
          <ol
            key={key}
            className="list-decimal pl-5 space-y-1.5 my-2.5 text-[#d8e3dc]"
          >
            {currentListItems}
          </ol>
        );
      } else {
        renderedElements.push(
          <ul
            key={key}
            className="list-disc pl-5 space-y-1.5 my-2.5 text-[#d8e3dc] marker:text-emerald-400"
          >
            {currentListItems}
          </ul>
        );
      }
      currentListItems = [];
    }
  };

  const flushTable = (key: string) => {
    if (tableRows.length > 0) {
      const [headerRow, ...bodyRows] = tableRows;
      renderedElements.push(
        <div key={key} className="my-3.5 overflow-x-auto rounded-xl border border-emerald-900/40 bg-[#09120c]">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-emerald-900/60 bg-[#0c1a11] text-emerald-300 font-semibold">
                {headerRow.map((cell, idx) => (
                  <th key={idx} className="px-3.5 py-2.5">
                    {parseInline(cell.trim(), sources)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/60 text-[#d4ded7]">
              {bodyRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-emerald-950/30 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2">
                      {parseInline(cell.trim(), sources)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check Table line
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(`list-before-table-${i}`);
      // Skip markdown table divider line like |---|---|
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
        inTable = true;
        continue;
      }
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRows.push(cells);
      inTable = true;
      continue;
    } else if (inTable) {
      flushTable(`table-${i}`);
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList(`list-${i}`);
      renderedElements.push(
        <h3
          key={`h3-${i}`}
          className="text-base font-semibold text-emerald-200 mt-4 mb-2 flex items-center gap-1.5"
        >
          {parseInline(trimmed.substring(4), sources)}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList(`list-${i}`);
      renderedElements.push(
        <h2
          key={`h2-${i}`}
          className="text-lg font-semibold text-emerald-100 mt-5 mb-2.5 border-b border-emerald-900/30 pb-1"
        >
          {parseInline(trimmed.substring(3), sources)}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushList(`list-${i}`);
      renderedElements.push(
        <h1
          key={`h1-${i}`}
          className="text-xl font-bold text-white mt-6 mb-3 border-b border-emerald-800/40 pb-1.5"
        >
          {parseInline(trimmed.substring(2), sources)}
        </h1>
      );
      continue;
    }

    // Blockquotes
    if (trimmed.startsWith('> ')) {
      flushList(`list-${i}`);
      renderedElements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-2 border-emerald-500/70 pl-3.5 my-2.5 italic text-emerald-200/80 bg-emerald-950/20 py-1 rounded-r-lg"
        >
          {parseInline(trimmed.substring(2), sources)}
        </blockquote>
      );
      continue;
    }

    // Unordered list (* or -)
    if (/^[\*\-]\s+(.+)/.test(trimmed)) {
      const match = trimmed.match(/^[\*\-]\s+(.+)/);
      if (match) {
        if (isNumberedList) flushList(`num-list-${i}`);
        isNumberedList = false;
        currentListItems.push(
          <li key={`li-${i}`} className="leading-relaxed">
            {parseInline(match[1], sources)}
          </li>
        );
        continue;
      }
    }

    // Ordered list (1. 2. etc)
    if (/^\d+\.\s+(.+)/.test(trimmed)) {
      const match = trimmed.match(/^\d+\.\s+(.+)/);
      if (match) {
        if (!isNumberedList && currentListItems.length > 0)
          flushList(`unord-list-${i}`);
        isNumberedList = true;
        currentListItems.push(
          <li key={`li-${i}`} className="leading-relaxed">
            {parseInline(match[1], sources)}
          </li>
        );
        continue;
      }
    }

    // If empty line, flush any active list
    if (!trimmed) {
      flushList(`list-${i}`);
      continue;
    }

    // Normal paragraph
    flushList(`list-${i}`);
    renderedElements.push(
      <p key={`p-${i}`} className="my-1.5 leading-relaxed">
        {parseInline(line, sources)}
      </p>
    );
  }

  flushList('final-list');
  flushTable('final-table');

  return <>{renderedElements}</>;
};

// Inline parser for bold, italic, inline code, links, and search citations
function parseInline(text: string, sources: GroundingSource[] = []): React.ReactNode {
  // First handle inline code: `code`
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`)|(\*\*.*?\*\*)|(\*.*?\*)|(\[[^\]]+\]\([^)]+\))|(\[\d+\])/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];

    // Inline code: `code`
    if (token.startsWith('`') && token.endsWith('`')) {
      const code = token.slice(1, -1);
      parts.push(
        <code
          key={`code-${match.index}`}
          className="px-1.5 py-0.5 mx-0.5 text-[13px] rounded bg-emerald-950/70 border border-emerald-800/40 text-emerald-300 font-mono"
        >
          {code}
        </code>
      );
    }
    // Bold: **text**
    else if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-emerald-50">
          {boldText}
        </strong>
      );
    }
    // Italic: *text*
    else if (token.startsWith('*') && token.endsWith('*')) {
      const italicText = token.slice(1, -1);
      parts.push(
        <em key={`italic-${match.index}`} className="italic text-emerald-200/90">
          {italicText}
        </em>
      );
    }
    // Markdown link: [Title](url)
    else if (token.startsWith('[') && token.includes('](')) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const title = linkMatch[1];
        const href = linkMatch[2];
        parts.push(
          <a
            key={`link-${match.index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-emerald-400 hover:text-emerald-300 underline underline-offset-2 font-medium transition-colors"
          >
            <span>{title}</span>
            <ExternalLink className="w-3 h-3 inline-block ml-0.5 opacity-70" />
          </a>
        );
      }
    }
    // Citation badge: [1], [2], etc.
    else if (/^\[\d+\]$/.test(token)) {
      const citationIndex = parseInt(token.slice(1, -1), 10) - 1;
      const matchedSource = sources[citationIndex];
      parts.push(
        <a
          key={`cite-${match.index}`}
          href={matchedSource ? matchedSource.uri : '#'}
          target={matchedSource ? '_blank' : undefined}
          rel={matchedSource ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center justify-center px-1.5 py-0.2 mx-0.5 text-[11px] font-mono font-semibold rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/80 transition-colors"
          title={matchedSource ? matchedSource.title : `Citation ${token}`}
        >
          {token}
        </a>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
