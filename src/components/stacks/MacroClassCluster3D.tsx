import React from 'react';
import type { StackClass3D } from '../../types/stacks';
import { computeCardTransform3D } from '../../utils/spatialMath';

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
                background: 'linear-gradient(135deg, rgba(24, 24, 28, 0.92), rgba(12, 12, 14, 0.85))',
                border: '1px solid rgba(242, 242, 242, 0.2)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(242, 242, 242, 0.25)',
                pointerEvents: 'none',
              }}
            />
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
