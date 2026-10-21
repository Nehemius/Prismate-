import gsap from 'gsap';
import type { StarWhirlFrame } from '../components/BlackWhiteStarWhirl';

/**
 * Standalone GSAP Controller Function for the B/W Star Whirl Animation
 */
export function playBlackWhiteStarWhirl(
  setFrame: (frame: StarWhirlFrame) => void,
  onComplete?: () => void
): gsap.core.Timeline {
  const tl = gsap.timeline({
    onComplete: () => {
      setFrame(0);
      onComplete?.();
    },
  });

  tl.call(() => setFrame(1), [], 0.00);
  tl.call(() => setFrame(2), [], 0.09);
  tl.call(() => setFrame(3), [], 0.18);
  tl.call(() => setFrame(4), [], 0.27);
  tl.call(() => setFrame(0), [], 0.38); // Hard instantaneous cut

  return tl;
}
