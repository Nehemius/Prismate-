# PRISMATE 1.5 — FULL UI CONTEXT & CODE SPECIFICATION BUNDLE

This document contains the complete UI specifications, type definitions, and core interactive widget implementations for Prismate 1.5.

## FILE: PRISMATE_UI_SPEC.md

```markdown
# PRISMATE — UI Specification and Animation Research

**Status:** Working handover document — inspect before implementation.  
**Prepared from:** `/mnt/data/ui.txt` (274 lines containing Argon/Gemini replies only), plus the design decisions already stated directly by the user in this project conversation, and a targeted review of the official Motion and Anime.js documentation.  
**Purpose:** Transfer the UI planning to Claude Opus in Google Antigravity without losing details or allowing unapproved ideas to become requirements.

> **Important source limitation:** The supplied TXT contains Argon's replies, not the user's messages. Therefore, when Argon says that something is “locked in,” this document preserves that status as **reported locked by Argon**. If the reply later proposes alternatives, asks a question, or contradicts an earlier reply, do not silently guess what the user approved. Keep the ambiguity visible and ask the user before making a material irreversible design decision.

---

## 1. How to read this document

Use these status labels throughout:

- **USER-CONFIRMED:** Stated directly by the user in the project conversation available to this handover.
- **ARGON-REPORTED LOCKED:** Argon's TXT says the choice was locked, but the user's confirming message is absent from the TXT. Preserve it as a strong candidate and verify against the user's current intent if it conflicts with other material.
- **SOURCE PROPOSAL:** Described by Argon as a possibility, option, recommendation, or question—not proven to have been accepted.
- **UNDECIDED / VERIFY:** The source asks a question, presents conflicting values, or lacks enough evidence to decide.
- **RESEARCH SUGGESTION — NOT APPROVED:** Animation pattern or technical recommendation found in official Motion/Anime.js resources. It is inspiration for review, not authorization to implement it automatically.

**Priority rule:** Follow direct user instructions and the existing master project instructions first. Do not treat an animation-gallery example or a design suggestion as user approval.

## 2. Product overview

Prismate is a chemistry-focused learning application for Tamil Nadu Class 11 and 12 Chemistry, with subject workspaces for Chemistry, Physics, and Mathematics. Its learning ideas include curated lesson-wise content, interactive textbook diagrams, quizzes, past-paper material, and user-managed lists of items to practise or review.

The UI aims to feel like a carefully designed, dark, geometric learning workspace—not a generic dashboard. The user wants to personally control the design and has objected to unrequested, generic AI-generated UI. Build only what has been specified or subsequently approved.

### Target devices

- HP EliteBook-class laptop: Intel Core i5-6300U, Intel HD 520 integrated graphics, approximately 8 GB RAM.
- Moto Pad 60 Neo Android tablet: Android 16, 8 GB RAM.

A 60 FPS experience is a **performance goal to test**, not a guarantee. Do not claim a measured frame rate without testing on actual hardware or a clearly stated benchmark environment.

## 3. Global theme

### 3.1 User-confirmed direction

- **Main background:** dark charcoal `#3A3A3A`.
- **Core light neutral:** off-white `#F2F2F2`.
- **Glass style:** restrained **frosted glass**, not live/liquid glass.
- Avoid gratuitous motion, constant moving surfaces, and expensive visual effects.
- A provided OTF font is intended for broad/global use, but its filename/path and supported weights have not been provided in this source. Do not guess a filename.

### 3.2 Colour decisions still open

- Accent colour: **UNDECIDED**. Do not invent cyan, violet, green, orange, or any other accent.
- Semantic success/error/warning colours: **NOT SPECIFIED**.
- Exact colour for disabled/hover/focus states: **NOT SPECIFIED** except where the navigation/tile candidates below mention values.

### 3.3 Frosted-glass and tile recipes in the TXT

The source records two levels of glass treatment:

**A. Floating left navigation dock — latest detailed candidate**

- A rounded, vertical frosted-glass dock at the middle-left edge.
- `position: fixed; left: ...; top: 50%; transform: translateY(-50%)` was proposed; the exact left offset is unspecified.
- It overlays the tile canvas at a higher `z-index`.
- Icy off-white tint candidate: `rgba(242, 242, 242, 0.16)`.
- Rim candidate: `1px solid rgba(242, 242, 242, 0.45)`.
- Blur value conflict: one earlier reply says `backdrop-filter: blur(12px)`; a later recipe says `backdrop-filter: blur(16px)`. **UNDECIDED: verify the final value** rather than treating either number as proven user approval.
- The dock is the one intended location for real `backdrop-filter` blur, subject to device testing.

**B. Bento tiles — performance-oriented smoked-glass candidate**

The later recipe proposes avoiding `backdrop-filter` on each tile and using a static surface treatment instead:

- Candidate fill: `linear-gradient(135deg, rgba(16, 16, 16, 0.82), rgba(28, 28, 28, 0.68))`.
- Candidate corner radius: `20px`.
- Candidate top edge reflection: `inset 0 1px 0 0 rgba(242, 242, 242, 0.22)`.
- Candidate border: `1px solid rgba(242, 242, 242, 0.10)`.
- Candidate static frost grain: a subtle noise texture at approximately `2%` opacity.
- An earlier, simpler fallback proposed `rgba(242, 242, 242, 0.05)` fill and a `1px solid rgba(242, 242, 242, 0.18)` border.
- Earlier examples mentioned `12px` versus `20px` corners as an open choice. The later recipe favours 20px, but the user's explicit acceptance cannot be verified from the reply-only TXT. Treat the numbers above as **candidate tokens**, not immutable facts, until confirmed against current user intent.

**Performance note:** The source claims that these choices will keep the site at a locked 60 FPS. That is not verified evidence. Test scrolling, drag/reorder, resize, transitions, memory use, and thermal behaviour on both target devices. Prefer transform/opacity animation and avoid unnecessary simultaneous blurs.

## 4. Application-level navigation and screens

### 4.1 Five primary screens

Argon records these five screens as locked:

1. Home / possibly “You” — customizable student widget canvas.
2. Chemistry — Bento-style subject workspace.
3. Physics — Bento-style subject workspace.
4. Mathematics — Bento-style subject workspace.
5. Profile — conventional profile/settings layout, not Bento.

**UNDECIDED:** The page label is inconsistent in the source: it asks whether the customizable page should be named **Home** or **You**. Later replies continue to call it Home. Do not silently treat the naming question as explicitly answered; verify if it affects visible labels.

### 4.2 Floating middle-left navigation dock

Argon records the following mechanics:

- Rounded vertical dock, fixed around the vertical midpoint on the left side, floating above the Bento canvas.
- Swipe/slide left to hide it, leaving a narrow vertical `#F2F2F2` indicator line at the left edge.
- Swipe right from the indicator—or click/drag the indicator—to reveal the dock again.
- The dock overlays content; tile content beneath it must remain usable wherever possible.
- If the Home page is disabled in Profile, hide the Home/You navigation entry and choose a valid startup page instead.

**UNDECIDED:** Navigation item appearance was asked as Icons only, Text labels only, or Icons + Text. The TXT does not contain the user's answer. Do not choose this for the user.

**Interaction/accessibility requirement:** Provide a discoverable keyboard-accessible alternative to swipe gestures, and do not make a thin edge line the only usable way to reveal navigation. This is a quality/accessibility recommendation, not a recovered visual decision.

## 5. Home / You page — customizable 16 × 8 Bento canvas

### 5.1 Grid and centre block

Argon records:

- A strict Bento grid with a desktop base of **16 columns × 8 rows**.
- Widgets can snap to row/column coordinates.
- The Home centre block is movable/customizable, unlike the fixed centre block on subject pages.
- The latest centre block description is a `4 × 2` block displaying a circular profile picture beside `Welcome, <Username>` in the heading font.
- The example username `Aqua √X` is given in the source.
- A custom picture widget must be capped at **one instance per Home layout**.
- A newly placed Home widget starts at `2 × 2` units and can be dragged/resized.
- Enter Home edit mode by long-pressing the Home/You navigation item, showing a confirmation dialog: `Enter Edit Mode?`.
- On confirmation, a bottom widget dock can slide up to reveal the 10 starter widgets. Grabbing a widget makes the dock slide down and exposes grid guides while placing it.

**Important unresolved contradiction:** Another part of the source says to long-press the navigation bar generally; a later reply specifies the Home button. The later, more specific description says Home button. Verify against the user's intended gesture before final implementation.

**Grid semantics unresolved:** The source first describes a “Strict 4-Column Bento Grid,” then defines a 16 × 8 unit grid. The 16 × 8 design is repeated later and appears to be the current grid concept, but clarify whether 16 columns are actual units or a finer grid underlying a four-column visual grouping. Do not implement an incompatible grid model without checking.

### 5.2 The ten starter widgets listed by Argon

1. **History** — opens a popup of recently viewed diagrams, reactions, formulas, and quizzes to support quick resumption; teacher-friendly.
2. **Studytube** — concept for distraction-reduced educational YouTube viewing, specifically keeping long-form study videos and hiding Shorts/algorithmic clutter. The implementation and service constraints are not specified.
3. **Pomodoro Timer** — configurable focus and break timer.
4. **Formula Rotator** — shows formulas from a selected Weaklist, Studylist, or Stronglist and changes item on a 30-minute cadence.
5. **Diagram Rotator** — shows a diagram from a selected list and changes item on a 30-minute cadence.
6. **Active Quiz** — shows a question from a selected list on a 30-minute cadence, or advances immediately after a correct answer.
7. **Cool Time** — monochrome digital/geometric clock using `#3A3A3A` and `#F2F2F2`.
8. **Quote / To-Do** — combines a motivational quote with a daily task checklist.
9. **Daily STEM Pulse (“Did You Know?”)** — mainstream STEM fact or current science news snippet, described as out-of-syllabus and updated daily. The source/feed is not specified.
10. **Custom Picture** — user-selected motivational image; maximum one instance per Home layout.

