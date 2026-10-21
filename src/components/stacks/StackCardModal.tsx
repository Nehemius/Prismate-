import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { StackCard, CardType } from '../../types/stacks';

interface StackCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardData: Omit<StackCard, 'id' | 'classId'>, existingId?: string) => void;
  onDelete?: (cardId: string) => void;
  initialCard?: StackCard | null;
  classNameTitle?: string;
}

const CARD_TYPES: CardType[] = ['CONCEPT', 'FORMULA', 'SIMULATION', 'PROOF', 'PROBLEM'];
const ACCENT_COLORS = [
  '#33F0FF',
  '#00B8FF',
  '#0055FF',
  '#00F5A0',
  '#FFB800',
  '#FF3366',
  '#FFFFFF',
];

const StackCardModalInner: React.FC<Omit<StackCardModalProps, 'isOpen'>> = ({
  onClose,
  onSave,
  onDelete,
  initialCard,
  classNameTitle,
}) => {
  const [title, setTitle] = useState(() => initialCard?.title || '');
  const [subtitle, setSubtitle] = useState(() => initialCard?.subtitle || '');
  const [cardType, setCardType] = useState<CardType>(() => initialCard?.cardType || 'CONCEPT');
  const [formulaLatex, setFormulaLatex] = useState(() => initialCard?.formulaLatex || '');
  const [summary, setSummary] = useState(() => initialCard?.summary || '');
  const [detailedNotes, setDetailedNotes] = useState(() => initialCard?.detailedNotes || '');
  const [keyTakeawaysText, setKeyTakeawaysText] = useState(() =>
    initialCard?.keyTakeaways ? initialCard.keyTakeaways.join('\n') : ''
  );
  const [tagsText, setTagsText] = useState(() =>
    initialCard?.tags ? initialCard.tags.join(', ') : ''
  );
  const [masteryLevel, setMasteryLevel] = useState<1 | 2 | 3>(() => initialCard?.masteryLevel || 1);
  const [accentColor, setAccentColor] = useState(() => initialCard?.accentColor || '#33F0FF');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const keyTakeaways = keyTakeawaysText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = tagsText
      .split(',')
      .map((s) => s.trim().replace(/^#/, ''))
      .filter(Boolean);

    onSave(
      {
        title: title.trim(),
        subtitle: subtitle.trim(),
        cardType,
        formulaLatex: formulaLatex.trim() || undefined,
        summary: summary.trim(),
        detailedNotes: detailedNotes.trim() || summary.trim(),
        keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : [title.trim()],
        tags: tags.length > 0 ? tags : ['stem'],
        masteryLevel,
        accentColor,
      },
      initialCard?.id
    );
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: '#0D0D0E',
            border: '1px solid rgba(242, 242, 242, 0.22)',
            borderRadius: '16px',
            padding: '26px 30px',
            maxWidth: '520px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95)',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: 'rgba(242, 242, 242, 0.5)',
                  textTransform: 'uppercase',
                }}
              >
                {classNameTitle ? `STACK • ${classNameTitle}` : 'STACK CARD ENGINE'}
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '18px',
                  letterSpacing: '2px',
                  color: '#FFFFFF',
                  margin: '4px 0 0',
                  textTransform: 'uppercase',
                }}
              >
                {initialCard ? 'EDIT 3D CARD' : 'ADD NEW 3D CARD'}
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(242, 242, 242, 0.5)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Title & Subtitle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
              <div>
                <label
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: 'rgba(242, 242, 242, 0.65)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  CARD TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Jahn-Teller Distortion"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#141416',
                    border: '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '12px',
                    color: '#FFFFFF',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: 'rgba(242, 242, 242, 0.65)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  SUBTITLE / TOPIC
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. d9 Cu(II) Complexes"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#141416',
                    border: '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '12px',
                    color: '#FFFFFF',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Card Type Selector */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                CARD TYPE
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {CARD_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCardType(t)}
                    style={{
                      background: cardType === t ? '#FFFFFF' : 'rgba(242, 242, 242, 0.06)',
                      color: cardType === t ? '#000000' : 'rgba(242, 242, 242, 0.75)',
                      border: '1px solid',
                      borderColor: cardType === t ? '#FFFFFF' : 'rgba(242, 242, 242, 0.16)',
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '10px',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Formula Snippet */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                FORMULA / EQUATION (LATEX / CODE)
              </label>
              <input
                type="text"
                value={formulaLatex}
                onChange={(e) => setFormulaLatex(e.target.value)}
                placeholder="e.g. CFSE = (-0.4 p + 0.6 q)Δo"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#141416',
                  border: '1px solid rgba(242, 242, 242, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#33F0FF',
                  outline: 'none',
                }}
              />
            </div>

            {/* Summary */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                SUMMARY (FRONT FACE) *
              </label>
              <textarea
                rows={2}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Crisp overview displayed on the front face of the 3D card..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#141416',
                  border: '1px solid rgba(242, 242, 242, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  color: '#FFFFFF',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            {/* Detailed Notes */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                DETAILED STUDY NOTES
              </label>
              <textarea
                rows={2}
                value={detailedNotes}
                onChange={(e) => setDetailedNotes(e.target.value)}
                placeholder="Comprehensive study notes for deep review..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#141416',
                  border: '1px solid rgba(242, 242, 242, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  color: '#FFFFFF',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            {/* Key Takeaways */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                KEY TAKEAWAYS (ONE PER LINE - BACK FACE)
              </label>
              <textarea
                rows={3}
                value={keyTakeawaysText}
                onChange={(e) => setKeyTakeawaysText(e.target.value)}
                placeholder="High-spin d9 has degenerate eg orbitals&#10;Axial bonds elongate to lift orbital degeneracy&#10;Strong distortion observed in Cu(II) octahedral complexes"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#141416',
                  border: '1px solid rgba(242, 242, 242, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  color: '#FFFFFF',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            {/* Mastery Level & Tags */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: 'rgba(242, 242, 242, 0.65)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  MASTERY LEVEL
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {([1, 2, 3] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setMasteryLevel(lvl)}
                      style={{
                        flex: 1,
                        background: masteryLevel === lvl ? '#FFFFFF' : 'rgba(242, 242, 242, 0.06)',
                        color: masteryLevel === lvl ? '#000000' : 'rgba(242, 242, 242, 0.75)',
                        border: '1px solid',
                        borderColor: masteryLevel === lvl ? '#FFFFFF' : 'rgba(242, 242, 242, 0.16)',
                        borderRadius: '6px',
                        padding: '6px',
                        fontFamily: 'var(--font-subheading)',
                        fontSize: '10px',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      LVL {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: 'rgba(242, 242, 242, 0.65)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  TAGS (COMMA-SEPARATED)
                </label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="isomerism, cfse, cu2+"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: '#141416',
                    border: '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    color: '#FFFFFF',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                CARD ACCENT
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAccentColor(c)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: c,
                      border: accentColor === c ? '2px solid #FFFFFF' : '1px solid rgba(0,0,0,0.4)',
                      boxShadow: accentColor === c ? `0 0 8px ${c}` : 'none',
                      cursor: 'pointer',
                      transform: accentColor === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              {initialCard && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete card "${initialCard.title}"?`)) {
                      onDelete(initialCard.id);
                      onClose();
                    }
                  }}
                  style={{
                    background: 'rgba(255, 60, 60, 0.12)',
                    border: '1px solid rgba(255, 60, 60, 0.35)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    color: '#FF6B6B',
                    cursor: 'pointer',
                  }}
                >
                  DELETE CARD
                </button>
              ) : (
                <div />
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                    fontWeight: 700,
                    color: '#000000',
                    cursor: 'pointer',
                  }}
                >
                  {initialCard ? 'SAVE CARD' : 'ADD TO STACK'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const StackCardModal: React.FC<StackCardModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <StackCardModalInner key={props.initialCard?.id || 'new'} {...props} />;
};

export default StackCardModal;
