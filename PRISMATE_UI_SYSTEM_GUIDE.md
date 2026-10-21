# PRISMATE 1.5 — MASTER UI/UX SYSTEM SPECIFICATION & AI STUDIO GUIDE
> **Purpose:** Single-file master reference and system instruction prompt for **Google AI Studio**.
> **Usage:** Copy the entire contents of this file and paste it into the **System Instructions** or as the context header of your Google AI Studio prompt when designing or planning any feature, screen, component, or animation for Prismate 1.5.
> **Last Updated:** October 2026 | Prismate 1.5

---

## 1. SYSTEM IDENTITY & CORE PHILOSOPHY

You are designing for **Prismate 1.5**, a hyper-focused STEM learning platform and customizable student workstation engineered for Tamil Nadu State Board Class 11/12 and JEE/NEET aspirants.

- **Aesthetic DNA:** **Obsidian Monochrome & Cyber-Manga Luxury**. High-end Swiss scientific instrumentation meets a high-performance code editor (Linear / Vercel meets Asphalt Legends tactical HUD).
- **Core Principle:** **High contrast, zero clutter, razor-sharp rendering, tactile physicality**.
- **Golden Rule:** **Pure Black & White palette**. Never invent generic AI gradients, rainbow colors, or gratuitous purple/neon themes unless explicitly instructed for specific 3D molecular chemistry models.

---

## 2. TYPOGRAPHY SYSTEM (LOCAL FONT MAPPING)

All typography is strictly bound to three dedicated local font files located in the project. Never substitute standard Google Fonts (Inter, Roboto, Poppins, Arial, etc.).

```css
:root {
  --font-heading: 'PrismateHeading', sans-serif;       /* Local: ./fonts/heading.otf */
  --font-subheading: 'PrismateSubheading', sans-serif; /* Local: ./fonts/sub-heading.ttf */
  --font-content: 'PrismateContent', sans-serif;       /* Local: ./fonts/content.ttf */
}
```

### Font Roles & Usage Rules

| Role | CSS Variable | Font Family | Usage |
| :--- | :--- | :--- | :--- |
| **Heading** | `var(--font-heading)` | `PrismateHeading` | Big numbers (`3, 2, 1, GO!`), major screen titles, profile usernames (`Aqua √X`, `Pyroo`, `Tanjiro`), version tag (`V 1.5`), flashcard front key terms. |
| **Subheading** | `var(--font-subheading)` | `PrismateSubheading` | HUD labels, button actions (`LOG IN`, `SWITCH`, `START QUIZ`), navigation items, section headers, badges (`TIMED`, `CLASSIC`, `EXPERT`). |
| **Content** | `var(--font-content)` | `PrismateContent` | Flashcard explanations, body copy, formulas, chemistry reactions, options text, input fields, metadata, hotkey hints. |

### Typography Styling Rules
- **Tracking:** Subheadings and HUD tags use uppercase with wide tracking (`letter-spacing: 0.15em` to `0.35em`).
- **Rendering:** Always apply `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale`.
- **Zero Blur Smears:** Never apply `filter: blur()` or `filter: drop-shadow()` to text elements during animation keyframes. Radiance must come exclusively from multi-layer `text-shadow`.

---

## 3. COLOR PALETTE & DESIGN TOKENS (OBSIDIAN MONOCHROME)

Prismate uses an OLED pitch-black canvas with layered smoked surfaces and high-contrast off-white accents.

```css
/* Color Tokens */
--color-bg-canvas: #000000;         /* Pure pitch-black canvas */
--color-bg-surface: #0D0D0E;        /* Bento card base */
--color-bg-elevated: #161618;       /* Popovers, modals, active containers */
--color-bg-hover: #222226;          /* Hovered tiles and interactive chips */

/* Foreground & Neutral Typography */
--color-fg-pure: #FFFFFF;           /* Primary highlights, GO!, big numbers */
--color-fg-primary: #F2F2F2;        /* Default text and crisp UI borders */
--color-fg-secondary: rgba(242, 242, 242, 0.70); /* Subtitles and secondary info */
--color-fg-muted: rgba(242, 242, 242, 0.40);     /* Placeholders, disabled states */
--color-fg-faint: rgba(242, 242, 242, 0.15);     /* Structural guides, grid lines */

/* Borders & Specular Hairlines */
--border-subtle: 1px solid rgba(242, 242, 242, 0.08); /* Default bento card border */
--border-active: 1px solid rgba(242, 242, 242, 0.28); /* Active card border */
--border-focus: 1px solid rgba(242, 242, 242, 0.60);  /* Keyboard focused border */
--specular-top: inset 0 1px 0 0 rgba(242, 242, 242, 0.22); /* Smoked glass rim */

/* Functional Status (Strictly for quiz feedback and badges) */
--status-success: #10B981;          /* Correct answer / mastery (Emerald) */
--status-danger: #EF4444;           /* Wrong answer / heart loss (Ruby) */
--status-warning: #F59E0B;          /* Timer low / caution (Amber) */
--status-info: #3B82F6;             /* System notice / formula highlight */
```

