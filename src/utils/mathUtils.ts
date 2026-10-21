/**
 * Clean Unicode fallback formatter for formula strings
 */
export function formatToReadableMath(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\pi/g, 'π')
    .replace(/\\theta/g, 'θ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\phi/g, 'φ')
    .replace(/\\circ/g, '°')
    .replace(/\\implies/g, ' ⇒ ')
    .replace(/\\rightarrow/g, ' → ')
    .replace(/\\quad/g, '  ')
    .replace(/\\,/g, ' ')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt/g, '√')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/_\{([^}]+)\}/g, '₍$1₎')
    .replace(/\^\{([^}]+)\}/g, '⁽$1⁾')
    .replace(/\\/g, '')
    .trim();
}
