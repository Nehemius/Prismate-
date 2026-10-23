import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/useApp';

interface ComeBookModalProps {
  onClose: () => void;
}

interface ComeVolume {
  id: string;
  volumeNumber: number;
  title: string;
  chapters: string[];
  pdfUrl?: string;
  questionCount: number;
  highlight: string;
  sampleQuestions: {
    part: string;
    marks: number;
    question: string;
    solution: string;
  }[];
}

const COME_VOLUMES: ComeVolume[] = [
  {
    id: 'come-vol-1',
    volumeNumber: 1,
    title: 'Matrices, Determinants & Complex Numbers',
    chapters: ['Chapter 1: Applications of Matrices and Determinants', 'Chapter 2: Complex Numbers'],
    pdfUrl: '/papers/pta/TN_12th_Maths_PTA_Model_1.pdf',
    questionCount: 45,
    highlight: 'Rank of matrix by echelon form, Cramer’s rule, de Moivre’s theorem, roots of complex numbers.',
    sampleQuestions: [
      {
        part: 'Part II (2 Marks)',
        marks: 2,
        question: 'If A is a non-singular matrix of order 3 such that |adj(A)| = 64, find |A|.',
        solution: '|adj(A)| = |A|^(n-1). Here n = 3, so |A|^(3-1) = |A|² = 64. Hence |A| = ±8.',
      },
      {
        part: 'Part III (3 Marks)',
        marks: 3,
        question: 'Solve the system of equations by Cramer’s rule: 2x - y = 3, x + 2y = 4.',
        solution: 'Δ = |2 -1; 1 2| = 4 - (-1) = 5 ≠ 0.\nΔ_x = |3 -1; 4 2| = 6 + 4 = 10. x = Δ_x / Δ = 10 / 5 = 2.\nΔ_y = |2 3; 1 4| = 8 - 3 = 5. y = Δ_y / Δ = 5 / 5 = 1.',
      },
      {
        part: 'Part IV (5 Marks)',
        marks: 5,
        question: 'Show that ((1 + i√3) / (1 - i√3))^10 + ((1 - i√3) / (1 + i√3))^10 = -1.',
        solution: 'Convert to polar form: 1 + i√3 = 2(cos(π/3) + i sin(π/3)), 1 - i√3 = 2(cos(-π/3) + i sin(-π/3)).\nQuotient = cos(2π/3) + i sin(2π/3). Raised to power 10: cos(20π/3) + i sin(20π/3).\nSecond term is conjugate: cos(20π/3) - i sin(20π/3).\nSum = 2 cos(20π/3) = 2 cos(6π + 2π/3) = 2 cos(2π/3) = 2(-1/2) = -1.',
      },
    ],
  },
  {
    id: 'come-vol-2',
    volumeNumber: 2,
    title: 'Theory of Equations & Inverse Trigonometry',
    chapters: ['Chapter 3: Theory of Equations', 'Chapter 4: Inverse Trigonometric Functions'],
    pdfUrl: '/papers/pta/TN_12th_Maths_PTA_Model_2.pdf',
    questionCount: 42,
    highlight: 'Vieta’s formulas, Descarte’s rule of signs, principal value branches, identity derivations.',
    sampleQuestions: [
      {
        part: 'Part II (2 Marks)',
        marks: 2,
        question: 'Find the principal value of sin⁻¹(-1/2) in radians and degrees.',
        solution: 'The principal value branch of sin⁻¹(x) is [-π/2, π/2]. Since sin(-π/6) = -1/2, sin⁻¹(-1/2) = -π/6 (-30°).',
      },
      {
        part: 'Part IV (5 Marks)',
        marks: 5,
        question: 'Solve the equation: 6x⁴ - 35x³ + 62x² - 35x + 6 = 0.',
        solution: 'This is a reciprocal equation of Type I of even degree. Divide throughout by x²: 6(x² + 1/x²) - 35(x + 1/x) + 62 = 0.\nLet u = x + 1/x. Then x² + 1/x² = u² - 2.\n6(u² - 2) - 35u + 62 = 0 ⟹ 6u² - 35u + 50 = 0.\nFactoring: (2u - 5)(3u - 10) = 0 ⟹ u = 5/2 or u = 10/3.\nSolving x + 1/x = 5/2 gives x = 2, 1/2.\nSolving x + 1/x = 10/3 gives x = 3, 1/3.\nRoots are {1/3, 1/2, 2, 3}.',
      },
    ],
  },
  {
    id: 'come-vol-3',
    volumeNumber: 3,
    title: '2D Analytical Geometry & Vector Algebra',
    chapters: ['Chapter 5: Two-Dimensional Analytical Geometry-II', 'Chapter 6: Applications of Vector Algebra'],
    pdfUrl: '/papers/pta/TN_12th_Maths_PTA_Model_3.pdf',
    questionCount: 48,
    highlight: 'Conic tangents and normals, skew lines, vector triple product, coplanar lines, planes.',
    sampleQuestions: [
      {
        part: 'Part III (3 Marks)',
        marks: 3,
        question: 'Find the vector and Cartesian equations of the sphere whose diameter endpoints are (2, -3, 4) and (-5, 6, -7).',
        solution: 'Cartesian equation of sphere on diameter joining (x₁, y₁, z₁) and (x₂, y₂, z₂):\n(x - x₁)(x - x₂) + (y - y₁)(y - y₂) + (z - z₁)(z - z₂) = 0.\n(x - 2)(x + 5) + (y + 3)(y - 6) + (z - 4)(z + 7) = 0\n⟹ x² + y² + z² + 3x - 3y + 3z - 56 = 0.',
      },
      {
        part: 'Part IV (5 Marks)',
        marks: 5,
        question: 'Prove by vector method that cos(α - β) = cos α cos β + sin α sin β.',
        solution: 'Take unit vectors â and b̂ making angles α and β with the positive X-axis in the XY plane.\nâ = cos α î + sin α ĵ, b̂ = cos β î + sin β ĵ.\nBy definition of scalar product: â · b̂ = |â||b̂| cos(α - β) = 1 · 1 · cos(α - β) = cos(α - β).\nBy algebraic dot product: â · b̂ = (cos α)(cos β) + (sin α)(sin β).\nEquating both: cos(α - β) = cos α cos β + sin α sin β. Hence proved.',
      },
    ],
  },
  {
    id: 'come-vol-4',
    volumeNumber: 4,
    title: 'Differential Calculus & Differential Equations',
    chapters: ['Chapter 7: Applications of Differential Calculus', 'Chapter 8: Differentials and Partial Derivatives', 'Chapter 10: Ordinary Differential Equations'],
    pdfUrl: '/papers/pta/TN_12th_Maths_PTA_Model_4.pdf',
    questionCount: 52,
    highlight: 'Rolle’s theorem, Taylor series, l’Hôpital’s rule, Euler’s theorem, integrating factors.',
    sampleQuestions: [
      {
        part: 'Part IV (5 Marks)',
        marks: 5,
        question: 'A tank contains 1000 liters of brine in which 50 kg of salt is dissolved. Brine containing 0.5 kg of salt per liter flows into the tank at 10 L/min, and the well-stirred mixture flows out at 10 L/min. Find the amount of salt after 30 minutes.',
        solution: 'Let A(t) be the salt in tank at time t. Rate in = 10 × 0.5 = 5 kg/min.\nRate out = (A / 1000) × 10 = A / 100 kg/min.\ndA/dt = 5 - A/100 = (500 - A) / 100.\nSeparating variables: dA / (500 - A) = dt / 100 ⟹ -ln(500 - A) = t / 100 + C.\nAt t = 0, A = 50 ⟹ -ln(450) = C ⟹ ln(450 / (500 - A)) = t / 100.\nAt t = 30 min: 450 / (500 - A) = e^(0.3) ≈ 1.3499.\n500 - A = 450 / 1.3499 ≈ 333.36 ⟹ A(30) ≈ 166.64 kg.',
      },
    ],
  },
  {
    id: 'come-vol-5',
    volumeNumber: 5,
    title: 'Integral Calculus & Probability Distributions',
    chapters: ['Chapter 9: Applications of Integration', 'Chapter 11: Probability Distributions', 'Chapter 12: Discrete Mathematics'],
    pdfUrl: '/papers/pta/TN_12th_Maths_PTA_Model_5.pdf',
    questionCount: 46,
    highlight: 'Definite integral properties, gamma integral, binomial distribution, truth tables, group duality.',
    sampleQuestions: [
      {
        part: 'Part II (2 Marks)',
        marks: 2,
        question: 'Evaluate ∫₀^(π/2) sin¹⁰(x) dx using reduction / Wallis formula.',
        solution: 'I_n = (n-1)/n · (n-3)/(n-2) ··· 1/2 · (π/2) for even n = 10.\nI₁₀ = (9/10) · (7/8) · (5/6) · (3/4) · (1/2) · (π/2) = 63π / 512.',
      },
      {
        part: 'Part IV (5 Marks)',
        marks: 5,
        question: 'Find the area of the region bounded between the parabola y² = 4x and the line y = 2x - 4.',
        solution: 'Intersection points: (2x - 4)² = 4x ⟹ 4x² - 16x + 16 = 4x ⟹ 4x² - 20x + 16 = 0 ⟹ x² - 5x + 4 = 0 ⟹ x = 1, 4.\nCorresponding y values: y = 2(1) - 4 = -2, y = 2(4) - 4 = 4.\nIntegrating along y from y = -2 to y = 4:\nArea = ∫₋₂⁴ [x_line - x_parabola] dy = ∫₋₂⁴ [(y + 4)/2 - y²/4] dy\n= [y²/4 + 2y - y³/12]₋₂⁴ = (4 + 8 - 64/12) - (1 - 4 - (-8)/12)\n= (12 - 16/3) - (-3 + 2/3) = 20/3 - (-7/3) = 27/3 = 9 sq. units.',
      },
    ],
  },
];