---

## 4. INTRO CHOREOGRAPHY & LOGIN SYSTEM (ANIME.JS & CANVAS WAVES)

The opening experience of Prismate 1.5 is a precisely orchestrated 5-phase choreography combining an Inkscape geometric loader, Anime.js motion paths, 2D HTML5 canvas wave ribbons, and Anime light streaks.

```
[ Phase 1: Universal Loader ] (2.0s morphing star)
            │
            ▼
[ Phase 2: Prism Center Entrance ] (Scales down 1.35 -> 1.15 at dead-center)
            │
            ▼
[ Phase 3: Prism Glide to Logo ] (Glides into slot between 'PR' and 'SMATE')
            │
            ▼
[ Phase 4: Anime Burst & Light Streaks ] (Flash bloom 1.0 -> 0 + SVG light streaks)
            │
            ▼
[ Phase 5: Idle Screen & Dynamic Wave Glow ] (PS3 XMB waves pulse the prism)
```

### 4.1 The 5 Intro Phases
1. **Phase 1: `loading`**: Universal Star Loader runs for 2.0s at dead-center while assets initialize.
2. **Phase 2: `prism-enter`**: The 3D isometric Prism appears at the exact viewport center (`innerWidth/2`, `innerHeight/2`), scaling down from `1.35` to `1.15` via `anime({ opacity: [0, 1], scale: [1.35, 1.15], duration: 800, ease: 'outCubic' })`.
3. **Phase 3: `prism-glide`**: The Prism glides from center into its dedicated slot between "PR" and "SMATE" inside the `PrismateLogo` container (`duration: 850ms, ease: 'inOutQuad'`).
4. **Phase 4: `anime-burst`**: Upon locking into place, `appearFlash: 1.0` triggers an ultra-bright bloom (`appearFlash: 1.0 -> 0` over 850ms), firing hardware-accelerated **Light Streaks** (diagonal SVG polygons shooting outward) and settling into place.
5. **Phase 5: `idle`**: The login screen is now interactive.

### 4.2 Dynamic Wave-Reactive Prism Glow (PS3 XMB Sine Waves)
- **Background Waves:** Continuous flowing monochrome (`#F2F2F2` at low alpha over `#000000`) ribbon waves rendered on a lightweight HTML5 2D `<canvas>` using smooth mathematical sine curves.
- **Wave Charge Math:** In the idle loop, the app calculates real-time wave density at the prism slot's center: `waveCharge = getWaveCharge(cx, cy)` (value from `0.0` to `1.0`).
- **Visual Reaction Stages:**
  - *Base State (`waveCharge: 0.0 - 0.2`):* Muted 3-faced isometric prism.
  - *Intermediate Stage (`waveCharge: 0.2 - 0.8`):* Central vertical spine and top triangular cap brighten to pure `#FFFFFF`; pixelated crystal matrix ripples outward across the faces.
  - *Peak Overload (`waveCharge: 0.8 - 1.0`):* Vibrant pixel-crystal transition with pure white ridge, neon magenta/violet pixels on left face, cyan/cobalt pixels on right face, and soft outer bloom.
  - *Recede:* As waves drift past, the glow smoothly recedes back to base.

### 4.3 Login Screen HUD & Authentication
- **Center Action:** `"TAP TO BEGIN"` text blinking smoothly every 800ms below the logo (Free Fire login style).
  - *If clicked while logged out:* Smoothly opens the `LoginModal`.
  - *If clicked while logged in:* Triggers the continuous Universal Loader (950ms) and enters the main workspace.
