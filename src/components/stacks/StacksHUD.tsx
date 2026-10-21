import React from 'react';
import type { Template3D, VSEPRClassGeometry } from '../../types/stacks';

interface StacksHUDProps {
  viewMode: 'MACRO' | 'MICRO';
  activeClassName?: string;
  vseprMode: VSEPRClassGeometry;
  onVseprChange: (mode: VSEPRClassGeometry) => void;
  activeTemplate: Template3D;
  onTemplateChange: (t: Template3D) => void;
  connectionFilter: 1 | 2 | 3 | 'ALL';
  onConnectionFilterChange: (f: 1 | 2 | 3 | 'ALL') => void;
  autoSpin: boolean;
  onToggleAutoSpin: () => void;
  onResetCamera: () => void;
  onBackToMacro: () => void;
}

const TEMPLATES: Template3D[] = ['SPHERE', 'RING', 'HELIX', 'GRID', 'COVERFLOW', 'STACK'];
const VSEPR_MODES: VSEPRClassGeometry[] = [
  'AUTO',
  'TRIGONAL_PLANAR',
  'TETRAHEDRAL',
  'TRIGONAL_BIPYRAMIDAL',
  'OCTAHEDRAL',
  'PENTAGONAL_BIPYRAMIDAL',
];

export const StacksHUD: React.FC<StacksHUDProps> = ({
  viewMode,
  activeClassName,
  vseprMode,
  onVseprChange,
  activeTemplate,
  onTemplateChange,
  connectionFilter,
  onConnectionFilterChange,
  autoSpin,
  onToggleAutoSpin,
  onResetCamera,
  onBackToMacro,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 32px',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {/* ─── TOP BAR: BREADCRUMBS & SYSTEM CONTROLS ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'auto',
        }}
      >
        {/* Left: Breadcrumb / Back Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {viewMode === 'MICRO' && (
            <button
              onClick={onBackToMacro}
              style={{
                background: 'rgba(242, 242, 242, 0.08)',
                border: '1px solid rgba(242, 242, 242, 0.16)',
                borderRadius: '8px',
                padding: '6px 14px',
                fontFamily: 'var(--font-subheading)',
                fontSize: '11px',
                letterSpacing: '1.5px',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              <span>←</span> MACRO SPACE
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '14px',
                letterSpacing: '3px',
                color: '#FFFFFF',
                textTransform: 'uppercase',
              }}
            >
              STACKS
            </span>
            {viewMode === 'MICRO' && activeClassName && (
              <>
                <span style={{ color: 'rgba(242, 242, 242, 0.3)' }}>/</span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '13px',
                    letterSpacing: '2px',
                    color: 'rgba(242, 242, 242, 0.75)',
                    textTransform: 'uppercase',
                  }}
                >
                  {activeClassName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Structural Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Macro Mode: VSEPR Molecular Geometry Switcher */}
          {viewMode === 'MACRO' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(12, 12, 14, 0.85)',
                border: '1px solid rgba(242, 242, 242, 0.12)',
                borderRadius: '8px',
                padding: '3px',
                gap: '2px',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '9px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.45)',
                  padding: '0 8px',
                  textTransform: 'uppercase',
                }}
              >
                VSEPR:
              </span>
              {VSEPR_MODES.map((mode) => (
                <button
                  key={mode}
                  onClick={() => onVseprChange(mode)}
                  style={{
                    background: vseprMode === mode ? '#FFFFFF' : 'transparent',
                    color: vseprMode === mode ? '#000000' : 'rgba(242, 242, 242, 0.65)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '9px',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {mode.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}

          {/* Micro Mode: 3D Structure Template Switcher */}
          {viewMode === 'MICRO' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(12, 12, 14, 0.85)',
                border: '1px solid rgba(242, 242, 242, 0.12)',
                borderRadius: '8px',
                padding: '3px',
                gap: '2px',
              }}
            >
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl}
                  onClick={() => onTemplateChange(tpl)}
                  style={{
                    background: activeTemplate === tpl ? '#FFFFFF' : 'transparent',
                    color: activeTemplate === tpl ? '#000000' : 'rgba(242, 242, 242, 0.65)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 9px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '9px',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tpl}
                </button>
              ))}
            </div>
          )}

          {/* Micro Mode: Connection Level Filter */}
          {viewMode === 'MICRO' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(12, 12, 14, 0.85)',
                border: '1px solid rgba(242, 242, 242, 0.12)',
                borderRadius: '8px',
                padding: '3px',
                gap: '2px',
              }}
            >
              {(['ALL', 1, 2, 3] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onConnectionFilterChange(lvl)}
                  style={{
                    background: connectionFilter === lvl ? 'rgba(242, 242, 242, 0.25)' : 'transparent',
                    color: connectionFilter === lvl ? '#FFFFFF' : 'rgba(242, 242, 242, 0.55)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '9px',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                  }}
                >
                  {lvl === 'ALL' ? 'ARCS: ALL' : `LVL ${lvl}`}
                </button>
              ))}
            </div>
          )}

          {/* Auto-Spin Toggle */}
          <button
            onClick={onToggleAutoSpin}
            style={{
              background: autoSpin ? 'rgba(255, 255, 255, 0.15)' : 'rgba(12, 12, 14, 0.85)',
              border: '1px solid rgba(242, 242, 242, 0.15)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontFamily: 'var(--font-subheading)',
              fontSize: '10px',
              letterSpacing: '1px',
              color: autoSpin ? '#FFFFFF' : 'rgba(242, 242, 242, 0.45)',
              cursor: 'pointer',
            }}
          >
            SPIN: {autoSpin ? 'ON' : 'OFF'}
          </button>

          {/* Reset Camera */}
          <button
            onClick={onResetCamera}
            style={{
              background: 'rgba(12, 12, 14, 0.85)',
              border: '1px solid rgba(242, 242, 242, 0.15)',
              borderRadius: '8px',
              padding: '6px 12px',
              fontFamily: 'var(--font-subheading)',
              fontSize: '10px',
              letterSpacing: '1px',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            RESET
          </button>
        </div>
      </div>

      {/* ─── BOTTOM HUD BAR: TACTICAL HINTS & COORDINATE STATUS ─── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-subheading)',
            fontSize: '9.5px',
            letterSpacing: '2px',
            color: 'rgba(242, 242, 242, 0.45)',
            textTransform: 'uppercase',
          }}
        >
          DRAG TO ORBIT 3D • SCROLL TO ZOOM • CLICK TO SELECT • SPACE TO SPIN
        </div>

        <div
          style={{
            fontFamily: 'var(--font-subheading)',
            fontSize: '9px',
            letterSpacing: '2px',
            color: 'rgba(242, 242, 242, 0.35)',
            textTransform: 'uppercase',
          }}
        >
          PRISMATE 1.5 SPATIAL ENGINE • 60 FPS CSS3D
        </div>
      </div>
    </div>
  );
};

export default StacksHUD;
