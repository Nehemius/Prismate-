import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ScreenType } from '../types/prismate';
import { useApp } from '../context/useApp';

/**
 * Floating Left Navigation Dock
 *
 * SPECIFICATION & CORRECTIONS (PRISMATE_UI_SPEC.md §4.2, §5.1, §6.1, PRISMATE_FIXES.md):
 *   - True floating overlay (z-index higher than the full-screen Bento grid).
 *   - Bento grid extends 100% underneath; dock floats freely on top.
 *   - Touch-Swipe Gesture Detection (§4.2):
 *       * Swipe left on dock collapses it to indicator line.
 *       * Swipe right on indicator line expands the dock.
 *   - Edit Mode Triggers (§5.1, §6.1):
 *       * Long-press (>500ms) or Right-click on Home: Prompts Home Edit Mode.
 *       * Long-press (>500ms) or Right-click on Subject (Chem/Phys/Math): Prompts Subject Edit Mode.
 */

interface NavItemConfig {
  id: ScreenType;
  label: string;
  icon: string;
}

const ALL_NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', label: 'YOU', icon: '◈' },
  { id: 'chemistry', label: 'CHEM', icon: '⚗' },
  { id: 'physics', label: 'PHYS', icon: '⚛' },
  { id: 'mathematics', label: 'MATH', icon: '∫' },
  { id: 'stacks', label: 'STACKS', icon: '⬡' },
  { id: 'profile', label: 'USER', icon: '◉' },
];

