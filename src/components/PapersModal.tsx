import React, { useState } from 'react';
import { motion } from 'motion/react';
import { INITIAL_PAPERS } from '../data/mockData';
import { useApp } from '../context/useApp';

interface PapersModalProps {
  type: 'pta' | 'board';
  subject: string;
  onClose: () => void;
}

interface PrismedSection {
  partTitle: string;
  instructions: string;
  marksBreakdown: string;
  questions: {
    qNum: number;
    question: string;
    options?: string[];
    correctAnswer?: string;
    isCompulsory?: boolean;
    eitherOr?: {
      a: string;
      b: string;
    };
    solutionHint?: string;
  }[];
}

// Generate realistic Prismed paper content based on subject and type
function getPrismedPaperContent(subjectName: string, _paperTitle?: string): PrismedSection[] {
  const s = subjectName.toLowerCase();

  if (s.includes('chem')) {
    return [
      {
        partTitle: 'PART — I (Objective Type)',
        instructions: 'Answer all questions. Choose the most appropriate answer from the given four alternatives.',
        marksBreakdown: '15 × 1 = 15 Marks',
        questions: [
          {
            qNum: 1,
            question: 'Which of the following mineral is concentrated by froth flotation process?',
            options: ['Haematite', 'Galena (PbS)', 'Bauxite', 'Cassiterite'],
            correctAnswer: 'Galena (PbS) — Sulphide ores are preferentially wetted by pine oil and float with froth.',
          },
          {
            qNum: 2,
            question: 'The geometry of [Ni(CN)₄]²⁻ and [NiCl₄]²⁻ complexes are respectively:',
            options: ['Square planar, Tetrahedral', 'Tetrahedral, Square planar', 'Both are Square planar', 'Both are Octahedral'],
            correctAnswer: 'Square planar, Tetrahedral — CN⁻ is strong field (dsp² pairing), Cl⁻ is weak field (sp³).',
          },
          {
            qNum: 3,
            question: 'The unit of rate constant for a first-order chemical reaction is:',
            options: ['mol L⁻¹ s⁻¹', 's⁻¹', 'L mol⁻¹ s⁻¹', 'L² mol⁻² s⁻¹'],
            correctAnswer: 's⁻¹ (time⁻¹)',
          },
          {
            qNum: 4,
            question: 'Which of the following forms Schiff base on reaction with primary amines?',
            options: ['Benzaldehyde', 'Phenol', 'Acetic acid', 'Nitrobenzene'],
            correctAnswer: 'Benzaldehyde — Aldehydes react with primary aliphatic/aromatic amines to form azomethines (Schiff base -CH=N-).',
          },
          {
            qNum: 5,
            question: 'The coordination number of Ce in [Ce(NO₃)₆]²⁻ is:',
            options: ['6', '8', '10', '12'],
            correctAnswer: '12 — Nitrate acts as a bidentate chelating ligand to cerium (6 × 2 = 12).',
          },
        ],
      },
      {
        partTitle: 'PART — II (Short Answers)',
        instructions: 'Answer any SIX questions. Question No. 24 is compulsory.',
        marksBreakdown: '6 × 2 = 12 Marks',
        questions: [
          {
            qNum: 16,
            question: 'What is the role of cryolite in the electrolytic extraction of aluminium from alumina (Hall-Héroult process)?',
            solutionHint: 'Cryolite (Na₃AlF₆) lowers the melting point of alumina from 2050°C to ~950°C and increases electrical conductivity.',
          },
          {
            qNum: 17,
            question: 'State Graham’s law of diffusion or calculate the oxidation state of Fe in [Fe(H₂O)₅(NO)]SO₄ (Brown ring complex).',
            solutionHint: 'In the brown ring complex, NO is in +1 state (nitrosonium ion NO⁺). Fe + 5(0) + 1 - 2 = 0 ⟹ Fe is in +1 oxidation state (d⁷ system).',
          },
          {
            qNum: 24,
            isCompulsory: true,
            question: '(Compulsory) Derive the relation between pH and pOH for an aqueous solution at 298 K.',
            solutionHint: 'Kw = [H₃O⁺][OH⁻] = 1.0 × 10⁻¹⁴ at 298 K. Taking -log₁₀ on both sides: -log Kw = -log[H₃O⁺] + (-log[OH⁻]) ⟹ pKw = pH + pOH = 14.',
          },
        ],
      },
      {
        partTitle: 'PART — III (Conceptual Calculations)',
        instructions: 'Answer any SIX questions. Question No. 33 is compulsory.',
        marksBreakdown: '6 × 3 = 18 Marks',
        questions: [
          {
            qNum: 25,
            question: 'Explain the preparation of Turnbull’s blue and Prussian blue with balanced ionic equations.',
            solutionHint: 'Prussian blue: 4Fe³⁺ + 3[Fe(CN)₆]⁴⁻ → Fe₄[Fe(CN)₆]₃ (Ferric ferrocyanide).\nTurnbull’s blue: 3Fe²⁺ + 2[Fe(CN)₆]³⁻ → Fe₃[Fe(CN)₆]₂ (Ferrous ferricyanide). Both are electronically equivalent via CT.',
          },
          {
            qNum: 33,
            isCompulsory: true,
            question: '(Compulsory) A first-order reaction takes 40 minutes for 75% completion. Calculate the half-life period (t₁/₂) of the reaction.',
            solutionHint: 'For a first-order reaction, time for 75% completion = 2 × t₁/₂.\nTherefore, t₁/₂ = 40 min / 2 = 20 minutes.',
          },
        ],
      },
      {
        partTitle: 'PART — IV (Comprehensive Essay / Mechanisms)',
        instructions: 'Answer ALL questions, choosing either (a) or (b) from each question.',
        marksBreakdown: '5 × 5 = 25 Marks',
        questions: [
          {
            qNum: 34,
            question: 'Question 34 (Either / Or)',
            eitherOr: {
              a: '(a) (i) Describe the postulation of Crystal Field Theory (CFT) for an Octahedral complex (3M).\n(ii) Why are transition metal complexes generally colored? Explain d-d transition (2M).',
              b: '(b) (i) Explain the mechanism of Aldol condensation of acetaldehyde with sodium hydroxide (3M).\n(ii) How is benzyl alcohol converted to benzoic acid using alkaline KMnO₄? (2M)',
            },
            solutionHint: '(a) Six ligands approach along Cartesian axes, splitting d-orbitals into eg (+3/5 Δo) and t2g (-2/5 Δo). Visible photon absorption excites electron between t2g and eg.\n(b) Enolate carbanion attack on carbonyl carbon yields 3-hydroxybutanal, which dehydrates on heating to but-2-enal.',
          },
        ],
      },
    ];
  } else if (s.includes('phys')) {
    return [
      {
        partTitle: 'PART — I (Objective Type)',
        instructions: 'Answer all questions. Choose the most appropriate answer from the given four alternatives.',
        marksBreakdown: '15 × 1 = 15 Marks',
        questions: [
          {
            qNum: 1,
            question: 'Two identical conducting spheres carrying charges +4q and -2q are brought into contact and separated to the same distance. The new electrostatic force compared to the initial force is:',
            options: ['F/8 attractive', 'F/8 repulsive', 'F/4 repulsive', 'F/2 attractive'],
            correctAnswer: 'F/8 repulsive — Initial force F = k(4q)(2q)/r² = 8kq²/r². When touched, each gets (4q - 2q)/2 = q. New force F’ = kq²/r² = F/8 (repulsive).',
          },
          {
            qNum: 2,
            question: 'The electric flux through a closed Gaussian surface enclosing a dipole is:',
            options: ['q / ε₀', '2q / ε₀', 'Zero', '∞'],
            correctAnswer: 'Zero — Net charge inside surface for a dipole is +q + (-q) = 0. By Gauss’s law, Φ_E = q_net / ε₀ = 0.',
          },
          {
            qNum: 3,
            question: 'A cyclotron cannot accelerate which of the following particles?',
            options: ['Protons', 'Alpha particles', 'Electrons', 'Deuterons'],
            correctAnswer: 'Electrons — Due to very small rest mass, electrons quickly reach relativistic speeds where mass increases (m = m₀/√(1-v²/c²)), throwing them out of resonance with RF oscillator.',
          },
        ],
      },
      {
        partTitle: 'PART — II (Short Answers)',
        instructions: 'Answer any SIX questions. Question No. 24 is compulsory.',
        marksBreakdown: '6 × 2 = 12 Marks',
        questions: [
          {
            qNum: 16,
            question: 'State Coulomb’s inverse square law in electrostatics in vector form.',
            solutionHint: 'F⃗₁₂ = (1 / 4πε₀) · (q₁ q₂ / r₁₂²) · r̂₁₂, where r̂₁₂ is the unit vector from q₁ to q₂.',
          },
          {
            qNum: 24,
            isCompulsory: true,
            question: '(Compulsory) A wire of resistance 20 Ω is drawn out so that its length is increased to twice its original length. Calculate its new resistance.',
            solutionHint: 'Volume remains constant: V = A · L = A’ · (2L) ⟹ A’ = A / 2.\nR = ρL/A. New resistance R’ = ρ(2L) / (A/2) = 4(ρL/A) = 4R = 4 × 20 = 80 Ω.',
          },
        ],
      },
      {
        partTitle: 'PART — IV (Long Essays)',
        instructions: 'Answer ALL questions in Either/Or format.',
        marksBreakdown: '5 × 5 = 25 Marks',
        questions: [
          {
            qNum: 34,
            question: 'Question 34 (Either / Or)',
            eitherOr: {
              a: '(a) Obtain the expression for electric field intensity due to an electric dipole at a point on its equatorial plane (5M).',
              b: '(b) Describe the construction, working principle and theory of Cyclotron with a neat labeled schematic (5M).',
            },
            solutionHint: '(a) E⃗_equatorial = - (1 / 4πε₀) · (p⃗ / (r² + a²)^(3/2)) ≈ - p⃗ / (4πε₀ r³) for r >> a.\n(b) Particle moves in dees under B field with frequency f = qB / 2πm, accelerated at dee gap by RF voltage.',
          },
        ],
      },
    ];
  } else {
    // Mathematics
    return [
      {
        partTitle: 'PART — I (Objective Type)',
        instructions: 'Answer all questions. Choose the correct answer from the given four options.',
        marksBreakdown: '20 × 1 = 20 Marks',
        questions: [
          {
            qNum: 1,
            question: 'If |adj(A)| = 25 for a square matrix A of order 3, then |A| is equal to:',
            options: ['±5', '±25', '5', '125'],
            correctAnswer: '±5 — |adj(A)| = |A|^(n-1). Here n = 3, so |A|² = 25 ⟹ |A| = ±5.',
          },
          {
            qNum: 2,
            question: 'The eccentricity of the rectangular hyperbola xy = c² is:',
            options: ['1', '√2', '2', '1/√2'],
            correctAnswer: '√2 — For any rectangular hyperbola, asymptotes are at right angles, e = √(1 + b²/a²) = √(1 + 1) = √2.',
          },
          {
            qNum: 3,
            question: 'The value of ∫₀^(π/2) sin⁴(x) cos²(x) dx is:',
            options: ['π / 32', 'π / 16', '3π / 32', '5π / 64'],
            correctAnswer: 'π / 32 — By Gamma / Beta function: Γ(5/2)Γ(3/2) / (2Γ(4)) = ((3/2)(1/2)√π · (1/2)√π) / (2 · 6) = (3π/8) / 12 = π / 32.',
          },
        ],
      },
      {
        partTitle: 'PART — IV (Comprehensive 5-Mark Questions)',
        instructions: 'Answer all questions in Either / Or format.',
        marksBreakdown: '7 × 5 = 35 Marks',
        questions: [
          {
            qNum: 41,
            question: 'Question 41 (Either / Or)',
            eitherOr: {
              a: '(a) By vector method, prove that cos(α + β) = cos α cos β - sin α sin β (5M).',
              b: '(b) Solve the non-homogeneous linear equations using matrix inversion method: 2x + 3y - z = 9, x + y + z = 9, 3x - y - z = -1 (5M).',
            },
            solutionHint: '(a) Unit vectors â and b̂ in fourth and first quadrants respectively. Use scalar product â · b̂.\n(b) X = A⁻¹ B. Det(A) = -16. A⁻¹ = (1/-16) adj(A). Solution: x = 1, y = 3, z = 5.',
          },
        ],
      },
    ];
  }
}

