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

const CARD_TYPES: { type: CardType; label: string; icon: string }[] = [
  { type: 'CONCEPT', label: 'Concept', icon: '💡' },
  { type: 'FORMULA', label: 'Formula', icon: '∑' },
  { type: 'WEBSITE', label: 'Website', icon: '🌐' },
  { type: 'YOUTUBE', label: 'YouTube', icon: '▶' },
  { type: 'PICTURE', label: 'Picture', icon: '🖼' },
  { type: 'WIDGET', label: 'Widget', icon: '⚙' },
  { type: 'PDF', label: 'PDF', icon: '📄' },
  { type: 'SIMULATION', label: 'Simulation', icon: '🔬' },
  { type: 'PROOF', label: 'Proof', icon: '📐' },
  { type: 'PROBLEM', label: 'Problem', icon: '✏' },
];

const STARTER_WIDGET_OPTIONS = [
  { id: 'clock', name: 'Cool Time', desc: 'Analog / Digital geometric clock', icon: '⏱' },
  { id: 'pomodoro', name: 'Pomodoro Timer', desc: 'Focus timer with study/break intervals', icon: '⏳' },
  { id: 'todos', name: 'Quote & Tasks', desc: 'Motivational quote & study checklist', icon: '☑' },
  { id: 'pulse', name: 'STEM Pulse', desc: 'Daily science facts and recall tips', icon: '💡' },
  { id: 'formula', name: 'Formula Rotator', desc: 'Rotating high-frequency STEM formulas', icon: '∑' },
  { id: 'diagram', name: 'Diagram Rotator', desc: 'Visual review diagrams & models', icon: '◈' },
  { id: 'quiz', name: 'Active Quiz', desc: 'Fast recall question engine', icon: '⚡' },
  { id: 'studytube', name: 'Studytube', desc: 'Distraction-free STEM study videos', icon: '▶' },
];

const ACCENT_COLORS = [
  '#33F0FF',
  '#00B8FF',
  '#0055FF',
  '#00F5A0',
  '#FFB800',
  '#FF3366',
  '#FFFFFF',
];

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

