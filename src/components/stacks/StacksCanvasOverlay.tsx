import React, { useEffect, useRef } from 'react';
import type { CardConnection, StackCard, Template3D } from '../../types/stacks';
import {
  project3DPointToScreen,
  calculateCircularArc,
  computeCardTransform3D,
} from '../../utils/spatialMath';

interface StacksCanvasOverlayProps {
  viewMode: 'MACRO' | 'MICRO';
  viewportWidth: number;
  viewportHeight: number;
  cameraYaw: number;
  cameraPitch: number;
  cameraZoom: number;
  // Macro data
  classPositions?: { x: number; y: number; z: number }[];
  centerDotWorld?: { x: number; y: number; z: number };
  // Micro data
  cards?: StackCard[];
  activeTemplate?: Template3D;
  spinDeg?: number;
  selectedCardId?: string | null;
  connections?: CardConnection[];
  connectionFilterLevel?: 1 | 2 | 3 | 'ALL';
}

export const StacksCanvasOverlay: React.FC<StacksCanvasOverlayProps> = ({
  viewMode,
  viewportWidth,
  viewportHeight,
  cameraYaw,
  cameraPitch,
  cameraZoom,
  classPositions = [],
  centerDotWorld = { x: 28, y: 6, z: 0 },
  cards = [],
  activeTemplate = 'SPHERE',
  spinDeg = 0,
  selectedCardId = null,
  connections = [],
  connectionFilterLevel = 'ALL',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewportWidth <= 0 || viewportHeight <= 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Pitfall #2: Cap dpr to 1.5 to prevent high-DPI frame rate collapse
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    canvas.width = viewportWidth * dpr;
    canvas.height = viewportHeight * dpr;
    ctx.scale(dpr, dpr);

    // Clear frame
    ctx.clearRect(0, 0, viewportWidth, viewportHeight);

    // Project Central Nucleus Dot
    const centerDotScreen = project3DPointToScreen(
      centerDotWorld.x,
      centerDotWorld.y,
      centerDotWorld.z,
      cameraYaw,
      cameraPitch,
      cameraZoom,
      viewportWidth,
      viewportHeight
    );

    // ────────────────────────────────────────────────────────────────
    // 1. MACRO VIEW RENDERING (VSEPR Molecular Coordination Bonds)
    // ────────────────────────────────────────────────────────────────
    if (viewMode === 'MACRO' && classPositions.length > 0) {
      const projectedClasses = classPositions.map((pos) =>
        project3DPointToScreen(
          pos.x,
          pos.y,
          pos.z,
          cameraYaw,
          cameraPitch,
          cameraZoom,
          viewportWidth,
          viewportHeight
        )
      );

      // A. Radial VSEPR Coordination Bonds from Center Nucleus Dot to each Class
      // Halo pass (low opacity wide stroke)
      ctx.beginPath();
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      projectedClasses.forEach((p) => {
        if (p.visible && centerDotScreen.visible) {
          ctx.moveTo(centerDotScreen.x, centerDotScreen.y);
          ctx.lineTo(p.x, p.y);
        }
      });
      ctx.stroke();

      // Core crisp pass
      ctx.beginPath();
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      projectedClasses.forEach((p) => {
        if (p.visible && centerDotScreen.visible) {
          ctx.moveTo(centerDotScreen.x, centerDotScreen.y);
          ctx.lineTo(p.x, p.y);
        }
      });
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // B. Inter-Class Molecular Peripheral Bonds (connecting adjacent classes)
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      for (let i = 0; i < projectedClasses.length; i++) {
        const next = (i + 1) % projectedClasses.length;
        const p1 = projectedClasses[i];
        const p2 = projectedClasses[next];
        if (p1.visible && p2.visible) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
      ctx.stroke();

      return;
    }

    // ────────────────────────────────────────────────────────────────
    // 2. MICRO VIEW RENDERING (Dotted Wireframes & Circular Arcs)
    // ────────────────────────────────────────────────────────────────
    if (viewMode === 'MICRO' && cards.length > 0) {
      // Compute 3D transforms for all cards
      const transforms3D = cards.map((_, idx) =>
        computeCardTransform3D(idx, cards.length, activeTemplate, null, spinDeg)
      );

      // Project each card's 3D position to 2D screen coordinates
      const screenPoints = transforms3D.map((t) =>
        project3DPointToScreen(
          t.x,
          t.y,
          t.z,
          cameraYaw,
          cameraPitch,
          cameraZoom,
          viewportWidth,
          viewportHeight
        )
      );

      // Card ID to Screen Point Map for connection lookup
      const cardScreenMap = new Map<string, { x: number; y: number; visible: boolean }>();
      cards.forEach((c, idx) => {
        cardScreenMap.set(c.id, screenPoints[idx]);
      });

      // A. Tiny Dotted Structure Wireframes (§1.2 & §5.2)
      // Connect structural neighbor cards to reveal polyhedron/helix/ring skeleton
      // Strictly NO solid orbit circle as requested
      ctx.beginPath();
      ctx.setLineDash([2, 5]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';

      if (activeTemplate === 'RING') {
        // Closed ring loop
        for (let i = 0; i < screenPoints.length; i++) {
          const next = (i + 1) % screenPoints.length;
          const p1 = screenPoints[i];
          const p2 = screenPoints[next];
          if (p1.visible && p2.visible) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
      } else if (activeTemplate === 'HELIX') {
        // Continuous spiral thread
        for (let i = 0; i < screenPoints.length - 1; i++) {
          const p1 = screenPoints[i];
          const p2 = screenPoints[i + 1];
          if (p1.visible && p2.visible) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
      } else if (activeTemplate === 'SPHERE') {
        // Triangular mesh connecting nearest neighbor points
        for (let i = 0; i < screenPoints.length; i++) {
          const p1 = screenPoints[i];
          if (!p1.visible) continue;
          // Connect to next 1 and 2 indices along Fibonacci sequence
          [1, 2].forEach((offset) => {
            const j = (i + offset) % screenPoints.length;
            const p2 = screenPoints[j];
            if (p2.visible) {
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
            }
          });
        }
      } else if (activeTemplate === 'GRID') {
        const cols = Math.ceil(Math.sqrt(cards.length));
        for (let i = 0; i < screenPoints.length; i++) {
          const p1 = screenPoints[i];
          if (!p1.visible) continue;
          // Horizontal neighbor
          if ((i + 1) % cols !== 0 && i + 1 < screenPoints.length) {
            const p2 = screenPoints[i + 1];
            if (p2.visible) {
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
            }
          }
          // Vertical neighbor
          if (i + cols < screenPoints.length) {
            const p2 = screenPoints[i + cols];
            if (p2.visible) {
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
            }
          }
        }
      }
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // B. True Mathematical Circular Arc Connections (§4.2)
      // Option A: Pure Monochrome Glowing White Lines
      const activeConnections = connections.filter((conn) => {
        if (connectionFilterLevel !== 'ALL' && conn.strength !== connectionFilterLevel) {
          return false;
        }
        if (selectedCardId && conn.fromCardId !== selectedCardId && conn.toCardId !== selectedCardId) {
          return false;
        }
        return true;
      });

      // Pass 1: Outer Optical Halo (White glow)
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      activeConnections.forEach((conn) => {
        const p1 = cardScreenMap.get(conn.fromCardId);
        const p2 = cardScreenMap.get(conn.toCardId);
        if (!p1 || !p2 || !p1.visible || !p2.visible) return;

        const arc = calculateCircularArc(
          p1.x,
          p1.y,
          p2.x,
          p2.y,
          viewportWidth / 2,
          viewportHeight / 2
        );
        if (arc) {
          ctx.beginPath();
          ctx.arc(
            arc.circleCenterX,
            arc.circleCenterY,
            arc.radius,
            arc.angleA,
            arc.angleB,
            arc.counterClockwise
          );
          ctx.stroke();
        }
      });

      // Pass 2: Core Crisp Arc (High contrast #FFFFFF)
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      activeConnections.forEach((conn) => {
        const p1 = cardScreenMap.get(conn.fromCardId);
        const p2 = cardScreenMap.get(conn.toCardId);
        if (!p1 || !p2 || !p1.visible || !p2.visible) return;

        const arc = calculateCircularArc(
          p1.x,
          p1.y,
          p2.x,
          p2.y,
          viewportWidth / 2,
          viewportHeight / 2
        );
        if (arc) {
          ctx.beginPath();
          ctx.arc(
            arc.circleCenterX,
            arc.circleCenterY,
            arc.radius,
            arc.angleA,
            arc.angleB,
            arc.counterClockwise
          );
          ctx.stroke();
        }
      });
    }
  }, [
    viewMode,
    viewportWidth,
    viewportHeight,
    cameraYaw,
    cameraPitch,
    cameraZoom,
    classPositions,
    centerDotWorld,
    cards,
    activeTemplate,
    spinDeg,
    selectedCardId,
    connections,
    connectionFilterLevel,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default StacksCanvasOverlay;
