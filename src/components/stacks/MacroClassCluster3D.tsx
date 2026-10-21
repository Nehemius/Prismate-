import React from 'react';
import type { StackClass3D } from '../../types/stacks';
import { computeCardTransform3D } from '../../utils/spatialMath';
import { formatToReadableMath } from '../../utils/mathUtils';

interface MacroClassCluster3DProps {
  stackClass: StackClass3D;
  position: { x: number; y: number; z: number };
  spinDeg: number;
  isHovered: boolean;
  onEnter: (classId: string) => void;
}

export const MacroClassCluster3D: React.FC<MacroClassCluster3DProps> = ({
  stackClass,
  position,
  spinDeg,
  isHovered,
  onEnter,
}) => {
  const cards = stackClass.cards.slice(0, 8); // Display up to 8 cards in miniature preview

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onEnter(stackClass.id);
      }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '0px',
        height: '0px',
        transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px)`,
        transformStyle: 'preserve-3d',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* ─── Miniature 3D Card Cluster Preview (scale 0.22 §5.3) ─── */}
      <div
        style={{
          position: 'relative',
          width: '0px',
          height: '0px',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.3s ease',
          transform: isHovered ? 'scale(1.15)' : 'scale(1)',
        }}
      >
        {cards.map((card, idx) => {
          const t = computeCardTransform3D(idx, cards.length, stackClass.template, null, spinDeg);
          // Scale down miniature cards by 0.22 so cluster radius stays within ~44px
          const miniX = t.x * 0.22;
          const miniY = t.y * 0.22;
          const miniZ = t.z * 0.22;
          const miniScale = 0.22 * t.scale;

          return (
            <div
              key={card.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '160px',
                height: '210px',
                marginLeft: '-80px',
                marginTop: '-105px',
                transform: `translate3d(${miniX}px, ${miniY}px, ${miniZ}px) rotateX(${t.rotateX}deg) rotateY(${t.rotateY}deg) scale(${miniScale})`,
                transformStyle: 'preserve-3d',
                borderRadius: '12px',
                background: 'linear-gradient(145deg, rgba(24, 24, 28, 0.94), rgba(10, 10, 12, 0.90))',
                border: '1px solid rgba(242, 242, 242, 0.24)',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.75), inset 0 1px 0 0 rgba(242, 242, 242, 0.3)',
                pointerEvents: 'none',
                padding: '10px 12px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                color: '#FFFFFF',
              }}
            >
              {/* Card Header Pill */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '8.5px',
                    letterSpacing: '1px',
                    fontWeight: 800,
                    color: '#33F0FF',
                    textTransform: 'uppercase',
                    background: 'rgba(51, 240, 255, 0.12)',
                    border: '1px solid rgba(51, 240, 255, 0.3)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {card.cardType}
                </span>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: card.accentColor || '#33F0FF',
                    boxShadow: `0 0 6px ${card.accentColor || '#33F0FF'}`,
                  }}
                />
              </div>

              {/* Card Title & Content Snippet */}
              <div style={{ flex: 1, marginTop: '8px', overflow: 'hidden' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    fontWeight: 700,
                    lineHeight: 1.25,
                    color: '#FFFFFF',
                    letterSpacing: '0.5px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {card.title}
                </div>

                {card.formulaLatex ? (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '4px 6px',
                      background: 'rgba(0, 0, 0, 0.45)',
                      borderRadius: '5px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontFamily: 'monospace',
                      fontSize: '9px',
                      color: '#E6FFFF',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {formatToReadableMath(card.formulaLatex)}
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: '4px',
                      fontFamily: 'var(--font-content)',
                      fontSize: '8.5px',
                      lineHeight: 1.3,
                      color: 'rgba(242, 242, 242, 0.65)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {card.summary}
                  </div>
                )}
              </div>

              {/* Card Footer: Mastery Dots & Tags */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(242, 242, 242, 0.08)',
                }}
              >
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[1, 2, 3].map((lvl) => (
                    <span
                      key={lvl}
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: lvl <= card.masteryLevel ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)',
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '8px',
                    letterSpacing: '1px',
                    color: 'rgba(242, 242, 242, 0.45)',
                    textTransform: 'uppercase',
                  }}
                >
                  {card.subtitle || 'PRISM'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Non-Colliding HUD Plaque Mounted at top: 56px with translateZ(45px) (§5.3) ─── */}
      <div
        style={{
          position: 'absolute',
          top: '56px',
          left: '50%',
          transform: 'translateX(-50%) translateZ(45px)',
          transformStyle: 'preserve-3d',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          pointerEvents: 'auto',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: isHovered
            ? 'linear-gradient(135deg, rgba(32, 32, 36, 0.96), rgba(18, 18, 20, 0.92))'
            : 'linear-gradient(135deg, rgba(16, 16, 18, 0.88), rgba(10, 10, 12, 0.80))',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: isHovered
            ? '1.5px solid #FFFFFF'
            : '1px solid rgba(242, 242, 242, 0.16)',
          boxShadow: isHovered
            ? '0 0 16px rgba(255, 255, 255, 0.25), 0 8px 24px rgba(0, 0, 0, 0.6)'
            : '0 8px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(242, 242, 242, 0.2)',
          transition: 'all 0.25s ease',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '1.5px',
            color: '#FFFFFF',
            textTransform: 'uppercase',
          }}
        >
          {stackClass.name}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-subheading)',
            fontSize: '8.5px',
            letterSpacing: '1px',
            color: 'rgba(242, 242, 242, 0.55)',
            textTransform: 'uppercase',
            marginTop: '2px',
          }}
        >
          {stackClass.cards.length} CARDS • {stackClass.template}
        </div>
      </div>
    </div>
  );
};

export default MacroClassCluster3D;
