import type {
  Template3D,
  VSEPRClassGeometry,
  ComputedCardTransform,
} from '../types/stacks';

export interface VSEPRClassCoord {
  idIndex: number;
  x: number;
  y: number;
  z: number;
  role: 'EQUATORIAL' | 'AXIAL_NORTH' | 'AXIAL_SOUTH' | 'NUCLEUS';
}

/**
 * Resolves 3D VSEPR molecular geometry coordination points for classes in Macro View.
 * Bounded strictly within viewport boundaries to prevent screen clipping.
 */
export function resolveVSEPRClassPositions(
  count: number,
  geometryMode: VSEPRClassGeometry,
  viewportWidth: number,
  viewportHeight: number
): VSEPRClassCoord[] {
  const dockOffsetX = 28;  // Compensates for left floating navigation dock
  const centerOffsetY = 6; // Vertical optical center offset

  // Strictly clamp radii so all Equatorial & Axial classes + bottom HUD plaques fit inside 100vw x 100vh
  const eqRadiusX = Math.min(340, Math.max(210, viewportWidth * 0.25));
  const eqRadiusZ = Math.min(220, Math.max(140, viewportWidth * 0.16));
  const axialRadiusY = Math.min(185, Math.max(130, viewportHeight * 0.205));

  // Auto-resolve geometry from class count if AUTO
  let mode = geometryMode;
  if (mode === 'AUTO') {
    if (count <= 3) mode = 'TRIGONAL_PLANAR';
    else if (count === 4) mode = 'TETRAHEDRAL';
    else if (count === 5) mode = 'TRIGONAL_BIPYRAMIDAL';
    else if (count === 6) mode = 'OCTAHEDRAL';
    else mode = 'PENTAGONAL_BIPYRAMIDAL';
  }

  const coords: VSEPRClassCoord[] = [];

  switch (mode) {
    case 'TRIGONAL_PLANAR': {
      // 120° Equatorial Triangle
      for (let k = 0; k < count; k++) {
        const theta = -Math.PI / 2 + (k * (2 * Math.PI)) / Math.max(3, count);
        coords.push({
          idIndex: k,
          x: dockOffsetX + Math.cos(theta) * eqRadiusX,
          y: centerOffsetY,
          z: Math.sin(theta) * eqRadiusZ,
          role: 'EQUATORIAL',
        });
      }
      break;
    }

    case 'TETRAHEDRAL': {
      // 109.5° 3D Cage
      // Index 0: Top Apex
      coords.push({
        idIndex: 0,
        x: dockOffsetX,
        y: centerOffsetY - axialRadiusY,
        z: 0,
        role: 'AXIAL_NORTH',
      });
      // Indices 1..3: Basal Triangle at Y offset
      for (let k = 1; k < count; k++) {
        const theta = -Math.PI / 2 + ((k - 1) * (2 * Math.PI)) / 3;
        coords.push({
          idIndex: k,
          x: dockOffsetX + Math.cos(theta) * eqRadiusX * 0.95,
          y: centerOffsetY + axialRadiusY * 0.62,
          z: Math.sin(theta) * eqRadiusZ * 0.95,
          role: 'EQUATORIAL',
        });
      }
      break;
    }

    case 'TRIGONAL_BIPYRAMIDAL': {
      // 3 Equatorial at 120° + 2 Axial Poles at ±Y
      // Indices 0, 1, 2: Equatorial
      for (let k = 0; k < Math.min(3, count); k++) {
        const theta = -Math.PI / 2 + (k * (2 * Math.PI)) / 3;
        coords.push({
          idIndex: k,
          x: dockOffsetX + Math.cos(theta) * eqRadiusX,
          y: centerOffsetY,
          z: Math.sin(theta) * eqRadiusZ,
          role: 'EQUATORIAL',
        });
      }
      // Index 3: Top Axial Pole
      if (count > 3) {
        coords.push({
          idIndex: 3,
          x: dockOffsetX,
          y: centerOffsetY - axialRadiusY,
          z: 0,
          role: 'AXIAL_NORTH',
        });
      }
      // Index 4: Bottom Axial Pole
      if (count > 4) {
        coords.push({
          idIndex: 4,
          x: dockOffsetX,
          y: centerOffsetY + axialRadiusY,
          z: 0,
          role: 'AXIAL_SOUTH',
        });
      }
      // Remaining (if any)
      for (let k = 5; k < count; k++) {
        const theta = (k * (2 * Math.PI)) / count;
        coords.push({
          idIndex: k,
          x: dockOffsetX + Math.cos(theta) * eqRadiusX * 0.8,
          y: centerOffsetY + ((k % 2 === 0 ? 1 : -1) * axialRadiusY) / 2,
          z: Math.sin(theta) * eqRadiusZ * 0.8,
          role: 'EQUATORIAL',
        });
      }
      break;
    }

    case 'OCTAHEDRAL': {
      // 4 Equatorial at 90° + 2 Axial Poles
      for (let k = 0; k < Math.min(4, count); k++) {
        const theta = Math.PI / 4 + (k * Math.PI) / 2;
        coords.push({
          idIndex: k,
          x: dockOffsetX + Math.cos(theta) * eqRadiusX,
          y: centerOffsetY,
          z: Math.sin(theta) * eqRadiusZ,
          role: 'EQUATORIAL',
        });
      }
      if (count > 4) {
        coords.push({
          idIndex: 4,
          x: dockOffsetX,
          y: centerOffsetY - axialRadiusY,
          z: 0,
          role: 'AXIAL_NORTH',
        });
      }
      if (count > 5) {
        coords.push({
          idIndex: 5,
          x: dockOffsetX,
          y: centerOffsetY + axialRadiusY,
          z: 0,
          role: 'AXIAL_SOUTH',
        });
      }
      for (let k = 6; k < count; k++) {
        const theta = (k * (2 * Math.PI)) / count;
        coords.push({
          idIndex: k,
          x: dockOffsetX + Math.cos(theta) * eqRadiusX * 0.75,
          y: centerOffsetY,
          z: Math.sin(theta) * eqRadiusZ * 0.75,
          role: 'EQUATORIAL',
        });
      }
      break;
    }

    case 'PENTAGONAL_BIPYRAMIDAL':
    default: {
      // 5 Equatorial at 72° + 2 Axial Poles
      for (let k = 0; k < Math.min(5, count); k++) {
        const theta = -Math.PI / 2 + (k * (2 * Math.PI)) / 5;
        coords.push({
          idIndex: k,
          x: dockOffsetX + Math.cos(theta) * eqRadiusX,
          y: centerOffsetY,
          z: Math.sin(theta) * eqRadiusZ,
          role: 'EQUATORIAL',
        });
      }
      if (count > 5) {
        coords.push({
          idIndex: 5,
          x: dockOffsetX,
          y: centerOffsetY - axialRadiusY,
          z: 0,
          role: 'AXIAL_NORTH',
        });
      }
      if (count > 6) {
        coords.push({
          idIndex: 6,
          x: dockOffsetX,
          y: centerOffsetY + axialRadiusY,
          z: 0,
          role: 'AXIAL_SOUTH',
        });
      }
      for (let k = 7; k < count; k++) {
        const theta = (k * (2 * Math.PI)) / count;
        coords.push({
          idIndex: k,
          x: dockOffsetX + Math.cos(theta) * eqRadiusX * 0.7,
          y: centerOffsetY,
          z: Math.sin(theta) * eqRadiusZ * 0.7,
          role: 'EQUATORIAL',
        });
      }
      break;
    }
  }

  return coords;
}