- **Bottom-Left Action Button:** Small solid `#F2F2F2` rectangle.
  - *Logged-out state:* Displays `"LOG IN"` in `#000000` (`PrismateSubheading` font).
  - *Logged-in state:* Displays `"SWITCH"` in `#000000` (`PrismateSubheading` font), and the active username (`Aqua √X`, `Pyroo`, or `Tanjiro`) is rendered directly above the rectangle in `#F2F2F2` (`PrismateSubheading` font).
- **Bottom-Right Version Tag:** Displays `"V 1.5"` in `#F2F2F2` (`PrismateHeading` font).
- **Login Modal Flow:**
  - Centered dialog box with `#121214` surface and subtle `#F2F2F2` border.
  - Lists 3 selectable profiles in `PrismateHeading`:
    1. `Aqua √X`
    2. `Pyroo`
    3. `Tanjiro`
  - Clicking any username smoothly expands that row (via Motion) to reveal the password input field (`PrismateContent` font). Password for all profiles is `prismate1.5`.

---

## 5. ASPHALT LEGENDS COUNTDOWN ENGINE & RADIANT GLOW

Prismate features an electrifying, arcade-inspired countdown (`3 → 2 → 1 → GO!`) that fires before quizzes and speed drills.

### 5.1 High-Energy Typography & Luminous Aura
The text must remain **razor-sharp and in focus** while radiating pure neon light:
```css
/* Numbers & 'GO!' Luminous Aura */
color: #FFFFFF;
text-shadow: 0 0 20px rgba(255, 255, 255, 0.95), 
             0 0 45px rgba(242, 242, 242, 0.65), 
             0 0 85px rgba(242, 242, 242, 0.35);
```

### 5.2 Dynamic Stage Badges (Specs)
- **Number 3:** Displays subject / unit (e.g. `PHYSICS` • `Electrostatics Unit 1`).
- **Number 2:** Displays Time Control mode: **`TIMED`** (with speed bonus) vs **`UNTIMED`**.
- **Number 1:** Displays Difficulty Level: **`CLASSIC`** (3 hearts) / **`EXPERT`** (1 heart) / **`MASTER`**.
- **GO!:** Massive pop with horizontal speed streaks and a glowing sweep-shine underline bar.

### 5.3 HUD Brackets & Expanding Rings
- **Shockwave Rings:** Concentric expanding rings with `box-shadow: 0 0 32px rgba(242, 242, 242, 0.45)`.
- **Corner HUD Brackets:** Tactical L-shaped border brackets on all 4 corners (`36px × 36px`, `box-shadow: 0 0 12px rgba(242, 242, 242, 0.3)`).
- **Pulse Flash:** Radial gradient burst (`radial-gradient(circle, rgba(255,255,255,0.24) 0%, transparent 60%)`) on every phase transition.

---

## 6. 3D TACTILE FLASHCARD & QUIZ ENGINE (5 DESIGN PILLARS)

Prismate draws animation inspiration from five approved platforms:
1. **Kokonut UI** (`https://kokonutui.com/`): Tactile micro-interactions and option pills.
2. **Motion.dev** (`https://motion.dev/`): Spring transitions and layout mounts.
3. **Anime.js** (`https://animejs.com/`): Choreographed timelines and path morphing.
4. **Bklit UI** (`https://bklit-ui.com/`): Minimalist dark monochrome layouts.
5. **Manus UI**: Tactical HUD brackets and telemetry.

### 6.1 3D Tactile Card Flip
Cards feature authentic spatial perspective and 180° rotation:
```css
.flashcard-perspective {
  perspective: 1400px;
}
.flashcard-inner {
  transform-style: preserve-3d;
  transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}
.flashcard-flipped {
  transform: rotateY(180deg);
}
.flashcard-face {
  backface-visibility: hidden;
}
.flashcard-back {
  transform: rotateY(180deg);
}
```

### 6.2 Spaced-Repetition Grading Dock
Upon flipping/revealing the answer, a tactile grading bar slides up:
- `AGAIN [1]` (Ruby indicator dot)
- `HARD [2]` (Amber indicator dot)
- `GOOD [3]` (Emerald indicator dot)
- `EASY [4]` (Cyan indicator dot)

### 6.3 Failure & Timeout Reactions
- **Failure Crumble (`al-wither`):** Wrong answer causes the card to rotate slightly, disintegrate into ash particles, and scale down into the void.
- **HUD Stamp (`al-stamp`):** High-speed `FAILED` or `OUT OF TIME` monochrome/ruby stamp slammed across the card.
- **Grayscale Dim:** Timeout applies a desaturating filter (`grayscale(1) brightness(0.5) contrast(1.15)`).

