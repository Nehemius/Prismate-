"use client";

import React from "react";

interface ReagentAtomViewerProps {
  symbol: string;
  valenceElectrons: number;
  transparent?: boolean;
  reactionId?: string;
}

export default function ReagentAtomViewer({ symbol, transparent, reactionId }: ReagentAtomViewerProps) {
  // If we have a mapped reactionId, render a beautiful HTML/CSS ball-and-stick molecule representation.
  const renderMolecule = () => {
    switch (reactionId) {
      case "hydroboration-oxidation":
        // BH3 (Boron Trihydride) - Trigonal Planar
        return (
          <div className="relative w-44 h-44 select-none scale-110">
            {/* SVG Bonds Background - Centered lines pointing exactly to atomic centers */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="88" y1="88" x2="88" y2="28" stroke="#B0B0B0" strokeWidth="4" />
              <line x1="88" y1="88" x2="36" y2="140" stroke="#B0B0B0" strokeWidth="4" />
              <line x1="88" y1="88" x2="140" y2="140" stroke="#B0B0B0" strokeWidth="4" />
            </svg>

            {/* Central Boron (CPK: Pink/Peach) */}
            <div 
              className="absolute top-[60px] left-[60px] w-14 h-14 rounded-full flex items-center justify-center font-bold text-base text-black shadow-lg z-10" 
              style={{ background: "radial-gradient(circle at 35% 35%, #FFE3E3 0%, #FFB5B5 60%, #A65B5B 100%)" }}
            >
              B
            </div>
            
            {/* Top Hydrogen */}
            <div className="absolute top-2 left-[68px] w-10 h-10 rounded-full border border-black/10 flex items-center justify-center font-bold text-xs bg-neutral-100 text-black shadow-md z-10">
              H
            </div>
            
            {/* Bottom Left Hydrogen */}
            <div className="absolute bottom-4 left-4 w-10 h-10 rounded-full border border-black/10 flex items-center justify-center font-bold text-xs bg-neutral-100 text-black shadow-md z-10">
              H
            </div>

            {/* Bottom Right Hydrogen */}
            <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full border border-black/10 flex items-center justify-center font-bold text-xs bg-neutral-100 text-black shadow-md z-10">
              H
            </div>
          </div>
        );

      case "markovnikov-hbr":
      case "anti-markovnikov-hbr":
        // HBr (Hydrogen Bromide) - Diatomic
        return (
          <div className="flex items-center gap-4 select-none scale-[0.9] md:scale-95">
            {/* Hydrogen atom (CPK: light gray/white) */}
            <div className="w-11 h-11 rounded-full border border-black/10 flex items-center justify-center font-bold text-sm bg-neutral-100 text-black shadow-md">
              H
            </div>
            {/* Single Bond Line */}
            <div className="w-10 h-1 bg-black/35 rounded"></div>
            {/* Bromine atom (CPK: Bronze Red) */}
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-xl" 
              style={{ background: "radial-gradient(circle at 35% 35%, #E67C7C 0%, #A62929 60%, #5A0C0C 100%)" }}
            >
              Br
            </div>
          </div>
        );

      case "ozonolysis":
        // O3 (Ozone) - Bent
        return (
          <div className="relative w-44 h-32 select-none scale-[0.85] md:scale-90">
            {/* SVG Bonds Background - Perfect representation of ozone resonance (single + double bond) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Single bond (left) */}
              <line x1="88" y1="30" x2="32" y2="96" stroke="#B0B0B0" strokeWidth="4" />
              {/* Double bond (right) */}
              <line x1="85" y1="27" x2="141" y2="93" stroke="#B0B0B0" strokeWidth="3" />
              <line x1="91" y1="33" x2="147" y2="99" stroke="#B0B0B0" strokeWidth="3" />
            </svg>

            {/* Central Oxygen (CPK: Red) */}
            <div 
              className="absolute top-2 left-[60px] w-14 h-14 rounded-full flex items-center justify-center font-bold text-base text-white shadow-lg z-10" 
              style={{ background: "radial-gradient(circle at 35% 35%, #FFA3A3 0%, #FF0D0D 60%, #990000 100%)" }}
            >
              O
            </div>
            
            {/* Left Oxygen */}
            <div 
              className="absolute bottom-2 left-2 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md z-10" 
              style={{ background: "radial-gradient(circle at 35% 35%, #FFA3A3 0%, #FF0D0D 60%, #990000 100%)" }}
            >
              O
            </div>
            
            {/* Right Oxygen */}
            <div 
              className="absolute bottom-2 right-2 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md z-10" 
              style={{ background: "radial-gradient(circle at 35% 35%, #FFA3A3 0%, #FF0D0D 60%, #990000 100%)" }}
            >
              O
            </div>
          </div>
        );

      case "friedel-crafts":
        // CH3Cl (Methyl Chloride) - Tetrahedral style
        return (
          <div className="relative w-48 h-48 select-none scale-[0.85] md:scale-90">
            {/* SVG Bonds Background - Centered lines pointing exactly to atomic centers */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="96" y1="96" x2="96" y2="22" stroke="#B0B0B0" strokeWidth="4" />
              <line x1="96" y1="96" x2="96" y2="166" stroke="#B0B0B0" strokeWidth="4" />
              <line x1="96" y1="96" x2="26" y2="144" stroke="#B0B0B0" strokeWidth="4" />
              <line x1="96" y1="96" x2="166" y2="144" stroke="#B0B0B0" strokeWidth="4" />
            </svg>

            {/* Central Carbon (CPK: Black) */}
            <div 
              className="absolute top-[68px] left-[68px] w-14 h-14 rounded-full flex items-center justify-center font-bold text-base text-white shadow-lg z-10" 
              style={{ background: "radial-gradient(circle at 35% 35%, #555555 0%, #222222 60%, #000000 100%)" }}
            >
              C
            </div>
            
            {/* Top Chlorine (CPK: Green) - Larger than Carbon/Hydrogen */}
            <div 
              className="absolute top-[-10px] left-[64px] w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm text-black shadow-lg z-20" 
              style={{ background: "radial-gradient(circle at 35% 35%, #A8FFA8 0%, #1FF01F 60%, #0A800A 100%)" }}
            >
              Cl
            </div>

            {/* Bottom Hydrogen */}
            <div className="absolute bottom-1.5 left-[76px] w-10 h-10 rounded-full border border-black/10 flex items-center justify-center font-bold text-xs bg-neutral-100 text-black shadow-md z-10">
              H
            </div>

            {/* Left Hydrogen */}
            <div className="absolute bottom-[28px] left-1.5 w-10 h-10 rounded-full border border-black/10 flex items-center justify-center font-bold text-xs bg-neutral-100 text-black shadow-md z-10">
              H
            </div>

            {/* Right Hydrogen */}
            <div className="absolute bottom-[28px] right-1.5 w-10 h-10 rounded-full border border-black/10 flex items-center justify-center font-bold text-xs bg-neutral-100 text-black shadow-md z-10">
              H
            </div>
          </div>
        );

      case "sn2-substitution":
      case "sn1-substitution":
      case "cannizzaro":
        // OH- (Hydroxide) - Diatomic
        return (
          <div className="flex items-center gap-3 select-none scale-[0.9] md:scale-95">
            {/* Oxygen (CPK: Red) */}
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-base text-white shadow-lg" 
              style={{ background: "radial-gradient(circle at 35% 35%, #FFA3A3 0%, #FF0D0D 60%, #990000 100%)" }}
            >
              O
            </div>
            {/* Single Bond Line */}
            <div className="w-8 h-1 bg-black/35 rounded"></div>
            {/* Hydrogen (CPK: white) */}
            <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center font-bold text-sm bg-neutral-100 text-black shadow-md">
              H
            </div>
          </div>
        );

      case "esterification":
        // Ethanol (CH3-CH2-OH) - Molecular chain
        return (
          <div className="flex items-center gap-1 select-none scale-[0.85] md:scale-95">
            {/* CH3 (Carbon - Black) */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md" 
              style={{ background: "radial-gradient(circle at 35% 35%, #555555 0%, #222222 60%, #000000 100%)" }}
              title="Methyl Carbon"
            >
              C
            </div>
            <div className="w-4 h-1 bg-black/35"></div>
            {/* CH2 (Carbon - Black) */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md" 
              style={{ background: "radial-gradient(circle at 35% 35%, #555555 0%, #222222 60%, #000000 100%)" }}
              title="Methylene Carbon"
            >
              C
            </div>
            <div className="w-4 h-1 bg-black/35"></div>
            {/* O (Oxygen - Red) */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md" 
              style={{ background: "radial-gradient(circle at 35% 35%, #FFA3A3 0%, #FF0D0D 60%, #990000 100%)" }}
            >
              O
            </div>
            <div className="w-4 h-1 bg-black/35"></div>
            {/* H (Hydrogen - White) */}
            <div className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center font-bold text-xs bg-neutral-100 text-black shadow-sm">
              H
            </div>
          </div>
        );

      case "aldol-condensation":
        // Acetaldehyde (CH3CHO)
        return (
          <div className="flex items-center gap-1 select-none scale-[0.85] md:scale-95">
            {/* Methyl C */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md" 
              style={{ background: "radial-gradient(circle at 35% 35%, #555555 0%, #222222 60%, #000000 100%)" }}
            >
              C
            </div>
            <div className="w-4 h-1 bg-black/35"></div>
            {/* Carbonyl C */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md relative" 
              style={{ background: "radial-gradient(circle at 35% 35%, #555555 0%, #222222 60%, #000000 100%)" }}
            >
              C
              {/* Double bond pointing upwards to Oxygen */}
              <div className="absolute -top-6 left-[18px] w-3 h-6 flex justify-between">
                <div className="w-[2px] h-full bg-black/35"></div>
                <div className="w-[2px] h-full bg-black/35"></div>
              </div>
              {/* Carbonyl O */}
              <div 
                className="absolute -top-[62px] -left-0.5 w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md" 
                style={{ background: "radial-gradient(circle at 35% 35%, #FFA3A3 0%, #FF0D0D 60%, #990000 100%)" }}
              >
                O
              </div>
            </div>
            <div className="w-4 h-1 bg-black/35"></div>
            {/* Aldehyde H */}
            <div className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center font-bold text-xs bg-neutral-100 text-black shadow-sm">
              H
            </div>
          </div>
        );

      default:
        // Generic fallback to standard CPK sphere
        const colors = CPK_COLORS[symbol] || {
          base: "#8A8A8A",
          highlight: "#D0D0D0",
          shadow: "#404040",
          text: "#FFFFFF"
        };
        return (
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div 
              className="absolute w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl select-none shadow-xl z-10"
              style={{ 
                background: `radial-gradient(circle at 30% 30%, ${colors.highlight} 0%, ${colors.base} 60%, ${colors.shadow} 100%)`, 
                color: colors.text,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), inset -4px -4px 12px rgba(0,0,0,0.4)"
              }}
            >
              {symbol}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`relative w-full flex-grow flex-shrink min-h-[220px] flex flex-col items-center justify-center overflow-hidden transition-all ${
      transparent ? "bg-transparent border-transparent" : "bg-white rounded-2xl border border-black/10 shadow-inner"
    }`}>
      <div className="flex-grow flex items-center justify-center w-full">
        {renderMolecule()}
      </div>

      {!transparent && (
        <div className="absolute bottom-2.5 right-2.5 pointer-events-none bg-black/5 px-2 py-0.5 rounded border border-black/5 text-black">
          <span className="text-[8px] tracking-widest text-black/60 uppercase font-mono">HTML Reagent Simulator</span>
        </div>
      )}
    </div>
  );
}

const CPK_COLORS: Record<string, { base: string; highlight: string; shadow: string; text: string }> = {
  "C": { base: "#222222", highlight: "#555555", shadow: "#000000", text: "#FFFFFF" },
  "H": { base: "#FFFFFF", highlight: "#FFFFFF", shadow: "#B0B0B0", text: "#000000" },
  "O": { base: "#FF0D0D", highlight: "#FFA3A3", shadow: "#990000", text: "#FFFFFF" },
  "N": { base: "#3050F8", highlight: "#8AA0FF", shadow: "#1020A0", text: "#FFFFFF" },
  "Cl": { base: "#1FF01F", highlight: "#A8FFA8", shadow: "#0A800A", text: "#000000" },
  "Br": { base: "#A62929", highlight: "#E67C7C", shadow: "#5A0C0C", text: "#FFFFFF" },
  "I": { base: "#9400D3", highlight: "#DDA0DD", shadow: "#4A0082", text: "#FFFFFF" },
  "Na": { base: "#7450E6", highlight: "#B0A0FF", shadow: "#4020A0", text: "#FFFFFF" },
  "B": { base: "#FFB5B5", highlight: "#FFE3E3", shadow: "#A65B5B", text: "#000000" },
  "Zn": { base: "#7D80B0", highlight: "#C2C5E8", shadow: "#4B4E7A", text: "#FFFFFF" },
  "Al": { base: "#BFA6A6", highlight: "#EBE0E0", shadow: "#8F7575", text: "#000000" },
};
