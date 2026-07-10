"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";

interface MoleculeViewerProps {
  sdfName: string;
  viewerId: string;
  autoRotate?: boolean;
  transparent?: boolean;
}

export default function MoleculeViewer({ sdfName, viewerId, autoRotate = true, transparent = false }: MoleculeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    // Cancel any existing rotation loop when loading a new molecule
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const initViewer = async () => {
      // Wait for $3Dmol to be loaded on window
      let attempts = 0;
      while (!(window as any).$3Dmol && attempts < 30) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        attempts++;
      }

      const $3Dmol = (window as any).$3Dmol;
      if (!$3Dmol) {
        if (active) setError("3Dmol.js viewer failed to load. Check your internet connection.");
        setLoading(false);
        return;
      }

      if (!containerRef.current || !active) return;

      // Clear existing canvas in the container to avoid duplication
      containerRef.current.innerHTML = "";

      try {
        const response = await fetch(`/molecules/${sdfName}.sdf`);
        if (!response.ok) {
          throw new Error(`SDF file not found for ${sdfName}`);
        }
        const sdfText = await response.text();

        if (!active) return;

        // Create the viewer inside the container - Background pure white #FFFFFF
        const viewer = $3Dmol.createViewer(containerRef.current, {
          backgroundColor: "#FFFFFF",
        });
        viewerRef.current = viewer;

        // Add model
        const model = viewer.addModel(sdfText, "sdf");

        // Custom styling based on the exact CPK color protocol in Section 3.3
        const atoms = model.selectedAtoms({});
        atoms.forEach((atom: any) => {
          let color = "#FFFFFF";
          let radiusRatio = 0.35; // Default H ratio
          
          switch (atom.elem) {
            case "C":
              color = "#000000"; // Black
              radiusRatio = 1.00;
              break;
            case "H":
              color = "#D3D3D3"; // Light Grey
              radiusRatio = 0.35;
              break;
            case "O":
              color = "#FF0000"; // Red
              radiusRatio = 0.65;
              break;
            case "N":
              color = "#3050F8"; // Deep Cobalt Blue
              radiusRatio = 0.70;
              break;
            case "Cl":
              color = "#00FF00"; // Green
              radiusRatio = 0.80;
              break;
            case "F":
              color = "#0000FF"; // Blue
              radiusRatio = 0.50;
              break;
            case "Br":
              color = "#A62929"; // Deep Bronze Red
              radiusRatio = 0.85;
              break;
            case "I":
              color = "#8A2BE2"; // Violet
              radiusRatio = 0.95;
              break;
            case "Na":
              color = "#7450E6"; // Deep Violet-Amethyst
              radiusRatio = 1.10;
              break;
            default:
              color = "#8A8A8A"; // Dynamic fallback
              radiusRatio = 1.00;
          }

          // Apply standard CPK styles to atoms
          const atomSphereRadius = 0.35 * radiusRatio;
          viewer.setStyle(
            { serial: atom.serial },
            {
              sphere: { color: color, radius: atomSphereRadius },
              stick: { color: "#B0B0B0", radius: 0.08 } // Bonds Ash Gray #B0B0B0
            }
          );
        });

        viewer.zoomTo();
        viewer.render();
        setLoading(false);
      } catch (err) {
        console.error("3Dmol render error:", err);
        if (active) {
          const errMsg = err instanceof Error ? err.message : "Failed to render 3D molecule.";
          setError(errMsg);
          setLoading(false);
        }
      }
    };

    initViewer();

    return () => {
      active = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [sdfName]);

  // Adjust viewer size when container resizes
  useEffect(() => {
    const handleResize = () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.resize();
          viewerRef.current.render();
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isInteracting, setIsInteracting] = useState(false);
  const releaseTimerRef = useRef<any>(null);

  // Animation Rotation Loop (Y-axis slow spin) - suspended during active user interaction
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (!autoRotate || isInteracting) return;

    const spin = () => {
      if (containerRef.current && containerRef.current.getBoundingClientRect().width > 0 && viewerRef.current) {
        try {
          viewerRef.current.rotate(0.5, "y"); // Rotate 0.5 degrees per frame on Y-axis
          viewerRef.current.render();
        } catch {
          // Ignore
        }
      }
      animationRef.current = requestAnimationFrame(spin);
    };

    // Delay rotation start slightly to let model load completely
    const timeout = setTimeout(() => {
      spin();
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoRotate, loading, isInteracting]);

  const handleInteractionStart = () => {
    setIsInteracting(true);
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
  };

  const handleInteractionEnd = () => {
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current);
    }
    releaseTimerRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 3000);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (releaseTimerRef.current) {
        clearTimeout(releaseTimerRef.current);
      }
    };
  }, []);

  return (
    <div 
      onMouseDown={handleInteractionStart}
      onTouchStart={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onTouchEnd={handleInteractionEnd}
      className={`relative w-full flex-grow flex-shrink flex flex-col overflow-hidden transition-all ${
        transparent 
          ? "bg-transparent border-transparent" 
          : "bg-white rounded-2xl border border-black/10 shadow-inner min-h-[220px]"
      }`}
    >
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-2"></div>
          <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Loading 3D Model...</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/95 text-center z-10">
          <span className="text-red-400 text-xs mb-2">⚠️ Visualizer Fault</span>
          <span className="text-[10px] text-white/60 font-mono leading-relaxed">{error}</span>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="mt-4 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] uppercase tracking-wider text-white border border-white/15 font-mono"
          >
            Retry
          </button>
        </div>
      )}
      <div
        ref={containerRef}
        id={viewerId}
        className="w-full flex-1 cursor-grab active:cursor-grabbing"
      />
      {!transparent && (
        <div className="absolute bottom-2.5 right-2.5 pointer-events-none bg-black/85 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 text-white">
          <span className="text-[8px] tracking-widest text-white/60 uppercase font-mono">3D Interactive</span>
        </div>
      )}
    </div>
  );
}
