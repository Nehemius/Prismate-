import React, { useState, useEffect, useRef, useCallback } from 'react';
import { animate } from 'animejs';
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
import { AppProvider, useApp } from './context/AppContext';

/**
 * App — Login Screen, Intro Choreography & Full System Routing
 *
 * SPECIFICATION COMPLIANCE:
 *   - Login intro: Universal loader -> Prism center entrance -> glide to logo ->
 *                  anime light streaks + ultra-high flash -> idle particle reactivity.
 *   - TAP TO BEGIN: Launches continuous UniversalLoader transition into the full-screen workspaces.
 *   - Continuous loader: Global time origin ensures star animation NEVER resets when entering workspaces.
 *   - Workspaces: Chemistry, Physics, Mathematics, Home (You), and Profile.
 *   - Floating NavDock: Frosted-glass dock on middle-left with swipe/collapse indicator.
 */

type AppPhase =
  | 'loading'        // Launch universal loader
  | 'prism-enter'    // Prism appears center screen
  | 'prism-glide'    // Prism glides into logo slot
  | 'anime-burst'    // Light streaks fire, letters flash bright
  | 'idle';          // Login screen interactive

const MainAppContent: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    loggedInUser,
    login,
    defaultStartupScreen,
    globalLoader,
    triggerLoader,
    inApp,
    setInApp,
  } = useApp();

  const [phase, setPhase] = useState<AppPhase>(() => {
    return inApp ? 'idle' : 'loading';
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [waveCharge, setWaveCharge] = useState(0);
  const [tapBlinkVisible, setTapBlinkVisible] = useState(true);
  const [appearFlash, setAppearFlash] = useState(0);
  const [isLockedIn, setIsLockedIn] = useState(false);

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

  // Phase 1 -> 2: After launch loader completes (2.0s)
  useEffect(() => {
    if (phase !== 'loading' || inApp) return;
    const timer = setTimeout(() => {
      setPhase('prism-enter');
    }, 2000);
    return () => clearTimeout(timer);
  }, [phase, inApp]);

  // Phase 2: Prism appears at exact center of screen
  useEffect(() => {
    if (phase !== 'prism-enter' || !prismRef.current) return;

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
    el.style.opacity = '0';

    animate(el, {
      opacity: [0, 1],
      scale: [1.35, 1.15],
      duration: 800,
      ease: 'outCubic',
      onComplete: () => {
        setTimeout(() => setPhase('prism-glide'), 400);
      },
    });
  }, [phase]);

  // Phase 3: Prism glides into logo slot
  useEffect(() => {
    if (phase !== 'prism-glide' || !prismRef.current || !logoContainerRef.current) return;

    const el = prismRef.current;
    const slot = logoContainerRef.current.querySelector('[data-prism-slot]') as HTMLElement | null;
    if (!slot) {
      setIsLockedIn(true);
      setPhase('anime-burst');
      return;
    }

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;
    const slotRect = slot.getBoundingClientRect();
    const targetLeft = slotRect.left + slotRect.width / 2;
    const targetTop = slotRect.top + slotRect.height / 2;

    animate(el, {
      left: [startX + 'px', targetLeft + 'px'],
      top: [startY + 'px', targetTop + 'px'],
      scale: [1.15, 1.0],
      duration: 850,
      ease: 'inOutQuad',
      onComplete: () => {
        setIsLockedIn(true);
        setPhase('anime-burst');
      },
    });
  }, [phase]);

  // Phase 4: Anime burst — logo appears with max bloom, then settles
  useEffect(() => {
    if (phase !== 'anime-burst') return;

    setAppearFlash(1.0);

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
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#000000' }}>
      {/* ── Continuous Universal Loader (Never resets, shared across entire app) */}
      <UniversalLoader visible={phase === 'loading' || globalLoader} />

      {/* ── Global Wave Canvas (Flows in login and across all workspaces §3) */}
      <WaveCanvas
        ref={waveCanvasRef}
        active={true}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: inApp ? 1 : 0,
          pointerEvents: 'none',
          opacity: inApp ? 0.38 : 1,
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
          {currentScreen === 'profile' && <ProfilePage />}
        </div>
      )}

      {/* ── Login Screen (Hidden when inApp is true) ──────────────────────── */}
      {!inApp && (
        <>

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
              letterOpacity={phase === 'loading' || phase === 'prism-enter' ? 0 : 1}
            >
              {isLockedIn && (
                <Prism
                  waveCharge={waveCharge}
                  flashIntensity={appearFlash}
                />
              )}
              <LightStreaks trigger={phase === 'anime-burst'} />
            </PrismateLogo>
          </div>

          {/* Floating Prism during glide */}
          {!isLockedIn && phase !== 'loading' && (
            <div
              ref={prismRef}
              style={{
                position: 'fixed',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 100,
              }}
            >
              <Prism waveCharge={0} flashIntensity={0} />
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