### 5.3 Lightweight data/refresh notes recorded by Argon

- Formula, diagram, and active-quiz rotators should not require three permanent ticking loops. The source suggests checking elapsed time using a timestamp such as `Date.now()` and persisting relevant state in `localStorage`.
- Resize/compress a selected image for display to reduce memory cost.
- Argon proposes storing up to six user profiles locally, including username, compressed avatar, Home on/off preference, default startup screen, list memberships, and widget coordinates.

These are implementation suggestions, not a guarantee that local storage is the correct persistence system. Check data needs and the existing code before choosing persistence.

## 6. Subject pages: Chemistry, Physics, Mathematics

### 6.1 Centre title block and edit mechanics

Argon records a fixed, unmovable subject-name rectangle at the centre of each subject page, with the page name in the heading font. Other subject modules arrange around it.

Later, Argon records a subject-page edit mode:

- Long-press the active subject's nav item (Chemistry, Physics, or Mathematics).
- Show `Enter Edit Mode?` and ask for confirmation.
- Subject page edit mode lets the user **resize and reposition existing blocks only**.
- Do **not** permit adding or deleting blocks on subject pages.
- The centre title block remains locked.
- Unlike Home edit mode, subject edit mode does not use the bottom widget dock.

An earlier reply describes subject pages as completely fixed/non-editable. The later reply explicitly permits resize/rearrange only and appears to supersede it. Preserve the later description but verify the intended final interaction if uncertain.

### 6.2 Latest subject block inventories recorded by Argon

The later section says the subject blocks are **separate blocks; no combined buttons**:

**Chemistry**
- Lesson-wise Reactions.
- PTA Question Papers (PTA QP).
- Previous Board Exam Question Papers (Board Exam QP).
- Book Back (BB) One-Word Quiz.
- Diagrams (teacher/concept mode).
- Formula Quiz.

**Physics**
- Formula Quiz.
- Unit Quiz.
- Diagrams.
- PTA Questions.
- Board Exam QP.
- Book Back (BB) One-Word Quiz.

**Mathematics**
- Formula Quiz.
- Book Back (BB) One-Word Quiz.
- Board Exam Question Papers.
- PTA Question Papers.
- “Common Book” / “COME Book” government questions — Argon interprets this as a Tamil Nadu state-book collection of critical board-exam-pattern questions; canonical name needs verification.
- Diagrams (graphs, constructions, theorems).
- Book Questions (standard textbook exercises/problems) appeared in an earlier detailed list; the latest separated-block list also refers to the Common/COME Book government questions. Verify whether both are separate features and which label should be shown.

### 6.3 Older proposed subject blocks and evolution

Earlier versions included:
- Weaklist Vault.
- Weaklist Quiz.
- Stronglist Quiz.
- PTA QP.
- Board QP.
- Lesson-wise Reactions or the corresponding formulas/derivations/theorems.
- Diagrams.

The later subject-page architecture moves list choice into each quiz screen and places a master Weaklist/Stronglist/Studylist manager in Profile. It also lists Book Back One-Word Quiz and Formula Quiz as individual subject blocks. **Do not automatically merge these versions.** The latest inventory above is the best available working version, but the disappearance of some earlier blocks should be verified before they are permanently removed from the design.

### 6.4 Proposed 16 × 8 subject-grid layouts

The TXT contains **two different grid blueprints**, neither with clearly verifiable user approval. Do not treat either as final pixel-perfect geometry.

**Earlier symmetric proposal:**
- Top: Lesson-wise Reactions spans 8 columns × 3 rows; Interactive Diagrams spans 8 × 3.
- Middle (rows 4–5): Weaklist Vault 5 × 2, Chemistry centre title 6 × 2, Board Exam QPs 5 × 2.
- Bottom (rows 6–8): Weaklist Quiz 5 × 3, Stronglist Quiz 6 × 3, PTA QPs 5 × 3.
- This is the 8+8 / 5+6+5 / 5+6+5 arrangement.

**Later asymmetric proposal:**
- Lesson-wise Reactions: 9 columns × 3 rows, columns 1–9 / rows 1–3.
- Diagrams: 3 columns × 3 rows, columns 10–12 / rows 1–3.
- Board Exam QPs: right-side vertical tower, columns 13–16 / rows 1–5 (4 × 5).
- Weaklist Vault: columns 1–5 / rows 4–8 (5 × 5).
- Centre title block: described as 6 columns × 2 rows, rows 4–5; coordinates are written as columns 6–12 in one place, which is **7 columns if both endpoints are inclusive**, so the arithmetic conflicts.
- Weaklist Quiz: columns 6–10 / rows 6–8 (5 × 3).
- Stronglist Quiz: columns 11–12 / rows 6–8 (2 × 3).
- PTA Book QPs: columns 13–16 / rows 6–8 (4 × 3).

This asymmetric proposal was offered for review and even presents a possible 2 × 2 diagram alternative. Its visual geometry needs user approval and coordinate validation before implementation.

### 6.5 Subject-page rendering and performance

- Bento modules should remain legible over the charcoal background.
- Avoid applying live `backdrop-filter` blur to every tile.
- Use Motion for relevant layout movement only after implementing deterministic grid/resize/snap maths; Motion's layout animation can animate position/size changes, but do not assume it automatically supplies the application's custom 16 × 8 snapping rules.
- Ensure resize/rearrange can be operated by mouse and touchscreen. Provide an accessible non-drag alternative if practical.

## 7. Profile page and profiles

Argon records Profile as a conventional settings/profile page, not a Bento grid:

- Editable username.
- Editable/uploadable circular avatar.
- `Turn Off Home Page` toggle, described for teachers or focused students.
- Default startup-page selector: Home/You, Chemistry, Physics, or Mathematics; it takes effect after `TAP TO BEGIN` on the login screen.
- Central list manager for Weaklist, Stronglist, and Studylist, with the ability to inspect and remove saved items.
- User capacity cap: maximum six user profiles. Three example profiles listed are `Aqua √X`, `Pyroo`, and `Tanjiro`, plus up to three extra slots.
- When Home is disabled, hide its navigation item and route startup to a valid enabled screen.

**Verify:** Whether the example names are final initial profile data or merely illustrative. Do not hard-code personal/profile data without confirmation.

## 8. Weaklist / Stronglist / Studylist

The three list meanings in the TXT are:

- **Weaklist:** items the learner is not confident about and needs to practise.
- **Stronglist:** items considered mastered/confident.
- **Studylist:** curated or bookmarked items queued for active study.

The feature is meant to work across relevant chemistry reactions, diagrams, and quiz questions. Later replies describe the Profile page as the global list manager. Quiz setup can filter using **All, Lesson-wise, Stronglist, Studylist, or Weaklist**.

Exact controls/icons, tagging behaviour, conflict handling (whether an item may exist in multiple lists), and persistence rules are not specified. Do not invent them without approval.

## 9. Quiz interface and quiz flow

The TXT includes the following detailed quiz design concept:

### 9.1 Setup view

Clicking a quiz-related block opens a setup view where the user chooses:
- Lesson/chapter filter.
- List filter: All, Stronglist, Studylist, or Weaklist.
- Time control toggle ON/OFF.
- Difficulty: Classic, Expert, or Master.

The Start button is described as being in the bottom-left.

### 9.2 Universal loading and countdown

After Start:
1. The universal loading screen is shown, described as an **Inkscape star polygon**.
2. It displays active subject, selected lessons, chosen filters, and difficulty.
3. When loading is complete, a countdown plays immediately before quiz gameplay begins.

The exact star geometry, movement, colour treatment, timing, easing, transition to countdown, and loading failure/timeout behaviour are **not specified**. The implementation agent must inspect the existing loading component and ask before inventing a signature animation.

### 9.3 Full-screen gameplay concept

- Quiz gameplay uses the full screen.
- Questions and answer options use the content font.
- Four multiple-choice options are specified.
- Classic = 3 hearts; Expert = 2 hearts; Master = 1 heart.
- A wrong answer subtracts one heart; a correct answer proceeds to the next question.
- Time expiry or zero hearts triggers the game-over effect described below.

### 9.4 Game-over and review

The described effect is a dramatic **particle-wither**: the quiz UI fades/dissolves into floating particles/ash, then transitions to a review/post-mortem screen. The review shows lessons done well and weak areas and updates Weaklist/Stronglist data.

Argon proposes Anime.js/Canvas particle dispersion and suggests a lightweight canvas effect rather than many DOM physics nodes. The TXT also suggests converting the final quiz DOM into a 2D pixel array; this is a **high-complexity, unverified implementation idea**, not an automatic requirement. A browser does not provide a simple built-in API that directly turns arbitrary DOM pixels into a canvas bitmap; any DOM-rasterization approach requires investigation and may add cost/dependencies. Prototype a lightweight particle visual independently and benchmark it before committing.

## 10. Login screen and existing in-progress work

The current conversation context says Opus in Antigravity has been working on the login screen, its animation, and the universal loading animation. However, the supplied `ui.txt` contains no detailed login-screen layout specification.

The TXT only contains these related references:
- `TAP TO BEGIN` as the action before opening the selected startup screen.
- An editable username should update a Login Modal, a bottom-left login HUD, and the Home welcome block.
- Up to six profiles are supported in the conceptual model.
- The default startup page can be configured in Profile.

