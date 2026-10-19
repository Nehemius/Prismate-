import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

/**
 * Particle representation flowing along harmonic wave streamlines,
 * inspired by the motion.dev particle hero field.
 */
interface WaveParticle {
  x: number;
  y: number;
  vx: number;
  radius: number;
  baseAlpha: number;
  currentAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  streamIndex: number;
  streamOffset: number; // Vertical offset from streamline center
}

/**
 * Harmonic wave stream definition that guides particle trajectories.
 */
interface Streamline {
  offsetY: number;
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
  secondaryAmp: number;
  secondaryFreq: number;
}

const DEFAULT_STREAMLINES: Streamline[] = [
  {
    offsetY: -45,
    amplitude: 70,
    frequency: 0.0018,
    speed: 0.38,
    phase: 0.0,
    secondaryAmp: 25,
    secondaryFreq: 0.0035,
  },
  {
    offsetY: -15,
    amplitude: 85,
    frequency: 0.0022,
    speed: 0.52,
    phase: 1.6,
    secondaryAmp: 30,
    secondaryFreq: 0.0042,
  },
  {
    offsetY: 15,
    amplitude: 95,
    frequency: 0.0016,
    speed: 0.42,
    phase: 3.2,
    secondaryAmp: 35,
    secondaryFreq: 0.0031,
  },
  {
    offsetY: 45,
    amplitude: 75,
    frequency: 0.0026,
    speed: 0.60,
    phase: 4.8,
    secondaryAmp: 20,
    secondaryFreq: 0.0050,
  },
  {
    offsetY: 0,
    amplitude: 60,
    frequency: 0.0030,
    speed: 0.46,
    phase: 2.1,
    secondaryAmp: 28,
    secondaryFreq: 0.0038,
  },
];

const TOTAL_PARTICLES = 1400;

export interface WaveCanvasProps {
  /**
   * When false, completely halts the requestAnimationFrame loop (0% CPU/GPU).
   * When true, renders at 60fps.
   * @default true
   */
  active?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** Optional point coordinate to continuously sample wave density */
  samplePoint?: { x: number; y: number };
  /** Callback receiving calculated wave charge (0.0 to 1.0) on every active frame */
  onWaveChargeUpdate?: (charge: number) => void;
  /** Callback fired once mounted, passing the getWaveCharge calculation function */
  onChargeReady?: (getWaveChargeFn: (x: number, y: number) => number) => void;
}

export interface WaveCanvasRef {
  /**
   * Calculates real-time particle wave density at coordinate (x, y).
   * Returns a normalized value from 0.0 (no particle density) to 1.0 (peak density).
   */
  getWaveCharge: (x: number, y: number) => number;
  /** Returns the underlying HTML5 Canvas element */
  getCanvas: () => HTMLCanvasElement | null;
}

// Module-level reference to active wave instance
let activeDensityGetter: ((x: number, y: number) => number) | null = null;

export const getWaveCharge = (x: number, y: number): number => {
  if (activeDensityGetter) {
    return activeDensityGetter(x, y);
  }
  return 0.3;
};

