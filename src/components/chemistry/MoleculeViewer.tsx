/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";

interface MoleculeViewerProps {
  sdfName: string;
  viewerId: string;
  autoRotate?: boolean;
  transparent?: boolean;
}

export const MoleculeViewer: React.FC<MoleculeViewerProps> = ({
  sdfName,
  viewerId,
  autoRotate = true,
  transparent = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const releaseTimerRef = useRef<any>(null);

  useEffect(() => {
    let active = true;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const initViewer = async () => {
      setLoading(true);
      setError(null);
      let attempts = 0;
      while (!(window as any).$3Dmol && attempts < 35) {
        await new Promise((res) => setTimeout(res, 200));
        attempts++;
      }

      const $3Dmol = (window as any).$3Dmol;
      if (!$3Dmol) {
        if (active) setError("3Dmol.js WebGL viewer failed to load. Check network.");
        setLoading(false);
        return;
      }

      if (!containerRef.current || !active) return;
      containerRef.current.innerHTML = "";

      try {
        const response = await fetch(`/molecules/${sdfName}.sdf`);
        if (!response.ok) throw new Error(`SDF file not found: /molecules/${sdfName}.sdf`);
        const sdfText = await response.text();
        if (!active) return;

        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: transparent ? 0x000000 : 0x0a0a0c,
          backgroundAlpha: transparent ? 0 : 0.85,
        });
        viewerRef.current = viewer;

        const model = viewer.addModel(sdfText, "sdf");
        const atoms = model.selectedAtoms({});

        // CPK Molecular Color Protocol
        atoms.forEach((atom: any) => {
          let color = "#FFFFFF";
          let radiusRatio = 0.35;

          switch (atom.elem) {
            case "C": color = "#333338"; radiusRatio = 1.00; break;
            case "H": color = "#F2F2F2"; radiusRatio = 0.35; break;
            case "O": color = "#FF2233"; radiusRatio = 0.65; break;
            case "N": color = "#33F0FF"; radiusRatio = 0.70; break;
            case "Cl": color = "#1FF01F"; radiusRatio = 0.80; break;
            case "Br": color = "#EB104B"; radiusRatio = 0.85; break;
            case "I": color = "#9400D3"; radiusRatio = 0.95; break;
            case "Na": color = "#7450E6"; radiusRatio = 1.10; break;
            default: color = "#8A8A8A"; radiusRatio = 1.00;
          }

          viewer.setStyle(
            { serial: atom.serial },
            {
              sphere: { color: color, radius: 0.38 * radiusRatio },
              stick: { color: "#555560", radius: 0.08 },
            }
          );
        });

        viewer.resize();
        viewer.zoomTo();
        viewer.render();
        setLoading(false);
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to render 3D molecule.");
          setLoading(false);
        }
      }
    };

    initViewer();
    return () => {
      active = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [sdfName, transparent]);

  // 60 FPS Orbit Rotation with Pause-on-Touch
  useEffect(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (!autoRotate || isInteracting) return;

    let frame = 0;
    const spin = () => {
      frame++;
      if (frame % 2 === 0 && viewerRef.current) {
        try {
          viewerRef.current.rotate(1, "y");
          viewerRef.current.render();
        } catch {}
      }
      animationRef.current = requestAnimationFrame(spin);
    };

    const timer = setTimeout(spin, 400);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [autoRotate, loading, isInteracting]);

  return (
    <div
      onMouseDown={() => setIsInteracting(true)}
      onTouchStart={() => setIsInteracting(true)}
      onMouseUp={() => {
        if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
        releaseTimerRef.current = setTimeout(() => setIsInteracting(false), 3000);
      }}
      onTouchEnd={() => {
        if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
        releaseTimerRef.current = setTimeout(() => setIsInteracting(false), 3000);
      }}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: transparent ? 'transparent' : 'linear-gradient(135deg, rgba(14,14,16,0.9), rgba(6,6,8,0.95))',
        borderRadius: '16px',
        border: '1px solid rgba(242,242,242,0.12)',
        boxShadow: 'inset 0 1px 0 0 rgba(242,242,242,0.15)',
      }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '2px solid rgba(51, 240, 255, 0.2)',
              borderTopColor: '#33F0FF',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '8px',
            }}
          />
          <span
            style={{
              fontSize: '10px',
              color: 'rgba(242,242,242,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontFamily: 'var(--font-subheading)',
            }}
          >
            Loading 3D Molecule...
          </span>
        </div>
      )}
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(0, 0, 0, 0.95)',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <span style={{ color: '#EB104B', fontSize: '12px', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
            ⚠️ 3D Visualizer Fault
          </span>
          <span style={{ fontSize: '10px', color: 'rgba(242,242,242,0.6)', fontFamily: 'var(--font-content)' }}>
            {error}
          </span>
        </div>
      )}
      <div
        ref={containerRef}
        id={viewerId}
        style={{
          width: '100%',
          height: '100%',
          flex: 1,
          cursor: 'grab',
        }}
      />
      {!transparent && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            pointerEvents: 'none',
            background: 'rgba(0,0,0,0.75)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(242,242,242,0.15)',
            color: '#F2F2F2',
          }}
        >
          <span
            style={{
              fontSize: '8px',
              letterSpacing: '1.5px',
              color: '#33F0FF',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-subheading)',
            }}
          >
            3D WEBGL
          </span>
        </div>
      )}
    </div>
  );
};

export default MoleculeViewer;
