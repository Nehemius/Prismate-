import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type {
  StackClass3D,
  StackCard,
  Template3D,
  VSEPRClassGeometry,
} from '../../types/stacks';
import {
  MOCK_CHEMISTRY_STACK_CLASSES,
  MOCK_CARD_CONNECTIONS,
} from '../../data/mockStacks';
import {
  resolveVSEPRClassPositions,
  computeCardTransform3D,
} from '../../utils/spatialMath';
import StackCard3D from './StackCard3D';
import MacroClassCluster3D from './MacroClassCluster3D';
import StacksCanvasOverlay from './StacksCanvasOverlay';
import StacksHUD from './StacksHUD';
import StackClassModal from './StackClassModal';
import StackCardModal from './StackCardModal';

export const StacksWorkspace: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<'MACRO' | 'MICRO'>('MACRO');
  const [activeClassId, setActiveClassId] = useState<string>('chem-coordination');
  const [classes, setClasses] = useState<StackClass3D[]>(() => {
    try {
      const saved = localStorage.getItem('prismate_3d_stacks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback to mock
    }
    return MOCK_CHEMISTRY_STACK_CLASSES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('prismate_3d_stacks', JSON.stringify(classes));
    } catch (e) {
      console.warn('Failed to save 3d stacks to localStorage', e);
    }
  }, [classes]);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [vseprMode, setVseprMode] = useState<VSEPRClassGeometry>('AUTO');
  const [connectionFilter, setConnectionFilter] = useState<1 | 2 | 3 | 'ALL'>('ALL');

  // Modals state
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<StackClass3D | null>(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<StackCard | null>(null);

  // Camera & Orbit state
  const [cameraYaw, setCameraYaw] = useState<number>(0);
  const [cameraPitch, setCameraPitch] = useState<number>(10);
  const [cameraZoom, setCameraZoom] = useState<number>(1.0);
  const [autoSpin, setAutoSpin] = useState<boolean>(true);
  const [spinDeg, setSpinDeg] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Viewport dimensions
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Drag tracking refs (avoiding React state thrashing during drag §5.4)
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafSpinIdRef = useRef<number | null>(null);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Active Class lookup
  const activeClass = useMemo(() => {
    return classes.find((c) => c.id === activeClassId) || classes[0];
  }, [classes, activeClassId]);

  // VSEPR Macro Class coordinates (memoized §5.4)
  const classCoordinates = useMemo(() => {
    return resolveVSEPRClassPositions(
      classes.length,
      vseprMode,
      dimensions.width,
      dimensions.height
    );
  }, [classes.length, vseprMode, dimensions.width, dimensions.height]);

  // Map 3D positions to classes
  const classPositionsMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number; z: number }>();
    classes.forEach((c, idx) => {
      const coord = classCoordinates[idx] || { x: 0, y: 0, z: 0 };
      map.set(c.id, { x: coord.x, y: coord.y, z: coord.z });
    });
    return map;
  }, [classes, classCoordinates]);

  // 60 FPS Auto-spin loop (~6.75°/sec §1.2)
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (autoSpin && !isDraggingRef.current && !selectedCardId) {
        setSpinDeg((prev) => (prev + delta * 6.75) % 360);
      }

      rafSpinIdRef.current = requestAnimationFrame(loop);
    };

    rafSpinIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafSpinIdRef.current !== null) {
        cancelAnimationFrame(rafSpinIdRef.current);
      }
    };
  }, [autoSpin, selectedCardId]);

  // Pointer drag controls (orbit rotation)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setCameraYaw((prev) => (prev + dx * 0.35) % 360);
    // Clamp pitch between -65° and +65° to avoid gimbal flip (§5.4)
    setCameraPitch((prev) => Math.max(-65, Math.min(65, prev - dy * 0.35)));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.0012;
    setCameraZoom((prev) => Math.max(0.65, Math.min(1.65, prev + zoomDelta)));
  };

  // Card Iteration Handlers (Next & Previous)
  const handleNextCard = useCallback(() => {
    if (!activeClass.cards || activeClass.cards.length === 0) return;
    const currentIdx = activeClass.cards.findIndex((c) => c.id === selectedCardId);
    const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % activeClass.cards.length;
    setSelectedCardId(activeClass.cards[nextIdx].id);
  }, [activeClass.cards, selectedCardId]);

  const handlePrevCard = useCallback(() => {
    if (!activeClass.cards || activeClass.cards.length === 0) return;
    const currentIdx = activeClass.cards.findIndex((c) => c.id === selectedCardId);
    const prevIdx = currentIdx === -1 ? 0 : (currentIdx - 1 + activeClass.cards.length) % activeClass.cards.length;
    setSelectedCardId(activeClass.cards[prevIdx].id);
  }, [activeClass.cards, selectedCardId]);

  // Keyboard controls (Space to toggle spin, ESC to back/deselect, R to reset, Arrows to iterate cards)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedCardId) {
          setSelectedCardId(null);
        } else if (viewMode === 'MICRO') {
          setViewMode('MACRO');
        }
      } else if (e.key === 'ArrowRight' && selectedCardId) {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === 'ArrowLeft' && selectedCardId) {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === ' ') {
        e.preventDefault();
        setAutoSpin((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        setCameraYaw(0);
        setCameraPitch(10);
        setCameraZoom(1.0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, selectedCardId, handleNextCard, handlePrevCard]);

  // Enter Class (Transition from Macro to Micro)
  const handleEnterClass = useCallback((classId: string) => {
    setActiveClassId(classId);
    setSelectedCardId(null); // Explicitly no auto-selected card on entry (§1.2)
    setViewMode('MICRO');
    setCameraYaw(0);
    setCameraPitch(12);
    setCameraZoom(1.0);
  }, []);

  // Back to Macro View
  const handleBackToMacro = useCallback(() => {
    setViewMode('MACRO');
    setSelectedCardId(null);
    setCameraYaw(0);
    setCameraPitch(10);
    setCameraZoom(1.0);
  }, []);

  // Change 3D Card Structure Template for active class
  const handleTemplateChange = (template: Template3D) => {
    setSelectedCardId(null); // Keep selectedCardId null on structure change (§1.2)
    setClasses((prev) =>
      prev.map((c) => (c.id === activeClassId ? { ...c, template } : c))
    );
  };

  // Stack Class CRUD
  const handleOpenCreateStack = () => {
    setEditingClass(null);
    setClassModalOpen(true);
  };

  const handleOpenEditStack = () => {
    setEditingClass(activeClass);
    setClassModalOpen(true);
  };

  const handleSaveClass = (data: {
    id?: string;
    name: string;
    subject: string;
    template: Template3D;
    accentColor: string;
    description: string;
  }) => {
    if (data.id) {
      setClasses((prev) =>
        prev.map((c) =>
          c.id === data.id
            ? {
                ...c,
                name: data.name,
                subject: data.subject,
                template: data.template,
                accentColor: data.accentColor,
                description: data.description,
              }
            : c
        )
      );
    } else {
      const newId = `stack_${Date.now()}`;
      const newClass: StackClass3D = {
        id: newId,
        name: data.name,
        subject: data.subject,
        template: data.template,
        accentColor: data.accentColor,
        description: data.description,
        cards: [
          {
            id: `card_${Date.now()}_1`,
            classId: newId,
            title: `${data.name} Core Axiom`,
            subtitle: 'Fundamental Theorem',
            cardType: 'CONCEPT',
            summary: `Core principles and theoretical framework of ${data.name}.`,
            detailedNotes: `Systematic review notes for ${data.name}.`,
            keyTakeaways: [
              `Core axioms and mathematical foundations of ${data.name}.`,
              'High-frequency exam derivations and definitions.',
              'Integration with board question papers.',
            ],
            tags: [data.subject.toLowerCase(), 'theory'],
            masteryLevel: 1,
            accentColor: data.accentColor,
          },
        ],
      };
      setClasses((prev) => [...prev, newClass]);
      setActiveClassId(newId);
      setViewMode('MICRO');
      setSelectedCardId(null);
    }
  };

  const handleDeleteClass = (classId: string) => {
    setClasses((prev) => {
      const remaining = prev.filter((c) => c.id !== classId);
      if (remaining.length > 0) {
        setActiveClassId(remaining[0].id);
      }
      return remaining.length > 0 ? remaining : MOCK_CHEMISTRY_STACK_CLASSES;
    });
    setViewMode('MACRO');
    setSelectedCardId(null);
  };

  // Card CRUD
  const handleOpenAddCard = () => {
    setEditingCard(null);
    setCardModalOpen(true);
  };

  const handleOpenEditCard = (card: StackCard) => {
    setEditingCard(card);
    setCardModalOpen(true);
  };

  const handleSaveCard = (
    cardData: Omit<StackCard, 'id' | 'classId'>,
    existingId?: string
  ) => {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id !== activeClassId) return cls;
        if (existingId) {
          return {
            ...cls,
            cards: cls.cards.map((c) =>
              c.id === existingId
                ? { ...c, ...cardData, classId: activeClassId }
                : c
            ),
          };
        } else {
          const newCard: StackCard = {
            ...cardData,
            id: `card_${Date.now()}`,
            classId: activeClassId,
          };
          return {
            ...cls,
            cards: [...cls.cards, newCard],
          };
        }
      })
    );
  };

  const handleDeleteCard = (cardId: string) => {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id !== activeClassId) return cls;
        return {
          ...cls,
          cards: cls.cards.filter((c) => c.id !== cardId),
        };
      })
    );
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5,
        background: 'transparent',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'none',
        perspective: '1600px',
        WebkitPerspective: '1600px',
      }}
    >
      {/* ─── 48px Coordinate Grid Background ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundSize: '48px 48px',
          backgroundImage:
            'linear-gradient(to right, rgba(242, 242, 242, 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(242, 242, 242, 0.035) 1px, transparent 1px)',
          pointerEvents: 'none',
        }}
      />

      {/* ─── Synchronized 60 FPS 2D Canvas Overlay ─── */}
      <StacksCanvasOverlay
        viewMode={viewMode}
        viewportWidth={dimensions.width}
        viewportHeight={dimensions.height}
        cameraYaw={cameraYaw}
        cameraPitch={cameraPitch}
        cameraZoom={cameraZoom}
        classPositions={Array.from(classPositionsMap.values())}
        centerDotWorld={{ x: 28, y: 6, z: 0 }}
        cards={viewMode === 'MICRO' ? activeClass.cards : []}
        activeTemplate={activeClass.template}
        spinDeg={spinDeg}
        selectedCardId={selectedCardId}
        connections={MOCK_CARD_CONNECTIONS}
        connectionFilterLevel={connectionFilter}
      />

      {/* ─── Main 3D Scene Container (Strictly preserve-3d, NO blur filters §5.1) ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
          transform: `scale(${cameraZoom}) rotateX(${cameraPitch}deg) rotateY(${cameraYaw}deg)`,
          transition: isDragging ? 'none' : 'transform 0.25s ease-out',
        }}
      >
        {/* ─── LEVEL 1: MACRO STACK SPACE ─── */}
        {viewMode === 'MACRO' && (
          <>
            {/* Central 3D Glowing Nucleus Orb with Gyroscopic Orbital Rings & Photons */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate3d(28px, 6px, 0)',
                transformStyle: 'preserve-3d',
                pointerEvents: 'none',
              }}
            >
              {/* Equatorial 3D Ring (Plane X-Z) */}
              <div
                style={{
                  position: 'absolute',
                  width: '54px',
                  height: '54px',
                  top: '-27px',
                  left: '-27px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255, 255, 255, 0.65)',
                  boxShadow: '0 0 16px rgba(255, 255, 255, 0.8), inset 0 0 10px rgba(51, 240, 255, 0.5)',
                  transform: `rotateX(90deg) rotateZ(${spinDeg * 1.5}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              />

              {/* Polar 3D Ring (Plane Y-Z) */}
              <div
                style={{
                  position: 'absolute',
                  width: '54px',
                  height: '54px',
                  top: '-27px',
                  left: '-27px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(51, 240, 255, 0.65)',
                  boxShadow: '0 0 16px rgba(51, 240, 255, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.4)',
                  transform: `rotateY(90deg) rotateZ(${spinDeg * -1.2}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              />

              {/* Diagonal 3D Ring (45° Tilt) */}
              <div
                style={{
                  position: 'absolute',
                  width: '46px',
                  height: '46px',
                  top: '-23px',
                  left: '-23px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.75)',
                  boxShadow: '0 0 14px rgba(255, 255, 255, 0.6)',
                  transform: `rotateX(45deg) rotateY(45deg) rotateZ(${spinDeg * 2}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              />

              {/* Counter-Diagonal 3D Ring (-45° Tilt) */}
              <div
                style={{
                  position: 'absolute',
                  width: '46px',
                  height: '46px',
                  top: '-23px',
                  left: '-23px',
                  borderRadius: '50%',
                  border: '1px solid rgba(0, 240, 255, 0.65)',
                  boxShadow: '0 0 14px rgba(0, 240, 255, 0.6)',
                  transform: `rotateX(-45deg) rotateY(-45deg) rotateZ(${spinDeg * -2}deg)`,
                  transformStyle: 'preserve-3d',
                }}
              />

              {/* Volumetric 3D Spherical Core (Plane XY) */}
              <div
                style={{
                  position: 'absolute',
                  width: '24px',
                  height: '24px',
                  top: '-12px',
                  left: '-12px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #D8F8FF 40%, rgba(51, 240, 255, 0.4) 75%, transparent 100%)',
                  boxShadow: '0 0 20px #FFFFFF, 0 0 35px rgba(51, 240, 255, 0.9)',
                  transform: 'rotateY(0deg)',
                }}
              />

              {/* Volumetric 3D Spherical Core (Plane YZ) */}
              <div
                style={{
                  position: 'absolute',
                  width: '24px',
                  height: '24px',
                  top: '-12px',
                  left: '-12px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #D8F8FF 40%, rgba(51, 240, 255, 0.4) 75%, transparent 100%)',
                  boxShadow: '0 0 20px #FFFFFF, 0 0 35px rgba(51, 240, 255, 0.9)',
                  transform: 'rotateY(90deg)',
                }}
              />

              {/* Volumetric 3D Spherical Core (Plane XZ) */}
              <div
                style={{
                  position: 'absolute',
                  width: '24px',
                  height: '24px',
                  top: '-12px',
                  left: '-12px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #D8F8FF 40%, rgba(51, 240, 255, 0.4) 75%, transparent 100%)',
                  boxShadow: '0 0 20px #FFFFFF, 0 0 35px rgba(51, 240, 255, 0.9)',
                  transform: 'rotateX(90deg)',
                }}
              />

              {/* Orbiting 3D Quantum Photons on elliptical 3D paths */}
              {[0, 1, 2].map((pIdx) => {
                const angle = ((spinDeg * 2.2 + pIdx * 120) * Math.PI) / 180;
                const px = Math.cos(angle) * 32;
                const py = Math.sin(angle * 1.5) * 16;
                const pz = Math.sin(angle) * 32;
                return (
                  <div
                    key={pIdx}
                    style={{
                      position: 'absolute',
                      width: '6px',
                      height: '6px',
                      top: '-3px',
                      left: '-3px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      boxShadow: '0 0 10px #FFFFFF, 0 0 18px #33F0FF',
                      transform: `translate3d(${px}px, ${py}px, ${pz}px)`,
                    }}
                  />
                );
              })}
            </div>

            {/* VSEPR 3D Classes */}
            {classes.map((c) => {
              const pos = classPositionsMap.get(c.id) || { x: 0, y: 0, z: 0 };
              return (
                <MacroClassCluster3D
                  key={c.id}
                  stackClass={c}
                  position={pos}
                  spinDeg={spinDeg}
                  isHovered={false}
                  onEnter={handleEnterClass}
                />
              );
            })}
          </>
        )}

        {/* ─── LEVEL 2: MICRO 3D CLASS VIEW ─── */}
        {viewMode === 'MICRO' && (
          <div
            style={{
              position: 'relative',
              width: '0px',
              height: '0px',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* 3D Cards inside the active class */}
            {activeClass.cards.map((card, idx) => {
              const transform = computeCardTransform3D(
                idx,
                activeClass.cards.length,
                activeClass.template,
                selectedCardId === card.id ? idx : null,
                spinDeg
              );

              return (
                <StackCard3D
                  key={card.id}
                  card={card}
                  transform={transform}
                  isSelected={selectedCardId === card.id}
                  onSelect={(id) => setSelectedCardId((prev) => (prev === id ? null : id))}
                  onEditCard={handleOpenEditCard}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Stacks Tactical HUD Overlay ─── */}
      <StacksHUD
        viewMode={viewMode}
        activeClassName={activeClass?.name}
        vseprMode={vseprMode}
        onVseprChange={setVseprMode}
        activeTemplate={activeClass.template}
        onTemplateChange={handleTemplateChange}
        connectionFilter={connectionFilter}
        onConnectionFilterChange={setConnectionFilter}
        autoSpin={autoSpin}
        onToggleAutoSpin={() => setAutoSpin((prev) => !prev)}
        onResetCamera={() => {
          setCameraYaw(0);
          setCameraPitch(10);
          setCameraZoom(1.0);
        }}
        onBackToMacro={handleBackToMacro}
        onCreateStack={handleOpenCreateStack}
        onEditStack={handleOpenEditStack}
        onAddCard={handleOpenAddCard}
      />

      {/* ─── Centered Card Interactive Navigation Controls ─── */}
      {viewMode === 'MICRO' && selectedCardId && (
        <div
          style={{
            position: 'fixed',
            bottom: '88px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 18px',
            borderRadius: '9999px',
            background: typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light'
              ? 'rgba(255, 255, 255, 0.88)'
              : 'rgba(12, 12, 16, 0.88)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light'
              ? '1px solid rgba(0, 0, 0, 0.14)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
            userSelect: 'none',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevCard();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light' ? '#111114' : '#FFFFFF',
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Previous Card (Left Arrow)"
          >
            ← PREVIOUS
          </button>

          <span
            style={{
              fontFamily: 'var(--font-subheading)',
              fontSize: '10px',
              letterSpacing: '1.5px',
              color: typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light' ? '#6B7280' : 'rgba(242, 242, 242, 0.65)',
              padding: '0 6px',
            }}
          >
            CARD {activeClass.cards.findIndex((c) => c.id === selectedCardId) + 1} OF {activeClass.cards.length}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextCard();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light' ? '#111114' : '#FFFFFF',
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Next Card (Right Arrow)"
          >
            NEXT →
          </button>

          <div
            style={{
              width: '1px',
              height: '16px',
              background: typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light'
                ? 'rgba(0, 0, 0, 0.12)'
                : 'rgba(255, 255, 255, 0.2)',
            }}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCardId(null);
            }}
            style={{
              background: typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light' ? '#111114' : '#FFFFFF',
              color: typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light' ? '#FFFFFF' : '#000000',
              border: 'none',
              borderRadius: '9999px',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Close Centered View (ESC)"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── Stack Class Create / Edit Modal ─── */}
      <StackClassModal
        isOpen={classModalOpen}
        onClose={() => setClassModalOpen(false)}
        onSave={handleSaveClass}
        onDelete={handleDeleteClass}
        initialClass={editingClass}
      />

      {/* ─── Stack Card Add / Edit Modal ─── */}
      <StackCardModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        initialCard={editingCard}
        classNameTitle={activeClass?.name}
      />
    </div>
  );
};

export default StacksWorkspace;
