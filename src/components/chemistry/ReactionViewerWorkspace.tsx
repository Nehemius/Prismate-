import React, { useState, useMemo } from "react";
import { CHAPTERS, REACTION_CONCEPTS, type ReactionConcept } from "../../data/chemistryData";
import MoleculeViewer from "./MoleculeViewer";
import ReagentAtomViewer from "./ReagentAtomViewer";
import {
  FlaskConical,
  RotateCw,
  Search,
  Sparkles,
  BookOpen,
  Award,
  HelpCircle,
  X,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

function renderSubscripts(text: string) {
  if (!text) return null;
  const parts = text.split(/([A-Za-z)\]]\d+)/g);
  return parts.map((part, index) => {
    const match = part.match(/^([A-Za-z)\]])(\d+)$/);
    if (match) {
      return (
        <React.Fragment key={index}>
          {match[1]}
          <sub style={{ fontSize: '0.7em', bottom: '-0.2em', position: 'relative' }}>{match[2]}</sub>
        </React.Fragment>
      );
    }
    return part;
  });
}

function shuffleOptions(options: string[], seedStr: string): string[] {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const result = [...options];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.abs((hash + i * 31) % (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

interface ReactionViewerWorkspaceProps {
  onBack?: () => void;
}

export const ReactionViewerWorkspace: React.FC<ReactionViewerWorkspaceProps> = ({ onBack }) => {
  const [selectedChapter, setSelectedChapter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReaction, setSelectedReaction] = useState<ReactionConcept>(REACTION_CONCEPTS[0]);
  const [isReactionProceeded, setIsReactionProceeded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  // Quiz Modal State
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const filteredReactions = REACTION_CONCEPTS.filter((rx) => {
    const matchesChapter = selectedChapter === "all" || rx.chapterId === selectedChapter;
    const matchesSearch =
      rx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.reagents.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.iupac_product_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChapter && matchesSearch;
  });

  const quizQuestions = useMemo(() => [
    {
      question: `What is the primary mechanism type for "${selectedReaction.name}"?`,
      options: shuffleOptions([
        selectedReaction.mechanism_type,
        "Nucleophilic Acyl Substitution",
        "Free Radical Halogenation",
        "E1cB Elimination",
      ], selectedReaction.id + "-1"),
      correctAnswer: selectedReaction.mechanism_type,
    },
    {
      question: `Which operational reagents drive this chemical transformation?`,
      options: shuffleOptions([
        selectedReaction.reagents,
        "Concentrated H2SO4 at 170°C",
        "Anhydrous AlCl3 + Cl2",
        "LiAlH4 in dry ether",
      ], selectedReaction.id + "-2"),
      correctAnswer: selectedReaction.reagents,
    },
    {
      question: `What is the systematic IUPAC name of the isolated final product?`,
      options: shuffleOptions([
        selectedReaction.iupac_product_name,
        "2-methylbut-2-ene",
        "Ethanol",
        "1,2-dichloroethane",
      ], selectedReaction.id + "-3"),
      correctAnswer: selectedReaction.iupac_product_name,
    },
  ], [selectedReaction]);

  const handleNextQuiz = () => {
    if (selectedAnswer === null) return;
    const isCorrect =
      quizQuestions[currentQIndex].options[selectedAnswer] === quizQuestions[currentQIndex].correctAnswer;
    if (isCorrect) setQuizScore((prev) => prev + 1);

    if (currentQIndex + 1 < quizQuestions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        color: '#F2F2F2',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <header
        style={{
          height: '60px',
          borderBottom: '1px solid rgba(242,242,242,0.12)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(10, 10, 12, 0.72)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'rgba(242,242,242,0.06)',
                border: '1px solid rgba(242,242,242,0.18)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#F2F2F2',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(242,242,242,0.14)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(242,242,242,0.06)')}
            >
              <ArrowLeft style={{ width: '14px', height: '14px' }} />
              <span>BENTO HUB</span>
            </button>
          )}

          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(51, 240, 255, 0.12)',
              border: '1px solid rgba(51, 240, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FlaskConical style={{ width: '18px', height: '18px', color: '#33F0FF' }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '13px',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                margin: 0,
                color: '#FFFFFF',
              }}
            >
              3D Reaction Viewer
            </h1>
            <p
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-subheading)',
                color: 'rgba(242,242,242,0.45)',
                margin: '2px 0 0',
                letterSpacing: '1px',
              }}
            >
              SPATIAL MOLECULAR DYNAMICS ENGINE
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: autoRotate ? '1px solid #33F0FF' : '1px solid rgba(242,242,242,0.15)',
              background: autoRotate ? 'rgba(51, 240, 255, 0.15)' : 'rgba(242,242,242,0.05)',
              color: autoRotate ? '#33F0FF' : 'rgba(242,242,242,0.7)',
              transition: 'all 0.2s ease',
            }}
          >
            <RotateCw
              style={{
                width: '13px',
                height: '13px',
                animation: autoRotate ? 'spin 3s linear infinite' : 'none',
              }}
            />
            <span>ORBIT {autoRotate ? 'ON' : 'PAUSED'}</span>
          </button>

          <button
            onClick={() => setSidePanelOpen(true)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: '#F2F2F2',
              color: '#000000',
              border: 'none',
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
              boxShadow: '0 2px 10px rgba(255,255,255,0.1)',
            }}
          >
            <BookOpen style={{ width: '13px', height: '13px' }} />
            <span>MECHANISM SHEET</span>
          </button>
        </div>
      </header>

      {/* ── Main Layout ────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Drawer */}
        <aside
          style={{
            width: '310px',
            borderRight: '1px solid rgba(242,242,242,0.1)',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(8, 8, 10, 0.8)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Search */}
          <div style={{ padding: '12px', borderBottom: '1px solid rgba(242,242,242,0.1)' }}>
            <div style={{ position: 'relative' }}>
              <Search
                style={{
                  width: '14px',
                  height: '14px',
                  position: 'absolute',
                  left: '10px',
                  top: '10px',
                  color: 'rgba(242,242,242,0.4)',
                }}
              />
              <input
                type="text"
                placeholder="Search reactions or reagents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(242,242,242,0.06)',
                  border: '1px solid rgba(242,242,242,0.12)',
                  borderRadius: '8px',
                  padding: '8px 10px 8px 32px',
                  fontSize: '12px',
                  color: '#F2F2F2',
                  outline: 'none',
                  fontFamily: 'var(--font-content)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Chapter Filter Pills */}
          <div
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid rgba(242,242,242,0.1)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <button
              onClick={() => setSelectedChapter('all')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '10px',
                fontFamily: 'var(--font-subheading)',
                letterSpacing: '1px',
                cursor: 'pointer',
                border: selectedChapter === 'all' ? '1px solid #33F0FF' : '1px solid rgba(242,242,242,0.1)',
                background: selectedChapter === 'all' ? '#33F0FF' : 'rgba(242,242,242,0.04)',
                color: selectedChapter === 'all' ? '#000000' : 'rgba(242,242,242,0.6)',
                fontWeight: selectedChapter === 'all' ? 700 : 400,
              }}
            >
              ALL
            </button>
            {CHAPTERS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChapter(ch.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-subheading)',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  border: selectedChapter === ch.id ? '1px solid #33F0FF' : '1px solid rgba(242,242,242,0.1)',
                  background: selectedChapter === ch.id ? '#33F0FF' : 'rgba(242,242,242,0.04)',
                  color: selectedChapter === ch.id ? '#000000' : 'rgba(242,242,242,0.6)',
                  fontWeight: selectedChapter === ch.id ? 700 : 400,
                }}
              >
                {ch.name.split(' ')[0].toUpperCase()}
              </button>
            ))}
          </div>

          {/* Reaction Cards List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredReactions.map((rx) => {
              const active = selectedReaction.id === rx.id;
              return (
                <button
                  key={rx.id}
                  onClick={() => {
                    setSelectedReaction(rx);
                    setIsReactionProceeded(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: active ? '1px solid #33F0FF' : '1px solid rgba(242,242,242,0.08)',
                    background: active
                      ? 'linear-gradient(135deg, rgba(51, 240, 255, 0.15), rgba(10, 10, 12, 0.8))'
                      : 'rgba(242,242,242,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 0 14px rgba(51, 240, 255, 0.15)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '9px',
                        fontFamily: 'var(--font-subheading)',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        color: active ? '#33F0FF' : 'rgba(242,242,242,0.45)',
                      }}
                    >
                      CLASS {rx.class_grade} • {rx.reaction_type}
                    </span>
                    {rx.is_secret_achievement && (
                      <Award style={{ width: '13px', height: '13px', color: '#FFD700' }} />
                    )}
                  </div>
                  <h4
                    style={{
                      fontSize: '12px',
                      fontFamily: 'var(--font-heading)',
                      letterSpacing: '1px',
                      margin: 0,
                      color: active ? '#FFFFFF' : '#E6E6E6',
                      lineHeight: 1.3,
                    }}
                  >
                    {rx.name}
                  </h4>
                  <p
                    style={{
                      fontSize: '10.5px',
                      fontFamily: 'var(--font-content)',
                      color: 'rgba(242,242,242,0.4)',
                      margin: '4px 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {rx.reagents}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Canvas */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
          {/* Reaction Header & Proceed Button */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(51, 240, 255, 0.15)',
                    border: '1px solid rgba(51, 240, 255, 0.3)',
                    fontSize: '10px',
                    fontFamily: 'var(--font-subheading)',
                    letterSpacing: '1px',
                    color: '#33F0FF',
                    textTransform: 'uppercase',
                  }}
                >
                  {selectedReaction.reaction_type} Reaction
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-content)',
                    color: 'rgba(242,242,242,0.5)',
                  }}
                >
                  Mechanism: {selectedReaction.mechanism_type}
                </span>
              </div>
              <h2
                style={{
                  fontSize: '24px',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '2px',
                  color: '#FFFFFF',
                  margin: 0,
                }}
              >
                {selectedReaction.name}
              </h2>
              <p
                style={{
                  fontSize: '12.5px',
                  fontFamily: 'var(--font-content)',
                  color: 'rgba(242,242,242,0.7)',
                  marginTop: '6px',
                  maxWidth: '780px',
                  lineHeight: 1.5,
                }}
              >
                {renderSubscripts(selectedReaction.description)}
              </p>
            </div>

            <button
              onClick={() => setIsReactionProceeded(!isReactionProceeded)}
              style={{
                padding: '12px 22px',
                borderRadius: '12px',
                fontFamily: 'var(--font-heading)',
                fontSize: '12px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: isReactionProceeded ? '1px solid #10B981' : '1px solid #33F0FF',
                background: isReactionProceeded
                  ? '#10B981'
                  : 'linear-gradient(135deg, #FFFFFF, #E6FFFF)',
                color: '#000000',
                boxShadow: isReactionProceeded
                  ? '0 0 20px rgba(16, 185, 129, 0.4)'
                  : '0 0 20px rgba(51, 240, 255, 0.3)',
                transition: 'all 0.3s ease',
              }}
            >
              <Sparkles style={{ width: '16px', height: '16px' }} />
              <span>{isReactionProceeded ? 'RESET REACTION' : 'PROCEED REACTION'}</span>
            </button>
          </div>

          {/* 3D Equation View: 1. Substrate | 2. Reagent | 3. Product */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '18px',
              flex: 1,
              minHeight: '360px',
            }}
          >
            {/* 1. Substrate */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(14, 14, 18, 0.65)',
                border: '1px solid rgba(242,242,242,0.12)',
                borderRadius: '16px',
                padding: '16px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-subheading)',
                    letterSpacing: '1.5px',
                    color: 'rgba(242,242,242,0.5)',
                  }}
                >
                  1. SUBSTRATE
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '1px',
                    color: '#33F0FF',
                    textTransform: 'uppercase',
                  }}
                >
                  {selectedReaction.reactant_sdf.replace(/-/g, ' ')}
                </span>
              </div>
              <div style={{ flex: 1, width: '100%', minHeight: '260px', borderRadius: '12px', overflow: 'hidden' }}>
                <MoleculeViewer
                  sdfName={selectedReaction.reactant_sdf}
                  viewerId={`reactant-${selectedReaction.id}`}
                  autoRotate={autoRotate}
                />
              </div>
            </div>

            {/* 2. Catalyst / Reagent */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(14, 14, 18, 0.65)',
                border: '1px solid rgba(242,242,242,0.12)',
                borderRadius: '16px',
                padding: '16px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-subheading)',
                    letterSpacing: '1.5px',
                    color: 'rgba(242,242,242,0.5)',
                  }}
                >
                  2. CATALYST / REAGENT
                </span>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontFamily: 'var(--font-content)',
                    color: 'rgba(242,242,242,0.6)',
                  }}
                >
                  {selectedReaction.conditions}
                </span>
              </div>
              <div style={{ flex: 1, width: '100%', minHeight: '260px', borderRadius: '12px', overflow: 'hidden' }}>
                <ReagentAtomViewer
                  symbol={selectedReaction.reagents.split(' ')[0]}
                  reactionId={selectedReaction.id}
                />
              </div>
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '1px',
                    color: '#F2F2F2',
                  }}
                >
                  {renderSubscripts(selectedReaction.reagents)}
                </span>
              </div>
            </div>

            {/* 3. Isolated Product */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: isReactionProceeded
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'rgba(14, 14, 18, 0.65)',
                border: isReactionProceeded
                  ? '1px solid rgba(16, 185, 129, 0.5)'
                  : '1px solid rgba(242,242,242,0.12)',
                borderRadius: '16px',
                padding: '16px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.5s ease',
                boxShadow: isReactionProceeded
                  ? '0 0 24px rgba(16, 185, 129, 0.2)'
                  : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-subheading)',
                    letterSpacing: '1.5px',
                    color: isReactionProceeded ? '#10B981' : 'rgba(242,242,242,0.5)',
                    fontWeight: 700,
                  }}
                >
                  3. ISOLATED PRODUCT
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '1px',
                    color: isReactionProceeded ? '#10B981' : '#FFFFFF',
                  }}
                >
                  {selectedReaction.iupac_product_name}
                </span>
              </div>
              <div style={{ flex: 1, width: '100%', minHeight: '260px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                <MoleculeViewer
                  sdfName={selectedReaction.product_sdf}
                  viewerId={`product-${selectedReaction.id}`}
                  autoRotate={autoRotate}
                />
              </div>
            </div>
          </div>

          {/* Equation Box + Test Knowledge Button */}
          <div
            style={{
              marginTop: '20px',
              padding: '16px 20px',
              borderRadius: '14px',
              background: 'rgba(14, 14, 18, 0.8)',
              border: '1px solid rgba(242,242,242,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontFamily: 'var(--font-subheading)',
                  color: 'rgba(242,242,242,0.45)',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Balanced Chemical Equation
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '14px',
                  letterSpacing: '1px',
                  color: '#FFFFFF',
                }}
              >
                {renderSubscripts(selectedReaction.balanced_equation)}
              </div>
            </div>

            <button
              onClick={() => {
                setQuizOpen(true);
                setQuizFinished(false);
                setCurrentQIndex(0);
                setQuizScore(0);
                setSelectedAnswer(null);
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: '#F2F2F2',
                color: '#000000',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <HelpCircle style={{ width: '14px', height: '14px' }} />
              <span>TEST KNOWLEDGE</span>
            </button>
          </div>
        </main>
      </div>

      {/* ── Mechanism Sheet Drawer ─────────────────────────── */}
      {sidePanelOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: '#0a0a0c',
              borderLeft: '1px solid rgba(242,242,242,0.18)',
              height: '100%',
              overflowY: 'auto',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(242,242,242,0.12)', paddingBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '2px', color: '#33F0FF' }}>
                    MOLECULAR DYNAMICS SHEET
                  </span>
                  <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', letterSpacing: '2px', color: '#FFFFFF', margin: '4px 0 0' }}>
                    {selectedReaction.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSidePanelOpen(false)}
                  style={{
                    background: 'rgba(242,242,242,0.08)',
                    border: '1px solid rgba(242,242,242,0.15)',
                    borderRadius: '8px',
                    padding: '6px',
                    color: '#F2F2F2',
                    cursor: 'pointer',
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>

              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '1.5px', color: 'rgba(242,242,242,0.45)', display: 'block', marginBottom: '6px' }}>
                  BALANCED EQUATION
                </span>
                <div style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(242,242,242,0.04)', border: '1px solid rgba(242,242,242,0.1)', fontFamily: 'var(--font-heading)', fontSize: '12px', color: '#FFFFFF' }}>
                  {renderSubscripts(selectedReaction.balanced_equation)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '1.5px', color: 'rgba(242,242,242,0.45)', display: 'block', marginBottom: '6px' }}>
                  STEP-BY-STEP MECHANISM
                </span>
                <div style={{ fontSize: '12.5px', color: 'rgba(242,242,242,0.85)', lineHeight: 1.6, fontFamily: 'var(--font-content)', background: 'rgba(242,242,242,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(242,242,242,0.08)', whiteSpace: 'pre-line' }}>
                  {renderSubscripts(selectedReaction.reaction_mechanisms)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '1.5px', color: 'rgba(242,242,242,0.45)', display: 'block', marginBottom: '6px' }}>
                  STERIC & INDUCTIVE EFFECTS
                </span>
                <p style={{ fontSize: '12px', color: 'rgba(242,242,242,0.7)', lineHeight: 1.5, fontFamily: 'var(--font-content)', margin: 0 }}>
                  {renderSubscripts(selectedReaction.structural_effects)}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '1.5px', color: 'rgba(242,242,242,0.45)', display: 'block', marginBottom: '6px' }}>
                  IUPAC DERIVATION
                </span>
                <div style={{ fontSize: '12px', color: 'rgba(242,242,242,0.7)', lineHeight: 1.5, fontFamily: 'var(--font-content)', background: 'rgba(242,242,242,0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(242,242,242,0.08)', whiteSpace: 'pre-line' }}>
                  {renderSubscripts(selectedReaction.iupac_derivation)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '1.5px', color: 'rgba(242,242,242,0.45)', display: 'block', marginBottom: '6px' }}>
                  INDUSTRIAL & LAB USES
                </span>
                <p style={{ fontSize: '12px', color: 'rgba(242,242,242,0.7)', lineHeight: 1.5, fontFamily: 'var(--font-content)', margin: 0 }}>
                  {renderSubscripts(selectedReaction.uses_applications)}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSidePanelOpen(false);
                setQuizOpen(true);
              }}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: '#33F0FF',
                color: '#000000',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '12px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              TAKE REACTION ASSESSMENT QUIZ
            </button>
          </div>
        </div>
      )}

      {/* ── Quiz Modal ─────────────────────────────────────── */}
      {quizOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#0d0d10',
              border: '1px solid rgba(242,242,242,0.2)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              boxSizing: 'border-box',
            }}
          >
            {!quizFinished ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(242,242,242,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '2px', color: 'rgba(242,242,242,0.45)' }}>
                      QUIZ EVALUATION
                    </span>
                    <h4 style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', letterSpacing: '1px', color: '#FFFFFF', margin: '2px 0 0' }}>
                      {selectedReaction.name}
                    </h4>
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-subheading)', color: '#33F0FF', background: 'rgba(51, 240, 255, 0.1)', border: '1px solid rgba(51, 240, 255, 0.25)', padding: '4px 8px', borderRadius: '6px' }}>
                    Q {currentQIndex + 1} / {quizQuestions.length}
                  </span>
                </div>

                <p style={{ fontSize: '13.5px', color: '#F2F2F2', marginBottom: '16px', fontFamily: 'var(--font-content)', lineHeight: 1.5 }}>
                  {quizQuestions[currentQIndex].question}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {quizQuestions[currentQIndex].options.map((opt, i) => {
                    const isSelected = selectedAnswer === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedAnswer(i)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontFamily: 'var(--font-heading)',
                          letterSpacing: '0.5px',
                          cursor: 'pointer',
                          border: isSelected ? '1px solid #33F0FF' : '1px solid rgba(242,242,242,0.1)',
                          background: isSelected ? '#33F0FF' : 'rgba(242,242,242,0.04)',
                          color: isSelected ? '#000000' : '#F2F2F2',
                          fontWeight: isSelected ? 700 : 400,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setQuizOpen(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(242,242,242,0.5)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-subheading)',
                      cursor: 'pointer',
                      letterSpacing: '1px',
                    }}
                  >
                    CANCEL
                  </button>
                  <button
                    disabled={selectedAnswer === null}
                    onClick={handleNextQuiz}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: '#F2F2F2',
                      color: '#000000',
                      border: 'none',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      cursor: selectedAnswer === null ? 'not-allowed' : 'pointer',
                      opacity: selectedAnswer === null ? 0.35 : 1,
                    }}
                  >
                    {currentQIndex + 1 === quizQuestions.length ? 'FINISH QUIZ' : 'NEXT QUESTION'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 style={{ width: '48px', height: '48px', color: '#10B981', margin: '0 auto 14px' }} />
                <h4 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', letterSpacing: '2px', color: '#FFFFFF', margin: '0 0 6px' }}>
                  ASSESSMENT COMPLETED!
                </h4>
                <p style={{ fontSize: '13px', color: 'rgba(242,242,242,0.6)', fontFamily: 'var(--font-content)', marginBottom: '20px' }}>
                  You scored <strong style={{ color: '#33F0FF' }}>{quizScore}</strong> out of {quizQuestions.length} on {selectedReaction.name}.
                </p>
                <button
                  onClick={() => setQuizOpen(false)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    background: '#F2F2F2',
                    color: '#000000',
                    border: 'none',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  RETURN TO CANVAS
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReactionViewerWorkspace;
