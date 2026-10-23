import React, { useState, useEffect, useRef, useCallback } from 'react';
import { animate } from 'animejs';
import gsap from 'gsap';
import UniversalLoader from './components/UniversalLoader';
import WaveCanvas from './components/WaveCanvas';
import type { WaveCanvasRef } from './components/WaveCanvas';
import Prism from './components/Prism';
import PrismateLogo from './components/PrismateLogo';
import LightStreaks from './components/LightStreaks';
import LoginModal from './components/LoginModal';
import NavDock from './components/NavDock';
import ChemistryPage from './pages/ChemistryPage';
import PhysicsPage from './pages/PhysicsPage';
import MathematicsPage from './pages/MathematicsPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import StacksWorkspace from './components/stacks/StacksWorkspace';
import BlackWhiteStarWhirl, { type StarWhirlFrame } from './components/BlackWhiteStarWhirl';
import { playBlackWhiteStarWhirl } from './utils/starWhirlController';
import OrientationGuard from './components/OrientationGuard';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';

/**
 * App — Login Screen, Intro Choreography & Full System Routing
 *
 * SPECIFICATION COMPLIANCE:
 *   1. Chiaroscuro Shadowed B/W Prism Reveal (Rim-lit tips -> full monolith reveal).
 *   2. Standalone Black & White Star / Pinwheel Whirl Impact Animation (4 frames over #FFFFFF).
 *   3. Electric Cyan Blur-Slam into razor-sharp focus -> Glide into PRISMATE logo slot.
 *   4. Light streaks burst + letters flash -> Interactive idle state with PS3 XMB waves.
 */

type AppPhase =
  | 'shadow-reveal'  // 1. Chiaroscuro shadowed B/W monolith prism appears at center, rim-lit tips reveal full monolith
  | 'star-whirl'     // 2. Pure #FFFFFF canvas + 4-frame #000000 geometric star/pinwheel whirl impact
  | 'anime-burst'    // 3. Overall PRISMATE logo shining burst with light streaks & bloom
  | 'idle';          // 4. Login screen interactive

