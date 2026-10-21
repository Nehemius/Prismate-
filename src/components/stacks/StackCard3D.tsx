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

  // 3D positioning applied strictly via transform to maintain preserve-3d hierarchy
  const containerTransform = `translate3d(${transform.x}px, ${transform.y}px, ${transform.z}px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) rotateZ(${transform.rotateZ}deg) scale(${transform.scale})`;

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
        {/* ─── FRONT FACE (Leaf element with backdrop blur §5.1) ─── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: '16px',
            background: isSelected
              ? 'linear-gradient(135deg, rgba(28, 28, 32, 0.96), rgba(18, 18, 20, 0.90))'
              : 'linear-gradient(135deg, rgba(16, 16, 18, 0.90), rgba(10, 10, 12, 0.82))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: isSelected
              ? '1.5px solid #FFFFFF'
              : '1px solid rgba(242, 242, 242, 0.12)',
            boxShadow: isSelected
              ? '0 0 24px rgba(255, 255, 255, 0.25), inset 0 1px 0 0 rgba(242, 242, 242, 0.35)'
              : '0 12px 30px -4px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(242, 242, 242, 0.18)',
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
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '9px',
                  letterSpacing: '2px',
                  color: 'rgba(242, 242, 242, 0.55)',
                  textTransform: 'uppercase',
                }}
              >
                {card.cardType}
              </span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[1, 2, 3].map((lvl) => (
                  <span
                    key={lvl}
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: lvl <= card.masteryLevel ? '#FFFFFF' : 'rgba(242, 242, 242, 0.2)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Title & Subtitle */}
            <h3
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '15px',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.25,
                margin: '0 0 4px 0',
              }}
            >
              {card.title}
            </h3>
            <div
              style={{
                fontFamily: 'var(--font-subheading)',
                fontSize: '10px',
                letterSpacing: '1px',
                color: 'rgba(242, 242, 242, 0.65)',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              {card.subtitle}
            </div>
          </div>

          {/* Formula or Summary Centerpiece */}
          {card.formulaLatex ? (
            <div
              style={{
                margin: 'auto 0',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(0, 0, 0, 0.55)',
                border: '1px solid rgba(51, 240, 255, 0.22)',
                textAlign: 'center',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '62px',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <MathFormula
                latex={card.formulaLatex}
                style={{
                  fontSize: '14px',
                  color: '#FFFFFF',
                }}
              />
            </div>
          ) : (
            <p
              style={{
                fontFamily: 'var(--font-content)',
                fontSize: '11px',
                color: 'rgba(242, 242, 242, 0.8)',
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
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid rgba(242, 242, 242, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
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
                  color: 'rgba(242, 242, 242, 0.7)',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  textTransform: 'uppercase',
                }}
              >
                FLIP ↷
              </button>
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
                    letterSpacing: '1.5px',
                    color: '#33F0FF',
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
                  color: isConnecting ? '#33F0FF' : 'rgba(242, 242, 242, 0.45)',
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

        {/* ─── BACK FACE (Detailed Notes & Takeaways) ─── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(20, 20, 24, 0.94), rgba(12, 12, 14, 0.88))',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(242, 242, 242, 0.16)',
            boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.75), inset 0 1px 0 0 rgba(242, 242, 242, 0.22)',
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
                  color: 'rgba(242, 242, 242, 0.55)',
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
                      color: '#33F0FF',
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
                    color: 'rgba(242, 242, 242, 0.7)',
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
                color: 'rgba(242, 242, 242, 0.82)',
                lineHeight: 1.45,
              }}
            >
              {card.keyTakeaways.slice(0, 3).map((item, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>
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
                    color: 'rgba(242, 242, 242, 0.5)',
                    padding: '2px 5px',
                    borderRadius: '4px',
                    background: 'rgba(242, 242, 242, 0.06)',
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
                color: '#FFFFFF',
                textAlign: 'center',
                paddingTop: '6px',
                borderTop: '1px solid rgba(242, 242, 242, 0.08)',
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