export const WaveCanvas = forwardRef<WaveCanvasRef, WaveCanvasProps>(
  (
    {
      active = true,
      className,
      style,
      samplePoint,
      onWaveChargeUpdate,
      onChargeReady,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const timeRef = useRef<number>(0);
    const lastTimestampRef = useRef<number | null>(null);

    const particlesRef = useRef<WaveParticle[]>([]);
    const smoothedChargeRef = useRef<number>(0.2);

    const samplePointRef = useRef(samplePoint);
    const onWaveChargeUpdateRef = useRef(onWaveChargeUpdate);

    useEffect(() => {
      samplePointRef.current = samplePoint;
      onWaveChargeUpdateRef.current = onWaveChargeUpdate;
    }, [samplePoint, onWaveChargeUpdate]);

    // Initialize particle field
    const initParticles = useCallback((width: number, height: number) => {
      const particles: WaveParticle[] = [];
      const streamsCount = DEFAULT_STREAMLINES.length;
      const centerY = height * 0.5;

      for (let i = 0; i < TOTAL_PARTICLES; i++) {
        const x = Math.random() * (width + 100) - 50;
        const streamIndex = Math.floor(Math.random() * streamsCount);
        const stream = DEFAULT_STREAMLINES[streamIndex];

        // Normal distribution for streamOffset so particles cluster around the center line
        const u1 = Math.random();
        const u2 = Math.random();
        const randStdNormal =
          Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * Math.cos(2.0 * Math.PI * u2);
        const streamOffset = randStdNormal * 28; // Spread within ~50px bandwidth

        const initialY =
          centerY +
          stream.offsetY +
          streamOffset +
          stream.amplitude * Math.sin(x * stream.frequency + stream.phase);

        // Particle size distribution: mostly 1.0 - 1.8px, occasional 2.2 - 2.6px
        const rRand = Math.random();
        let radius = 1.1;
        if (rRand > 0.85) radius = 2.2;
        else if (rRand > 0.55) radius = 1.6;
        else if (rRand < 0.25) radius = 0.85;

        // Base alpha between 0.25 and 0.95
        const baseAlpha = 0.25 + Math.random() * 0.7;

        // Drift speed: 0.8 to 2.4 px/frame
        const vx = 0.8 + Math.random() * 1.6;

        particles.push({
          x,
          y: initialY,
          vx,
          radius,
          baseAlpha,
          currentAlpha: baseAlpha,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.02 + Math.random() * 0.04,
          streamIndex,
          streamOffset,
        });
      }

      particlesRef.current = particles;
    }, []);

    // Calculate real-time wave charge (particle density around coordinate x, y)
    const calculateChargeAtPoint = useCallback(
      (px: number, py: number): number => {
        const particles = particlesRef.current;
        if (particles.length === 0) return 0.2;

        const radius = 140; // Sampling neighborhood in pixels
        const radiusSq = radius * radius;
        let weightedSum = 0;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          const dx = p.x - px;
          const dy = p.y - py;
          const distSq = dx * dx + dy * dy;

          if (distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            // Linear falloff with particle alpha weighting
            weightedSum += (1.0 - dist / radius) * (p.currentAlpha || p.baseAlpha);
          }
        }

        // Baseline: ~12-16 weighted particles is normal, 35+ is peak wave convergence
        const normalized = Math.min(1.0, weightedSum / 36);
        return normalized;
      },
      []
    );

    const instanceGetWaveCharge = useCallback(
      (x: number, y: number): number => {
        return calculateChargeAtPoint(x, y);
      },
      [calculateChargeAtPoint]
    );

    // Expose imperative ref
    useImperativeHandle(
      ref,
      () => ({
        getWaveCharge: instanceGetWaveCharge,
        getCanvas: () => canvasRef.current,
      }),
      [instanceGetWaveCharge]
    );

    // Register active global getter
    useEffect(() => {
      activeDensityGetter = instanceGetWaveCharge;
      if (onChargeReady) {
        onChargeReady(instanceGetWaveCharge);
      }
      return () => {
        if (activeDensityGetter === instanceGetWaveCharge) {
          activeDensityGetter = null;
        }
      };
    }, [instanceGetWaveCharge, onChargeReady]);

    // Handle canvas resizing
    const handleResize = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        if (particlesRef.current.length === 0) {
          initParticles(width, height);
        }
      }
    }, [initParticles]);

    useEffect(() => {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, [handleResize]);

    // Render loop
    const renderFrame = useCallback(
      (timestamp: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Delta-time based progression
        if (lastTimestampRef.current !== null) {
          const delta = (timestamp - lastTimestampRef.current) / 1000;
          timeRef.current += Math.min(delta, 0.1);
        }
        lastTimestampRef.current = timestamp;

        const width = canvas.width;
        const height = canvas.height;
        const time = timeRef.current;
        const centerY = height * 0.5;

        let particles = particlesRef.current;
        if (particles.length === 0) {
          initParticles(width, height);
          particles = particlesRef.current;
        }

        // Pure black canvas background #000000
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        const streams = DEFAULT_STREAMLINES;
        const streamsCount = streams.length;

        // Update and draw particles in pure white
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Compute current streamline target Y
          const stream = streams[p.streamIndex];
          const targetY =
            centerY +
            stream.offsetY +
            p.streamOffset +
            stream.amplitude *
              Math.sin(p.x * stream.frequency + time * stream.speed + stream.phase) +
            stream.secondaryAmp *
              Math.sin(p.x * stream.secondaryFreq - time * 0.35);

          // Smooth vertical spring towards streamline
          p.y += (targetY - p.y) * 0.08;

          // Advance horizontally
          p.x += p.vx;

          // Twinkle alpha variation
          p.twinklePhase += p.twinkleSpeed;
          const twinkle = 0.8 + 0.2 * Math.sin(p.twinklePhase);
          p.currentAlpha = Math.max(0.1, Math.min(1.0, p.baseAlpha * twinkle));

          // Screen wrap-around
          if (p.x > width + 30) {
            p.x = -30 - Math.random() * 40;
            p.streamIndex = Math.floor(Math.random() * streamsCount);
            const u1 = Math.random();
            const u2 = Math.random();
            const randNorm =
              Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * Math.cos(2.0 * Math.PI * u2);
            p.streamOffset = randNorm * 28;
            const newStream = streams[p.streamIndex];
            p.y =
              centerY +
              newStream.offsetY +
              p.streamOffset +
              newStream.amplitude *
                Math.sin(p.x * newStream.frequency + time * newStream.speed + newStream.phase);
          }

          // Render glowing white particle dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.currentAlpha.toFixed(3)})`;
          ctx.fill();
        }

        // Sample point charge update
        if (samplePointRef.current && onWaveChargeUpdateRef.current) {
          const rawCharge = calculateChargeAtPoint(
            samplePointRef.current.x,
            samplePointRef.current.y
          );
          // Smooth charge update
          smoothedChargeRef.current +=
            (rawCharge - smoothedChargeRef.current) * 0.1;
          onWaveChargeUpdateRef.current(smoothedChargeRef.current);
        }
      },
      [initParticles, calculateChargeAtPoint]
    );

    // Animation frame scheduler
    useEffect(() => {
      if (!active) {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        lastTimestampRef.current = null;
        return;
      }

      lastTimestampRef.current = null;

      const loop = (timestamp: number) => {
        renderFrame(timestamp);
        rafIdRef.current = requestAnimationFrame(loop);
      };

      rafIdRef.current = requestAnimationFrame(loop);

      return () => {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
      };
    }, [active, renderFrame]);

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          display: 'block',
          ...style,
        }}
        aria-hidden="true"
      />
    );
  }
);

WaveCanvas.displayName = 'WaveCanvas';

export default WaveCanvas;
