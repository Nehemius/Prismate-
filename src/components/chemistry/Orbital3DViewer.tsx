import React, { useRef, useEffect, useState, useCallback } from 'react';

export type FieldMode = 'octahedral' | 'tetrahedral';
export type OrbitalFilter = 'all' | 'axial' | 'interaxial' | 'dz2' | 'dx2y2' | 'dxy' | 'dyz' | 'dxz';

interface Orbital3DViewerProps {
  isLight?: boolean;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface ProjectedPoint {
  x: number;
  y: number;
  depth: number;
}

export const Orbital3DViewer: React.FC<Orbital3DViewerProps> = ({ isLight = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [fieldMode, setFieldMode] = useState<FieldMode>('octahedral');
  const [activeFilter, setActiveFilter] = useState<OrbitalFilter>('all');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [showLigandVectors, setShowLigandVectors] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Rotation angles in radians
  const rotXRef = useRef<number>(0.38);
  const rotYRef = useRef<number>(-0.62);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 3D Matrix Rotation & Projection
  const project = useCallback(
    (p: Point3D, width: number, height: number): ProjectedPoint => {
      const rx = rotXRef.current;
      const ry = rotYRef.current;

      // Rotate around Y axis
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x1 = p.x * cosY + p.z * sinY;
      const y1 = p.y;
      const z1 = -p.x * sinY + p.z * cosY;

      // Rotate around X axis
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      // Perspective projection
      const cameraDistance = 420;
      const scale = (cameraDistance / (cameraDistance + z2 * 0.95)) * zoomLevel;

      const screenX = width / 2 + x2 * scale;
      const screenY = height / 2 - y2 * scale; // Invert Y for screen coords

      return { x: screenX, y: screenY, depth: z2 };
    },
    [zoomLevel]
  );

  // Render Loop
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (isAutoRotating && !isDraggingRef.current) {
        rotYRef.current += 0.006;
      }

      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Background gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) / 1.5
      );
      if (isLight) {
        bgGrad.addColorStop(0, '#FFFFFF');
        bgGrad.addColorStop(1, '#F0F4FA');
      } else {
        bgGrad.addColorStop(0, 'rgba(18, 24, 38, 0.95)');
        bgGrad.addColorStop(1, 'rgba(8, 10, 16, 0.98)');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Bounding Glass Cube Size
      const cubeHalf = 95;

      // 8 Vertices of the bounding cube
      const cubeCorners: Point3D[] = [
        { x: -cubeHalf, y: -cubeHalf, z: -cubeHalf }, // 0: ---
        { x: cubeHalf, y: -cubeHalf, z: -cubeHalf },  // 1: +--
        { x: cubeHalf, y: cubeHalf, z: -cubeHalf },   // 2: ++-
        { x: -cubeHalf, y: cubeHalf, z: -cubeHalf },  // 3: -+-
        { x: -cubeHalf, y: -cubeHalf, z: cubeHalf },  // 4: --+
        { x: cubeHalf, y: -cubeHalf, z: cubeHalf },   // 5: +-+
        { x: cubeHalf, y: cubeHalf, z: cubeHalf },    // 6: +++
        { x: -cubeHalf, y: cubeHalf, z: cubeHalf },   // 7: -++
      ];

      const projCorners = cubeCorners.map((p) => project(p, width, height));

      // Cube faces (each with 4 vertex indices, normal, and depth)
      const faces = [
        { indices: [0, 1, 2, 3], name: 'back' },
        { indices: [4, 5, 6, 7], name: 'front' },
        { indices: [0, 1, 5, 4], name: 'bottom' },
        { indices: [2, 3, 7, 6], name: 'top' },
        { indices: [0, 3, 7, 4], name: 'left' },
        { indices: [1, 2, 6, 5], name: 'right' },
      ].map((face) => {
        const avgDepth =
          face.indices.reduce((sum, idx) => sum + projCorners[idx].depth, 0) / 4;
        return { ...face, avgDepth };
      });

      // Sort faces: depth > 0 is farther away (back), depth < 0 is closer (front)
      const backFaces = faces.filter((f) => f.avgDepth > 0);
      const frontFaces = faces.filter((f) => f.avgDepth <= 0);

      // Draw back glass faces
      backFaces.forEach((face) => {
        ctx.beginPath();
        face.indices.forEach((idx, i) => {
          const pt = projCorners[idx];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.fillStyle = isLight
          ? 'rgba(180, 220, 255, 0.16)'
          : 'rgba(56, 189, 248, 0.08)';
        ctx.fill();
        ctx.strokeStyle = isLight
          ? 'rgba(0, 119, 238, 0.22)'
          : 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // In Tetrahedral mode: draw guide planes connecting tetrahedral vertices
      if (fieldMode === 'tetrahedral') {
        // Ligands are at 4 alternate corners: [4 (--+), 1 (+--), 6 (+++), 3 (-+-)]
        // Draw translucent triangle planes
        ctx.beginPath();
        ctx.moveTo(projCorners[4].x, projCorners[4].y);
        ctx.lineTo(projCorners[1].x, projCorners[1].y);
        ctx.lineTo(projCorners[6].x, projCorners[6].y);
        ctx.closePath();
        ctx.fillStyle = isLight
          ? 'rgba(236, 72, 153, 0.12)'
          : 'rgba(236, 72, 153, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Central Equatorial Plane Grid (XY Plane)
      const eqCorners: ProjectedPoint[] = [
        { x: -cubeHalf, y: 0, z: -cubeHalf },
        { x: cubeHalf, y: 0, z: -cubeHalf },
        { x: cubeHalf, y: 0, z: cubeHalf },
        { x: -cubeHalf, y: 0, z: cubeHalf },
      ].map((p) => project(p, width, height));

      ctx.beginPath();
      eqCorners.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.closePath();
      ctx.fillStyle = isLight
        ? 'rgba(190, 215, 245, 0.12)'
        : 'rgba(147, 197, 253, 0.06)';
      ctx.fill();
      ctx.strokeStyle = isLight
        ? 'rgba(100, 150, 220, 0.25)'
        : 'rgba(147, 197, 253, 0.2)';
      ctx.stroke();

      // Draw Cartesian Coordinate Axes (X, Y, Z)
      const axisLen = cubeHalf * 1.65;
      const origin = project({ x: 0, y: 0, z: 0 }, width, height);

      const axes = [
        { name: 'X', negName: fieldMode === 'tetrahedral' ? "X'" : '-X', end: { x: axisLen, y: 0, z: 0 }, negEnd: { x: -axisLen, y: 0, z: 0 } },
        { name: 'Y', negName: fieldMode === 'tetrahedral' ? "Y'" : '-Y', end: { x: 0, y: 0, z: axisLen }, negEnd: { x: 0, y: 0, z: -axisLen } },
        { name: 'Z', negName: fieldMode === 'tetrahedral' ? "Z'" : '-Z', end: { x: 0, y: axisLen, z: 0 }, negEnd: { x: 0, y: -axisLen, z: 0 } },
      ];

      axes.forEach((axis) => {
        const pEnd = project(axis.end, width, height);
        const pNeg = project(axis.negEnd, width, height);

        // Dashed axis line through origin
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(pNeg.x, pNeg.y);
        ctx.lineTo(pEnd.x, pEnd.y);
        ctx.strokeStyle = isLight ? '#1F2937' : '#E5E7EB';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Label positive axis
        ctx.font = 'bold 13px var(--font-heading), sans-serif';
        ctx.fillStyle = isLight ? '#111827' : '#F9FAFB';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(axis.name, pEnd.x + (pEnd.x > origin.x ? 14 : -14), pEnd.y + (pEnd.y > origin.y ? 14 : -14));

        // Label negative axis
        ctx.fillText(axis.negName, pNeg.x + (pNeg.x > origin.x ? 14 : -14), pNeg.y + (pNeg.y > origin.y ? 14 : -14));
      });

      // ── Helper to draw a 3D orbital lobe with smooth radial shading ──
      const drawLobe = (
        direction: Point3D,
        length: number,
        radius: number,
        colorHex: string,
        label?: string
      ) => {
        const tip = project(
          {
            x: direction.x * length,
            y: direction.y * length,
            z: direction.z * length,
          },
          width,
          height
        );

        const mid = project(
          {
            x: direction.x * (length * 0.55),
            y: direction.y * (length * 0.55),
            z: direction.z * (length * 0.55),
          },
          width,
          height
        );

        // Elliptical lobe path from origin to tip and back
        const dx = tip.x - origin.x;
        const dy = tip.y - origin.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 1) return;

        // Normal perpendicular vector on 2D screen
        const nx = -dy / dist;
        const ny = dx / dist;

        const lobeWidth = radius * (420 / (420 + mid.depth * 0.95)) * zoomLevel;

        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        ctx.quadraticCurveTo(
          origin.x + dx * 0.4 + nx * lobeWidth,
          origin.y + dy * 0.4 + ny * lobeWidth,
          tip.x,
          tip.y
        );
        ctx.quadraticCurveTo(
          origin.x + dx * 0.4 - nx * lobeWidth,
          origin.y + dy * 0.4 - ny * lobeWidth,
          origin.x,
          origin.y
        );
        ctx.closePath();

        // 3D Shading gradient on the lobe
        const lobeGrad = ctx.createRadialGradient(
          mid.x - nx * (lobeWidth * 0.3),
          mid.y - ny * (lobeWidth * 0.3),
          lobeWidth * 0.1,
          mid.x,
          mid.y,
          lobeWidth * 1.5
        );
        lobeGrad.addColorStop(0, '#FFFFFF');
        lobeGrad.addColorStop(0.35, colorHex);
        lobeGrad.addColorStop(1, `${colorHex}CC`);

        ctx.fillStyle = lobeGrad;
        ctx.fill();
        ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Optional label callout
        if (label) {
          ctx.font = '10px var(--font-content), monospace';
          ctx.fillStyle = isLight ? '#111827' : '#FFFFFF';
          ctx.fillText(label, tip.x + (dx > 0 ? 12 : -12), tip.y + (dy > 0 ? 10 : -10));
        }
      };

      // ── Draw Torus Ring for dz2 Orbital ──
      const drawTorus = (torusRadius: number, colorHex: string) => {
        const numPts = 32;
        const ringPoints: ProjectedPoint[] = [];
        for (let i = 0; i <= numPts; i++) {
          const theta = (i / numPts) * Math.PI * 2;
          const x = Math.cos(theta) * torusRadius;
          const z = Math.sin(theta) * torusRadius;
          ringPoints.push(project({ x, y: 0, z }, width, height));
        }

        ctx.beginPath();
        ringPoints.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 4 * zoomLevel;
        ctx.stroke();
      };

      // ── Determine which orbitals to render based on activeFilter ──
      const shouldRender = (orb: string) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'axial' && (orb === 'dz2' || orb === 'dx2y2')) return true;
        if (activeFilter === 'interaxial' && (orb === 'dxy' || orb === 'dyz' || orb === 'dxz')) return true;
        return activeFilter === orb;
      };

      // Orbital Colors matching textbook images:
      // dz2: Purple (#7C3AED / #8B5CF6)
      // dx2-y2: Purple (#8B5CF6)
      // dxy: Red (#EF4444)
      // dyz: Yellow (#EAB308)
      // dxz: Green (#22C55E)
      const lobeLen = 78;
      const lobeRad = 19;

      // 1. dz2 (Purple): 2 vertical lobes along Z (in our coordinate system Y is UP) + Torus
      if (shouldRender('dz2')) {
        drawLobe({ x: 0, y: 1, z: 0 }, lobeLen * 1.05, lobeRad * 1.15, '#7C3AED', 'dz²');
        drawLobe({ x: 0, y: -1, z: 0 }, lobeLen * 1.05, lobeRad * 1.15, '#7C3AED');
        drawTorus(34, '#A855F7');
      }

      // 2. dx2-y2 (Purple): 4 lobes along X and Y axes (here X and Z coordinate plane)
      if (shouldRender('dx2y2')) {
        drawLobe({ x: 1, y: 0, z: 0 }, lobeLen, lobeRad, '#8B5CF6', 'dx²-y²');
        drawLobe({ x: -1, y: 0, z: 0 }, lobeLen, lobeRad, '#8B5CF6');
        drawLobe({ x: 0, y: 0, z: 1 }, lobeLen, lobeRad, '#8B5CF6');
        drawLobe({ x: 0, y: 0, z: -1 }, lobeLen, lobeRad, '#8B5CF6');
      }

      // 3. dxy (Red): 4 lobes in XY plane (between X and Z in 3D projection)
      if (shouldRender('dxy')) {
        const invSqrt2 = 1 / Math.SQRT2;
        drawLobe({ x: invSqrt2, y: 0, z: invSqrt2 }, lobeLen * 0.9, lobeRad * 0.95, '#EF4444', 'dxy');
        drawLobe({ x: -invSqrt2, y: 0, z: -invSqrt2 }, lobeLen * 0.9, lobeRad * 0.95, '#EF4444');
        drawLobe({ x: invSqrt2, y: 0, z: -invSqrt2 }, lobeLen * 0.9, lobeRad * 0.95, '#EF4444');
        drawLobe({ x: -invSqrt2, y: 0, z: invSqrt2 }, lobeLen * 0.9, lobeRad * 0.95, '#EF4444');
      }

      // 4. dyz (Yellow): 4 lobes in YZ plane (between Y and Z in 3D projection)
      if (shouldRender('dyz')) {
        const invSqrt2 = 1 / Math.SQRT2;
        drawLobe({ x: 0, y: invSqrt2, z: invSqrt2 }, lobeLen * 0.9, lobeRad * 0.95, '#EAB308', 'dyz');
        drawLobe({ x: 0, y: -invSqrt2, z: -invSqrt2 }, lobeLen * 0.9, lobeRad * 0.95, '#EAB308');
        drawLobe({ x: 0, y: invSqrt2, z: -invSqrt2 }, lobeLen * 0.9, lobeRad * 0.95, '#EAB308');
        drawLobe({ x: 0, y: -invSqrt2, z: invSqrt2 }, lobeLen * 0.9, lobeRad * 0.95, '#EAB308');
      }

      // 5. dxz (Green): 4 lobes in XZ plane (between X and Y in 3D projection)
      if (shouldRender('dxz')) {
        const invSqrt2 = 1 / Math.SQRT2;
        drawLobe({ x: invSqrt2, y: invSqrt2, z: 0 }, lobeLen * 0.9, lobeRad * 0.95, '#22C55E', 'dxz');
        drawLobe({ x: -invSqrt2, y: -invSqrt2, z: 0 }, lobeLen * 0.9, lobeRad * 0.95, '#22C55E');
        drawLobe({ x: invSqrt2, y: -invSqrt2, z: 0 }, lobeLen * 0.9, lobeRad * 0.95, '#22C55E');
        drawLobe({ x: -invSqrt2, y: invSqrt2, z: 0 }, lobeLen * 0.9, lobeRad * 0.95, '#22C55E');
      }

      // Draw front glass faces (with subtle highlight)
      frontFaces.forEach((face) => {
        ctx.beginPath();
        face.indices.forEach((idx, i) => {
          const pt = projCorners[idx];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.fillStyle = isLight
          ? 'rgba(180, 220, 255, 0.18)'
          : 'rgba(56, 189, 248, 0.10)';
        ctx.fill();
        ctx.strokeStyle = isLight
          ? 'rgba(0, 119, 238, 0.45)'
          : 'rgba(56, 189, 248, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // ── Draw Ligands with 3D Spheres & Approaching Vector Arrows ──
      const ligandDist = cubeHalf * 1.55;

      const octahedralLigands = [
        { label: 'L₄', pos: { x: 0, y: ligandDist, z: 0 } },      // Top (+Z in textbook)
        { label: 'L₁', pos: { x: 0, y: -ligandDist, z: 0 } },     // Bottom (-Z)
        { label: 'L₂', pos: { x: ligandDist, y: 0, z: 0 } },      // Right (+X)
        { label: 'L₅', pos: { x: -ligandDist, y: 0, z: 0 } },     // Left (-X)
        { label: 'L₃', pos: { x: 0, y: 0, z: ligandDist } },      // Front (+Y)
        { label: 'L₆', pos: { x: 0, y: 0, z: -ligandDist } },     // Back (-Y)
      ];

      const tetCornerDist = cubeHalf * 1.45;
      const tetrahedralLigands = [
        { label: 'L₁', pos: { x: -tetCornerDist, y: -tetCornerDist, z: tetCornerDist } }, // Bottom front left
        { label: 'L₂', pos: { x: tetCornerDist, y: -tetCornerDist, z: -tetCornerDist } },  // Bottom back right
        { label: 'L₃', pos: { x: tetCornerDist, y: tetCornerDist, z: tetCornerDist } },    // Top front right
        { label: 'L₄', pos: { x: -tetCornerDist, y: tetCornerDist, z: -tetCornerDist } },  // Top back left
      ];

      const activeLigands = fieldMode === 'octahedral' ? octahedralLigands : tetrahedralLigands;

      activeLigands.forEach((lig) => {
        const pLig = project(lig.pos, width, height);

        // Vector arrow from ligand pointing toward origin (metal center)
        if (showLigandVectors) {
          const arrowTarget = project(
            {
              x: lig.pos.x * 0.72,
              y: lig.pos.y * 0.72,
              z: lig.pos.z * 0.72,
            },
            width,
            height
          );

          ctx.beginPath();
          ctx.setLineDash([3, 3]);
          ctx.moveTo(pLig.x, pLig.y);
          ctx.lineTo(arrowTarget.x, arrowTarget.y);
          ctx.strokeStyle = isLight ? '#111827' : '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.setLineDash([]);

          // Arrowhead
          const adx = arrowTarget.x - pLig.x;
          const ady = arrowTarget.y - pLig.y;
          const aAngle = Math.atan2(ady, adx);
          const arrowHeadLen = 9;

          ctx.beginPath();
          ctx.moveTo(arrowTarget.x, arrowTarget.y);
          ctx.lineTo(
            arrowTarget.x - arrowHeadLen * Math.cos(aAngle - Math.PI / 6),
            arrowTarget.y - arrowHeadLen * Math.sin(aAngle - Math.PI / 6)
          );
          ctx.lineTo(
            arrowTarget.x - arrowHeadLen * Math.cos(aAngle + Math.PI / 6),
            arrowTarget.y - arrowHeadLen * Math.sin(aAngle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = isLight ? '#111827' : '#FFFFFF';
          ctx.fill();
        }

        // Green Ligand Sphere (Textbook green #22C55E / #16A34A with specular 3D highlight)
        const ligRadius = 13 * (420 / (420 + pLig.depth * 0.95)) * zoomLevel;

        const sphereGrad = ctx.createRadialGradient(
          pLig.x - ligRadius * 0.35,
          pLig.y - ligRadius * 0.35,
          ligRadius * 0.1,
          pLig.x,
          pLig.y,
          ligRadius
        );
        sphereGrad.addColorStop(0, '#86EFAC');
        sphereGrad.addColorStop(0.4, '#22C55E');
        sphereGrad.addColorStop(1, '#15803D');

        ctx.beginPath();
        ctx.arc(pLig.x, pLig.y, ligRadius, 0, Math.PI * 2);
        ctx.fillStyle = sphereGrad;
        ctx.fill();
        ctx.strokeStyle = '#14532D';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Ligand Label (e.g. L1, L2, L3, L4, L5, L6)
        ctx.font = 'bold 12px var(--font-heading), sans-serif';
        ctx.fillStyle = isLight ? '#065F46' : '#BBF7D0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(lig.label, pLig.x, pLig.y - ligRadius - 3);
      });

      // Central Metal Ion (Co³⁺ / Fe³⁺ / Mⁿ⁺) at origin
      ctx.beginPath();
      ctx.arc(origin.x, origin.y, 7 * zoomLevel, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#1E293B' : '#E2E8F0';
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [fieldMode, activeFilter, isAutoRotating, showLigandVectors, zoomLevel, isLight, project]);

  // Pointer drag event handlers for 3D rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;

    rotYRef.current += deltaX * 0.008;
    rotXRef.current -= deltaY * 0.008;

    // Clamp pitch to avoid flipping upside-down
    rotXRef.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, rotXRef.current));

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        color: isLight ? '#111114' : '#F2F2F2',
      }}
    >
      {/* ── Top Bar Controls ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 16px',
          background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(16, 20, 28, 0.85)',
          borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px 12px 0 0',
        }}
      >
        {/* Field Mode Toggle (Figure 5.9 vs Figure 5.12) */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', letterSpacing: '1px', opacity: 0.7 }}>
            CRYSTAL FIELD:
          </span>
          <button
            onClick={() => setFieldMode('octahedral')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              letterSpacing: '1px',
              cursor: 'pointer',
              background: fieldMode === 'octahedral' ? (isLight ? '#111114' : '#38BDF8') : 'transparent',
              color: fieldMode === 'octahedral' ? (isLight ? '#FFFFFF' : '#000000') : (isLight ? '#111114' : '#F2F2F2'),
              border: isLight ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.2)',
              fontWeight: 700,
            }}
          >
            FIG 5.9: OCTAHEDRAL (6 LIGANDS)
          </button>
          <button
            onClick={() => setFieldMode('tetrahedral')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              letterSpacing: '1px',
              cursor: 'pointer',
              background: fieldMode === 'tetrahedral' ? (isLight ? '#111114' : '#EC4899') : 'transparent',
              color: fieldMode === 'tetrahedral' ? '#FFFFFF' : (isLight ? '#111114' : '#F2F2F2'),
              border: isLight ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.2)',
              fontWeight: 700,
            }}
          >
            FIG 5.12: TETRAHEDRAL (4 LIGANDS)
          </button>
        </div>

        {/* View Tools */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setIsAutoRotating((r) => !r)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontFamily: 'var(--font-subheading)',
              fontSize: '10px',
              letterSpacing: '1px',
              cursor: 'pointer',
              background: isAutoRotating ? (isLight ? 'rgba(0,119,238,0.15)' : 'rgba(56,189,248,0.2)') : 'transparent',
              color: isAutoRotating ? (isLight ? '#0077EE' : '#38BDF8') : (isLight ? '#4B5563' : 'rgba(242,242,242,0.6)'),
              border: isLight ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {isAutoRotating ? '⏸ PAUSE ROTATION' : '▶ AUTO ROTATE'}
          </button>
          <button
            onClick={() => setShowLigandVectors((v) => !v)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontFamily: 'var(--font-subheading)',
              fontSize: '10px',
              letterSpacing: '1px',
              cursor: 'pointer',
              background: showLigandVectors ? (isLight ? 'rgba(16,185,129,0.15)' : 'rgba(34,197,94,0.2)') : 'transparent',
              color: showLigandVectors ? (isLight ? '#059669' : '#4ADE80') : (isLight ? '#4B5563' : 'rgba(242,242,242,0.6)'),
              border: isLight ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {showLigandVectors ? '✓ LIGAND VECTORS' : '✗ LIGAND VECTORS'}
          </button>
          <button
            onClick={() => {
              rotXRef.current = 0.38;
              rotYRef.current = -0.62;
              setZoomLevel(1);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              fontFamily: 'var(--font-subheading)',
              fontSize: '10px',
              cursor: 'pointer',
              background: 'transparent',
              border: isLight ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.15)',
              color: isLight ? '#111114' : '#F2F2F2',
            }}
            title="Reset 3D Camera"
          >
            RESET VIEW
          </button>
        </div>
      </div>

      {/* ── Orbital Filter Pills ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          padding: '8px 16px',
          background: isLight ? 'rgba(245, 248, 255, 0.85)' : 'rgba(12, 16, 24, 0.75)',
          borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-subheading)', letterSpacing: '1px', opacity: 0.6, marginRight: '4px' }}>
          ORBITAL FILTER:
        </span>
        {(
          [
            { id: 'all', label: 'All 5 Orbitals' },
            { id: 'axial', label: 'Axial (eg: dz², dx²-y²)' },
            { id: 'interaxial', label: 'Interaxial (t2g: dxy, dyz, dxz)' },
            { id: 'dz2', label: 'dz² (Purple)' },
            { id: 'dx2y2', label: 'dx²-y² (Purple)' },
            { id: 'dxy', label: 'dxy (Red)' },
            { id: 'dyz', label: 'dyz (Yellow)' },
            { id: 'dxz', label: 'dxz (Green)' },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            style={{
              padding: '4px 10px',
              borderRadius: '14px',
              fontFamily: 'monospace',
              fontSize: '10px',
              cursor: 'pointer',
              background: activeFilter === f.id
                ? (isLight ? '#111114' : '#FFFFFF')
                : (isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)'),
              color: activeFilter === f.id
                ? (isLight ? '#FFFFFF' : '#000000')
                : (isLight ? '#374151' : 'rgba(242,242,242,0.7)'),
              border: isLight
                ? (activeFilter === f.id ? '1px solid #111114' : '1px solid rgba(0,0,0,0.15)')
                : (activeFilter === f.id ? '1px solid #FFFFFF' : '1px solid rgba(255,255,255,0.15)'),
              fontWeight: activeFilter === f.id ? 700 : 500,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── 3D Canvas Workspace ── */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          minHeight: '380px',
          overflow: 'hidden',
          cursor: isDraggingRef.current ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <canvas
          ref={canvasRef}
          width={760}
          height={440}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {/* Dynamic Textbook Annotation Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '16px',
            right: '16px',
            background: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(10, 12, 18, 0.88)',
            border: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '12px 16px',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            pointerEvents: 'none',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', letterSpacing: '1px', color: isLight ? '#111827' : '#F9FAFB' }}>
              {fieldMode === 'octahedral'
                ? 'Figure 5.9 Octahedral Ligand Field (Coordination Chemistry §5.3)'
                : 'Figure 5.12 d-Orbitals in Tetrahedral Ligand Field (§5.4)'}
            </div>
            <div style={{ fontFamily: 'var(--font-content)', fontSize: '11px', color: isLight ? '#4B5563' : 'rgba(242,242,242,0.7)', marginTop: '2px' }}>
              {fieldMode === 'octahedral'
                ? 'Six ligands approach directly along the X, Y, and Z Cartesian axes. Axial eg orbitals (dz², dx²-y²) suffer direct head-on electrostatic repulsion and split upwards by +3/5 Δo.'
                : 'Four ligands approach from alternate corners of the cube. Interaxial t2 orbitals (dxy, dyz, dxz) lie closer to the corners and split upwards by +2/5 Δt.'}
            </div>
          </div>

          <div
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              color: isLight ? '#0077EE' : '#38BDF8',
            }}
          >
            {fieldMode === 'octahedral' ? 'Δo = 10 Dq' : 'Δt = (4/9) Δo'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orbital3DViewer;
