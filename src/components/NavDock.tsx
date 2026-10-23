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
    userAvatar,
    theme,
    toggleTheme,
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);

  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressRef = useRef(false);

  // Swipe gesture tracking refs
  const dockPointerDownX = useRef<number | null>(null);
  const indicatorPointerDownX = useRef<number | null>(null);

  const visibleItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.id === 'home' && !homePageEnabled) return false;
    return true;
  });

  // Long-press detection on any editable nav button (>500ms activates/toggles edit mode)
  const handleItemPointerDown = useCallback((screenId: ScreenType) => {
    if (screenId === 'profile' || screenId === 'stacks') return;
    isLongPressRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true;
      try {
        if ('vibrate' in navigator) navigator.vibrate(60);
      } catch {}

      if (editModeScreen === screenId) {
        setEditModeScreen(null);
      } else {
        setEditModeScreen(screenId);
        setCurrentScreen(screenId);
      }
    }, 500);
  }, [editModeScreen, setEditModeScreen, setCurrentScreen]);

  const handleItemPointerUp = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleItemContextMenu = useCallback((e: React.MouseEvent, screenId: ScreenType) => {
    if (screenId === 'profile' || screenId === 'stacks') return;
    e.preventDefault();
    if (editModeScreen === screenId) {
      setEditModeScreen(null);
    } else {
      setEditModeScreen(screenId);
      setCurrentScreen(screenId);
    }
  }, [editModeScreen, setEditModeScreen, setCurrentScreen]);

  const handleItemClick = (id: ScreenType) => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    setCurrentScreen(id);
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

  return (
    <>
      <style>{`
        @media (max-height: 520px) {
          .prismate-nav-dock {
            padding: 6px 4px !important;
            gap: 4px !important;
            border-radius: 20px !important;
          }
          .prismate-nav-item {
            width: 44px !important;
            height: 38px !important;
            border-radius: 12px !important;
          }
          .prismate-nav-item-icon {
            font-size: 13px !important;
          }
          .prismate-nav-item-label {
            font-size: 7.5px !important;
          }
        }
      `}</style>

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
              left: 'max(6px, env(safe-area-inset-left))',
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
        className="prismate-nav-dock"
        onPointerDown={handleDockPointerDown}
        onPointerMove={handleDockPointerMove}
        onPointerUp={handleDockPointerUp}
        style={{
          position: 'fixed',
          left: 'max(14px, env(safe-area-inset-left))',
          top: '50%',
          transform: collapsed ? 'translate3d(-140px, -50%, 0)' : 'translate3d(0, -50%, 0)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 8px',
          background: 'var(--color-dock-bg, rgba(16, 16, 16, 0.78))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--color-dock-border, rgba(242, 242, 242, 0.22))',
          borderRadius: '32px',
          boxShadow: '0 12px 40px var(--color-shadow, rgba(0, 0, 0, 0.7))',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, background 0.25s, border-color 0.25s',
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
            color: 'var(--color-dock-fg-muted, rgba(242, 242, 242, 0.45))',
            fontSize: '11px',
            cursor: 'pointer',
            padding: '4px',
            lineHeight: 1,
            marginBottom: '4px',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-fg, #F2F2F2)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-dock-fg-muted, rgba(242, 242, 242, 0.45))')}
        >
          ❮
        </button>

        {/* Nav Items */}
        {visibleItems.map((item) => {
          const isActive = currentScreen === item.id;
          const isItemInEditMode = editModeScreen === item.id;
          const isEditable = item.id !== 'profile' && item.id !== 'stacks';

          return (
            <motion.button
              key={item.id}
              className={`prismate-nav-item ${isActive ? 'is-active' : ''}`}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              onClick={() => handleItemClick(item.id)}
              onContextMenu={isEditable ? (e) => handleItemContextMenu(e, item.id) : undefined}
              onPointerDown={isEditable ? () => handleItemPointerDown(item.id) : undefined}
              onPointerUp={isEditable ? handleItemPointerUp : undefined}
              onPointerLeave={isEditable ? handleItemPointerUp : undefined}
              aria-label={
                isEditable
                  ? `Switch to ${item.label} (Hold for Edit Mode)`
                  : `Switch to ${item.label}`
              }
              title={
                isEditable
                  ? `${item.label} (Hold / Long-press for Edit Mode)`
                  : item.label
              }
              style={{
                width: '54px',
                height: '52px',
                borderRadius: '20px',
                background: isActive ? 'var(--color-dock-active-bg, #F2F2F2)' : 'transparent',
                border: isItemInEditMode ? '1.5px dashed var(--color-dock-active-bg, #F2F2F2)' : 'none',
                color: isActive ? 'var(--color-dock-active-fg, #000000)' : 'var(--color-dock-fg, rgba(242, 242, 242, 0.75))',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                boxShadow: isActive ? '0 4px 14px var(--color-shadow, rgba(0,0,0,0.25))' : 'none',
                position: 'relative',
              }}
            >
              <span className="prismate-nav-item-icon" style={{ fontSize: '16px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.id === 'profile' && userAvatar && (userAvatar.startsWith('data:image') || userAvatar.startsWith('http') || userAvatar.startsWith('/')) ? (
                  <img src={userAvatar} alt="User" style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  item.icon
                )}
              </span>
              <span
                className="prismate-nav-item-label"
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

        {/* Separator */}
        <div
          style={{
            width: '26px',
            height: '1px',
            background: 'var(--color-dock-border, rgba(242, 242, 242, 0.16))',
            margin: '3px 0',
          }}
        />

        {/* Theme Toggle Button (☀️ Light / 🌙 Dark) */}
        <motion.button
          className="prismate-theme-toggle-btn"
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.12)',
            color: theme === 'dark' ? '#F2F2F2' : '#111114',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </motion.button>
      </nav>
    </>
  );
};

export default NavDock;
