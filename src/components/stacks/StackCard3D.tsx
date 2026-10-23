import React, { useState } from 'react';
import type { StackCard } from '../../types/stacks';
import MathFormula from './MathFormula';

interface StackCard3DProps {
  card: StackCard;
  transform: {
    x: number;
    y: number;
    z: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    scale: number;
    opacity: number;
  };
  isSelected: boolean;
  isConnecting?: boolean;
  onSelect: (cardId: string) => void;
  onConnectStart?: (cardId: string) => void;
  onEditCard?: (card: StackCard) => void;
}

function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const StackCard3D: React.FC<StackCard3DProps> = ({
  card,
  transform,
  isSelected,
  isConnecting = false,
  onSelect,
  onConnectStart,
  onEditCard,
}) => {
  const [flipped, setFlipped] = useState(false);
  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';

  // 3D positioning applied strictly via transform to maintain preserve-3d hierarchy
  const containerTransform = `translate3d(${transform.x}px, ${transform.y}px, ${transform.z}px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) rotateZ(${transform.rotateZ}deg) scale(${transform.scale})`;

  const ytId = card.cardType === 'YOUTUBE' ? getYouTubeVideoId(card.url) : null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect(card.id);
      }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '210px',
        height: '280px',
        marginLeft: '-105px',
        marginTop: '-140px',
        transform: containerTransform,
        transformStyle: 'preserve-3d',
        cursor: 'pointer',
        transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        opacity: transform.opacity,
        zIndex: isSelected ? 50 : 1,
      }}
    >
      {/* 3D Inner Card flipper */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* ─── FRONT FACE ─── */}
        <div
          className={`stack-card-3d-face stack-card-3d-front ${isSelected ? 'is-selected' : ''}`}
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: '16px',
            background: isSelected
              ? (isLight
                  ? 'rgba(255, 255, 255, 0.94)'
                  : 'linear-gradient(135deg, rgba(28, 28, 32, 0.96), rgba(18, 18, 20, 0.90))')
              : (isLight
                  ? 'rgba(255, 255, 255, 0.84)'
                  : 'linear-gradient(135deg, rgba(16, 16, 18, 0.90), rgba(10, 10, 12, 0.82))'),
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: isSelected
              ? (isLight ? '2px solid #0055FF' : '1.5px solid #FFFFFF')
              : (isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(242, 242, 242, 0.12)'),
            boxShadow: isSelected
              ? (isLight
                  ? '0 0 28px rgba(0, 85, 255, 0.28), inset 0 1px 0 0 #FFFFFF'
                  : '0 0 24px rgba(255, 255, 255, 0.25), inset 0 1px 0 0 rgba(242, 242, 242, 0.35)')
              : (isLight
                  ? '0 12px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.95)'
                  : '0 12px 30px -4px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(242, 242, 242, 0.18)'),
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          {/* Header Tag & Type Badge */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span
                className="card-type-tag"
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '9px',
                  letterSpacing: '2px',
                  color: card.accentColor || (isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.55)'),
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {card.cardType === 'WEBSITE' && '🌐 WEBSITE'}
                {card.cardType === 'YOUTUBE' && '▶ YOUTUBE'}
                {card.cardType === 'PICTURE' && '🖼 PICTURE'}
                {card.cardType === 'WIDGET' && '⚙ WIDGET'}
                {card.cardType === 'PDF' && '📄 PDF'}
                {card.cardType === 'FORMULA' && '∑ FORMULA'}
                {card.cardType === 'CONCEPT' && '💡 CONCEPT'}
                {card.cardType === 'PROOF' && '📐 PROOF'}
                {card.cardType === 'PROBLEM' && '✏ PROBLEM'}
                {card.cardType === 'SIMULATION' && '🔬 SIMULATION'}
              </span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[1, 2, 3].map((lvl) => (
                  <span
                    key={lvl}
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: lvl <= card.masteryLevel
                        ? (card.accentColor || '#33F0FF')
                        : (isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(242, 242, 242, 0.2)'),
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Title & Subtitle */}
            <h3
              className="card-title"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '14px',
                fontWeight: 700,
                color: isLight ? '#111114' : '#FFFFFF',
                lineHeight: 1.25,
                margin: '0 0 3px 0',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {card.title}
            </h3>
            <div
              className="card-subtitle"
              style={{
                fontFamily: 'var(--font-subheading)',
                fontSize: '9.5px',
                letterSpacing: '1px',
                color: isLight ? '#6B7280' : 'rgba(242, 242, 242, 0.65)',
                textTransform: 'uppercase',
                marginBottom: '8px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {card.subtitle}
            </div>
          </div>

          {/* ─── Specialized Centerpiece Rendering based on CardType ─── */}
          {card.cardType === 'WEBSITE' ? (
            <div
              style={{
                margin: 'auto 0',
                padding: '10px',
                borderRadius: '10px',
                background: isLight ? 'rgba(0, 85, 255, 0.05)' : 'rgba(51, 240, 255, 0.08)',
                border: isLight ? '1px solid rgba(0, 85, 255, 0.2)' : '1px solid rgba(51, 240, 255, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: isLight ? '#0055FF' : '#33F0FF', wordBreak: 'break-all', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {card.url || 'https://external-resource.org'}
              </span>
              {card.url && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(card.url, '_blank');
                  }}
                  style={{
                    background: isLight ? '#0055FF' : '#33F0FF',
                    color: isLight ? '#FFFFFF' : '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '9px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '1px',
                  }}
                >
                  VISIT LINK ↗
                </button>
              )}
            </div>
          ) : card.cardType === 'YOUTUBE' ? (
            <div
              style={{
                margin: 'auto 0',
                borderRadius: '10px',
                overflow: 'hidden',
                position: 'relative',
                background: '#000000',
                border: '1px solid rgba(255, 60, 60, 0.3)',
                height: '84px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {ytId ? (
                <img
                  src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                  alt="YouTube Thumbnail"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: '#FF4444', fontSize: '24px' }}>▶</span>
              )}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (card.url) window.open(card.url, '_blank');
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FF0000', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  ▶
                </div>
              </div>
            </div>
          ) : card.cardType === 'PICTURE' ? (
            <div
              style={{
                margin: 'auto 0',
                borderRadius: '10px',
                overflow: 'hidden',
                position: 'relative',
                height: '86px',
                background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(242, 242, 242, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ fontSize: '24px' }}>🖼</span>
              )}
            </div>
          ) : card.cardType === 'WIDGET' ? (
            <div
              style={{
                margin: 'auto 0',
                padding: '10px',
                borderRadius: '10px',
                background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(242, 242, 242, 0.15)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '20px', display: 'block', marginBottom: '2px' }}>
                {card.widgetId === 'clock' && '⏱'}
                {card.widgetId === 'pomodoro' && '⏳'}
                {card.widgetId === 'todos' && '☑'}
                {card.widgetId === 'pulse' && '💡'}
                {card.widgetId === 'formula' && '∑'}
                {card.widgetId === 'diagram' && '◈'}
                {card.widgetId === 'quiz' && '⚡'}
                {card.widgetId === 'studytube' && '▶'}
                {!card.widgetId && '⚙'}
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '10px', fontWeight: 700, color: isLight ? '#111114' : '#FFFFFF', display: 'block' }}>
                {card.widgetId ? card.widgetId.toUpperCase() : 'STARTER WIDGET'}
              </span>
              <span style={{ fontSize: '9px', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.5)', fontFamily: 'var(--font-content)' }}>
                Active in Dock & Home
              </span>
            </div>
          ) : card.cardType === 'PDF' ? (
            <div
              style={{
                margin: 'auto 0',
                padding: '10px',
                borderRadius: '10px',
                background: isLight ? 'rgba(220, 38, 38, 0.05)' : 'rgba(255, 60, 60, 0.08)',
                border: '1px solid rgba(220, 38, 38, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                textAlign: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontSize: '16px' }}>📄</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '10px', fontWeight: 700, color: '#DC2626' }}>
                  PDF DOCUMENT
                </span>
              </div>
              <span style={{ fontSize: '9px', fontFamily: 'monospace', color: isLight ? '#374151' : 'rgba(242,242,242,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {card.pdfFileName || (card.pdfUrl ? 'document.pdf' : 'Board Exam Notes')}
              </span>
              {card.pdfUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(card.pdfUrl, '_blank');
                  }}
                  style={{
                    background: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '5px',
                    padding: '3px 6px',
                    fontSize: '9px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '2px',
                  }}
                >
                  OPEN PDF ↗
                </button>
              )}
            </div>
          ) : card.formulaLatex ? (
            <div
              className="card-formula-box"
              style={{
                margin: 'auto 0',
                padding: '10px 12px',
                borderRadius: '10px',
                background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.55)',
                border: isLight ? '1px solid rgba(0, 85, 255, 0.25)' : '1px solid rgba(51, 240, 255, 0.22)',
                textAlign: 'center',
                boxShadow: isLight
                  ? 'none'
                  : 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '58px',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <MathFormula
                latex={card.formulaLatex}
                style={{
                  fontSize: '13px',
                  color: isLight ? '#111114' : '#FFFFFF',
                }}
              />
            </div>
          ) : (
            <p
              className="card-summary-text"
              style={{
                fontFamily: 'var(--font-content)',
                fontSize: '11px',
                color: isLight ? '#374151' : 'rgba(242, 242, 242, 0.8)',
                lineHeight: 1.45,
                margin: 'auto 0',
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {card.summary}
            </p>
          )}

          {/* Action Row */}
          <div
            className="card-action-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(242, 242, 242, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="card-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setFlipped(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '9px',
                  letterSpacing: '1.5px',
                  color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.7)',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  textTransform: 'uppercase',
                }}
              >
                FLIP ↷
              </button>
              {onEditCard && (
                <button
                  className="card-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCard(card);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '9px',
                    letterSpacing: '1.5px',
                    color: isLight ? '#0055FF' : '#33F0FF',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    textTransform: 'uppercase',
                  }}
                >
                  EDIT ✎
                </button>
              )}
            </div>
            {onConnectStart && (
              <button
                className="card-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onConnectStart(card.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '9px',
                  letterSpacing: '1px',
                  color: isConnecting ? (isLight ? '#0055FF' : '#33F0FF') : (isLight ? '#9CA3AF' : 'rgba(242, 242, 242, 0.45)'),
                  cursor: 'pointer',
                  padding: '2px 4px',
                  textTransform: 'uppercase',
                }}
              >
                CONNECT ⤳
              </button>
            )}
          </div>
        </div>

        {/* ─── BACK FACE ─── */}
        <div
          className="stack-card-3d-face stack-card-3d-back"
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: '16px',
            background: isLight
              ? 'rgba(252, 252, 254, 0.94)'
              : 'linear-gradient(135deg, rgba(20, 20, 24, 0.94), rgba(12, 12, 14, 0.88))',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: isLight ? '1px solid rgba(0, 0, 0, 0.14)' : '1px solid rgba(242, 242, 242, 0.16)',
            boxShadow: isLight
              ? '0 12px 32px rgba(0, 0, 0, 0.08)'
              : '0 12px 30px -4px rgba(0, 0, 0, 0.75), inset 0 1px 0 0 rgba(242, 242, 242, 0.22)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '9px',
                  letterSpacing: '2px',
                  color: isLight ? '#6B7280' : 'rgba(242, 242, 242, 0.55)',
                  textTransform: 'uppercase',
                }}
              >
                KEY TAKEAWAYS
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {onEditCard && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCard(card);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '9px',
                      letterSpacing: '1px',
                      color: isLight ? '#0055FF' : '#33F0FF',
                      cursor: 'pointer',
                      padding: '2px',
                      textTransform: 'uppercase',
                    }}
                  >
                    EDIT ✎
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFlipped(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '9px',
                    color: isLight ? '#374151' : 'rgba(242, 242, 242, 0.7)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                >
                  ↶ FRONT
                </button>
              </div>
            </div>

            <ul
              style={{
                margin: '0 0 10px 0',
                paddingLeft: '14px',
                fontFamily: 'var(--font-content)',
                fontSize: '10.5px',
                color: isLight ? '#374151' : 'rgba(242, 242, 242, 0.82)',
                lineHeight: 1.45,
              }}
            >
              {card.keyTakeaways.slice(0, 3).map((item, idx) => (
                <li key={idx} className="card-takeaway-item" style={{ marginBottom: '4px' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
              {card.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '8px',
                    letterSpacing: '1px',
                    color: isLight ? '#6B7280' : 'rgba(242, 242, 242, 0.5)',
                    padding: '2px 5px',
                    borderRadius: '4px',
                    background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(242, 242, 242, 0.06)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div
              style={{
                fontFamily: 'var(--font-subheading)',
                fontSize: '9px',
                letterSpacing: '1.5px',
                color: isLight ? '#111114' : '#FFFFFF',
                textAlign: 'center',
                paddingTop: '6px',
                borderTop: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(242, 242, 242, 0.08)',
              }}
            >
              PRISMATE 1.5 • STEM DRILL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StackCard3D;
