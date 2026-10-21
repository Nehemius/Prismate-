import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { formatToReadableMath } from '../../utils/mathUtils';

interface MathFormulaProps {
  latex: string;
  displayMode?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({
  latex,
  displayMode = false,
  style,
  className,
}) => {
  const html = useMemo(() => {
    if (!latex) return '';
    try {
      // Normalize escaped backslashes if doubly encoded
      let clean = latex.trim();
      clean = clean.replace(/\\\\([a-zA-Z]+|\^|_|\{|\}|,| )/g, '\\$1');

      if (clean.startsWith('$$') && clean.endsWith('$$')) {
        clean = clean.slice(2, -2).trim();
      } else if (clean.startsWith('$') && clean.endsWith('$')) {
        clean = clean.slice(1, -1).trim();
      }

      return katex.renderToString(clean, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return '';
    }
  }, [latex, displayMode]);

  if (!latex) return null;

  if (!html) {
    // Graceful fallback to clean Unicode math
    return (
      <span
        className={className}
        style={{
          fontFamily: 'var(--font-heading), monospace',
          fontSize: '13px',
          color: '#E6FFFF',
          letterSpacing: '0.5px',
          ...style,
        }}
      >
        {formatToReadableMath(latex)}
      </span>
    );
  }

  return (
    <div
      className={`prismate-math-formula ${className || ''}`}
      style={{
        color: '#FFFFFF',
        display: 'inline-block',
        lineHeight: 1.3,
        letterSpacing: '0.2px',
        userSelect: 'none',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathFormula;