/**
 * Exact 3D Card Structure Formulas for the Micro View.
 * Computes individual card transforms for SPHERE, RING, HELIX, GRID, COVERFLOW, and STACK.
 */
export function computeCardTransform3D(
  index: number,
  total: number,
  template: Template3D,
  selectedIndex: number | null,
  spinDeg: number = 0
): ComputedCardTransform {
  // When a card is clicked/selected, bring it directly to the center focal stage
  if (selectedIndex !== null && selectedIndex === index) {
    return {
      x: 0,
      y: 0,
      z: 240,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      scale: 1.22,
      opacity: 1,
    };
  }

  const spinRad = (spinDeg * Math.PI) / 180;
  const isAnotherSelected = selectedIndex !== null && selectedIndex !== index;
  const bgOpacity = isAnotherSelected ? 0.22 : 1;


  switch (template) {
    case 'SPHERE': {
      // Fibonacci Spherical Polyhedron
      const R = Math.max(240, Math.min(330, 215 + total * 10));
      const yNorm = total === 1 ? 0 : 1 - (index / (total - 1)) * 2; // +1 north to -1 south
      const ySafe = yNorm * 0.84; // Prevent polar gimbal pinch
      const radiusAtY = Math.sqrt(Math.max(0.001, 1 - ySafe * ySafe));
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const theta = index * goldenAngle + spinRad;

      const x = Math.cos(theta) * radiusAtY * R;
      const y = -ySafe * R * 0.88;
      const z = Math.sin(theta) * radiusAtY * R;

      const rotateY = (Math.atan2(x, z) * 180) / Math.PI;
      const rotateX = ((Math.asin(ySafe) * 180) / Math.PI) * 0.65;

      return {
        x,
        y,
        z,
        rotateX,
        rotateY,
        rotateZ: 0,
        scale: 1,
        opacity: bgOpacity,
      };
    }

    case 'RING': {
      // Horizontal Cylindrical Carousel
      const R = Math.max(260, Math.min(380, total * 48));
      const theta = (index / total) * Math.PI * 2 + spinRad;
      const x = Math.sin(theta) * R;
      const y = 0;
      const z = Math.cos(theta) * R;
      const rotateY = (theta * 180) / Math.PI;

      return {
        x,
        y,
        z,
        rotateX: 0,
        rotateY,
        rotateZ: 0,
        scale: 1,
        opacity: bgOpacity,
      };
    }

    case 'HELIX': {
      // Double-Pitch Cylindrical DNA Spiral
      const R = 275;
      const verticalStep = Math.min(72, Math.max(46, 380 / Math.max(1, total)));
      const theta = index * 0.92 + spinRad;
      const x = Math.sin(theta) * R;
      const y = (index - (total - 1) / 2) * verticalStep;
      const z = Math.cos(theta) * R;
      const rotateY = (theta * 180) / Math.PI;
      const rotateZ = -8; // Subtle helical pitch tilt

      return {
        x,
        y,
        z,
        rotateX: 0,
        rotateY,
        rotateZ,
        scale: 1,
        opacity: bgOpacity,
      };
    }

    case 'GRID': {
      // Parabolic Concave 3D Matrix Wall
      const cols = Math.ceil(Math.sqrt(total));
      const rows = Math.ceil(total / cols);
      const col = index % cols;
      const row = Math.floor(index / cols);
      const normX = col - (cols - 1) / 2;
      const normY = row - (rows - 1) / 2;

      const spacingX = 235;
      const spacingY = 265;
      const x = normX * spacingX;
      const y = normY * spacingY;
      // Parabolic Z-depth curve + inward yaw so outer columns angle toward viewer
      const z = -(normX * normX * 28 + normY * normY * 18);
      const rotateY = -normX * 12;
      const rotateX = normY * 8;

      return {
        x,
        y,
        z,
        rotateX,
        rotateY,
        rotateZ: 0,
        scale: 1,
        opacity: bgOpacity,
      };
    }

    case 'COVERFLOW': {
      // Center Focal Stage + Angled Side Wings
      const centerIdx = selectedIndex !== null ? selectedIndex : Math.floor((total - 1) / 2);
      const offset = index - centerIdx;
      if (offset === 0) {
        return { x: 0, y: 0, z: 120, rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1.06, opacity: 1 };
      }
      const dir = offset > 0 ? 1 : -1;
      const absOff = Math.abs(offset);
      const x = dir * (175 + (absOff - 1) * 115);
      const z = -absOff * 65;
      const rotateY = -dir * 48;

      return {
        x,
        y: 0,
        z,
        rotateX: 0,
        rotateY,
        rotateZ: 0,
        scale: Math.max(0.78, 1 - absOff * 0.08),
        opacity: Math.max(0.2, (1 - absOff * 0.18) * bgOpacity),
      };
    }

    case 'STACK':
    default: {
      // Isometric Depth-Staggered Z-Cascade
      const centerIdx = (total - 1) / 2;
      const rel = index - centerIdx;
      const x = rel * 48;
      const y = -rel * 26;
      const z = -index * 70;
      const rotateY = -18;
      const rotateX = 8;

      return {
        x,
        y,
        z,
        rotateX,
        rotateY,
        rotateZ: 0,
        scale: Math.max(0.75, 1 - Math.abs(rel) * 0.05),
        opacity: Math.max(0.2, (1 - Math.abs(rel) * 0.12) * bgOpacity),
      };
    }
  }
}