const StackCardModalInner: React.FC<Omit<StackCardModalProps, 'isOpen'>> = ({
  onClose,
  onSave,
  onDelete,
  initialCard,
  classNameTitle,
}) => {
  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';

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

  // Specialized card type fields
  const [url, setUrl] = useState(() => initialCard?.url || '');
  const [imageUrl, setImageUrl] = useState(() => initialCard?.imageUrl || '');
  const [widgetId, setWidgetId] = useState(() => initialCard?.widgetId || 'clock');
  const [pdfUrl, setPdfUrl] = useState(() => initialCard?.pdfUrl || '');
  const [pdfFileName, setPdfFileName] = useState(() => initialCard?.pdfFileName || '');

  // Handle local image file upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
          if (!title.trim()) {
            setTitle(file.name.replace(/\.[^/.]+$/, ''));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle local PDF file upload
  const handlePdfFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFileName(file.name);
      if (!title.trim()) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPdfUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

    let defaultSummary = summary.trim();
    if (!defaultSummary) {
      if (cardType === 'WEBSITE') defaultSummary = `Web reference link: ${url || 'External Resource'}`;
      else if (cardType === 'YOUTUBE') defaultSummary = `Video lesson: ${title.trim()}`;
      else if (cardType === 'PICTURE') defaultSummary = `Study diagram and visual reference for ${title.trim()}`;
      else if (cardType === 'WIDGET') defaultSummary = `Interactive ${widgetId} starter widget`;
      else if (cardType === 'PDF') defaultSummary = `PDF study material: ${pdfFileName || title.trim()}`;
      else defaultSummary = `Key notes on ${title.trim()}`;
    }

    onSave(
      {
        title: title.trim(),
        subtitle: subtitle.trim(),
        cardType,
        formulaLatex: formulaLatex.trim() || undefined,
        summary: defaultSummary,
        detailedNotes: detailedNotes.trim() || defaultSummary,
        keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : [title.trim()],
        tags: tags.length > 0 ? tags : ['stem'],
        masteryLevel,
        accentColor,
        url: url.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        widgetId: widgetId || undefined,
        pdfUrl: pdfUrl.trim() || undefined,
        pdfFileName: pdfFileName.trim() || undefined,
      },
      initialCard?.id
    );
    onClose();
  };

  const ytId = cardType === 'YOUTUBE' ? getYouTubeVideoId(url) : null;

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
          background: isLight ? 'rgba(0, 0, 0, 0.45)' : 'rgba(0, 0, 0, 0.82)',
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
          className="prismate-modal-card"
          style={{
            background: isLight ? '#FFFFFF' : '#0D0D0E',
            border: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(242, 242, 242, 0.22)',
            borderRadius: '16px',
            padding: '26px 30px',
            maxWidth: '560px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: isLight ? '0 20px 50px rgba(0, 0, 0, 0.12)' : '0 24px 60px rgba(0, 0, 0, 0.95)',
            boxSizing: 'border-box',
            color: isLight ? '#111114' : '#FFFFFF',
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
                  color: isLight ? '#6B7280' : 'rgba(242, 242, 242, 0.5)',
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
                  color: isLight ? '#111114' : '#FFFFFF',
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
                color: isLight ? '#6B7280' : 'rgba(242, 242, 242, 0.5)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Card Type Selector */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                CARD TYPE
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {CARD_TYPES.map((t) => {
                  const isSelected = cardType === t.type;
                  return (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => setCardType(t.type)}
                      style={{
                        background: isSelected
                          ? (isLight ? '#111114' : '#FFFFFF')
                          : (isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(242, 242, 242, 0.06)'),
                        color: isSelected
                          ? (isLight ? '#FFFFFF' : '#000000')
                          : (isLight ? '#374151' : 'rgba(242, 242, 242, 0.75)'),
                        border: '1px solid',
                        borderColor: isSelected
                          ? (isLight ? '#111114' : '#FFFFFF')
                          : (isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(242, 242, 242, 0.16)'),
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontFamily: 'var(--font-subheading)',
                        fontSize: '10px',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Subtitle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
              <div>
                <label
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.65)',
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
                  placeholder="e.g. Chemical Kinetics & Rate Laws"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: isLight ? '#F9FAFB' : '#141416',
                    border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '12px',
                    color: isLight ? '#111114' : '#FFFFFF',
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
                    color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.65)',
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
                  placeholder="e.g. Arrhenius Equation"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: isLight ? '#F9FAFB' : '#141416',
                    border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '12px',
                    color: isLight ? '#111114' : '#FFFFFF',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Specialized Input Fields based on Card Type */}
            {cardType === 'WEBSITE' && (
              <div style={{ background: isLight ? 'rgba(0, 85, 255, 0.05)' : 'rgba(51, 240, 255, 0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(51, 240, 255, 0.2)' }}>
                <label
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: isLight ? '#0055FF' : '#33F0FF',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  🌐 WEBSITE LINK (URL) *
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://en.wikipedia.org/wiki/Chemical_reaction"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: isLight ? '#FFFFFF' : '#141416',
                    border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: isLight ? '#0055FF' : '#33F0FF',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '9px', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.5)', marginTop: '4px', display: 'block' }}>
                  Clicking this card in 3D workspace provides instant direct navigation to the web page.
                </span>
              </div>
            )}

            {cardType === 'YOUTUBE' && (
              <div style={{ background: isLight ? 'rgba(255, 0, 0, 0.04)' : 'rgba(255, 50, 50, 0.06)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 60, 60, 0.2)' }}>
                <label
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: '#FF4444',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  ▶ YOUTUBE VIDEO LINK (URL) *
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: isLight ? '#FFFFFF' : '#141416',
                    border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: isLight ? '#111114' : '#FFFFFF',
                    outline: 'none',
                  }}
                />
                {ytId && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                      alt="YouTube thumbnail preview"
                      style={{ width: '80px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <span style={{ fontSize: '10px', color: isLight ? '#059669' : '#10B981', fontFamily: 'var(--font-subheading)' }}>
                      ✓ Valid YouTube video recognized
                    </span>
                  </div>
                )}
              </div>
            )}

            {cardType === 'PICTURE' && (
              <div style={{ background: isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(242, 242, 242, 0.14)' }}>
                <label
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.65)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  🖼 PICTURE / IMAGE *
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <label
                    style={{
                      background: isLight ? '#111114' : '#FFFFFF',
                      color: isLight ? '#FFFFFF' : '#000000',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '10px',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '10px', color: isLight ? '#9CA3AF' : 'rgba(242,242,242,0.4)' }}>or enter Image URL below:</span>
                </div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/diagram.png (or use file upload above)"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: isLight ? '#FFFFFF' : '#141416',
                    border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: isLight ? '#111114' : '#FFFFFF',
                    outline: 'none',
                  }}
                />
                {imageUrl && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={imageUrl}
                      alt="Thumbnail preview"
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(242,242,242,0.2)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      style={{ background: 'none', border: 'none', color: '#FF6B6B', fontSize: '10px', cursor: 'pointer' }}
                    >
                      Remove Picture
                    </button>
                  </div>
                )}
              </div>
            )}

            {cardType === 'WIDGET' && (
              <div style={{ background: isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.04)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(242, 242, 242, 0.14)' }}>
                <label
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.65)',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  ⚙ CHOOSE STARTER WIDGET TO DISPLAY
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {STARTER_WIDGET_OPTIONS.map((w) => {
                    const isSelected = widgetId === w.id;
                    return (
                      <div
                        key={w.id}
                        onClick={() => setWidgetId(w.id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: isSelected
                            ? (isLight ? '2px solid #0055FF' : '2px solid #33F0FF')
                            : (isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(242, 242, 242, 0.12)'),
                          background: isSelected
                            ? (isLight ? 'rgba(0, 85, 255, 0.08)' : 'rgba(51, 240, 255, 0.12)')
                            : (isLight ? '#FFFFFF' : '#141416'),
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{w.icon}</span>
                        <div>
                          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', fontWeight: 700, color: isLight ? '#111114' : '#FFFFFF' }}>
                            {w.name}
                          </div>
                          <div style={{ fontSize: '9px', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.5)', fontFamily: 'var(--font-content)' }}>
                            {w.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {cardType === 'PDF' && (
              <div style={{ background: isLight ? 'rgba(220, 38, 38, 0.04)' : 'rgba(255, 60, 60, 0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                <label
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: '#DC2626',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  📄 PDF DOCUMENT *
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <label
                    style={{
                      background: '#DC2626',
                      color: '#FFFFFF',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '10px',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>Upload PDF File</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '10px', color: isLight ? '#9CA3AF' : 'rgba(242,242,242,0.4)' }}>or enter web PDF link:</span>
                </div>
                <input
                  type="text"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://example.com/document.pdf"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: isLight ? '#FFFFFF' : '#141416',
                    border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: isLight ? '#111114' : '#FFFFFF',
                    outline: 'none',
                  }}
                />
                {pdfFileName && (
                  <div style={{ marginTop: '6px', fontSize: '10px', color: '#DC2626', fontFamily: 'monospace' }}>
                    Attached: {pdfFileName}
                  </div>
                )}
              </div>
            )}

            {/* Formula Snippet */}
            {(cardType === 'FORMULA' || cardType === 'PROOF') && (
              <div>
                <label
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.65)',
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
                  placeholder="e.g. k = A e^{-E_a / (R T)}"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: isLight ? '#F9FAFB' : '#141416',
                    border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: isLight ? '#0055FF' : '#33F0FF',
                    outline: 'none',
                  }}
                />
              </div>
            )}

            {/* Summary */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                SUMMARY (FRONT FACE)
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Crisp overview displayed on the front face of the 3D card..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isLight ? '#F9FAFB' : '#141416',
                  border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(242, 242, 242, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  color: isLight ? '#111114' : '#FFFFFF',
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
                  color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                KEY TAKEAWAYS (ONE PER LINE - BACK FACE)
              </label>
              <textarea
                rows={2}
                value={keyTakeawaysText}
                onChange={(e) => setKeyTakeawaysText(e.target.value)}
                placeholder="Core definition or derivation step&#10;Key exam trap or high-frequency pitfall&#10;Systematic revision takeaway"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isLight ? '#F9FAFB' : '#141416',
                  border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(242, 242, 242, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  color: isLight ? '#111114' : '#FFFFFF',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            {/* Detailed Notes (Back Face) */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                DETAILED NOTES (BACK FACE)
              </label>
              <textarea
                rows={2}
                value={detailedNotes}
                onChange={(e) => setDetailedNotes(e.target.value)}
                placeholder="Comprehensive explanation, derivations, or memory mnemonics..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: isLight ? '#F9FAFB' : '#141416',
                  border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(242, 242, 242, 0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  color: isLight ? '#111114' : '#FFFFFF',
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
                    color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.65)',
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
                        background: masteryLevel === lvl
                          ? (isLight ? '#111114' : '#FFFFFF')
                          : (isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(242, 242, 242, 0.06)'),
                        color: masteryLevel === lvl
                          ? (isLight ? '#FFFFFF' : '#000000')
                          : (isLight ? '#374151' : 'rgba(242, 242, 242, 0.75)'),
                        border: '1px solid',
                        borderColor: masteryLevel === lvl
                          ? (isLight ? '#111114' : '#FFFFFF')
                          : (isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(242, 242, 242, 0.16)'),
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
                    color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.65)',
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
                  placeholder="chemistry, kinetics, board-exam"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    background: isLight ? '#F9FAFB' : '#141416',
                    border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    color: isLight ? '#111114' : '#FFFFFF',
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
                  color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.65)',
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
                      border: accentColor === c ? (isLight ? '2px solid #111114' : '2px solid #FFFFFF') : '1px solid rgba(0,0,0,0.2)',
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
                    border: isLight ? '1px solid rgba(0, 0, 0, 0.2)' : '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    color: isLight ? '#374151' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  style={{
                    background: isLight ? '#111114' : '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                    fontWeight: 700,
                    color: isLight ? '#FFFFFF' : '#000000',
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
