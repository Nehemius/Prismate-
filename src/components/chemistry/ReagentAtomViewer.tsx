import React from "react";

interface ReagentAtomViewerProps {
  symbol: string;
  valenceElectrons?: number;
  transparent?: boolean;
  reactionId?: string;
}

export const ReagentAtomViewer: React.FC<ReagentAtomViewerProps> = ({
  symbol,
  transparent = false,
  reactionId,
}) => {
  const renderMolecule = () => {
    switch (reactionId) {
      case "hydroboration-oxidation":
        return (
          <div style={{ position: 'relative', width: '176px', height: '176px', userSelect: 'none', transform: 'scale(1.05)' }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <line x1="88" y1="88" x2="88" y2="28" stroke="#555560" strokeWidth="4" />
              <line x1="88" y1="88" x2="36" y2="140" stroke="#555560" strokeWidth="4" />
              <line x1="88" y1="88" x2="140" y2="140" stroke="#555560" strokeWidth="4" />
            </svg>
            <div
              style={{
                position: 'absolute',
                top: '60px',
                left: '60px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
                color: '#000000',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                zIndex: 10,
                background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E6FFFF 40%, #33F0FF 100%)',
              }}
            >
              B
            </div>
            <div style={{ position: 'absolute', top: '8px', left: '68px', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', background: '#222228', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 10 }}>H</div>
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', background: '#222228', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 10 }}>H</div>
            <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', background: '#222228', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 10 }}>H</div>
          </div>
        );

      case "markovnikov-hbr":
      case "anti-markovnikov-hbr":
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', userSelect: 'none' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', background: '#222228', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>H</div>
            <div style={{ width: '36px', height: '4px', background: '#555560', borderRadius: '2px' }} />
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(235,16,75,0.3)',
                background: 'radial-gradient(circle at 35% 35%, #FF6B8B 0%, #EB104B 60%, #8A0524 100%)',
              }}
            >
              Br
            </div>
          </div>
        );

      case "ozonolysis":
        return (
          <div style={{ position: 'relative', width: '176px', height: '128px', userSelect: 'none', transform: 'scale(0.95)' }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <line x1="88" y1="30" x2="32" y2="96" stroke="#555560" strokeWidth="4" />
              <line x1="85" y1="27" x2="141" y2="93" stroke="#555560" strokeWidth="3" />
              <line x1="91" y1="33" x2="147" y2="99" stroke="#555560" strokeWidth="3" />
            </svg>
            <div
              style={{
                position: 'absolute',
                top: '8px',
                left: '60px',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(255,34,51,0.35)',
                zIndex: 10,
                background: 'radial-gradient(circle at 35% 35%, #FFA3A3 0%, #FF2233 60%, #990011 100%)',
              }}
            >
              O
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#FFFFFF',
                boxShadow: '0 2px 10px rgba(255,34,51,0.3)',
                zIndex: 10,
                background: 'radial-gradient(circle at 35% 35%, #FFA3A3 0%, #FF2233 60%, #990011 100%)',
              }}
            >
              O
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#FFFFFF',
                boxShadow: '0 2px 10px rgba(255,34,51,0.3)',
                zIndex: 10,
                background: 'radial-gradient(circle at 35% 35%, #FFA3A3 0%, #FF2233 60%, #990011 100%)',
              }}
            >
              O
            </div>
          </div>
        );

      default:
        return (
          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '18px',
                userSelect: 'none',
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                background: 'radial-gradient(circle at 30% 30%, #555560 0%, #222228 60%, #111114 100%)',
                color: '#F2F2F2',
                border: '1px solid rgba(242,242,242,0.2)',
              }}
            >
              {symbol}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: transparent ? 'transparent' : 'linear-gradient(135deg, rgba(14,14,16,0.9), rgba(6,6,8,0.95))',
        borderRadius: '16px',
        border: '1px solid rgba(242,242,242,0.12)',
        boxShadow: 'inset 0 1px 0 0 rgba(242,242,242,0.15)',
      }}
    >
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {renderMolecule()}
      </div>
    </div>
  );
};

export default ReagentAtomViewer;