/**
 * Projects a 3D coordinate point in world space directly to 2D screen coordinates
 * synchronized with CSS perspective: 1600px.
 */
export function project3DPointToScreen(
  worldX: number,
  worldY: number,
  worldZ: number,
  cameraYawDeg: number,
  cameraPitchDeg: number,
  cameraZoom: number,
  viewportWidth: number,
  viewportHeight: number,
  perspective: number = 1600
): { x: number; y: number; scale: number; visible: boolean } {
  // 1. Apply camera zoom scaling
  const sx = worldX * cameraZoom;
  const sy = worldY * cameraZoom;
  const sz = worldZ * cameraZoom;

  // 2. Rotate around Y-axis (cameraYawDeg)
  const yawRad = (cameraYawDeg * Math.PI) / 180;
  const cosY = Math.cos(yawRad);
  const sinY = Math.sin(yawRad);
  const rx = sx * cosY + sz * sinY;
  const rz1 = -sx * sinY + sz * cosY;

  // 3. Rotate around X-axis (cameraPitchDeg)
  const pitchRad = (cameraPitchDeg * Math.PI) / 180;
  const cosP = Math.cos(pitchRad);
  const sinP = Math.sin(pitchRad);
  const ry = sy * cosP - rz1 * sinP;
  const rz2 = sy * sinP + rz1 * cosP;

  // 4. Perspective divide (CSS perspective = 1600px)
  const depth = perspective - rz2;
  if (depth <= 80) {
    return { x: viewportWidth / 2, y: viewportHeight / 2, scale: 0, visible: false };
  }
  const scale = perspective / depth;
  return {
    x: viewportWidth / 2 + rx * scale,
    y: viewportHeight / 2 + ry * scale,
    scale,
    visible: true,
  };
}