const MainAppContent: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    loggedInUser,
    login,
    defaultStartupScreen,
    globalLoader,
    globalLoaderMetadata,
    triggerLoader,
    inApp,
    setInApp,
  } = useApp();

  const [phase, setPhase] = useState<AppPhase>(() => {
    return inApp ? 'idle' : 'shadow-reveal';
  });
  const [starWhirlFrame, setStarWhirlFrame] = useState<StarWhirlFrame>(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [waveCharge, setWaveCharge] = useState(0);
  const [tapBlinkVisible, setTapBlinkVisible] = useState(true);
  const [appearFlash, setAppearFlash] = useState(0);
  const [isLockedIn, setIsLockedIn] = useState<boolean>(() => inApp);

  // When user logs out (inApp transitions from true to false), replay the login animation sequence
  const prevInAppRef = useRef<boolean>(inApp);
  useEffect(() => {
    if (prevInAppRef.current && !inApp) {
      setIsLockedIn(false);
      setStarWhirlFrame(0);
      setAppearFlash(0);
      setPhase('shadow-reveal');
    }
    prevInAppRef.current = inApp;
  }, [inApp]);

  const prismRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const waveCanvasRef = useRef<WaveCanvasRef | null>(null);
  const chargeRafRef = useRef<number>(0);

  // TAP TO BEGIN blink effect
  useEffect(() => {
    if (phase !== 'idle' || inApp) return;
    const interval = setInterval(() => {
      setTapBlinkVisible((v) => !v);
    }, 800);
    return () => clearInterval(interval);
  }, [phase, inApp]);

  // Phase 1: Chiaroscuro Shadowed B/W Prism Reveal (Rim-Lit Tips -> Full Reveal)
  useEffect(() => {
    if (phase !== 'shadow-reveal' || inApp || !prismRef.current) return;

    const el = prismRef.current;
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    const slot = logoContainerRef.current?.querySelector('[data-prism-slot]') as HTMLElement | null;
    const slotRect = slot?.getBoundingClientRect();
    const targetW = slotRect && slotRect.width > 0 ? slotRect.width : 78;
    const targetH = slotRect && slotRect.height > 0 ? slotRect.height : 185;

    el.style.width = `${targetW}px`;
    el.style.height = `${targetH}px`;
    el.style.left = `${startX}px`;
    el.style.top = `${startY}px`;
    el.style.opacity = '1';

    const maskProxy = { edgeBand: 8, centerAlpha: 0 };
    const updateChiaroscuroMask = () => {
      const e = maskProxy.edgeBand;
      const c = maskProxy.centerAlpha;
      const gradient = `linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${e}%, rgba(0,0,0,${c}) 50%, rgba(0,0,0,1) ${100 - e}%, rgba(0,0,0,1) 100%)`;
      if (prismRef.current) {
        prismRef.current.style.webkitMaskImage = gradient;
        prismRef.current.style.maskImage = gradient;
      }
    };

    updateChiaroscuroMask();

    const tl = gsap.timeline({
      onComplete: () => {
        if (prismRef.current) {
          prismRef.current.style.webkitMaskImage = 'none';
          prismRef.current.style.maskImage = 'none';
        }
        setPhase('star-whirl');
      },
    });

    gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0.92 });
    tl.to(el, { scale: 1, duration: 1.3, ease: 'power2.out' }, 0);
    tl.to(
      maskProxy,
      {
        edgeBand: 24,
        centerAlpha: 0.04,
        duration: 0.7,
        ease: 'power2.inOut',
        onUpdate: updateChiaroscuroMask,
      },
      0
    );
    tl.to(
      maskProxy,
      {
        edgeBand: 50,
        centerAlpha: 1,
        duration: 0.6,
        ease: 'power3.out',
        onUpdate: updateChiaroscuroMask,
      },
      0.7
    );

    return () => {
      tl.kill();
    };
  }, [phase, inApp]);

  // Phase 2: Standalone Black & White Star / Pinwheel Whirl Impact Animation (4 frames over #FFFFFF)
  // Directly skips to the overall logo shining scene upon impact completion
  useEffect(() => {
    if (phase !== 'star-whirl' || inApp) return;

    const tl = playBlackWhiteStarWhirl(setStarWhirlFrame, () => {
      setIsLockedIn(true);
      setAppearFlash(1.0);
      setPhase('anime-burst');
    });

    return () => {
      tl.kill();
    };
  }, [phase, inApp]);

  // Phase 3: Overall PRISMATE logo shining burst with max bloom, then settles
  useEffect(() => {
    if (phase !== 'anime-burst') return;

    const animState = { flash: 1.0 };
    animate(animState, {
      flash: 0,
      duration: 850,
      delay: 50,
      ease: 'outQuad',
      onRender: () => {
        setAppearFlash(animState.flash);
      },
      onComplete: () => {
        setAppearFlash(0);
        setPhase('idle');
      },
    });
  }, [phase]);

  // Wave charge calculation loop — runs during idle phase on login screen
  useEffect(() => {
    if (phase !== 'idle' || inApp) return;

    const updateCharge = () => {
      const slot = logoContainerRef.current?.querySelector('[data-prism-slot]') as HTMLElement | null;
      if (waveCanvasRef.current && slot) {
        const rect = slot.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const charge = waveCanvasRef.current.getWaveCharge(cx, cy);
        setWaveCharge(charge);
      }
      chargeRafRef.current = requestAnimationFrame(updateCharge);
    };

    chargeRafRef.current = requestAnimationFrame(updateCharge);
    return () => cancelAnimationFrame(chargeRafRef.current);
  }, [phase, inApp]);

  // TAP TO BEGIN: Triggers continuous loader and enters app
  const handleTapToBegin = useCallback(() => {
    if (!loggedInUser) {
      setLoginModalOpen(true);
    } else {
      triggerLoader(950, () => {
        setInApp(true);
      });
      setCurrentScreen(defaultStartupScreen || 'chemistry');
    }
  }, [loggedInUser, triggerLoader, setCurrentScreen, defaultStartupScreen, setInApp]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: 'var(--color-bg, #000000)' }}>
      {/* ── Mobile Horizontal Orientation Enforcer (§1) ── */}
      <OrientationGuard />

      {/* ── Universal Loader (Unique Peak Morphing Geometric Star Animation) ── */}
      <UniversalLoader
        visible={globalLoader}
        centered={true}
        metadata={globalLoaderMetadata || undefined}
      />

      {/* ── Global Wave Canvas (Flows in login and across all workspaces except user page) */}
      <WaveCanvas
        ref={waveCanvasRef}
        active={currentScreen !== 'profile'}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: inApp ? 1 : 0,
          pointerEvents: 'none',
          opacity: currentScreen === 'profile' ? 0 : inApp ? 0.72 : 1,
          display: currentScreen === 'profile' ? 'none' : 'block',
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* ── Full Application Workspaces (Mounted when inApp is true) ─────── */}
      {inApp && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
          {/* Floating Navigation Dock (§4.2) */}
          <NavDock />

          {/* Active Screen View */}
          {currentScreen === 'home' && <HomePage />}
          {currentScreen === 'chemistry' && <ChemistryPage />}
          {currentScreen === 'physics' && <PhysicsPage />}
          {currentScreen === 'mathematics' && <MathematicsPage />}
          {currentScreen === 'stacks' && <StacksWorkspace />}
          {currentScreen === 'profile' && <ProfilePage />}
        </div>
      )}

      {/* ── Login Screen (Hidden when inApp is true) ──────────────────────── */}
      {!inApp && (
        <>
          {/* Standalone Black & White Star / Pinwheel Whirl Impact Animation */}
          <BlackWhiteStarWhirl frame={starWhirlFrame} />

          {/* PRISMATE Logo Container */}
          <div
            ref={logoContainerRef}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(820px, 86vw)',
              zIndex: 10,
            }}
          >
            <PrismateLogo
              appearFlash={appearFlash}
              waveCharge={waveCharge}
              letterOpacity={isLockedIn || phase === 'idle' || phase === 'anime-burst' ? 1 : 0}
            >
              {(isLockedIn || phase === 'idle' || phase === 'anime-burst') && (
                <Prism
                  variant="glowing-cyan"
                  waveCharge={waveCharge}
                  flashIntensity={appearFlash}
                />
              )}
              <LightStreaks trigger={phase === 'anime-burst'} />
            </PrismateLogo>
          </div>

          {/* Floating Monolith Prism during shadow-reveal */}
          {phase === 'shadow-reveal' && (
            <div
              ref={prismRef}
              style={{
                position: 'fixed',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 100,
              }}
            >
              <Prism
                variant="monolith"
                waveCharge={0}
                flashIntensity={0}
              />
            </div>
          )}

          {/* HUD: TAP TO BEGIN (smooth blink, Free Fire style) */}
          {phase === 'idle' && (
            <button
              onClick={handleTapToBegin}
              style={{
                position: 'fixed',
                bottom: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'none',
                border: 'none',
                color: '#F2F2F2',
                fontFamily: 'var(--font-subheading)',
                fontSize: '16px',
                letterSpacing: '4px',
                cursor: 'pointer',
                opacity: tapBlinkVisible ? 1 : 0.15,
                transition: 'opacity 0.5s ease',
                zIndex: 20,
                padding: '12px 24px',
              }}
            >
              TAP TO BEGIN
            </button>
          )}

          {/* HUD: Bottom-Left — Solid #F2F2F2 Rectangle LOG IN / SWITCH button */}
          {phase === 'idle' && (
            <div
              style={{
                position: 'fixed',
                bottom: '24px',
                left: '24px',
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '6px',
              }}
            >
              {loggedInUser && (
                <span
                  style={{
                    color: '#F2F2F2',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '14px',
                    paddingLeft: '4px',
                    letterSpacing: '1px',
                  }}
                >
                  {loggedInUser}
                </span>
              )}

              <button
                onClick={() => setLoginModalOpen(true)}
                style={{
                  background: '#F2F2F2',
                  border: 'none',
                  color: '#000000',
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  letterSpacing: '2px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                {loggedInUser ? 'SWITCH' : 'LOG IN'}
              </button>
            </div>
          )}

          {/* HUD: Bottom-Right — Version Tag */}
          {phase === 'idle' && (
            <span
              style={{
                position: 'fixed',
                bottom: '28px',
                right: '28px',
                color: '#F2F2F2',
                fontFamily: 'var(--font-heading)',
                fontSize: '14px',
                letterSpacing: '2px',
                zIndex: 20,
              }}
            >
              V 1.5
            </span>
          )}

          {/* Login Modal */}
          <LoginModal
            open={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
            onLogin={(user) => {
              login(user);
              setLoginModalOpen(false);
              triggerLoader(950, () => {
                setInApp(true);
              });
              setCurrentScreen(defaultStartupScreen || 'chemistry');
            }}
          />
        </>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
};

export default App;
