"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [frame, setFrame] = useState(1);

  useEffect(() => {
    // Timestamps matching the PRISMATE Build Spec Section 6 exactly:
    // Frame 1 (t=0s): Diagonal split (top-left black, bottom-right white)
    // Frame 2 (t=0.2s - 0.8s): "PRIS" slides in from left
    const t2 = setTimeout(() => setFrame(2), 200);
    
    // Frame 3 (t=0.8s - 1.4s): "MATE" slides in from right
    const t3 = setTimeout(() => setFrame(3), 800);
    
    // Frame 4 (t=1.4s - 2.2s): Both scale down/shift out to screen boundaries
    const t4 = setTimeout(() => setFrame(4), 1400);
    
    // Frame 5 (t=2.2s - 2.6s): Crossfade to flat white background, "Prismate" fades in
    const t5 = setTimeout(() => setFrame(5), 2200);
    
    // Frame 6 (t=2.6s - 3.4s): Small descriptors "Playful · Powerful · Purposeful" translate up
    const t6 = setTimeout(() => setFrame(6), 2600);
    
    // Termination (t=3.4s): Automatically route state to login router
    const t7 = setTimeout(() => {
      setFrame(7);
      onComplete();
    }, 3400);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans select-none bg-black">
      <AnimatePresence mode="wait">
        {frame < 5 && (
          <motion.div
            key="split-screen"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Layer: Top-Left Black Half */}
            <div
              className="absolute inset-0 bg-black"
              style={{
                clipPath: "polygon(0 0, 100% 0, 0 100%)",
                zIndex: 1,
              }}
            />

            {/* Background Layer: Bottom-Right White Half */}
            <div
              className="absolute inset-0 bg-white"
              style={{
                clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
                zIndex: 2,
              }}
            />

            {/* Foreground Text Layer */}
            <div className="absolute inset-0 w-full h-full z-10 flex flex-col justify-between p-[5vh] md:p-[8vh]">
              {/* Top Text: PRIS (White) */}
              <div className="w-full flex justify-start relative">
                {frame >= 2 && (
                  <motion.h1
                    initial={{ x: "-80vw", opacity: 0 }}
                    animate={
                      frame === 4
                        ? { scale: 0.05, x: "20vw", y: "30vh", opacity: 0 }
                        : { x: "20vw", opacity: 1 } // Centering inside the black half
                    }
                    transition={{
                      x: { duration: frame === 4 ? 0.6 : 0.5, ease: "easeOut" },
                      scale: { duration: 0.6, ease: "easeInOut" },
                      opacity: { duration: 0.5 },
                    }}
                    className="text-[14vw] md:text-[22vw] font-black tracking-tighter leading-none text-white font-outfit select-none"
                  >
                    PRIS
                  </motion.h1>
                )}
              </div>

              {/* Bottom Text: MATE (Black) */}
              <div className="w-full flex justify-end relative">
                {frame >= 3 && (
                  <motion.h1
                    initial={{ x: "80vw", opacity: 0 }}
                    animate={
                      frame === 4
                        ? { scale: 0.05, x: "-20vw", y: "-30vh", opacity: 0 }
                        : { x: "-20vw", opacity: 1 } // Centering inside the white half
                    }
                    transition={{
                      x: { duration: frame === 4 ? 0.6 : 0.5, ease: "easeOut" },
                      scale: { duration: 0.6, ease: "easeInOut" },
                      opacity: { duration: 0.5 },
                    }}
                    className="text-[14vw] md:text-[22vw] font-black tracking-tighter leading-none text-black font-outfit select-none"
                  >
                    MATE
                  </motion.h1>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {frame >= 5 && (
          <motion.div
            key="final-screen"
            initial={{ opacity: 0, backgroundColor: "#000000" }}
            animate={{ opacity: 1, backgroundColor: "#ffffff" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center text-black z-30"
          >
            {/* Center Wordmark */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-6xl md:text-8xl font-light tracking-[0.25em] uppercase font-outfit text-black mb-6"
            >
              Prismate
            </motion.h1>

            {/* Tagline */}
            <div className="flex gap-4 items-center justify-center">
              {frame >= 6 && (
                <>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.0, ease: "easeOut" }}
                    className="text-xs md:text-sm tracking-[0.3em] uppercase text-gray-500 font-sans font-bold"
                  >
                    Playful
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                    className="text-xs md:text-sm tracking-[0.3em] uppercase text-gray-400 font-sans"
                  >
                    ·
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
                    className="text-xs md:text-sm tracking-[0.3em] uppercase text-gray-500 font-sans font-bold"
                  >
                    Powerful
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
                    className="text-xs md:text-sm tracking-[0.3em] uppercase text-gray-400 font-sans"
                  >
                    ·
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4, ease: "easeOut" }}
                    className="text-xs md:text-sm tracking-[0.3em] uppercase text-gray-500 font-sans font-bold"
                  >
                    Purposeful
                  </motion.span>
                </>
              )}
            </div>

            {/* Click to Skip/Continue option */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              whileHover={{ opacity: 0.9 }}
              onClick={onComplete}
              className="absolute bottom-10 text-xs tracking-widest uppercase font-mono text-gray-600 transition-opacity"
            >
              Skip Intro
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