export interface CircularArcParams {
  circleCenterX: number;
  circleCenterY: number;
  radius: number;
  angleA: number;
  angleB: number;
  counterClockwise: boolean;
}

/**
 * Calculates exact circular arc parameters between two 2D screen points (x1, y1) and (x2, y2).
 * Sagitta h bulges outward from centerDotScreen.
 */
export function calculateCircularArc(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  centerDotScreenX: number,
  centerDotScreenY: number
): CircularArcParams | null {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const chordLen = Math.hypot(dx, dy);
  if (chordLen < 6) return null;

  // Midpoint of chord AB
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  // Unit normal perpendicular to chord AB, oriented outward from the central dot
  let nx = -dy / chordLen;
  let ny = dx / chordLen;
  const toMidX = mx - centerDotScreenX;
  const toMidY = my - centerDotScreenY;
  if (nx * toMidX + ny * toMidY < 0) {
    nx = -nx;
    ny = -ny;
  }

  // Circular arc sagitta (bulge height h) and exact circle radius R = h/2 + L^2 / (8h)
  const sagitta = Math.min(95, Math.max(18, chordLen * 0.22));
  const radius = sagitta / 2 + (chordLen * chordLen) / (8 * sagitta);

  // Circle center O = M - (R - h) * n
  const circleCenterX = mx - nx * (radius - sagitta);
  const circleCenterY = my - ny * (radius - sagitta);

  // Angles from circle center O to endpoints A, B, and Apex
  const angleA = Math.atan2(y1 - circleCenterY, x1 - circleCenterX);
  const angleB = Math.atan2(y2 - circleCenterY, x2 - circleCenterX);
  const apexX = mx + nx * sagitta;
  const apexY = my + ny * sagitta;
  const angleApex = Math.atan2(apexY - circleCenterY, apexX - circleCenterX);

  // Determine clockwise vs counter-clockwise so the short arc passes through Apex
  const normAngle = (a: number) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const dAB = normAngle(angleB - angleA);
  const dAApex = normAngle(angleApex - angleA);
  const counterClockwise = dAApex > dAB;

  return {
    circleCenterX,
    circleCenterY,
    radius,
    angleA,
    angleB,
    counterClockwise,
  };
}
