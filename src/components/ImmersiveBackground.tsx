import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/useApp';
import { IMMERSIVE_WALLPAPERS } from '../data/wallpapers';

export const ImmersiveBackground: React.FC = () => {
  const {
    theme,
    immersiveWallpaperMode,
    immersiveFixedWallpaper,
    currentWallpaperIndex,
    immersiveTone,
  } = useApp();

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

  const isLightTone = immersiveTone === 'light';

  return (
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

      {/* Cinematic Ambient Vignette & Text Legibility Shroud */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isLightTone
            ? 'radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.35) 70%, rgba(240, 244, 252, 0.55) 100%)'
            : 'radial-gradient(circle at 50% 45%, rgba(10, 12, 20, 0.08) 0%, rgba(4, 6, 12, 0.28) 70%, rgba(2, 3, 8, 0.52) 100%)',
          backdropFilter: isLightTone ? 'contrast(102%) brightness(102%)' : 'contrast(104%) brightness(98%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default ImmersiveBackground;