### 6.4 Keyboard Controls
- `1 - 4`: Select option pill (front) or grade spaced-repetition difficulty (back).
- `Space`: Flip flashcard / reveal answer.
- `ESC`: Pause or exit quiz drill.

---

## 7. BENTO GRID SURFACES & NAVIGATION DOCK

### 7.1 Bento Tile Recipe (High-Performance Smoked Glass)
```css
.prism-bento-tile {
  background: linear-gradient(135deg, rgba(16, 16, 16, 0.88), rgba(26, 26, 28, 0.75));
  border: 1px solid rgba(242, 242, 242, 0.10);
  border-radius: 20px;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(242, 242, 242, 0.22);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.25s ease,
              box-shadow 0.25s ease;
}

.prism-bento-tile:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 242, 242, 0.30);
  box-shadow: 0 14px 32px -4px rgba(0, 0, 0, 0.75), inset 0 1px 0 0 rgba(242, 242, 242, 0.35);
}
```

### 7.2 Floating Left Navigation Dock
- Vertically centered on the left viewport edge (`top: 50%; transform: translateY(-50%)`).
- Frosted glass capsule overlaying workspace tiles.
- Swiping/collapsing left leaves a hairline `#F2F2F2` indicator line. Swiping right expands the dock.
- Primary screen targets:
  1. **Chemistry Workspace** (Bento subject workspace)
  2. **Physics Workspace** (Bento subject workspace)
  3. **Mathematics Workspace** (Bento subject workspace)
  4. **Home / You** (Customizable student bento canvas)
  5. **Profile / Settings** (Conventional profile layout)

---

## 8. UNIVERSAL LOADER (INKSCAPE SELF-INTERSECTING STAR)

Whenever background operations, route switches, or asset loads occur, display the locked **Universal Loader**:
- **Backdrop:** `position: fixed; inset: 0; background: rgba(0, 0, 0, 0.88); z-index: 9999;`
- **Icon:** Fixed bottom-center `48px × 48px` SVG polygon (`#F2F2F2`).
- **Mathematical Model:** Continuous 4.8s `requestAnimationFrame` loop morphing 10 vertices ($R_{outer} = 85$, alternating inner radius and angular twist) across 4 geometric states:
  1. *Classic Star*
  2. *Pinwheel Blades*
  3. *Hollow Center Cutout*
  4. *Reverse Shuriken Twist*
- **Continuous Time Origin:** The star animation preserves its global animation timestamp across route transitions so the geometry never abruptly jumps or restarts.

---

## 9. TECHNICAL CONSTRAINTS & HARDWARE PERFORMANCE GATES

All generated code and CSS MUST maintain **locked 60 FPS performance** on baseline hardware:
1. **Laptop Target:** HP EliteBook (Intel Core i5-6300U, integrated Intel HD 520 GPU, 8 GB RAM).
2. **Tablet Target:** Moto Pad 60 Neo (Android tablet, 8 GB RAM).

### Implementation Rules:
- **No Heavy Dynamic Blurs:** Never put continuous `backdrop-filter: blur(20px)` on animated or scrolling elements.
- **Clean rAF Cleanup:** Always cancel `requestAnimationFrame` loops (`cancelAnimationFrame`) and clear intervals on component unmount to prevent GPU/CPU leaks.
- **Hardware-Accelerated Properties:** Animations must strictly use `transform` and `opacity`.

---

## 10. STRICT ANTI-PATTERNS (WHAT NEVER TO GENERATE)

1. **NO Generic Dashboards:** Never generate light-mode cards, standard Bootstrap cards, or rounded colorful SaaS cards.
2. **NO Colorful Gradient Headers:** Keep headers strictly monochrome (`#F2F2F2` or `#FFFFFF`).
3. **NO Font Substitutions:** Never use Inter, Roboto, Arial, or standard sans-serif. Always reference `var(--font-heading)`, `var(--font-subheading)`, or `var(--font-content)`.
4. **NO Muddy Text Blur:** Do not apply `filter: blur(...)` to typography in CSS keyframes. Keep text 100% sharp; achieve glow via `text-shadow`.
5. **NO Unmount Memory Leaks:** Always cancel `requestAnimationFrame` loops and clear timers on component unmount.
