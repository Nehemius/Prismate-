import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type {
  StackClass3D,
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

export const StacksWorkspace: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<'MACRO' | 'MICRO'>('MACRO');
  const [activeClassId, setActiveClassId] = useState<string>('chem-coordination');
  const [classes, setClasses] = useState<StackClass3D[]>(MOCK_CHEMISTRY_STACK_CLASSES);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [vseprMode, setVseprMode] = useState<VSEPRClassGeometry>('AUTO');
  const [connectionFilter, setConnectionFilter] = useState<1 | 2 | 3 | 'ALL'>('ALL');

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

  // Keyboard controls (Space to toggle spin, ESC to back/deselect, R to reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedCardId) {
          setSelectedCardId(null);
        } else if (viewMode === 'MICRO') {
          setViewMode('MACRO');
        }
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
  }, [viewMode, selectedCardId]);

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
        background: '#000000',
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
            {/* Central Glowing White Nucleus Dot (§1.1: 16x16 pure white core, radial halo, pulsing ring, NO text) */}
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
              {/* Outer Pulsing Ring */}
              <div
                style={{
                  position: 'absolute',
                  top: '-20px',
                  left: '-20px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1.5px solid rgba(255, 255, 255, 0.45)',
                  boxShadow: '0 0 16px rgba(255, 255, 255, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.3)',
                  animation: 'al-ring-expand 2.4s ease-out infinite',
                }}
              />
              {/* Radial Halo */}
              <div
                style={{
                  position: 'absolute',
                  top: '-16px',
                  left: '-16px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.15) 60%, transparent 80%)',
                }}
              />
              {/* Core 16x16 Crisp White Dot */}
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '-8px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  boxShadow: '0 0 12px #FFFFFF, 0 0 24px rgba(255, 255, 255, 0.8)',
                }}
              />
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
      />
    </div>
  );
};

export default StacksWorkspace;
