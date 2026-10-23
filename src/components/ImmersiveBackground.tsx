import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/useApp';
import { IMMERSIVE_WALLPAPERS } from '../data/wallpapers';
import { Sparkles, ChevronRight, ChevronLeft, Lock, RefreshCw } from 'lucide-react';

export const ImmersiveBackground: React.FC = () => {
  const {
    theme,
    immersiveWallpaperMode,
    immersiveFixedWallpaper,
    currentWallpaperIndex,
    nextWallpaper,
    prevWallpaper,
    immersiveCycleMinutes,
    currentScreen,
  } = useApp();

  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);

  // Determine which wallpaper to show
  const activeWallpaper =
    immersiveWallpaperMode === 'fixed'
      ? IMMERSIVE_WALLPAPERS.find((w) => w.url === immersiveFixedWallpaper) || IMMERSIVE_WALLPAPERS[0]
      : IMMERSIVE_WALLPAPERS[currentWallpaperIndex] || IMMERSIVE_WALLPAPERS[0];

  // Material You Dynamic Theme Accent Extraction
  useEffect(() => {
    if (theme !== 'immersive' || !activeWallpaper?.materialYou) return;
    const { primary, secondary, glow, surfaceTint } = activeWallpaper.materialYou;
    document.documentElement.style.setProperty('--color-accent', primary);
    document.documentElement.style.setProperty('--tile-border-hover', primary);
    document.documentElement.style.setProperty('--glow-accent', glow);
    document.documentElement.style.setProperty('--material-you-primary', primary);
    document.documentElement.style.setProperty('--material-you-secondary', secondary);
    document.documentElement.style.setProperty('--material-you-tint', surfaceTint);

    return () => {
      document.documentElement.style.removeProperty('--material-you-primary');
      document.documentElement.style.removeProperty('--material-you-secondary');
      document.documentElement.style.removeProperty('--material-you-tint');
      document.documentElement.style.removeProperty('--glow-accent');
    };
  }, [theme, activeWallpaper]);

  if (theme !== 'immersive') {
    return null;
  }

  return (
    <>
      {/* ── Wallpaper Crossfade Engine with Motion.dev & Ambient Vignette ── */}
      <div
        className="prismate-immersive-container"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeWallpaper.id + (immersiveWallpaperMode === 'fixed' ? '-fixed' : '')}
            initial={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              transition: {
                duration: 1.5,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
              filter: 'blur(4px)',
              transition: {
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${activeWallpaper.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </AnimatePresence>

        {/* ── Cinematic Ambient Vignette & Text Legibility Shroud ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 50% 45%, rgba(10, 12, 20, 0.08) 0%, rgba(4, 6, 12, 0.28) 70%, rgba(2, 3, 8, 0.52) 100%)',
            backdropFilter: 'contrast(104%) brightness(98%)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* ── Immersive Wallpaper Floating HUD Pill (Interactive Overlay at z-index 1500) ── */}
      {currentScreen !== 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25, delay: 0.2 }}
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1500,
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: hudCollapsed ? '6px 10px' : '6px 14px',
              borderRadius: '24px',
              background: 'rgba(12, 14, 24, 0.72)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              backdropFilter: 'blur(24px) saturate(160%)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              userSelect: 'none',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              onClick={() => setHudCollapsed((c) => !c)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
              title="Click to expand/collapse wallpaper controls"
            >
              <Sparkles style={{ width: '13px', height: '13px', color: activeWallpaper?.materialYou?.primary || '#33F0FF' }} />
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '9.5px',
                  letterSpacing: '1.5px',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                }}
              >
                {hudCollapsed ? activeWallpaper.name : `${activeWallpaper.name}`}
              </span>
            </div>

            {!hudCollapsed && (
              <>
                {activeWallpaper.materialYou && (
                  <span
                    style={{
                      fontSize: '9px',
                      fontFamily: 'monospace',
                      color: activeWallpaper.materialYou.primary,
                      background: activeWallpaper.materialYou.surfaceTint,
                      border: `1px solid ${activeWallpaper.materialYou.primary}55`,
                      padding: '2px 7px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: activeWallpaper.materialYou.primary }} />
                    {activeWallpaper.materialYou.name}
                  </span>
                )}
                <span
                  style={{
                    fontSize: '9px',
                    fontFamily: 'var(--font-subheading)',
                    color: activeWallpaper?.materialYou?.primary || '#33F0FF',
                    background: 'rgba(255, 255, 255, 0.08)',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {immersiveWallpaperMode === 'fixed' ? (
                    <>
                      <Lock style={{ width: '9px', height: '9px' }} /> FIXED
                    </>
                  ) : (
                    <>
                      <RefreshCw style={{ width: '9px', height: '9px' }} /> {immersiveCycleMinutes}M CYCLE
                    </>
                  )}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '4px' }}>
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevWallpaper}
                    title="Previous Wallpaper"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <ChevronLeft style={{ width: '12px', height: '12px' }} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextWallpaper}
                    title="Next Wallpaper"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <ChevronRight style={{ width: '12px', height: '12px' }} />
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ImmersiveBackground;