export const PapersModal: React.FC<PapersModalProps> = ({ type, subject, onClose }) => {
  const { theme } = useApp();
  const isLight = theme === 'light';

  const [activePaperView, setActivePaperView] = useState<{
    paperId: string;
    title: string;
    fileUrl?: string;
    mode: 'prismed' | 'pdf';
  } | null>(null);

  const title = type === 'pta' ? 'PTA QUESTION PAPERS' : 'BOARD EXAM QUESTION PAPERS';
  const subKey = subject.toLowerCase() as 'chemistry' | 'physics' | 'mathematics';
  const papers = INITIAL_PAPERS.filter(
    (p) => p.subject === subKey && (type === 'pta' ? p.id.startsWith('pta') : p.id.startsWith('board'))
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        background: isLight ? 'rgba(238, 242, 248, 0.96)' : 'rgba(0, 0, 0, 0.94)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        color: isLight ? '#111114' : '#F2F2F2',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 32px',
          borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(242, 242, 242, 0.12)',
          background: isLight ? '#FFFFFF' : 'rgba(10, 12, 16, 0.85)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: isLight ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(242,242,242,0.25)',
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
              {subject.toUpperCase()} • {papers.length} OFFICIAL PAPERS LOADED
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
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* ── Papers Grid List ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: '20px',
          alignContent: 'start',
        }}
      >
        {papers.map((paper) => (
          <div
            key={paper.id}
            style={{
              background: isLight
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 245, 255, 0.88))'
                : 'linear-gradient(135deg, rgba(16,16,16,0.92), rgba(28,28,28,0.76))',
              border: isLight ? '1.5px solid rgba(0, 0, 0, 0.14)' : '1px solid rgba(242,242,242,0.14)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: isLight
                ? '0 12px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)'
                : '0 12px 30px rgba(0,0,0,0.4)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    color: isLight ? '#6B7280' : 'rgba(242,242,242,0.4)',
                  }}
                >
                  {paper.yearOrType}
                </span>
                {paper.answerKeyUrl && (
                  <span
                    style={{
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '9px',
                      color: isLight ? '#059669' : '#4ADE80',
                      background: isLight ? 'rgba(16,185,129,0.12)' : 'transparent',
                      border: isLight ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(74,222,128,0.3)',
                      borderRadius: '10px',
                      padding: '2px 8px',
                      letterSpacing: '0.5px',
                      fontWeight: 600,
                    }}
                  >
                    OFFICIAL KEY
                  </span>
                )}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '18px',
                  letterSpacing: '1.5px',
                  margin: '8px 0 16px',
                  color: isLight ? '#111114' : '#FFFFFF',
                }}
              >
                {paper.title}
              </h3>
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  fontFamily: 'var(--font-content)',
                  fontSize: '13px',
                  color: isLight ? '#4B5563' : 'rgba(242,242,242,0.6)',
                }}
              >
                <span>Questions: {paper.questionCount}</span>
                <span>Duration: {paper.duration}</span>
                <span>Max Marks: {paper.marks}</span>
              </div>
            </div>

            {/* Action Buttons: Prismed Mode vs PDF View */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
              <button
                onClick={() =>
                  setActivePaperView({
                    paperId: paper.id,
                    title: paper.title,
                    fileUrl: paper.fileUrl,
                    mode: 'prismed',
                  })
                }
                style={{
                  flex: 1.2,
                  background: isLight ? '#111114' : '#38BDF8',
                  color: isLight ? '#FFFFFF' : '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                ✨ PRISMED MODE
              </button>

              {paper.fileUrl && (
                <button
                  onClick={() =>
                    setActivePaperView({
                      paperId: paper.id,
                      title: paper.title,
                      fileUrl: paper.fileUrl,
                      mode: 'pdf',
                    })
                  }
                  style={{
                    flex: 1,
                    background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                    color: isLight ? '#111114' : '#F2F2F2',
                    border: isLight ? '1.5px solid rgba(0,0,0,0.18)' : '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                  }}
                >
                  📄 PDF VIEW
                </button>
              )}

              {paper.answerKeyUrl && (
                <button
                  onClick={() =>
                    setActivePaperView({
                      paperId: paper.id,
                      title: `${paper.title} — Official Answer Key`,
                      fileUrl: paper.answerKeyUrl,
                      mode: 'pdf',
                    })
                  }
                  style={{
                    background: isLight ? 'rgba(16, 185, 129, 0.12)' : 'rgba(74, 222, 128, 0.12)',
                    color: isLight ? '#065F46' : '#4ADE80',
                    border: isLight ? '1.5px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(74, 222, 128, 0.35)',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  KEY
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── In-App Fullscreen Paper Viewer (Prismed Mode & PDF Overlay) ── */}
      {activePaperView && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5000,
            background: isLight ? 'rgba(238, 242, 248, 0.98)' : 'rgba(4, 6, 10, 0.96)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Viewer Top Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 28px',
              borderBottom: isLight ? '1px solid rgba(0,0,0,0.12)' : '1px solid rgba(242,242,242,0.15)',
              background: isLight ? '#FFFFFF' : '#0a0a0e',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setActivePaperView(null)}
                style={{
                  background: 'none',
                  border: isLight ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(242,242,242,0.3)',
                  borderRadius: '6px',
                  color: isLight ? '#111114' : '#F2F2F2',
                  padding: '6px 14px',
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                ← CLOSE
              </button>
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '14px',
                    letterSpacing: '1px',
                    color: isLight ? '#111114' : '#F2F2F2',
                  }}
                >
                  {activePaperView.title}
                </span>
              </div>
            </div>

            {/* Toggle between Prismed Mode and Standard PDF */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '4px', background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', padding: '3px', borderRadius: '8px' }}>
                <button
                  onClick={() => setActivePaperView((prev) => (prev ? { ...prev, mode: 'prismed' } : null))}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    background: activePaperView.mode === 'prismed' ? (isLight ? '#111114' : '#38BDF8') : 'transparent',
                    color: activePaperView.mode === 'prismed' ? (isLight ? '#FFFFFF' : '#000000') : (isLight ? '#6B7280' : 'rgba(242,242,242,0.6)'),
                    fontWeight: 700,
                  }}
                >
                  ✨ PRISMED MODE
                </button>
                {activePaperView.fileUrl && (
                  <button
                    onClick={() => setActivePaperView((prev) => (prev ? { ...prev, mode: 'pdf' } : null))}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      background: activePaperView.mode === 'pdf' ? (isLight ? '#111114' : '#38BDF8') : 'transparent',
                      color: activePaperView.mode === 'pdf' ? (isLight ? '#FFFFFF' : '#000000') : (isLight ? '#6B7280' : 'rgba(242,242,242,0.6)'),
                      fontWeight: 700,
                    }}
                  >
                    📄 STANDARD PDF
                  </button>
                )}
              </div>

              {activePaperView.fileUrl && (
                <a
                  href={activePaperView.fileUrl}
                  download
                  style={{
                    background: isLight ? '#111114' : '#F2F2F2',
                    color: isLight ? '#FFFFFF' : '#000000',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    textDecoration: 'none',
                    fontWeight: 700,
                  }}
                >
                  DOWNLOAD
                </a>
              )}
            </div>
          </div>

          {/* Mode View: Prismed Mode vs Raw PDF */}
          {activePaperView.mode === 'pdf' && activePaperView.fileUrl ? (
            <iframe
              src={activePaperView.fileUrl}
              title={activePaperView.title}
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#1a1a1a',
              }}
            />
          ) : (
            /* ✨ PRISMED MODE: Liquid Glass Translucent Sheet */
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '40px 24px',
              }}
            >
              <div
                style={{
                  maxWidth: '860px',
                  margin: '0 auto',
                  background: isLight
                    ? 'rgba(255, 255, 255, 0.94)'
                    : 'rgba(14, 18, 28, 0.88)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: isLight ? '1.5px solid rgba(0, 0, 0, 0.14)' : '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '24px',
                  padding: '48px',
                  boxShadow: isLight
                    ? '0 20px 50px rgba(0, 0, 0, 0.08), inset 0 1px 0 #FFFFFF'
                    : '0 24px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px',
                }}
              >
                {/* Official Exam Sheet Masthead */}
                <div style={{ textAlign: 'center', borderBottom: isLight ? '2px solid rgba(0,0,0,0.1)' : '2px solid rgba(255,255,255,0.1)', paddingBottom: '24px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', letterSpacing: '2px', opacity: 0.7 }}>
                    GOVERNMENT OF TAMIL NADU • DEPARTMENT OF GOVERNMENT EXAMINATIONS
                  </span>
                  <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', letterSpacing: '3px', margin: '8px 0 12px', color: isLight ? '#111114' : '#FFFFFF' }}>
                    {activePaperView.title.toUpperCase()}
                  </h1>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', fontSize: '13px', fontFamily: 'monospace', opacity: 0.8 }}>
                    <span>TIME ALLOWED: 3.00 HOURS</span>
                    <span>•</span>
                    <span>MAXIMUM MARKS: 70</span>
                  </div>
                </div>

                {/* Render Sections (Part I, II, III, IV) */}
                {getPrismedPaperContent(subject, activePaperView.title).map((section, sIdx) => (
                  <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Section Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', letterSpacing: '1.5px', margin: 0, color: isLight ? '#0077EE' : '#38BDF8' }}>
                        {section.partTitle}
                      </h3>
                      <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700 }}>
                        {section.marksBreakdown}
                      </span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-content)', fontSize: '13px', fontStyle: 'italic', opacity: 0.75, margin: 0 }}>
                      {section.instructions}
                    </p>

                    {/* Questions in Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '8px' }}>
                      {section.questions.map((q) => (
                        <div
                          key={q.qNum}
                          style={{
                            background: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
                            border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '12px',
                            padding: '16px 20px',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: q.isCompulsory ? '#EC4899' : isLight ? '#111114' : '#38BDF8',
                                background: q.isCompulsory ? (isLight ? 'rgba(236,72,153,0.12)' : 'rgba(236,72,153,0.2)') : 'transparent',
                                padding: q.isCompulsory ? '2px 6px' : '0',
                                borderRadius: '4px',
                              }}
                            >
                              {q.qNum}.
                            </span>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontFamily: 'var(--font-content)', fontSize: '15px', lineHeight: 1.5, margin: '0 0 10px', color: isLight ? '#111114' : '#FFFFFF' }}>
                                {q.question}
                              </p>

                              {/* MCQ Options */}
                              {q.options && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                                  {q.options.map((opt, oIdx) => (
                                    <div
                                      key={oIdx}
                                      style={{
                                        fontSize: '13px',
                                        fontFamily: 'var(--font-content)',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                                        border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.08)',
                                      }}
                                    >
                                      <strong>{['(A)', '(B)', '(C)', '(D)'][oIdx]}</strong> {opt}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Either / Or */}
                              {q.eitherOr && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0 12px' }}>
                                  <div style={{ padding: '10px', borderRadius: '6px', background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.04)', border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-content)', fontSize: '14px', lineHeight: 1.5 }}>
                                    {q.eitherOr.a}
                                  </div>
                                  <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, opacity: 0.6 }}>
                                    [ OR ]
                                  </div>
                                  <div style={{ padding: '10px', borderRadius: '6px', background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.04)', border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-content)', fontSize: '14px', lineHeight: 1.5 }}>
                                    {q.eitherOr.b}
                                  </div>
                                </div>
                              )}

                              {/* Solution Hint / Verified Key */}
                              {(q.correctAnswer || q.solutionHint) && (
                                <div
                                  style={{
                                    marginTop: '8px',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    background: isLight ? 'rgba(16,185,129,0.08)' : 'rgba(34,197,94,0.12)',
                                    border: isLight ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(34,197,94,0.25)',
                                    fontSize: '12px',
                                    fontFamily: 'var(--font-content)',
                                    color: isLight ? '#065F46' : '#86EFAC',
                                  }}
                                >
                                  <strong>✓ KEY / SCHEME:</strong> {q.correctAnswer || q.solutionHint}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default PapersModal;