export const NavDock: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    homePageEnabled,
    editModeScreen,
    setEditModeScreen,
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);
  const [promptTarget, setPromptTarget] = useState<ScreenType | null>(null);

  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressRef = useRef(false);

  // Swipe gesture tracking refs
  const dockPointerDownX = useRef<number | null>(null);
  const indicatorPointerDownX = useRef<number | null>(null);

  const visibleItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.id === 'home' && !homePageEnabled) return false;
    return true;
  });

  // Long-press detection on any editable nav button (Home or Subject §5.1, §6.1)
  const handleItemPointerDown = useCallback((screenId: ScreenType) => {
    if (screenId === 'profile' || screenId === 'stacks') return;
    isLongPressRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true;
      setPromptTarget(screenId);
    }, 550);
  }, []);

  const handleItemPointerUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleItemContextMenu = useCallback((e: React.MouseEvent, screenId: ScreenType) => {
    if (screenId === 'profile') return;
    e.preventDefault();
    setPromptTarget(screenId);
  }, []);

  const handleItemClick = (id: ScreenType) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    setCurrentScreen(id);
  };

  const handleConfirmEditMode = () => {
    if (!promptTarget) return;
    if (editModeScreen === promptTarget) {
      setEditModeScreen(null);
    } else {
      setEditModeScreen(promptTarget);
      setCurrentScreen(promptTarget);
    }
    setPromptTarget(null);
  };

  // Swipe detection on dock (swipe left to collapse §4.2)
  const handleDockPointerDown = (e: React.PointerEvent) => {
    dockPointerDownX.current = e.clientX;
  };

  const handleDockPointerMove = (e: React.PointerEvent) => {
    if (dockPointerDownX.current !== null) {
      const diff = e.clientX - dockPointerDownX.current;
      if (diff < -45) {
        setCollapsed(true);
        dockPointerDownX.current = null;
      }
    }
  };

  const handleDockPointerUp = () => {
    dockPointerDownX.current = null;
  };

  // Swipe detection on indicator line (swipe right to expand §4.2)
  const handleIndicatorPointerDown = (e: React.PointerEvent) => {
    indicatorPointerDownX.current = e.clientX;
  };

  const handleIndicatorPointerMove = (e: React.PointerEvent) => {
    if (indicatorPointerDownX.current !== null) {
      const diff = e.clientX - indicatorPointerDownX.current;
      if (diff > 25) {
        setCollapsed(false);
        indicatorPointerDownX.current = null;
      }
    }
  };

  const handleIndicatorPointerUp = () => {
    indicatorPointerDownX.current = null;
  };

  const isCurrentScreenEditing = editModeScreen !== null && editModeScreen === promptTarget;

  return (
    <>
      {/* ── Collapsed Indicator Line (spec §4.2 with swipe-right detection) */}
      <AnimatePresence>
        {collapsed && (
          <motion.button
            key="collapsed-indicator"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setCollapsed(false)}
            onPointerDown={handleIndicatorPointerDown}
            onPointerMove={handleIndicatorPointerMove}
            onPointerUp={handleIndicatorPointerUp}
            aria-label="Reveal navigation dock (Click or swipe right)"
            title="Open Navigation"
            style={{
              position: 'fixed',
              left: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '6px',
              height: '110px',
              borderRadius: '4px',
              background: '#F2F2F2',
              border: 'none',
              cursor: 'pointer',
              zIndex: 1000,
              boxShadow: '0 0 12px rgba(242,242,242,0.6)',
              touchAction: 'none',
            }}
            whileHover={{ width: '10px', scaleY: 1.08 }}
            whileTap={{ scale: 0.94 }}
          />
        )}
      </AnimatePresence>

      {/* ── Floating Frosted-Glass Dock (True Overlay with swipe-left detection) */}
      <nav
        aria-label="Main Application Navigation"
        onPointerDown={handleDockPointerDown}
        onPointerMove={handleDockPointerMove}
        onPointerUp={handleDockPointerUp}
        style={{
          position: 'fixed',
          left: '16px',
          top: '50%',
          transform: collapsed ? 'translate3d(-140px, -50%, 0)' : 'translate3d(0, -50%, 0)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 8px',
          background: 'rgba(16, 16, 16, 0.78)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(242, 242, 242, 0.22)',
          borderRadius: '32px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? 'none' : 'all',
          userSelect: 'none',
          touchAction: 'none',
          willChange: 'transform, opacity',
        }}
      >
        {/* Collapse toggle arrow */}
        <button
          onClick={() => setCollapsed(true)}
          aria-label="Collapse navigation dock (Swipe left or click)"
          title="Collapse Navigation"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(242, 242, 242, 0.45)',
            fontSize: '11px',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
            marginBottom: '4px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#F2F2F2')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(242, 242, 242, 0.45)')}
        >
          ❮
        </button>

        {/* Nav Items */}
        {visibleItems.map((item) => {
          const isActive = currentScreen === item.id;
          const isItemInEditMode = editModeScreen === item.id;
          const isEditable = item.id !== 'profile';

          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              onClick={() => handleItemClick(item.id)}
              onDoubleClick={isEditable ? () => setPromptTarget(item.id) : undefined}
              onContextMenu={isEditable ? (e) => handleItemContextMenu(e, item.id) : undefined}
              onPointerDown={isEditable ? () => handleItemPointerDown(item.id) : undefined}
              onPointerUp={isEditable ? handleItemPointerUp : undefined}
              onPointerLeave={isEditable ? handleItemPointerUp : undefined}
              aria-label={
                isEditable
                  ? `Switch to ${item.label} (Double-click, Long-press, or Right-click for Edit Mode)`
                  : `Switch to ${item.label}`
              }
              title={
                isEditable
                  ? `${item.label} (Double-click, Right-click, or Long-press for Edit Mode)`
                  : item.label
              }
              style={{
                width: '54px',
                height: '52px',
                borderRadius: '20px',
                background: isActive ? '#F2F2F2' : 'transparent',
                border: isItemInEditMode ? '1.5px dashed #F2F2F2' : 'none',
                color: isActive ? '#000000' : 'rgba(242, 242, 242, 0.75)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                boxShadow: isActive ? '0 4px 14px rgba(242,242,242,0.3)' : 'none',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(242, 242, 242, 0.12)';
                  e.currentTarget.style.color = '#F2F2F2';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(242, 242, 242, 0.75)';
                }
              }}
            >
              <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '9px',
                  letterSpacing: '1px',
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}

        {/* Discrete Edit Shortcut Button (§12 accessible alternative) */}
        {currentScreen !== 'profile' && (
          <button
            onClick={() => setPromptTarget(currentScreen)}
            aria-label={editModeScreen === currentScreen ? 'Exit Edit Mode' : 'Enter Edit Mode'}
            title={
              editModeScreen === currentScreen
                ? 'Exit Edit Mode'
                : 'Edit Layout (Double-click or Long-press also supported)'
            }
            style={{
              marginTop: '4px',
              width: '44px',
              height: '32px',
              borderRadius: '12px',
              background: editModeScreen === currentScreen ? '#F2F2F2' : 'rgba(242, 242, 242, 0.08)',
              border: '1px solid rgba(242, 242, 242, 0.22)',
              color: editModeScreen === currentScreen ? '#000000' : 'rgba(242, 242, 242, 0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (editModeScreen !== currentScreen) {
                e.currentTarget.style.background = 'rgba(242, 242, 242, 0.2)';
                e.currentTarget.style.color = '#F2F2F2';
              }
            }}
            onMouseLeave={(e) => {
              if (editModeScreen !== currentScreen) {
                e.currentTarget.style.background = 'rgba(242, 242, 242, 0.08)';
                e.currentTarget.style.color = 'rgba(242, 242, 242, 0.75)';
              }
            }}
          >
            ✎
          </button>
        )}
      </nav>

      {/* ── Edit Mode Confirmation Modal (§5.1, §6.1, PRISMATE_FIXES.md §1.2) */}
      <AnimatePresence>
        {promptTarget && (
          <motion.div
            key="editmode-prompt-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setPromptTarget(null);
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9000,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              key="editmode-prompt-card"
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: '#000000',
                border: '1px solid rgba(242, 242, 242, 0.25)',
                borderRadius: '16px',
                padding: '32px 36px',
                maxWidth: '460px',
                width: '90vw',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '18px',
                  letterSpacing: '2px',
                  color: '#F2F2F2',
                  margin: '0 0 12px',
                  textTransform: 'uppercase',
                }}
              >
                {isCurrentScreenEditing
                  ? `EXIT ${promptTarget.toUpperCase()} EDIT MODE?`
                  : `ENTER ${promptTarget.toUpperCase()} EDIT MODE?`}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-content)',
                  fontSize: '13px',
                  color: 'rgba(242, 242, 242, 0.6)',
                  lineHeight: 1.5,
                  margin: '0 0 28px',
                }}
              >
                {promptTarget === 'home'
                  ? isCurrentScreenEditing
                    ? 'Save your current Home widget arrangement and lock the 16 × 8 Bento grid.'
                    : 'Confirming unlocks the 16 × 8 Bento grid for widget dragging and repositioning.'
                  : isCurrentScreenEditing
                  ? `Save your block layout and lock the ${promptTarget} workspace.`
                  : `Subject page edit mode lets you resize and reposition existing blocks. The centre title block remains locked.`}
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleConfirmEditMode}
                  style={{
                    flex: 1,
                    background: '#F2F2F2',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {isCurrentScreenEditing ? 'EXIT EDIT MODE' : 'ENTER EDIT MODE'}
                </button>
                <button
                  onClick={() => setPromptTarget(null)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    color: '#F2F2F2',
                    border: '1px solid rgba(242, 242, 242, 0.25)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavDock;