export const ComeBookModal: React.FC<ComeBookModalProps> = ({ onClose }) => {
  const { theme } = useApp();
  const isLight = theme === 'light';

  const [selectedVolId, setSelectedVolId] = useState<string>(COME_VOLUMES[0].id);
  const [readingMode, setReadingMode] = useState<'prismed' | 'pdf'>('prismed');

  const selectedVol = COME_VOLUMES.find((v) => v.id === selectedVolId) || COME_VOLUMES[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        background: isLight ? 'rgba(238, 242, 248, 0.96)' : 'rgba(4, 6, 10, 0.95)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        color: isLight ? '#111114' : '#F2F2F2',
      }}
    >
      {/* ── Top Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(255, 255, 255, 0.12)',
          background: isLight ? '#FFFFFF' : 'rgba(12, 16, 24, 0.85)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: isLight ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.25)',
              borderRadius: '6px',
              color: isLight ? '#111114' : '#F2F2F2',
              fontFamily: 'var(--font-subheading)',
              fontSize: '11px',
              letterSpacing: '2px',
              padding: '6px 14px',
              cursor: 'pointer',
            }}
          >
            ← BACK
          </button>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-subheading)',
                fontSize: '11px',
                color: isLight ? '#0077EE' : '#38BDF8',
                letterSpacing: '1px',
                fontWeight: 600,
              }}
            >
              TAMIL NADU GOVT. PARENT TEACHER ASSOCIATION (PTA) QUESTION BANK
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                letterSpacing: '3px',
                margin: '2px 0 0',
                color: isLight ? '#111114' : '#FFFFFF',
              }}
            >
              12TH MATHS C.O.M.E. BOOK (OFFICIAL VOLUMES)
            </h2>
          </div>
        </div>

        {/* Reading Mode Switcher */}
        <div style={{ display: 'flex', gap: '6px', background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setReadingMode('prismed')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              cursor: 'pointer',
              background: readingMode === 'prismed' ? (isLight ? '#111114' : '#38BDF8') : 'transparent',
              color: readingMode === 'prismed' ? (isLight ? '#FFFFFF' : '#000000') : (isLight ? '#4B5563' : 'rgba(242,242,242,0.6)'),
              fontWeight: 700,
            }}
          >
            ✨ PRISMED MODE
          </button>
          <button
            onClick={() => setReadingMode('pdf')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              cursor: 'pointer',
              background: readingMode === 'pdf' ? (isLight ? '#111114' : '#38BDF8') : 'transparent',
              color: readingMode === 'pdf' ? (isLight ? '#FFFFFF' : '#000000') : (isLight ? '#4B5563' : 'rgba(242,242,242,0.6)'),
              fontWeight: 700,
            }}
          >
            📄 OFFICIAL PDF
          </button>
        </div>
      </div>

      {/* ── Main Body Split ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Side: Volume Directory */}
        <div
          style={{
            width: '340px',
            borderRight: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px',
            overflowY: 'auto',
            background: isLight ? '#FFFFFF' : 'rgba(10, 14, 20, 0.65)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-subheading)', letterSpacing: '1px', opacity: 0.6 }}>
            SELECT C.O.M.E. VOLUME:
          </span>

          {COME_VOLUMES.map((vol) => {
            const isSelected = selectedVol.id === vol.id;
            return (
              <button
                key={vol.id}
                onClick={() => setSelectedVolId(vol.id)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: isSelected
                    ? (isLight ? '#111114' : '#F2F2F2')
                    : (isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.04)'),
                  border: isLight
                    ? (isSelected ? '1px solid #111114' : '1px solid rgba(0,0,0,0.12)')
                    : (isSelected ? '1px solid #F2F2F2' : '1px solid rgba(255,255,255,0.15)'),
                  color: isSelected ? (isLight ? '#FFFFFF' : '#000000') : (isLight ? '#111114' : '#F2F2F2'),
                  boxShadow: isLight && isSelected ? '0 4px 14px rgba(0,0,0,0.14)' : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'monospace', opacity: 0.7 }}>
                    VOLUME {vol.volumeNumber}
                  </span>
                  <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: isSelected ? 'rgba(0,119,238,0.2)' : 'rgba(255,255,255,0.08)', fontWeight: 700 }}>
                    {vol.questionCount} QUESTIONS
                  </span>
                </div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', margin: '4px 0 6px', letterSpacing: '1px' }}>
                  {vol.title}
                </h4>
                <div style={{ fontSize: '10px', opacity: 0.7, fontFamily: 'var(--font-content)', lineHeight: 1.3 }}>
                  {vol.chapters.join(' • ')}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side: Reader Content (Prismed Mode vs PDF) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 48px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {readingMode === 'pdf' ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', margin: 0, letterSpacing: '1px' }}>
                    {selectedVol.title} — Official PDF
                  </h3>
                  <p style={{ fontSize: '12px', opacity: 0.7, margin: '2px 0 0' }}>
                    Parent Teacher Association Official Class 12 Higher Secondary Model Paper
                  </p>
                </div>
                {selectedVol.pdfUrl && (
                  <a
                    href={selectedVol.pdfUrl}
                    download
                    style={{
                      background: isLight ? '#111114' : '#F2F2F2',
                      color: isLight ? '#FFFFFF' : '#000000',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      textDecoration: 'none',
                      fontWeight: 700,
                    }}
                  >
                    DOWNLOAD PDF
                  </a>
                )}
              </div>
              <iframe
                src={selectedVol.pdfUrl || '/papers/pta/TN_12th_Maths_PTA_Model_1.pdf'}
                title={selectedVol.title}
                style={{
                  width: '100%',
                  flex: 1,
                  minHeight: '600px',
                  border: isLight ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                }}
              />
            </div>
          ) : (
            /* Prismed Mode: Liquid Glass Translucent Question Sheets */
            <div style={{ maxWidth: '840px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Volume Overview Banner */}
              <div
                style={{
                  background: isLight
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(240,245,255,0.85))'
                    : 'linear-gradient(135deg, rgba(24,28,38,0.92), rgba(12,16,24,0.88))',
                  border: isLight ? '1.5px solid rgba(0,0,0,0.12)' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: isLight ? '0 12px 30px rgba(0,0,0,0.06)' : '0 14px 34px rgba(0,0,0,0.4)',
                }}
              >
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: isLight ? '#0077EE' : '#38BDF8', fontWeight: 700 }}>
                  VOLUME {selectedVol.volumeNumber} • C.O.M.E. CURATED QUESTIONS
                </span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', margin: '6px 0 10px', letterSpacing: '1.5px' }}>
                  {selectedVol.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-content)', fontSize: '14px', lineHeight: 1.6, opacity: 0.8, margin: 0 }}>
                  {selectedVol.highlight}
                </p>
              </div>

              {/* Sample High-Yield Questions in Prismed Glass Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', letterSpacing: '1.5px', opacity: 0.6 }}>
                  CURATED EXAM QUESTIONS & STEP-BY-STEP SCHEMES:
                </span>

                {selectedVol.sampleQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: isLight
                        ? 'rgba(255, 255, 255, 0.94)'
                        : 'rgba(16, 20, 30, 0.85)',
                      backdropFilter: 'blur(16px)',
                      border: isLight ? '1.5px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: '14px',
                      padding: '20px 24px',
                      boxShadow: isLight ? '0 6px 20px rgba(0,0,0,0.04)' : '0 8px 24px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-heading)',
                          letterSpacing: '1px',
                          color: q.marks === 5 ? '#EC4899' : q.marks === 3 ? '#38BDF8' : '#10B981',
                          fontWeight: 700,
                        }}
                      >
                        {q.part} • {q.marks} MARKS
                      </span>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', opacity: 0.5 }}>
                        Q#{idx + 1}
                      </span>
                    </div>

                    <h4
                      style={{
                        fontFamily: 'var(--font-content)',
                        fontSize: '16px',
                        lineHeight: 1.5,
                        margin: '0 0 16px',
                        color: isLight ? '#111114' : '#FFFFFF',
                      }}
                    >
                      {q.question}
                    </h4>

                    {/* Step-by-Step Marking Scheme */}
                    <div
                      style={{
                        background: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
                        border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        padding: '14px 18px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-heading)',
                          letterSpacing: '1px',
                          color: isLight ? '#4B5563' : 'rgba(242,242,242,0.5)',
                          marginBottom: '6px',
                        }}
                      >
                        ✓ OFFICIAL MARKING SCHEME & DERIVATION:
                      </div>
                      <pre
                        style={{
                          fontFamily: 'var(--font-content)',
                          fontSize: '13px',
                          lineHeight: 1.6,
                          color: isLight ? '#1F2937' : 'rgba(242,242,242,0.9)',
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {q.solution}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ComeBookModal;
