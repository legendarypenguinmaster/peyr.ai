import React from "react";

interface RichTextProps {
  text: string;
  className?: string;
}

export default function RichText({ text, className = "" }: RichTextProps) {
  if (!text) return null;

  // Parse markdown-like formatting and convert to JSX
  const parseText = (input: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];

    // Regular expressions for different formatting
    const patterns = [
      { regex: /\*\*(.*?)\*\*/g, component: "strong" }, // Bold
      { regex: /\*(.*?)\*/g, component: "em" }, // Italic
      { regex: /`(.*?)`/g, component: "code" }, // Inline code
      { regex: /^### (.*$)/gm, component: "h3" }, // H3 headers
      { regex: /^## (.*$)/gm, component: "h2" }, // H2 headers
      { regex: /^# (.*$)/gm, component: "h1" }, // H1 headers
    ];

    // Find all matches with their positions
    const matches: Array<{
      start: number;
      end: number;
      content: string;
      component: string;
      originalMatch: string;
    }> = [];

    patterns.forEach(({ regex, component }) => {
      let match;
      const regexCopy = new RegExp(regex.source, regex.flags);
      while ((match = regexCopy.exec(input)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[1] || match[0],
          component,
          originalMatch: match[0],
        });
      }
    });

    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);

    // Remove overlapping matches (keep the first one)
    const filteredMatches = matches.filter((match, index) => {
      return !matches
        .slice(0, index)
        .some(
          (prevMatch) =>
            match.start < prevMatch.end && match.end > prevMatch.start
        );
    });

    // Build the result
    let lastIndex = 0;

    filteredMatches.forEach((match) => {
      // Add text before the match
      if (match.start > lastIndex) {
        const beforeText = input.slice(lastIndex, match.start);
        if (beforeText) {
          parts.push(beforeText);
        }
      }

      // Add the formatted content
      const content = match.content;
      switch (match.component) {
        case "strong":
          parts.push(
            <strong
              key={`strong-${match.start}`}
              className="font-semibold text-gray-900 dark:text-white"
            >
              {content}
            </strong>
          );
          break;
        case "em":
          parts.push(
            <em
              key={`em-${match.start}`}
              className="italic text-gray-700 dark:text-gray-300"
            >
              {content}
            </em>
          );
          break;
        case "code":
          parts.push(
            <code
              key={`code-${match.start}`}
              className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200"
            >
              {content}
            </code>
          );
          break;
        case "h1":
          parts.push(
            <h1
              key={`h1-${match.start}`}
              className="text-xl font-bold text-gray-900 dark:text-white mb-2"
            >
              {content}
            </h1>
          );
          break;
        case "h2":
          parts.push(
            <h2
              key={`h2-${match.start}`}
              className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
            >
              {content}
            </h2>
          );
          break;
        case "h3":
          parts.push(
            <h3
              key={`h3-${match.start}`}
              className="text-base font-semibold text-gray-900 dark:text-white mb-1"
            >
              {content}
            </h3>
          );
          break;
        default:
          parts.push(content);
      }

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < input.length) {
      const remainingText = input.slice(lastIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }

    return parts.length > 0 ? parts : [input];
  };

  const parsedContent = parseText(text);

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {parsedContent.map((part, index) => (
        <React.Fragment key={index}>{part}</React.Fragment>
      ))}
    </div>
  );
}