Therefore:
- **Preserve and inspect Opus's existing code first.** Do not replace the current login screen from this document alone.
- No exact login layout, profile chooser, field/control list, transition choreography, animation duration, or font size can be recovered from the TXT.
- Capture a screenshot or obtain explicit user feedback before making major visual changes.

## 11. Animation research: official Motion and Anime.js references

The user explicitly asked for animations to be researched on the official **Motion** and **Anime.js** websites. The implementation agent must inspect these resources rather than inventing animations from memory.

### 11.1 Motion (React UI interactions and layout)

Official sources reviewed:

- [Motion examples gallery](https://motion.dev/examples) — examples include loading circle spinner, jumping dots, progress bar, ripple, pulse dots, loading overlay, layout animation, drag with spring follow, reorder animation, shared layout animation, path drawing/morphing, and more.
- [Motion for React layout animations](https://motion.dev/docs/react-layout-animations) — `layout`/layout animation concepts for changing size/position and shared `layoutId` transitions.
- [Motion gestures](https://motion.dev/docs/react-gestures) — hover, tap, pan, drag, focus, and in-view interactions.
- [AnimatePresence](https://motion.dev/docs/react-animate-presence) — coordinated enter/exit animation when React elements mount/unmount.
- [Reduced-motion accessibility](https://motion.dev/docs/react-accessibility) — APIs to respect reduced-motion preferences.
- [Scroll animations](https://motion.dev/docs/react-scroll-animations) — scroll-triggered and scroll-linked patterns. Use only if a specific Prismate screen genuinely needs them; do not add scroll spectacle without approval.

**Potential use cases (RESEARCH SUGGESTIONS — NOT APPROVED):**
- Motion layout/reorder patterns for Bento widget move/resize feedback.
- Drag gestures for widget placement and the navigation reveal/hide interaction, with explicit grid snapping implemented by Prismate logic.
- Enter/exit patterns for menus, the edit-mode confirmation, profile modal, quiz setup, and loading overlay—only if the user approves those transitions.
- A basic loading pattern from the official gallery as a comparison against the custom Inkscape-star loading symbol. Do not replace the signature star without user approval.

### 11.2 Anime.js (timelines, SVG and coordinated sequences)

Official sources reviewed:

- [Anime.js animation API](https://animejs.com/documentation/animation/) — general animation API; its documentation also describes a smaller Web Animations API-powered `waapi.animate()` option with a narrower feature set.
- [Anime.js timelines](https://animejs.com/documentation/timeline) — synchronise animations, timers and callbacks into a coordinated sequence.
- [Adding animations to a timeline](https://animejs.com/documentation/timeline/add-animations/) — add/synchronise multiple animations with timeline positions.
- [Anime.js stagger utility](https://animejs.com/documentation/utilities/stagger/) — stagger values/delays across multiple targets.
- [Anime.js SVG utilities](https://animejs.com/documentation/svg/) — path drawing, morphing, and motion-path helpers.
- [Anime.js SVG morphing](https://animejs.com/documentation/svg/morphto) — morph between supported SVG shapes.
- [Anime.js text utilities](https://animejs.com/documentation/text) — text splitting and scramble effects. Treat text-scramble as optional stylistic inspiration, not a default for educational text.
- [Anime.js scroll events](https://animejs.com/documentation/events/onscroll) — scroll-linked triggers and synchronisation; only use if required by an approved screen.

**Potential use cases (RESEARCH SUGGESTIONS — NOT APPROVED):**
- Use an Anime.js timeline for a user-approved, multi-part loading/countdown sequence where timing and order need precise coordination.
- Inspect SVG path-drawing or restrained morphing patterns for the Inkscape star polygon. Do not pick a specific spin, morph, particle, or drawing effect until the user approves it.
- Use stagger only where several items intentionally enter/exit in sequence; avoid animating every tile or every line of educational text just because the library supports it.
- For particle-wither, use Anime.js to coordinate a carefully limited canvas effect if a tested prototype proves performant. Do not create hundreds of continuously animated DOM nodes.

### 11.3 Research/approval protocol for Opus

Before implementing an animation that is not already specified in code or explicitly approved by the user:

1. Check the relevant official Motion or Anime.js page above and open at least one relevant example from the live official gallery.
2. Record the **example name, official URL, library, and which part of Prismate it may inspire**.
3. Present the user a short comparison of 2–3 plausible patterns where the choice affects the visible design.
4. Clearly label each as a suggestion, not an approved feature.
5. Implement only the one the user approves, unless the user already specified the behaviour.
6. Document reduced-motion behaviour, cancellation/cleanup, touch behaviour, and performance trade-offs.
7. Never copy an example blindly: adapt it to Prismate's existing code, the confirmed colours, and the target devices.

### 11.4 Library responsibilities / conflict rules

- **Native CSS:** ordinary hover/focus/colour/border transitions and simple micro-interactions.
- **Motion:** React UI state transitions, gestures, modal/popup presence, and layout/reorder animations where appropriate.
- **Anime.js:** complex synchronised timelines, SVG-specific effects, and the eventual custom particle sequence if justified.
- Do not install another animation library without explicit approval.
- Do not have Motion and Anime.js animate the same element/property at the same time.
- Do not keep animations running while the component is hidden/unmounted.
- Consider lazy-loading complex animation code so it is not loaded on every basic page.

## 12. Performance and accessibility guardrails

- Do not add backdrop blur to every Bento tile; the later glass recipe reserves actual blur for the small nav dock, subject to testing.
- Use CSS transforms and opacity for routine motion where suitable; avoid repeated layout reflow and expensive effects during pointer movement.
- During widget drag, use a lightweight placeholder/preview and snap deterministically to grid coordinates. Validate pointer/touch handling on the tablet.
- Pause or stop nonessential animated loops when hidden, inactive, or unmounted.
- Honour the OS/user reduced-motion preference. For intense effects, offer a reduced/fade version rather than forcing a full-screen zoom or particle dissolve.
- Preserve readable contrast and focus indication, especially for translucent surfaces.
- Respect touch, keyboard, and screen-reader usage; long-press and swipe should not be the only way to reach important functions.
- Test loading failure, cancellation, slow operations, and navigation during loading. A universal loader must not trap the user or loop indefinitely.
- Test with an empty data state and realistic content; don't invent fake backend behaviour to make a UI appear complete.

## 13. Explicitly unresolved design questions

1. Is the customizable main page labelled **Home** or **You**?
2. Navigation dock: icons only, labels only, or icons + labels?
3. Is the desktop grid best treated as a strict 16 × 8 unit grid, a four-column conceptual grid subdivided into units, or something else?
4. Which subject-grid arrangement is final: symmetric 8+8 / 5+6+5 / 5+6+5 or the asymmetric towers? The source does not prove acceptance of either.
5. What are the correct centre-block coordinates/size? Source contains a 4 × 2 Home welcome block, a 4-unit centre-coordinate suggestion, and later a 6-wide subject hub with inconsistent endpoint math.
6. Should the two glass recipes use 12px or 16px blur on the nav? Is the later 20px tile radius approved over earlier 12px/20px alternatives?
7. Which older subject blocks (Weaklist Vault / Weaklist Quiz / Stronglist Quiz) remain visible as tiles after list filtering moved into quizzes and list management moved to Profile?
8. Are PTA QP and Board QP always separate blocks? The later reply says separated blocks, but confirm if screen space or subject layout requires decisions.
9. Is “Common Book” or “COME Book” the intended Mathematics label, and is it distinct from ordinary textbook Book Questions?
10. What precisely should the Inkscape star polygon do during loading? Its shape source is named, but motion/duration/easing are not.
11. What is the approved login-screen layout and animation? The TXT does not specify them. Inspect Opus's current implementation and ask the user before a major redesign.
12. What animation pattern is approved for navigation, widgets, loading, countdown, quiz success/error, and particle-wither? Official examples are research references, not decisions.
13. What are the exact OTF font filename/path and weight map?
14. What happens if a profile's Home page is disabled and its saved startup page is Home/You? The source says fall back to an enabled subject, but the preferred fallback selection is unclear.
15. How are daily STEM facts/news sourced and refreshed? How is Studytube implemented within the app? These are feature/service questions, not merely visual decisions.
16. What should happen when an item is in more than one of Weaklist, Stronglist, and Studylist?
17. Is the maximum six-profile limit final, and are the example profile names actual starter data?

## 14. Implementation instructions for Claude Opus in Antigravity

1. Read this file and all existing Prismate master instructions/theme files before editing.
2. Inspect the current codebase and preserve existing work—especially the partially implemented login screen, its animation, and universal loading animation.
3. Do not regenerate the project from scratch or replace working components just because another model made them.
4. Build only within the currently approved scope. Do not invent pages, components, copy, colours, or animation choreography.
5. Keep status distinctions intact: USER-CONFIRMED versus ARGON-REPORTED LOCKED versus SOURCE PROPOSAL versus UNDECIDED.
6. Research official Motion/Anime.js resources as described in Section 11 before proposing new animations. Give source URLs for the exact examples considered.
7. Ask before implementing material unresolved design choices. For a minor missing value, use a safe neutral fallback only if it cannot alter the user's visible design in a meaningful way, and document it as temporary.
8. Keep layout geometry data-driven rather than hardcoding inconsistent coordinates in many components.
9. Test build/type checks, current login/loading behaviours, responsive layout, keyboard/touch interactions, reduced-motion behaviour, and performance risks. Report which checks actually ran and what the results were.
10. Do not claim 60 FPS, universal accessibility, complete responsiveness, or verified animation quality without evidence.

### Required completion report

- Completed.
- Not completed.
- Existing work preserved.
- Bugs found/fixed.
- Tests actually performed and results.
- Official animation references reviewed (names + URLs).
- Decisions awaiting user approval.
- Known issues / unverified behaviour.
- UI work remaining.
- Next recommended step.

---

## 15. Research record: official pages used

### Motion
- Main examples gallery: https://motion.dev/examples
- React layout animations: https://motion.dev/docs/react-layout-animations
- React gestures: https://motion.dev/docs/react-gestures
- AnimatePresence: https://motion.dev/docs/react-animate-presence
- Accessibility / reduced motion: https://motion.dev/docs/react-accessibility
- React scroll animations: https://motion.dev/docs/react-scroll-animations

### Anime.js
- Animation API: https://animejs.com/documentation/animation/
- Timelines: https://animejs.com/documentation/timeline
- Timeline add/sync: https://animejs.com/documentation/timeline/add-animations/
- Stagger: https://animejs.com/documentation/utilities/stagger/
- SVG utilities: https://animejs.com/documentation/svg/
- SVG morphing: https://animejs.com/documentation/svg/morphto
- Text utilities: https://animejs.com/documentation/text
- Scroll events: https://animejs.com/documentation/events/onscroll

*This is a design/implementation handover, not proof that every proposed feature is implemented or approved. The user's decisions remain the source of truth.*

```

## FILE: prismate-app/src/types/prismate.ts

```tsx
/**
 * Prismate 1.5 — Global Type Definitions
 */

export type ScreenType = 'home' | 'chemistry' | 'physics' | 'mathematics' | 'profile';

export type ListType = 'weaklist' | 'stronglist' | 'studylist';

export type DifficultyLevel = 'classic' | 'expert' | 'master';

export interface UserProfile {
  id: string;
  username: string;
  avatarSeed: string;
  defaultStartupScreen: ScreenType;
  homePageEnabled: boolean;
}

export interface ListItem {
  id: string;
  subject: 'chemistry' | 'physics' | 'mathematics';
  category: 'reaction' | 'formula' | 'diagram' | 'question';
  title: string;
  content: string;
  source: string;
  addedAt: number;
}

export interface QuizQuestion {
  id: string;
  subject: 'chemistry' | 'physics' | 'mathematics';
  topic: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  category: 'bb' | 'pta' | 'board' | 'formula' | 'unit';
  sourcePage?: number;
  requiresDiagram?: boolean;
}

export interface ChemicalReaction {
  id: string;
  chapter: string;
  name: string;
  equation: string;
  reactants: string;
  products: string;
  conditions: string;
  mechanismNote?: string;
}

export interface SubjectDiagram {
  id: string;
  subject: 'chemistry' | 'physics' | 'mathematics';
  title: string;
  chapter: string;
  description: string;
  svgType: string;
}

export interface QuestionPaperItem {
  id: string;
  subject: 'chemistry' | 'physics' | 'mathematics';
  title: string;
  yearOrType: string;
  questionCount: number;
  duration: string;
  marks: number;
  fileUrl?: string;
  answerKeyUrl?: string;
  examSession?: string;
}

```

## FILE: prismate-app/src/components/GlowingTitle.tsx

```tsx
import React, { useEffect, useRef } from 'react';
import { getWaveCharge } from './WaveCanvas';

interface GlowingTitleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  fontSize?: string;
  letterSpacing?: string;
}

/**
 * GlowingTitle
 *
 * Dynamically modulates pure white text shadow and brightness based on real-time
 * particle wave charge flowing through the center of the title.
 * Operates at 60fps via requestAnimationFrame without triggering React re-renders.
 */
export const GlowingTitle: React.FC<GlowingTitleProps> = ({
  text,
  className,
  style,
  fontSize = 'clamp(24px, 2.6vw, 42px)',
  letterSpacing = '6px',
}) => {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothedChargeRef = useRef<number>(0.2);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const updateGlow = () => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Sample particle wave density at the title's visual center
      const rawCharge = getWaveCharge(cx, cy);

      // Smooth progression (exponential moving average)
      smoothedChargeRef.current = smoothedChargeRef.current * 0.72 + rawCharge * 0.28;
      const charge = smoothedChargeRef.current;

      // Active glow factor (0.0 to 1.0)
      const glowFactor = Math.max(0, Math.min(1, (charge - 0.12) / 0.65));

      if (glowFactor > 0.04) {
        el.style.textShadow = `0 0 ${Math.round(12 * glowFactor)}px rgba(255, 255, 255, ${0.95 * glowFactor}), 0 0 ${Math.round(30 * glowFactor)}px rgba(255, 255, 255, ${0.72 * glowFactor}), 0 0 ${Math.round(52 * glowFactor)}px rgba(255, 255, 255, ${0.45 * glowFactor})`;
        el.style.filter = `brightness(${1 + 0.5 * glowFactor}) drop-shadow(0 0 ${Math.round(16 * glowFactor)}px rgba(255, 255, 255, ${0.85 * glowFactor}))`;
      } else {
        el.style.textShadow = 'none';
        el.style.filter = 'none';
      }

      rafRef.current = requestAnimationFrame(updateGlow);
    };

    rafRef.current = requestAnimationFrame(updateGlow);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <h1
      ref={titleRef}
      className={className}
      style={{
        fontFamily: 'var(--font-heading)',
        fontSize,
        color: '#F2F2F2',
        letterSpacing,
        textAlign: 'center',
        fontWeight: 'normal',
        margin: 0,
        userSelect: 'none',
        transition: 'color 0.15s ease',
        ...style,
      }}
    >
      {text}
    </h1>
  );
};

export default GlowingTitle;

```

## FILE: prismate-app/src/components/AnalogClock.tsx

```tsx
import React from 'react';

interface AnalogClockProps {
  time: Date;
  size?: number;
}

/**
 * AnalogClock
 *
 * Minimalist geometric analog clock face rendered in SVG.
 * Clean monochrome palette matching the PRISMATE aesthetic.
 */
export const AnalogClock: React.FC<AnalogClockProps> = ({ time, size = 120 }) => {
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = seconds * 6; // 360 / 60
  const minuteDeg = minutes * 6 + seconds * 0.1; // 360 / 60
  const hourDeg = hours * 30 + minutes * 0.5; // 360 / 12

  const radius = 46;
  const center = 50;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ overflow: 'visible', userSelect: 'none' }}
    >
      {/* Outer Dial Circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="rgba(10, 10, 10, 0.65)"
        stroke="rgba(242, 242, 242, 0.25)"
        strokeWidth="1.5"
      />

      {/* 12 Hour Tick Marks */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const isQuarter = i % 3 === 0;
        const tickLength = isQuarter ? 6 : 3;
        const x1 = center + (radius - 2) * Math.sin(angle);
        const y1 = center - (radius - 2) * Math.cos(angle);
        const x2 = center + (radius - 2 - tickLength) * Math.sin(angle);
        const y2 = center - (radius - 2 - tickLength) * Math.cos(angle);

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={isQuarter ? '#F2F2F2' : 'rgba(242, 242, 242, 0.35)'}
            strokeWidth={isQuarter ? 1.5 : 0.8}
            strokeLinecap="round"
          />
        );
      })}

      {/* Hour Hand */}
      <line
        x1={center}
        y1={center}
        x2={center}
        y2={center - 24}
        stroke="#F2F2F2"
        strokeWidth="2.4"
        strokeLinecap="round"
        transform={`rotate(${hourDeg} ${center} ${center})`}
      />

      {/* Minute Hand */}
      <line
        x1={center}
        y1={center}
        x2={center}
        y2={center - 34}
        stroke="#F2F2F2"
        strokeWidth="1.6"
        strokeLinecap="round"
        transform={`rotate(${minuteDeg} ${center} ${center})`}
      />

      {/* Second Hand */}
      <line
        x1={center}
        y1={center + 6}
        x2={center}
        y2={center - 38}
        stroke="#EB104B"
        strokeWidth="1"
        strokeLinecap="round"
        transform={`rotate(${secondDeg} ${center} ${center})`}
      />

      {/* Center Pivot Pin */}
      <circle cx={center} cy={center} r="2.5" fill="#EB104B" />
      <circle cx={center} cy={center} r="1" fill="#FFFFFF" />
    </svg>
  );
};

export default AnalogClock;

```

## FILE: prismate-app/src/components/home/ClockModal.tsx

```tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AnalogClock from '../AnalogClock';

export interface AlarmItem {
  id: string;
  time: string; // "HH:MM"
  label: string;
  enabled: boolean;
}

export interface ClockConfig {
  mode: 'digital' | 'analog';
  format: '12h' | '24h';
}

interface ClockModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ClockConfig;
  onUpdateConfig: (cfg: ClockConfig) => void;
  alarms: AlarmItem[];
  onUpdateAlarms: (alarms: AlarmItem[]) => void;
  coolTimeRemaining: number | null;
  onStartCoolTime: (seconds: number) => void;
  onStopCoolTime: () => void;
}

export const ClockModal: React.FC<ClockModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  alarms,
  onUpdateAlarms,
  coolTimeRemaining,
  onStartCoolTime,
  onStopCoolTime,
}) => {
  const [activeTab, setActiveTab] = useState<'display' | 'cooltime' | 'alarms'>('display');
  const [currentTime, setCurrentTime] = useState(() => new Date());

  // Alarm form
  const [newAlarmTime, setNewAlarmTime] = useState('06:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('Formula Drill');

  // Cool time preset
  const [customCoolMinutes, setCustomCoolMinutes] = useState(1);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!isOpen) return null;

  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlarmTime) return;
    const newAlarm: AlarmItem = {
      id: 'alarm-' + Date.now(),
      time: newAlarmTime,
      label: newAlarmLabel || 'Study Reminder',
      enabled: true,
    };
    onUpdateAlarms([...alarms, newAlarm]);
    setNewAlarmLabel('');
  };

  const handleToggleAlarm = (id: string) => {
    onUpdateAlarms(
      alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleDeleteAlarm = (id: string) => {
    onUpdateAlarms(alarms.filter((a) => a.id !== id));
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9600,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 'min(480px, 94vw)',
            background: 'linear-gradient(135deg, rgba(24, 24, 24, 0.98), rgba(12, 12, 12, 0.95))',
            border: '1.5px solid rgba(242, 242, 242, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(242, 242, 242, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid rgba(242, 242, 242, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>⏱</span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  color: '#F2F2F2',
                }}
              >
                CLOCK & COOL TIME
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(242, 242, 242, 0.6)',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Nav Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderBottom: '1px solid rgba(242, 242, 242, 0.1)',
              background: 'rgba(0, 0, 0, 0.4)',
            }}
          >
            {[
              { id: 'display', label: 'CLOCK DISPLAY' },
              { id: 'cooltime', label: 'COOL TIME' },
              { id: 'alarms', label: `ALARMS (${alarms.filter((a) => a.enabled).length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: activeTab === tab.id ? 'rgba(242, 242, 242, 0.12)' : 'transparent',
                  color: activeTab === tab.id ? '#F2F2F2' : 'rgba(242, 242, 242, 0.45)',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #F2F2F2' : '2px solid transparent',
                  padding: '12px 6px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div style={{ padding: '24px', minHeight: '260px' }}>
            {/* TAB 1: DISPLAY MODE (Analog vs Digital, 12h vs 24h) */}
            {activeTab === 'display' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    background: 'rgba(0, 0, 0, 0.45)',
                    borderRadius: '14px',
                    border: '1px solid rgba(242, 242, 242, 0.08)',
                  }}
                >
                  {config.mode === 'analog' ? (
                    <AnalogClock time={currentTime} size={130} />
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '38px',
                          letterSpacing: '3px',
                          color: '#F2F2F2',
                        }}
                      >
                        {currentTime.toLocaleTimeString([], {
                          hour12: config.format === '12h',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-content)',
                          fontSize: '11px',
                          color: 'rgba(242, 242, 242, 0.45)',
                          letterSpacing: '1px',
                          marginTop: '6px',
                        }}
                      >
                        {currentTime.toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Clock Mode Toggle */}
                <div>
                  <label
                    style={{
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '11px',
                      letterSpacing: '1.5px',
                      color: 'rgba(242, 242, 242, 0.5)',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    CLOCK STYLE
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      onClick={() => onUpdateConfig({ ...config, mode: 'digital' })}
                      style={{
                        background: config.mode === 'digital' ? '#F2F2F2' : 'rgba(242, 242, 242, 0.06)',
                        color: config.mode === 'digital' ? '#000000' : '#F2F2F2',
                        border: '1px solid rgba(242, 242, 242, 0.2)',
                        borderRadius: '8px',
                        padding: '10px',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '11px',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                      }}
                    >
                      DIGITAL CLOCK
                    </button>
                    <button
                      onClick={() => onUpdateConfig({ ...config, mode: 'analog' })}
                      style={{
                        background: config.mode === 'analog' ? '#F2F2F2' : 'rgba(242, 242, 242, 0.06)',
                        color: config.mode === 'analog' ? '#000000' : '#F2F2F2',
                        border: '1px solid rgba(242, 242, 242, 0.2)',
                        borderRadius: '8px',
                        padding: '10px',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '11px',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                      }}
                    >
                      ANALOG CLOCK
                    </button>
                  </div>
                </div>

                {/* Digital Format Toggle (Only if digital mode) */}
                {config.mode === 'digital' && (
                  <div>
                    <label
                      style={{
                        fontFamily: 'var(--font-subheading)',
                        fontSize: '11px',
                        letterSpacing: '1.5px',
                        color: 'rgba(242, 242, 242, 0.5)',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      TIME FORMAT
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button
                        onClick={() => onUpdateConfig({ ...config, format: '12h' })}
                        style={{
                          background: config.format === '12h' ? '#F2F2F2' : 'rgba(242, 242, 242, 0.06)',
                          color: config.format === '12h' ? '#000000' : '#F2F2F2',
                          border: '1px solid rgba(242, 242, 242, 0.2)',
                          borderRadius: '8px',
                          padding: '10px',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '11px',
                          letterSpacing: '1px',
                          cursor: 'pointer',
                        }}
                      >
                        12-HOUR (AM/PM)
                      </button>
                      <button
                        onClick={() => onUpdateConfig({ ...config, format: '24h' })}
                        style={{
                          background: config.format === '24h' ? '#F2F2F2' : 'rgba(242, 242, 242, 0.06)',
                          color: config.format === '24h' ? '#000000' : '#F2F2F2',
                          border: '1px solid rgba(242, 242, 242, 0.2)',
                          borderRadius: '8px',
                          padding: '10px',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '11px',
                          letterSpacing: '1px',
                          cursor: 'pointer',
                        }}
                      >
                        24-HOUR FORMAT
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: COOL TIME TIMER */}
            {activeTab === 'cooltime' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px',
                    background: 'rgba(0, 0, 0, 0.45)',
                    borderRadius: '14px',
                    border: '1px solid rgba(242, 242, 242, 0.08)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '11px',
                      letterSpacing: '2px',
                      color: 'rgba(242, 242, 242, 0.5)',
                      marginBottom: '8px',
                    }}
                  >
                    {coolTimeRemaining !== null ? 'COOL TIME ACTIVE' : 'SET COOL TIME TIMER'}
                  </span>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '44px',
                      letterSpacing: '3px',
                      color: coolTimeRemaining !== null && coolTimeRemaining <= 10 ? '#EB104B' : '#F2F2F2',
                    }}
                  >
                    {coolTimeRemaining !== null
                      ? `${Math.floor(coolTimeRemaining / 60)
                          .toString()
                          .padStart(2, '0')}:${(coolTimeRemaining % 60).toString().padStart(2, '0')}`
                      : `${customCoolMinutes.toString().padStart(2, '0')}:00`}
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label
                    style={{
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '11px',
                      letterSpacing: '1.5px',
                      color: 'rgba(242, 242, 242, 0.5)',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    QUICK PRESETS
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[1, 3, 5, 10].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => {
                          setCustomCoolMinutes(mins);
                          onStartCoolTime(mins * 60);
                        }}
                        style={{
                          background: customCoolMinutes === mins ? '#F2F2F2' : 'rgba(242, 242, 242, 0.08)',
                          color: customCoolMinutes === mins ? '#000000' : '#F2F2F2',
                          border: '1px solid rgba(242, 242, 242, 0.2)',
                          borderRadius: '8px',
                          padding: '10px 4px',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        {mins} MIN
                      </button>
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {coolTimeRemaining !== null ? (
                    <button
                      onClick={onStopCoolTime}
                      style={{
                        flex: 1,
                        background: '#EB104B',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '12px',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                      }}
                    >
                      STOP COOL TIME
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartCoolTime(customCoolMinutes * 60)}
                      style={{
                        flex: 1,
                        background: '#F2F2F2',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '12px',
                        letterSpacing: '1px',
                        cursor: 'pointer',
                      }}
                    >
                      START {customCoolMinutes} MIN COOL TIME
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ALARMS & REMINDERS */}
            {activeTab === 'alarms' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Add Alarm Form */}
                <form
                  onSubmit={handleAddAlarm}
                  style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '10px',
                    border: '1px solid rgba(242, 242, 242, 0.1)',
                  }}
                >
                  <input
                    type="time"
                    value={newAlarmTime}
                    onChange={(e) => setNewAlarmTime(e.target.value)}
                    required
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(242, 242, 242, 0.25)',
                      borderRadius: '6px',
                      color: '#F2F2F2',
                      padding: '6px 10px',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      width: '95px',
                    }}
                  />
                  <input
                    type="text"
                    value={newAlarmLabel}
                    onChange={(e) => setNewAlarmLabel(e.target.value)}
                    placeholder="Alarm reminder label..."
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(242, 242, 242, 0.25)',
                      borderRadius: '6px',
                      color: '#F2F2F2',
                      padding: '6px 10px',
                      fontFamily: 'var(--font-content)',
                      fontSize: '12px',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#F2F2F2',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    ADD
                  </button>
                </form>

                {/* Alarms List */}
                <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {alarms.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(242, 242, 242, 0.35)', fontSize: '12px' }}>
                      No alarms set. Add an alarm or study reminder above.
                    </div>
                  ) : (
                    alarms.map((alarm) => (
                      <div
                        key={alarm.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          border: '1px solid rgba(242, 242, 242, 0.1)',
                          borderRadius: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              color: alarm.enabled ? '#F2F2F2' : 'rgba(242, 242, 242, 0.35)',
                            }}
                          >
                            {alarm.time}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-content)',
                              fontSize: '12px',
                              color: alarm.enabled ? 'rgba(242, 242, 242, 0.85)' : 'rgba(242, 242, 242, 0.35)',
                            }}
                          >
                            {alarm.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            onClick={() => handleToggleAlarm(alarm.id)}
                            style={{
                              background: alarm.enabled ? '#F2F2F2' : 'rgba(242, 242, 242, 0.15)',
                              color: alarm.enabled ? '#000000' : '#F2F2F2',
                              border: 'none',
                              borderRadius: '12px',
                              padding: '3px 10px',
                              fontSize: '10px',
                              fontFamily: 'var(--font-heading)',
                              cursor: 'pointer',
                            }}
                          >
                            {alarm.enabled ? 'ON' : 'OFF'}
                          </button>
                          <button
                            onClick={() => handleDeleteAlarm(alarm.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'rgba(242, 242, 242, 0.4)',
                              fontSize: '13px',
                              cursor: 'pointer',
                              padding: '2px 6px',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ClockModal;

```

## FILE: prismate-app/src/components/home/PomodoroModal.tsx

```tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesBeforeLongBreak: number;
}

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
  onUpdateSettings: (settings: PomodoroSettings) => void;
  currentCycle: number;
  currentMode: 'focus' | 'shortBreak' | 'longBreak';
  onResetCycle: () => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentCycle,
  currentMode,
  onResetCycle,
}) => {
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(settings);

  if (!isOpen) return null;

  const handlePreset = (focus: number, shortBreak: number, longBreak: number, cycles: number) => {
    const updated = {
      focusMinutes: focus,
      shortBreakMinutes: shortBreak,
      longBreakMinutes: longBreak,
      cyclesBeforeLongBreak: cycles,
    };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9600,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 'min(480px, 94vw)',
            background: 'linear-gradient(135deg, rgba(24, 24, 24, 0.98), rgba(12, 12, 12, 0.95))',
            border: '1.5px solid rgba(242, 242, 242, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(242, 242, 242, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid rgba(242, 242, 242, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>⏳</span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  color: '#F2F2F2',
                }}
              >
                POMODORO & BREAK CONFIGURATION
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(242, 242, 242, 0.6)',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Cycle Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                background: 'rgba(0, 0, 0, 0.45)',
                borderRadius: '12px',
                border: '1px solid rgba(242, 242, 242, 0.1)',
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    color: 'rgba(242, 242, 242, 0.5)',
                    display: 'block',
                  }}
                >
                  ACTIVE STAGE
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '14px',
                    letterSpacing: '1.5px',
                    color: currentMode === 'focus' ? '#F2F2F2' : '#EB104B',
                    textTransform: 'uppercase',
                  }}
                >
                  {currentMode === 'focus'
                    ? `FOCUS DRILL (CYCLE ${currentCycle} / ${localSettings.cyclesBeforeLongBreak})`
                    : currentMode === 'shortBreak'
                    ? 'SHORT BREAK'
                    : 'LONG BREAK REST'}
                </span>
              </div>
              <button
                onClick={onResetCycle}
                style={{
                  background: 'rgba(242, 242, 242, 0.1)',
                  border: '1px solid rgba(242, 242, 242, 0.2)',
                  color: '#F2F2F2',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                RESET CYCLE
              </button>
            </div>

            {/* Presets */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.5)',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                PRODUCTIVITY PRESETS
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  onClick={() => handlePreset(25, 5, 15, 4)}
                  style={{
                    background:
                      localSettings.focusMinutes === 25 && localSettings.shortBreakMinutes === 5
                        ? '#F2F2F2'
                        : 'rgba(242, 242, 242, 0.08)',
                    color:
                      localSettings.focusMinutes === 25 && localSettings.shortBreakMinutes === 5
                        ? '#000000'
                        : '#F2F2F2',
                    border: '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 4px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  CLASSIC 25 / 5
                </button>
                <button
                  onClick={() => handlePreset(50, 10, 25, 3)}
                  style={{
                    background:
                      localSettings.focusMinutes === 50 && localSettings.shortBreakMinutes === 10
                        ? '#F2F2F2'
                        : 'rgba(242, 242, 242, 0.08)',
                    color:
                      localSettings.focusMinutes === 50 && localSettings.shortBreakMinutes === 10
                        ? '#000000'
                        : '#F2F2F2',
                    border: '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 4px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  DEEP WORK 50 / 10
                </button>
                <button
                  onClick={() => handlePreset(15, 3, 10, 4)}
                  style={{
                    background:
                      localSettings.focusMinutes === 15 && localSettings.shortBreakMinutes === 3
                        ? '#F2F2F2'
                        : 'rgba(242, 242, 242, 0.08)',
                    color:
                      localSettings.focusMinutes === 15 && localSettings.shortBreakMinutes === 3
                        ? '#000000'
                        : '#F2F2F2',
                    border: '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 4px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  SPRINT 15 / 3
                </button>
              </div>
            </div>

            {/* Custom Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Focus Duration */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-subheading)', fontSize: '11px', color: 'rgba(242,242,242,0.6)' }}>
                    FOCUS TIME
                  </span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', color: '#F2F2F2' }}>
                    {localSettings.focusMinutes} MIN
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="5"
                  value={localSettings.focusMinutes}
                  onChange={(e) => setLocalSettings({ ...localSettings, focusMinutes: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#F2F2F2' }}
                />
              </div>

              {/* Short Break Duration */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-subheading)', fontSize: '11px', color: 'rgba(242,242,242,0.6)' }}>
                    SHORT BREAK
                  </span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', color: '#F2F2F2' }}>
                    {localSettings.shortBreakMinutes} MIN
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={localSettings.shortBreakMinutes}
                  onChange={(e) => setLocalSettings({ ...localSettings, shortBreakMinutes: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#F2F2F2' }}
                />
              </div>

              {/* Long Break Duration */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-subheading)', fontSize: '11px', color: 'rgba(242,242,242,0.6)' }}>
                    LONG BREAK
                  </span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', color: '#F2F2F2' }}>
                    {localSettings.longBreakMinutes} MIN
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="5"
                  value={localSettings.longBreakMinutes}
                  onChange={(e) => setLocalSettings({ ...localSettings, longBreakMinutes: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#F2F2F2' }}
                />
              </div>

              {/* Cycles before long break */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-subheading)', fontSize: '11px', color: 'rgba(242,242,242,0.6)' }}>
                    CYCLES / BREAKS COUNT
                  </span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '12px', color: '#F2F2F2' }}>
                    {localSettings.cyclesBeforeLongBreak} CYCLES
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={localSettings.cyclesBeforeLongBreak}
                  onChange={(e) => setLocalSettings({ ...localSettings, cyclesBeforeLongBreak: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: '#F2F2F2' }}
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              style={{
                width: '100%',
                background: '#F2F2F2',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontFamily: 'var(--font-heading)',
                fontSize: '12px',
                letterSpacing: '2px',
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              SAVE SETTINGS
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PomodoroModal;

```

## FILE: prismate-app/src/components/home/TasksQuotesModal.tsx

```tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

interface TasksQuotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  todos: TodoItem[];
  onUpdateTodos: (todos: TodoItem[]) => void;
  quote: string;
  onUpdateQuote: (quote: string) => void;
}

const STEM_QUOTES = [
  'Supercritical CO₂ acts as both gas and liquid simultaneously — currently replacing toxic organic solvents in modern green chemistry decaffeination.',
  'Electric field lines never intersect because if they did, the field at the point of intersection would point in two different directions simultaneously.',
  'A system of linear equations AX = B has a unique solution if and only if |A| ≠ 0 (i.e. matrix A is non-singular with rank equal to number of unknowns).',
  'In the Hall-Héroult process, cryolite (Na₃AlF₆) lowers the melting point of alumina from 2323 K to 1223 K and increases electrical conductivity.',
  'The electric flux through any closed Gaussian surface enclosing charge Q depends purely on the net charge divided by ε₀, regardless of shape or size.',
  'By Cramer’s Rule, if Δ = 0 and at least one of Δx, Δy, Δz is non-zero, the system of equations is strictly inconsistent and has no solution.',
];

export const TasksQuotesModal: React.FC<TasksQuotesModalProps> = ({
  isOpen,
  onClose,
  todos,
  onUpdateTodos,
  quote,
  onUpdateQuote,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'quote'>('tasks');
  const [newTodoText, setNewTodoText] = useState('');
  const [editingQuote, setEditingQuote] = useState(quote);

  if (!isOpen) return null;

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    const newItem: TodoItem = {
      id: 't-' + Date.now(),
      text: newTodoText.trim(),
      done: false,
    };
    onUpdateTodos([...todos, newItem]);
    setNewTodoText('');
  };

  const handleToggleTodo = (id: string) => {
    onUpdateTodos(
      todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleDeleteTodo = (id: string) => {
    onUpdateTodos(todos.filter((t) => t.id !== id));
  };

  const handleClearDone = () => {
    onUpdateTodos(todos.filter((t) => !t.done));
  };

  const handleRandomQuote = () => {
    const random = STEM_QUOTES[Math.floor(Math.random() * STEM_QUOTES.length)];
    setEditingQuote(random);
    onUpdateQuote(random);
  };

  const handleSaveQuote = () => {
    if (editingQuote.trim()) {
      onUpdateQuote(editingQuote.trim());
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9600,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 'min(500px, 94vw)',
            background: 'linear-gradient(135deg, rgba(24, 24, 24, 0.98), rgba(12, 12, 12, 0.95))',
            border: '1.5px solid rgba(242, 242, 242, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(242, 242, 242, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid rgba(242, 242, 242, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>📝</span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  color: '#F2F2F2',
                }}
              >
                TASKS & STEM QUOTES
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(242, 242, 242, 0.6)',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              borderBottom: '1px solid rgba(242, 242, 242, 0.1)',
              background: 'rgba(0, 0, 0, 0.4)',
            }}
          >
            <button
              onClick={() => setActiveTab('tasks')}
              style={{
                background: activeTab === 'tasks' ? 'rgba(242, 242, 242, 0.12)' : 'transparent',
                color: activeTab === 'tasks' ? '#F2F2F2' : 'rgba(242, 242, 242, 0.45)',
                border: 'none',
                borderBottom: activeTab === 'tasks' ? '2px solid #F2F2F2' : '2px solid transparent',
                padding: '12px 6px',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              DAILY TASKS ({todos.filter((t) => !t.done).length} REMAINING)
            </button>
            <button
              onClick={() => setActiveTab('quote')}
              style={{
                background: activeTab === 'quote' ? 'rgba(242, 242, 242, 0.12)' : 'transparent',
                color: activeTab === 'quote' ? '#F2F2F2' : 'rgba(242, 242, 242, 0.45)',
                border: 'none',
                borderBottom: activeTab === 'quote' ? '2px solid #F2F2F2' : '2px solid transparent',
                padding: '12px 6px',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              STEM INSIGHT / QUOTE
            </button>
          </div>

          <div style={{ padding: '24px', minHeight: '260px' }}>
            {/* TAB 1: TASKS */}
            {activeTab === 'tasks' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Add Input */}
                <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Enter study task or revision goal..."
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(242, 242, 242, 0.25)',
                      borderRadius: '8px',
                      color: '#F2F2F2',
                      padding: '10px 14px',
                      fontFamily: 'var(--font-content)',
                      fontSize: '13px',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#F2F2F2',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                    }}
                  >
                    ADD
                  </button>
                </form>

                {/* Task List */}
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {todos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(242, 242, 242, 0.35)', fontSize: '12px' }}>
                      No tasks yet. Add your study goals above.
                    </div>
                  ) : (
                    todos.map((todo) => (
                      <div
                        key={todo.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          background: 'rgba(0, 0, 0, 0.35)',
                          border: '1px solid rgba(242, 242, 242, 0.1)',
                          borderRadius: '8px',
                        }}
                      >
                        <div
                          onClick={() => handleToggleTodo(todo.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            flex: 1,
                          }}
                        >
                          <span
                            style={{
                              fontSize: '15px',
                              color: todo.done ? '#F2F2F2' : 'rgba(242, 242, 242, 0.35)',
                            }}
                          >
                            {todo.done ? '☑' : '☐'}
                          </span>
                          <span
                            style={{
                              fontFamily: 'var(--font-content)',
                              fontSize: '13px',
                              color: todo.done ? 'rgba(242, 242, 242, 0.35)' : '#F2F2F2',
                              textDecoration: todo.done ? 'line-through' : 'none',
                            }}
                          >
                            {todo.text}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(242, 242, 242, 0.4)',
                            fontSize: '13px',
                            cursor: 'pointer',
                            padding: '2px 6px',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {todos.some((t) => t.done) && (
                  <button
                    onClick={handleClearDone}
                    style={{
                      alignSelf: 'flex-start',
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(242, 242, 242, 0.45)',
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '11px',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      marginTop: '4px',
                    }}
                  >
                    Clear completed tasks
                  </button>
                )}
              </div>
            )}

            {/* TAB 2: QUOTE / INSIGHT */}
            {activeTab === 'quote' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label
                    style={{
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '11px',
                      letterSpacing: '1.5px',
                      color: 'rgba(242, 242, 242, 0.5)',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    CURRENT MOTIVATIONAL INSIGHT
                  </label>
                  <textarea
                    rows={4}
                    value={editingQuote}
                    onChange={(e) => setEditingQuote(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(242, 242, 242, 0.25)',
                      borderRadius: '8px',
                      color: '#F2F2F2',
                      padding: '12px',
                      fontFamily: 'var(--font-content)',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      resize: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={handleRandomQuote}
                    style={{
                      flex: 1,
                      background: 'rgba(242, 242, 242, 0.08)',
                      border: '1px solid rgba(242, 242, 242, 0.2)',
                      color: '#F2F2F2',
                      borderRadius: '8px',
                      padding: '10px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                    }}
                  >
                    🎲 RANDOM STEM INSIGHT
                  </button>
                  <button
                    onClick={handleSaveQuote}
                    style={{
                      flex: 1,
                      background: '#F2F2F2',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                    }}
                  >
                    SAVE QUOTE
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TasksQuotesModal;

```

## FILE: prismate-app/src/components/home/ActiveQuizModal.tsx

```tsx
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ListType, ListItem } from '../../types/prismate';

export type ActiveQuizFilter = 'all' | ListType;
export type SubjectFilter = 'all' | 'physics' | 'chemistry' | 'mathematics';

interface ActiveQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilter: ActiveQuizFilter;
  onSelectFilter: (filter: ActiveQuizFilter) => void;
  subjectFilter: SubjectFilter;
  onSelectSubjectFilter: (sub: SubjectFilter) => void;
  weaklist: ListItem[];
  stronglist: ListItem[];
  studylist: ListItem[];
  totalAnswered: number;
}

export const ActiveQuizModal: React.FC<ActiveQuizModalProps> = ({
  isOpen,
  onClose,
  activeFilter,
  onSelectFilter,
  subjectFilter,
  onSelectSubjectFilter,
  weaklist,
  stronglist,
  studylist,
  totalAnswered,
}) => {
  if (!isOpen) return null;

  const totalEvaluated = weaklist.length + stronglist.length;
  const accuracy =
    totalEvaluated > 0 ? Math.round((stronglist.length / totalEvaluated) * 100) : 100;

  const weakPhysics = weaklist.filter((i) => i.subject === 'physics').length;
  const weakChem = weaklist.filter((i) => i.subject === 'chemistry').length;
  const weakMath = weaklist.filter((i) => i.subject === 'mathematics').length;

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9600,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 'min(520px, 94vw)',
            background: 'linear-gradient(135deg, rgba(24, 24, 24, 0.98), rgba(12, 12, 12, 0.95))',
            border: '1.5px solid rgba(242, 242, 242, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(242, 242, 242, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid rgba(242, 242, 242, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>🎯</span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  color: '#F2F2F2',
                }}
              >
                ACTIVE QUIZ SOURCE & STATISTICS
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(242, 242, 242, 0.6)',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Statistics Banner */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.45)',
                borderRadius: '14px',
                border: '1px solid rgba(242, 242, 242, 0.1)',
                textAlign: 'center',
              }}
            >
              <div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#F2F2F2' }}>
                  {totalAnswered}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '9px',
                    letterSpacing: '1px',
                    color: 'rgba(242,242,242,0.45)',
                    marginTop: '4px',
                  }}
                >
                  DRILLS TAKEN
                </span>
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#F2F2F2' }}>
                  {accuracy}%
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '9px',
                    letterSpacing: '1px',
                    color: 'rgba(242,242,242,0.45)',
                    marginTop: '4px',
                  }}
                >
                  ACCURACY
                </span>
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#EB104B' }}>
                  {weaklist.length}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '9px',
                    letterSpacing: '1px',
                    color: 'rgba(242,242,242,0.45)',
                    marginTop: '4px',
                  }}
                >
                  WEAK ISSUES
                </span>
              </div>
              <div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: '#F2F2F2' }}>
                  {stronglist.length}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '9px',
                    letterSpacing: '1px',
                    color: 'rgba(242,242,242,0.45)',
                    marginTop: '4px',
                  }}
                >
                  STRONG MASTERED
                </span>
              </div>
            </div>

            {/* List Source Filter */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.5)',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                SELECT QUIZ SOURCE LIST
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'all', label: 'ALL (116 Qs)', count: 116 },
                  { id: 'weaklist', label: 'WEAK LIST', count: weaklist.length },
                  { id: 'stronglist', label: 'STRONG LIST', count: stronglist.length },
                  { id: 'studylist', label: 'STUDY LIST', count: studylist.length },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectFilter(item.id as ActiveQuizFilter)}
                    style={{
                      background: activeFilter === item.id ? '#F2F2F2' : 'rgba(242, 242, 242, 0.08)',
                      color: activeFilter === item.id ? '#000000' : '#F2F2F2',
                      border: '1px solid rgba(242, 242, 242, 0.2)',
                      borderRadius: '8px',
                      padding: '10px 4px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div>{item.label}</div>
                    <div style={{ fontSize: '9px', opacity: 0.6, marginTop: '2px' }}>
                      ({item.count})
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Focus Filter */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.5)',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                SUBJECT FOCUS
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  { id: 'all', label: 'ALL SUBJECTS' },
                  { id: 'physics', label: 'PHYSICS' },
                  { id: 'chemistry', label: 'CHEMISTRY' },
                  { id: 'mathematics', label: 'MATHEMATICS' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => onSelectSubjectFilter(sub.id as SubjectFilter)}
                    style={{
                      background: subjectFilter === sub.id ? '#F2F2F2' : 'rgba(242, 242, 242, 0.08)',
                      color: subjectFilter === sub.id ? '#000000' : '#F2F2F2',
                      border: '1px solid rgba(242, 242, 242, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 4px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weak Issues Breakdown by Lesson */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.5)',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                WEAK ISSUES BY CHAPTER 1 LESSON
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-content)',
                  }}
                >
                  <span style={{ color: '#F2F2F2' }}>Physics: Unit 1 Electrostatics</span>
                  <span style={{ color: weakPhysics > 0 ? '#EB104B' : 'rgba(242,242,242,0.4)' }}>
                    {weakPhysics} issue{weakPhysics === 1 ? '' : 's'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-content)',
                  }}
                >
                  <span style={{ color: '#F2F2F2' }}>Chemistry: Unit 1 Metallurgy</span>
                  <span style={{ color: weakChem > 0 ? '#EB104B' : 'rgba(242,242,242,0.4)' }}>
                    {weakChem} issue{weakChem === 1 ? '' : 's'}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.35)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-content)',
                  }}
                >
                  <span style={{ color: '#F2F2F2' }}>Math: Unit 1 Applications of Matrices</span>
                  <span style={{ color: weakMath > 0 ? '#EB104B' : 'rgba(242,242,242,0.4)' }}>
                    {weakMath} issue{weakMath === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            </div>

            {/* Done Button */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                background: '#F2F2F2',
                color: '#000000',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontFamily: 'var(--font-heading)',
                fontSize: '12px',
                letterSpacing: '2px',
                cursor: 'pointer',
              }}
            >
              APPLY & RESUME DRILLS
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ActiveQuizModal;

```

## FILE: prismate-app/src/components/home/HistoryModal.tsx

```tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { ListItem } from '../../types/prismate';

export interface HistoryEntry {
  id: string;
  question: string;
  correctAnswer: string;
  userAnswer?: string;
  isCorrect: boolean;
  subject: string;
  timestamp: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
  weaklist: ListItem[];
  onResetHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  weaklist,
  onResetHistory,
}) => {
  const [filter, setFilter] = useState<'all' | 'mistakes' | 'correct'>('all');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const displayEntries = history.filter((entry) => {
    if (filter === 'mistakes') return !entry.isCorrect;
    if (filter === 'correct') return entry.isCorrect;
    return true;
  });

  const handleConfirmReset = () => {
    onResetHistory();
    setShowConfirmReset(false);
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9600,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 'min(580px, 94vw)',
            background: 'linear-gradient(135deg, rgba(24, 24, 24, 0.98), rgba(12, 12, 12, 0.95))',
            border: '1.5px solid rgba(242, 242, 242, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(242, 242, 242, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid rgba(242, 242, 242, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>📜</span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  color: '#F2F2F2',
                }}
              >
                PREVIOUS ATTEMPTS & MISTAKES LOG
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(242, 242, 242, 0.6)',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'all', label: `ALL (${history.length})` },
                { id: 'mistakes', label: `MISTAKES (${history.filter((h) => !h.isCorrect).length})` },
                { id: 'correct', label: `MASTERED (${history.filter((h) => h.isCorrect).length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  style={{
                    background: filter === tab.id ? '#F2F2F2' : 'rgba(242, 242, 242, 0.08)',
                    color: filter === tab.id ? '#000000' : '#F2F2F2',
                    border: '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List of Entries */}
            <div
              style={{
                maxHeight: '260px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                paddingRight: '4px',
              }}
            >
              {displayEntries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: 'rgba(242,242,242,0.4)', fontSize: '12px' }}>
                  No drill history recorded yet. Answer questions in the Active Quiz widget to populate logs.
                </div>
              ) : (
                displayEntries.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      padding: '12px 14px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: `1px solid ${entry.isCorrect ? 'rgba(242, 242, 242, 0.12)' : 'rgba(235, 16, 75, 0.25)'}`,
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '10px',
                          letterSpacing: '1px',
                          color: entry.isCorrect ? '#F2F2F2' : '#EB104B',
                          textTransform: 'uppercase',
                        }}
                      >
                        {entry.isCorrect ? '✓ CORRECT' : '✗ MISTAKE'} • {entry.subject}
                      </span>
                      <span style={{ fontSize: '10px', color: 'rgba(242,242,242,0.35)', fontFamily: 'monospace' }}>
                        {entry.timestamp}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: 'var(--font-content)',
                        fontSize: '12px',
                        lineHeight: 1.4,
                        color: '#F2F2F2',
                      }}
                    >
                      {entry.question}
                    </p>
                    <div style={{ fontSize: '11px', color: 'rgba(242,242,242,0.6)', fontFamily: 'var(--font-content)' }}>
                      Correct Answer: <span style={{ color: '#F2F2F2', fontWeight: 'bold' }}>{entry.correctAnswer}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* INTEGRATED RESET BOX ("box within the box to the pop up") */}
            <div
              style={{
                border: '1px dashed rgba(242, 242, 242, 0.25)',
                borderRadius: '12px',
                padding: '14px 18px',
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '12px',
                      letterSpacing: '1.5px',
                      color: '#F2F2F2',
                      display: 'block',
                    }}
                  >
                    RESET DRILL & MISTAKE RECORDS
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-content)',
                      fontSize: '11px',
                      color: 'rgba(242, 242, 242, 0.45)',
                    }}
                  >
                    Wipes all logged mistakes ({weaklist.length} issues) and history records
                  </span>
                </div>
                {!showConfirmReset ? (
                  <button
                    onClick={() => setShowConfirmReset(true)}
                    style={{
                      background: 'rgba(235, 16, 75, 0.15)',
                      border: '1px solid #EB104B',
                      color: '#EB104B',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      letterSpacing: '1px',
                    }}
                  >
                    RESET ALL
                  </button>
                ) : null}
              </div>

              {/* Confirmation box inside the box */}
              {showConfirmReset && (
                <div
                  style={{
                    background: 'rgba(235, 16, 75, 0.1)',
                    border: '1px solid rgba(235, 16, 75, 0.4)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '11px',
                      color: '#F2F2F2',
                      letterSpacing: '0.5px',
                    }}
                  >
                    ⚠️ Are you sure you want to permanently clear all mistake logs? This cannot be undone.
                  </span>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setShowConfirmReset(false)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(242, 242, 242, 0.25)',
                        color: '#F2F2F2',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleConfirmReset}
                      style={{
                        background: '#EB104B',
                        border: 'none',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      CONFIRM RESET
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default HistoryModal;

```

## FILE: prismate-app/src/components/home/StudyTubeModal.tsx

```tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface StudyTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CuratedLesson {
  id: string;
  title: string;
  subject: string;
  videoId: string;
  duration: string;
  chapter: string;
}

const CURATED_LESSONS: CuratedLesson[] = [
  {
    id: 'phy-1',
    title: 'Electrostatics Full Chapter In-Depth Revision',
    subject: 'Physics',
    videoId: 'TjE3Y0jY8V4',
    duration: '48m',
    chapter: 'Unit 1: Electrostatics',
  },
  {
    id: 'chem-1',
    title: 'Metallurgy: Mineral, Ore & Extraction Principles',
    subject: 'Chemistry',
    videoId: '4rJ7Zk_vI-M',
    duration: '42m',
    chapter: 'Unit 1: Metallurgy',
  },
  {
    id: 'math-1',
    title: 'Applications of Matrices & Determinants Matrix Inversion',
    subject: 'Mathematics',
    videoId: 'g0Qe3k1Kj50',
    duration: '55m',
    chapter: 'Unit 1: Matrices & Determinants',
  },
];

export const StudyTubeModal: React.FC<StudyTubeModalProps> = ({ isOpen, onClose }) => {
  const [selectedLesson, setSelectedLesson] = useState<CuratedLesson>(CURATED_LESSONS[0]);
  const [customInputUrl, setCustomInputUrl] = useState('');
  const [activeVideoId, setActiveVideoId] = useState<string>(CURATED_LESSONS[0].videoId);

  if (!isOpen) return null;

  const extractVideoId = (input: string): string | null => {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Direct 11-char ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    // Standard youtube.com/watch?v=...
    const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (vMatch && vMatch[1]) return vMatch[1];

    // youtu.be/...
    const beMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (beMatch && beMatch[1]) return beMatch[1];

    // youtube.com/embed/...
    const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch && embedMatch[1]) return embedMatch[1];

    return null;
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractVideoId(customInputUrl);
    if (id) {
      setActiveVideoId(id);
      setCustomInputUrl('');
    }
  };

  const handleSelectCurated = (lesson: CuratedLesson) => {
    setSelectedLesson(lesson);
    setActiveVideoId(lesson.videoId);
  };

  return (
    <AnimatePresence>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9600,
          background: 'rgba(0, 0, 0, 0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 'min(920px, 94vw)',
            maxHeight: '92vh',
            background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.98), rgba(10, 10, 10, 0.95))',
            border: '1.5px solid rgba(242, 242, 242, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(242, 242, 242, 0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(242, 242, 242, 0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>📺</span>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  color: '#F2F2F2',
                }}
              >
                STUDYTUBE • {selectedLesson.chapter.toUpperCase()}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(242, 242, 242, 0.6)',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Embedded YouTube Player (Zero distraction, zero shorts, zero related feed) */}
          <div style={{ position: 'relative', width: '100%', paddingBottom: '48%', background: '#000000' }}>
            <iframe
              title="Distraction-Free Study Stream"
              src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&fs=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>

          {/* Controls & Curated Lessons Selector */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Custom URL Input */}
            <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={customInputUrl}
                onChange={(e) => setCustomInputUrl(e.target.value)}
                placeholder="Paste any educational YouTube video link or ID (e.g. https://youtu.be/...)"
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(242, 242, 242, 0.25)',
                  borderRadius: '8px',
                  color: '#F2F2F2',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#F2F2F2',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                LOAD VIDEO
              </button>
            </form>

            {/* Curated Chapter 1 Lessons Tabs */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.5)',
                  display: 'block',
                  marginBottom: '8px',
                }}
              >
                CURATED CHAPTER 1 LECTURES (ZERO DISTRACTIONS)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {CURATED_LESSONS.map((lesson) => {
                  const isSelected = activeVideoId === lesson.videoId;
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleSelectCurated(lesson)}
                      style={{
                        padding: '12px 14px',
                        background: isSelected ? 'rgba(242, 242, 242, 0.14)' : 'rgba(0, 0, 0, 0.4)',
                        border: `1px solid ${isSelected ? '#F2F2F2' : 'rgba(242, 242, 242, 0.12)'}`,
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '10px',
                            letterSpacing: '1px',
                            color: isSelected ? '#F2F2F2' : 'rgba(242,242,242,0.6)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {lesson.subject}
                        </span>
                        <span style={{ fontSize: '10px', color: 'rgba(242,242,242,0.4)', fontFamily: 'monospace' }}>
                          ⏱ {lesson.duration}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-content)',
                          fontSize: '12px',
                          color: '#F2F2F2',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          lineHeight: 1.35,
                        }}
                      >
                        {lesson.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudyTubeModal;

```

