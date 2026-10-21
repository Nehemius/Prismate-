import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useApp } from '../context/useApp';
import { INITIAL_DIAGRAMS, INITIAL_QUESTIONS } from '../data/mockData';
import GridGuides from '../components/GridGuides';
import BentoEditToolbar from '../components/BentoEditToolbar';
import HomeWidgetDock from '../components/HomeWidgetDock';
import GlowingTitle from '../components/GlowingTitle';
import AnalogClock from '../components/AnalogClock';
import ClockModal from '../components/home/ClockModal';
import type { ClockConfig, AlarmItem } from '../components/home/ClockModal';
import PomodoroModal from '../components/home/PomodoroModal';
import type { PomodoroSettings } from '../components/home/PomodoroModal';
import TasksQuotesModal from '../components/home/TasksQuotesModal';
import type { TodoItem } from '../components/home/TasksQuotesModal';
import ActiveQuizModal from '../components/home/ActiveQuizModal';
import type { ActiveQuizFilter, SubjectFilter } from '../components/home/ActiveQuizModal';
import HistoryModal from '../components/home/HistoryModal';
import type { HistoryEntry } from '../components/home/HistoryModal';
import StudyTubeModal from '../components/home/StudyTubeModal';

/**
 * HomePage / "You" — Customizable 16 x 8 Bento Canvas
 *
 * SPECIFICATION & CORRECTIONS:
 *   - Edge-to-edge 16x8 Bento layout with Drag & Swap repositioning engine.
 *   - Central title word ("WELCOME, <USER>" or "WELCOME, YOU") glows in real-time with wave particle density.
 *   - Double-click triggers dedicated interactive modals:
 *       * Cool Time / Clock: Digital vs Analog SVG, 12h/24h toggle, Cool Time countdown, Alarms.
 *       * Pomodoro: mode duration, short/long break duration, break cycle count, presets.
 *       * Quotes & Tasks: checklist task manager + quote editor / random STEM insights.
 *       * Formula: advances to next formula.
 *       * Diagram: advances to next diagram.
 *       * Active Quiz: question source list (All, Weak, Strong, Study), statistics breakdown, auto-advances on answer.
 *       * Mistakes / History: past attempts log + integrated reset box inside popup.
 *       * Studytube: distraction-free YouTube lecture stream without shorts or related video feeds.
 *       * Custom Picture: double-click triggers file picker; explicit "CHANGE IMAGE" button removed from tile face.
 */

interface WidgetLayout {
  id: string;
  gridColumn: string;
  gridRow: string;
}

const DEFAULT_HOME_LAYOUT: WidgetLayout[] = [
  { id: 'clock', gridColumn: '1 / 5', gridRow: '1 / 4' },
  { id: 'pomodoro', gridColumn: '5 / 9', gridRow: '1 / 4' },
  { id: 'todos', gridColumn: '9 / 13', gridRow: '1 / 4' },
  { id: 'pulse', gridColumn: '13 / 17', gridRow: '1 / 4' },
  { id: 'formula', gridColumn: '1 / 5', gridRow: '4 / 6' },
  { id: 'welcome', gridColumn: '5 / 11', gridRow: '4 / 6' },
  { id: 'diagram', gridColumn: '11 / 17', gridRow: '4 / 6' },
  { id: 'quiz', gridColumn: '1 / 7', gridRow: '6 / 9' },
  { id: 'history', gridColumn: '7 / 12', gridRow: '6 / 9' },
  { id: 'studytube', gridColumn: '12 / 17', gridRow: '6 / 9' },
];

const TILE_BASE: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(16,16,16,0.85), rgba(28,28,28,0.72))',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(242,242,242,0.10)',
  borderRadius: '20px',
  boxShadow: 'inset 0 1px 0 0 rgba(242,242,242,0.22)',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column' as const,
  position: 'relative' as const,
  overflow: 'hidden' as const,
  boxSizing: 'border-box' as const,
  width: '100%',
  height: '100%',
  transition: 'border-color 0.2s ease, background 0.2s ease',
};

export const HomePage: React.FC = () => {
  const {
    loggedInUser,
    userAvatar,
    editModeScreen,
    setEditModeScreen,
    weaklist,
    stronglist,
    studylist,
    addToList,
    removeFromList,
    isInList,
  } = useApp();
  const isEditMode = editModeScreen === 'home';

  // Dynamic layout state with LocalStorage persistence (§5.1)
  const [layout, setLayout] = useState<WidgetLayout[]>(() => {
    const saved = localStorage.getItem('prismate_home_widget_layout');
    return saved ? JSON.parse(saved) : DEFAULT_HOME_LAYOUT;
  });

  const draggedWidgetId = useRef<string | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // ── 1. Clock & Cool Time State ─────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const [clockConfig, setClockConfig] = useState<ClockConfig>(() => {
    const saved = localStorage.getItem('prismate_clock_config');
    return saved ? JSON.parse(saved) : { mode: 'digital', format: '24h' };
  });
  useEffect(() => {
    localStorage.setItem('prismate_clock_config', JSON.stringify(clockConfig));
  }, [clockConfig]);

  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    const saved = localStorage.getItem('prismate_alarms');
    return saved
      ? JSON.parse(saved)
      : [
          { id: 'a1', time: '06:00', label: 'Electrostatics Formulas', enabled: true },
          { id: 'a2', time: '17:30', label: 'Metallurgy Drill', enabled: true },
        ];
  });
  useEffect(() => {
    localStorage.setItem('prismate_alarms', JSON.stringify(alarms));
  }, [alarms]);

  const [coolTimeRemaining, setCoolTimeRemaining] = useState<number | null>(null);
  useEffect(() => {
    if (coolTimeRemaining === null || coolTimeRemaining <= 0) return;
    const t = setInterval(() => {
      setCoolTimeRemaining((s) => {
        if (s === null || s <= 1) return null;
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [coolTimeRemaining]);

  const [clockModalOpen, setClockModalOpen] = useState(false);

  // ── 2. Pomodoro Timer State ────────────────────────────────────────────────
  const [pomoSettings, setPomoSettings] = useState<PomodoroSettings>(() => {
    const saved = localStorage.getItem('prismate_pomodoro_settings');
    return saved
      ? JSON.parse(saved)
      : {
          focusMinutes: 25,
          shortBreakMinutes: 5,
          longBreakMinutes: 15,
          cyclesBeforeLongBreak: 4,
        };
  });
  useEffect(() => {
    localStorage.setItem('prismate_pomodoro_settings', JSON.stringify(pomoSettings));
  }, [pomoSettings]);

  const [pomoCycle, setPomoCycle] = useState(1);
  const [pomoMode, setPomoMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
  const [pomoSeconds, setPomoSeconds] = useState(pomoSettings.focusMinutes * 60);
  const [pomoRunning, setPomoRunning] = useState(false);
  const [pomoModalOpen, setPomoModalOpen] = useState(false);

  useEffect(() => {
    if (!pomoRunning) return;
    const t = setInterval(() => {
      setPomoSeconds((s) => {
        if (s > 1) return s - 1;
        // Cycle transition
        if (pomoMode === 'focus') {
          if (pomoCycle >= pomoSettings.cyclesBeforeLongBreak) {
            setPomoMode('longBreak');
            setPomoCycle(1);
            return pomoSettings.longBreakMinutes * 60;
          } else {
            setPomoMode('shortBreak');
            setPomoCycle((c) => c + 1);
            return pomoSettings.shortBreakMinutes * 60;
          }
        } else {
          setPomoMode('focus');
          return pomoSettings.focusMinutes * 60;
        }
      });
    }, 1000);
    return () => clearInterval(t);
  }, [pomoRunning, pomoMode, pomoCycle, pomoSettings]);

  // ── 3. Tasks & Quote State ────────────────────────────────────────────────
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('prismate_todos');
    return saved
      ? JSON.parse(saved)
      : [
          { id: 't1', text: 'Electrostatics Gauss Law Problems', done: true },
          { id: 't2', text: 'Metallurgy Froth Floatation Flowsheet', done: false },
          { id: 't3', text: 'Matrix Inversion Method Drill', done: false },
        ];
  });
  useEffect(() => {
    localStorage.setItem('prismate_todos', JSON.stringify(todos));
  }, [todos]);

  const [customQuote, setCustomQuote] = useState<string>(() => {
    return (
      localStorage.getItem('prismate_custom_quote') ||
      'Supercritical CO₂ acts as both gas and liquid simultaneously — currently replacing toxic organic solvents in modern green chemistry decaffeination.'
    );
  });
  useEffect(() => {
    localStorage.setItem('prismate_custom_quote', customQuote);
  }, [customQuote]);

  const [tasksQuotesModalOpen, setTasksQuotesModalOpen] = useState(false);

  // ── 4. Rotators State (Formula & Diagram) ──────────────────────────────────
  const [formulaIdx, setFormulaIdx] = useState(0);
  const [diagIdx, setDiagIdx] = useState(0);

  const formulas = [
    { name: 'Nernst Equation', eq: 'E = E° - (0.0591/n) log Q' },
    { name: 'Bragg’s Law', eq: '2d sin θ = nλ' },
    { name: 'Arrhenius Rate Law', eq: 'k = A · e^(-Ea / RT)' },
    { name: 'Bohr Radius', eq: 'r_n = 0.529 · (n² / Z) Å' },
    { name: 'Coulomb’s Law', eq: 'F = (1 / 4πε₀) · (|q₁q₂| / r²)' },
    { name: 'Electric Flux', eq: 'Φ_E = ∮ E · dA = Q_enclosed / ε₀' },
    { name: 'Matrix Inverse', eq: 'A⁻¹ = (1 / |A|) · adj(A)' },
    { name: 'Cramer’s Rule', eq: 'x = Δx / Δ,  y = Δy / Δ,  z = Δz / Δ' },
  ];

  const currentFormula = formulas[formulaIdx % formulas.length];
  const currentDiagram = INITIAL_DIAGRAMS[diagIdx % INITIAL_DIAGRAMS.length] || INITIAL_DIAGRAMS[0];

  // ── 5. Active Quiz State ──────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState<ActiveQuizFilter>('all');
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [activeQuizIdx, setActiveQuizIdx] = useState(0);
  const [activeQuizAnswered, setActiveQuizAnswered] = useState<number | null>(null);
  const [totalQuizAnswered, setTotalQuizAnswered] = useState(0);
  const [activeQuizModalOpen, setActiveQuizModalOpen] = useState(false);

  const filteredQuizQuestions = useMemo(() => {
    const list = INITIAL_QUESTIONS.filter((q) => {
      if (subjectFilter !== 'all' && q.subject !== subjectFilter) {
        return false;
      }
      if (activeFilter === 'weaklist') {
        return isInList('weaklist', q.question);
      }
      if (activeFilter === 'stronglist') {
        return isInList('stronglist', q.question);
      }
      if (activeFilter === 'studylist') {
        return isInList('studylist', q.question);
      }
      return true;
    });
    return list.length > 0 ? list : INITIAL_QUESTIONS;
  }, [activeFilter, subjectFilter, isInList]);

  const currentQuizQ = filteredQuizQuestions[activeQuizIdx % filteredQuizQuestions.length];

  // ── 6. Mistakes & History State ───────────────────────────────────────────
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem('prismate_quiz_history');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'h-1',
            question:
              'Two identical point charges of magnitude -q are fixed as shown in the figure. A third charge +q placed midway...',
            correctAnswer: 'B_1 and B_2',
            userAnswer: 'B_1 and B_2',
            isCorrect: true,
            subject: 'PHYSICS',
            timestamp: '09:15 AM',
          },
          {
            id: 'h-2',
            question: 'In the Hall-Héroult process, which flux is added to alumina?',
            correctAnswer: 'Cryolite (Na₃AlF₆)',
            userAnswer: 'Fluorspar (CaF₂)',
            isCorrect: false,
            subject: 'CHEMISTRY',
            timestamp: '09:22 AM',
          },
        ];
  });
  useEffect(() => {
    localStorage.setItem('prismate_quiz_history', JSON.stringify(historyEntries));
  }, [historyEntries]);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // ── 7. Studytube State ────────────────────────────────────────────────────
  const [studyTubeModalOpen, setStudyTubeModalOpen] = useState(false);

  // ── 8. Custom Picture State ───────────────────────────────────────────────
  const [customPictureUrl, setCustomPictureUrl] = useState<string | null>(() => {
    return localStorage.getItem('prismate_custom_picture') || null;
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCustomPictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setCustomPictureUrl(url);
        localStorage.setItem('prismate_custom_picture', url);
      };
      reader.readAsDataURL(file);
    }
  };

  const activeQuizTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (activeQuizTimeoutRef.current) clearTimeout(activeQuizTimeoutRef.current);
    };
  }, []);

  // ── Active Quiz Answer Selection Handler with Auto-Advance ────────────────
  const handleActiveQuizOption = useCallback((optIdx: number) => {
    if (activeQuizAnswered !== null || !currentQuizQ) return;
    setActiveQuizAnswered(optIdx);

    const isCorrect = optIdx === currentQuizQ.correctIndex;

    if (isCorrect) {
      addToList('stronglist', {
        subject: (currentQuizQ.subject || 'chemistry') as any,
        category: 'question',
        title: currentQuizQ.question,
        content: `Answer: ${currentQuizQ.options[currentQuizQ.correctIndex]}`,
        source: 'Home Active Quiz',
      });
    } else {
      addToList('weaklist', {
        subject: (currentQuizQ.subject || 'chemistry') as any,
        category: 'question',
        title: currentQuizQ.question,
        content: `Answer: ${currentQuizQ.options[currentQuizQ.correctIndex]}`,
        source: 'Home Active Quiz',
      });
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newHistory: HistoryEntry = {
      id: `hist-${Date.now()}-${optIdx}`,
      question: currentQuizQ.question,
      correctAnswer: currentQuizQ.options[currentQuizQ.correctIndex],
      userAnswer: currentQuizQ.options[optIdx],
      isCorrect,
      subject: (currentQuizQ.subject || 'chemistry').toUpperCase(),
      timestamp,
    };
    setHistoryEntries((prev) => [newHistory, ...prev]);
    setTotalQuizAnswered((c) => c + 1);

    // Auto-advance to the next question after 600ms
    if (activeQuizTimeoutRef.current) clearTimeout(activeQuizTimeoutRef.current);
    activeQuizTimeoutRef.current = window.setTimeout(() => {
      setActiveQuizIdx((idx) => {
        const len = filteredQuizQuestions.length;
        return len > 0 ? (idx + 1) % len : 0;
      });
      setActiveQuizAnswered(null);
      activeQuizTimeoutRef.current = null;
    }, 600);
  }, [activeQuizAnswered, currentQuizQ, addToList, filteredQuizQuestions.length]);

  // Reset History & Weaklist Handler
  const handleResetHistory = () => {
    setHistoryEntries([]);
    localStorage.removeItem('prismate_quiz_history');
    // Clear weaklist items
    weaklist.forEach((item) => {
      removeFromList('weaklist', item.id);
    });
  };

  // ── Drag & Swap handlers with full HTML5 dataTransfer & dock support (§5.1)
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isEditMode) return;
    draggedWidgetId.current = id;
    setActiveDragId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTargetId !== id) {
      setDragOverTargetId(id);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, id: string) => {
    if (dragOverTargetId === id) {
      setDragOverTargetId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverTargetId(null);
    setActiveDragId(null);
    if (!isEditMode) return;

    const rawData = e.dataTransfer.getData('text/plain') || draggedWidgetId.current;
    if (!rawData) return;

    if (rawData.startsWith('new:')) {
      const newWidgetId = rawData.replace('new:', '');
      setLayout((prev) => {
        if (prev.some((w) => w.id === newWidgetId)) return prev;
        const targetIdx = prev.findIndex((w) => w.id === targetId);
        if (targetIdx === -1) return prev;
        const targetCoord = { gridColumn: prev[targetIdx].gridColumn, gridRow: prev[targetIdx].gridRow };
        const next = prev.filter((w) => w.id !== targetId);
        next.push({ id: newWidgetId, ...targetCoord });
        localStorage.setItem('prismate_home_widget_layout', JSON.stringify(next));
        return next;
      });
      draggedWidgetId.current = null;
      return;
    }

    const sourceId = rawData;
    if (sourceId === targetId) return;

    setLayout((prev) => {
      const sourceIdx = prev.findIndex((w) => w.id === sourceId);
      const targetIdx = prev.findIndex((w) => w.id === targetId);
      if (sourceIdx === -1 || targetIdx === -1) return prev;

      const next = [...prev];
      const sourceCoord = { gridColumn: next[sourceIdx].gridColumn, gridRow: next[sourceIdx].gridRow };
      const targetCoord = { gridColumn: next[targetIdx].gridColumn, gridRow: next[targetIdx].gridRow };

      next[sourceIdx] = { ...next[sourceIdx], ...targetCoord };
      next[targetIdx] = { ...next[targetIdx], ...sourceCoord };

      localStorage.setItem('prismate_home_widget_layout', JSON.stringify(next));
      return next;
    });

    draggedWidgetId.current = null;
  };

  const resizeWidget = (id: string, colDelta: number, rowDelta: number) => {
    setLayout((prev) => {
      const next = prev.map((w) => {
        if (w.id !== id) return w;
        let [cStart, cEnd] = w.gridColumn.split('/').map((s) => parseInt(s.trim()));
        let [rStart, rEnd] = w.gridRow.split('/').map((s) => parseInt(s.trim()));
        if (isNaN(cEnd)) cEnd = cStart + 4;
        if (isNaN(rEnd)) rEnd = rStart + 3;

        let newStartCol = cStart;
        let newEndCol = cEnd + colDelta;
        let newStartRow = rStart;
        let newEndRow = rEnd + rowDelta;

        if (newEndCol > 17) {
          const overflow = newEndCol - 17;
          newEndCol = 17;
          newStartCol = Math.max(1, newStartCol - overflow);
        }
        if (newEndCol - newStartCol < 2) {
          if (colDelta < 0) newEndCol = newStartCol + 2;
        }

        if (newEndRow > 9) {
          const overflow = newEndRow - 9;
          newEndRow = 9;
          newStartRow = Math.max(1, newStartRow - overflow);
        }
        if (newEndRow - newStartRow < 1) {
          newEndRow = newStartRow + 1;
        }

        return {
          ...w,
          gridColumn: `${newStartCol} / ${newEndCol}`,
          gridRow: `${newStartRow} / ${newEndRow}`,
        };
      });
      localStorage.setItem('prismate_home_widget_layout', JSON.stringify(next));
      return next;
    });
  };

  const moveWidget = (id: string, colShift: number, rowShift: number) => {
    setLayout((prev) => {
      const next = prev.map((w) => {
        if (w.id !== id) return w;
        const [cStart, cEnd] = w.gridColumn.split('/').map((s) => parseInt(s.trim()));
        const [rStart, rEnd] = w.gridRow.split('/').map((s) => parseInt(s.trim()));
        const cSpan = (isNaN(cEnd) ? cStart + 4 : cEnd) - cStart;
        const rSpan = (isNaN(rEnd) ? rStart + 3 : rEnd) - rStart;
        const newStartCol = Math.max(1, Math.min(17 - cSpan, cStart + colShift));
        const newStartRow = Math.max(1, Math.min(9 - rSpan, rStart + rowShift));
        return {
          ...w,
          gridColumn: `${newStartCol} / ${newStartCol + cSpan}`,
          gridRow: `${newStartRow} / ${newStartRow + rSpan}`,
        };
      });
      localStorage.setItem('prismate_home_widget_layout', JSON.stringify(next));
      return next;
    });
  };

  const removeWidget = (id: string) => {
    if (id === 'welcome') return;
    setLayout((prev) => {
      const next = prev.filter((w) => w.id !== id);
      localStorage.setItem('prismate_home_widget_layout', JSON.stringify(next));
      return next;
    });
  };

  const addWidget = (id: string, colSpan = 2, rowSpan = 2) => {
    setLayout((prev) => {
      if (prev.some((w) => w.id === id)) return prev;
      let startCol = 1;
      let startRow = 1;
      let found = false;
      for (let r = 1; r <= 8 - rowSpan + 1; r++) {
        for (let c = 1; c <= 16 - colSpan + 1; c++) {
          const collides = prev.some((w) => {
            const [wCs, wCe] = w.gridColumn.split('/').map((s) => parseInt(s.trim()));
            const [wRs, wRe] = w.gridRow.split('/').map((s) => parseInt(s.trim()));
            const colOverlap = !(c + colSpan <= wCs || c >= wCe);
            const rowOverlap = !(r + rowSpan <= wRs || r >= wRe);
            return colOverlap && rowOverlap;
          });
          if (!collides) {
            startCol = c;
            startRow = r;
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (!found) {
        startCol = 1;
        startRow = 1;
      }
      const next = [
        ...prev,
        {
          id,
          gridColumn: `${startCol} / ${startCol + colSpan}`,
          gridRow: `${startRow} / ${startRow + rowSpan}`,
        },
      ];
      localStorage.setItem('prismate_home_widget_layout', JSON.stringify(next));
      return next;
    });
  };

  const handleResetLayout = () => {
    setLayout(DEFAULT_HOME_LAYOUT);
    localStorage.setItem('prismate_home_widget_layout', JSON.stringify(DEFAULT_HOME_LAYOUT));
  };

  const getWidgetPos = (id: string): React.CSSProperties => {
    const item = layout.find((w) => w.id === id);
    if (!item) return { display: 'none' };
    return {
      gridColumn: item.gridColumn,
      gridRow: item.gridRow,
    };
  };

  const tileStyle = (id: string, extra?: React.CSSProperties): React.CSSProperties => {
    const isTarget = dragOverTargetId === id;
    const isDrag = activeDragId === id;
    return {
      ...TILE_BASE,
      borderColor: isTarget
        ? '#F2F2F2'
        : isEditMode
        ? 'rgba(242,242,242,0.35)'
        : 'rgba(242,242,242,0.10)',
      background: isTarget
        ? 'linear-gradient(135deg, rgba(32,32,32,0.95), rgba(48,48,48,0.85))'
        : 'linear-gradient(135deg, rgba(16,16,16,0.85), rgba(28,28,28,0.72))',
      opacity: isDrag ? 0.4 : 1,
      cursor: isEditMode ? 'grab' : 'pointer',
      boxShadow: isTarget
        ? '0 0 20px rgba(242,242,242,0.2), inset 0 1px 0 0 rgba(242,242,242,0.4)'
        : 'inset 0 1px 0 0 rgba(242,242,242,0.22)',
      ...extra,
    };
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Edit Mode Trigger Header Button ──────────────────────────────── */}
      {!isEditMode && (
        <button
          onClick={() => setEditModeScreen('home')}
          title="Customize Bento Canvas Tiles"
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15,15,15,0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242,242,242,0.22)',
            borderRadius: '20px',
            padding: '7px 16px',
            color: 'rgba(242,242,242,0.85)',
            fontFamily: 'var(--font-heading)',
            fontSize: '11px',
            letterSpacing: '1.5px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(25,25,25,0.92)';
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.borderColor = 'rgba(242,242,242,0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(15,15,15,0.75)';
            e.currentTarget.style.color = 'rgba(242,242,242,0.85)';
            e.currentTarget.style.borderColor = 'rgba(242,242,242,0.22)';
          }}
        >
          <span>✎</span>
          <span>EDIT CANVAS</span>
        </button>
      )}

      {/* ── Edit Mode Floating Indicator Banner ──────────────────────────── */}
      {isEditMode && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(20,20,20,0.92)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(242,242,242,0.3)',
            borderRadius: '24px',
            padding: '6px 16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              letterSpacing: '1px',
              color: '#F2F2F2',
            }}
          >
            EDIT MODE: DRAG TILES OR USE CONTROLS
          </span>
          <button
            onClick={handleResetLayout}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(242,242,242,0.5)',
              fontSize: '10px',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: 'var(--font-subheading)',
            }}
          >
            RESET
          </button>
          <button
            onClick={() => setEditModeScreen(null)}
            style={{
              background: '#F2F2F2',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              padding: '4px 12px',
              fontFamily: 'var(--font-heading)',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            DONE
          </button>
        </div>
      )}

      {/* Hidden file picker for custom picture upload (§5.2) */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleCustomPictureUpload}
      />

      {/* ── Whole-Screen 16 × 8 Bento Canvas (100% width/height edge-to-edge) */}
      <div
        className="prismate-home-grid"
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          height: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(8, minmax(0, 1fr))',
          gap: '14px',
          padding: '16px',
          boxSizing: 'border-box',
        }}
      >
        {isEditMode && <GridGuides />}

        {/* 1. Cool Time / Clock Widget */}
        {layout.some((w) => w.id === 'clock') && (
          <div
            style={{ ...getWidgetPos('clock'), position: 'relative' }}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, 'clock')}
            onDragOver={(e) => handleDragOver(e, 'clock')}
            onDragLeave={(e) => handleDragLeave(e, 'clock')}
            onDrop={(e) => handleDrop(e, 'clock')}
          >
            {isEditMode && (
              <BentoEditToolbar
                id="clock"
                label="Cool Time"
                gridColumn={layout.find((w) => w.id === 'clock')?.gridColumn || '1 / 5'}
                gridRow={layout.find((w) => w.id === 'clock')?.gridRow || '1 / 4'}
                onResize={resizeWidget}
                onMove={moveWidget}
                onRemove={removeWidget}
                onDragStart={() => {
                  draggedWidgetId.current = 'clock';
                  setActiveDragId('clock');
                }}
              />
            )}
            <div
              className={`prism-bento-tile ${isEditMode ? 'is-edit-mode' : ''}`}
              onDoubleClick={() => !isEditMode && setClockModalOpen(true)}
              style={tileStyle('clock', { justifyContent: 'center', alignItems: 'center' })}
            >
              {coolTimeRemaining !== null ? (
                <div style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '10px',
                      letterSpacing: '1.5px',
                      color: '#EB104B',
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    ● COOL TIME ACTIVE
                  </span>
                  <h2
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(32px, 2.8vw, 46px)',
                      letterSpacing: '3px',
                      margin: 0,
                      lineHeight: 1,
                      color: coolTimeRemaining <= 10 ? '#EB104B' : '#F2F2F2',
                    }}
                  >
                    {Math.floor(coolTimeRemaining / 60)
                      .toString()
                      .padStart(2, '0')}
                    :{(coolTimeRemaining % 60).toString().padStart(2, '0')}
                  </h2>
                </div>
              ) : clockConfig.mode === 'analog' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <AnalogClock time={currentTime} size={110} />
                  <span
                    style={{
                      fontFamily: 'var(--font-content)',
                      fontSize: '11px',
                      color: 'rgba(242,242,242,0.4)',
                      marginTop: '6px',
                      letterSpacing: '1px',
                    }}
                  >
                    {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ) : (
                <>
                  <h2
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'clamp(28px, 2.5vw, 42px)',
                      letterSpacing: '3px',
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {currentTime.toLocaleTimeString([], {
                      hour12: clockConfig.format === '12h',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </h2>
                  <span
                    style={{
                      fontFamily: 'var(--font-content)',
                      fontSize: '12px',
                      color: 'rgba(242,242,242,0.45)',
                      marginTop: '10px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    {alarms.some((a) => a.enabled) && ' • 🔔 ALARMS SET'}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* 2. Pomodoro Timer Widget */}
        {layout.some((w) => w.id === 'pomodoro') && (
          <div
            style={{ ...getWidgetPos('pomodoro'), position: 'relative' }}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, 'pomodoro')}
            onDragOver={(e) => handleDragOver(e, 'pomodoro')}
            onDragLeave={(e) => handleDragLeave(e, 'pomodoro')}
            onDrop={(e) => handleDrop(e, 'pomodoro')}
          >
            {isEditMode && (
              <BentoEditToolbar
                id="pomodoro"
                label="Pomodoro"
                gridColumn={layout.find((w) => w.id === 'pomodoro')?.gridColumn || '5 / 9'}
                gridRow={layout.find((w) => w.id === 'pomodoro')?.gridRow || '1 / 4'}
                onResize={resizeWidget}
                onMove={moveWidget}
                onRemove={removeWidget}
                onDragStart={() => {
                  draggedWidgetId.current = 'pomodoro';
                  setActiveDragId('pomodoro');
                }}
              />
            )}
            <div
              className={`prism-bento-tile ${isEditMode ? 'is-edit-mode' : ''}`}
              onDoubleClick={() => !isEditMode && setPomoModalOpen(true)}
              style={tileStyle('pomodoro', { justifyContent: 'center', alignItems: 'center', gap: '14px' })}
            >
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: pomoMode === 'focus' ? 'rgba(242,242,242,0.5)' : '#EB104B',
                    textTransform: 'uppercase',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  {pomoMode === 'focus'
                    ? `FOCUS • CYCLE ${pomoCycle}/${pomoSettings.cyclesBeforeLongBreak}`
                    : pomoMode === 'shortBreak'
                    ? 'SHORT BREAK'
                    : 'LONG BREAK'}
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(28px, 2.4vw, 40px)',
                    letterSpacing: '3px',
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {Math.floor(pomoSeconds / 60)
                    .toString()
                    .padStart(2, '0')}
                  :{(pomoSeconds % 60).toString().padStart(2, '0')}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setPomoRunning((r) => !r)}
                  style={{
                    background: pomoRunning ? 'rgba(242,242,242,0.1)' : '#F2F2F2',
                    color: pomoRunning ? '#F2F2F2' : '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    letterSpacing: '1px',
                  }}
                >
                  {pomoRunning ? 'PAUSE' : 'START'}
                </button>
                <button
                  onClick={() => {
                    setPomoRunning(false);
                    setPomoSeconds(
                      pomoMode === 'focus'
                        ? pomoSettings.focusMinutes * 60
                        : pomoMode === 'shortBreak'
                        ? pomoSettings.shortBreakMinutes * 60
                        : pomoSettings.longBreakMinutes * 60
                    );
                  }}
                  style={{
                    background: 'transparent',
                    color: '#F2F2F2',
                    border: '1px solid rgba(242,242,242,0.2)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    letterSpacing: '1px',
                  }}
                >
                  RESET
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Daily Checklist (Todos) */}
        {layout.some((w) => w.id === 'todos') && (
          <div
            style={{ ...getWidgetPos('todos'), position: 'relative' }}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, 'todos')}
            onDragOver={(e) => handleDragOver(e, 'todos')}
            onDragLeave={(e) => handleDragLeave(e, 'todos')}
            onDrop={(e) => handleDrop(e, 'todos')}
          >
            {isEditMode && (
              <BentoEditToolbar
                id="todos"
                label="Quote & Tasks"
                gridColumn={layout.find((w) => w.id === 'todos')?.gridColumn || '9 / 13'}
                gridRow={layout.find((w) => w.id === 'todos')?.gridRow || '1 / 4'}
                onResize={resizeWidget}
                onMove={moveWidget}
                onRemove={removeWidget}
                onDragStart={() => {
                  draggedWidgetId.current = 'todos';
                  setActiveDragId('todos');
                }}
              />
            )}
            <div
              className={`prism-bento-tile ${isEditMode ? 'is-edit-mode' : ''}`}
              onDoubleClick={() => !isEditMode && setTasksQuotesModalOpen(true)}
              style={tileStyle('todos', { justifyContent: 'flex-start', overflowY: 'auto' })}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                    color: 'rgba(242,242,242,0.4)',
                  }}
                >
                  TASKS • DOUBLE CLICK TO EDIT
                </span>
                <span style={{ fontSize: '11px', color: '#F2F2F2', fontFamily: 'monospace' }}>
                  {todos.filter((t) => t.done).length}/{todos.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {todos.slice(0, 3).map((todo) => (
                  <div
                    key={todo.id}
                    onClick={() => {
                      setTodos((prev) =>
                        prev.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t))
                      );
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontFamily: 'var(--font-content)',
                      fontSize: '13px',
                      color: todo.done ? 'rgba(242,242,242,0.30)' : '#F2F2F2',
                      textDecoration: todo.done ? 'line-through' : 'none',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{ fontSize: '14px', color: todo.done ? '#F2F2F2' : 'rgba(242,242,242,0.4)' }}>
                      {todo.done ? '☑' : '☐'}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {todo.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Daily STEM Insight / Quote */}
        {layout.some((w) => w.id === 'pulse') && (
          <div
            style={{ ...getWidgetPos('pulse'), position: 'relative' }}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, 'pulse')}
            onDragOver={(e) => handleDragOver(e, 'pulse')}
            onDragLeave={(e) => handleDragLeave(e, 'pulse')}
            onDrop={(e) => handleDrop(e, 'pulse')}
          >
            {isEditMode && (
              <BentoEditToolbar
                id="pulse"
                label="STEM Pulse"
                gridColumn={layout.find((w) => w.id === 'pulse')?.gridColumn || '13 / 17'}
                gridRow={layout.find((w) => w.id === 'pulse')?.gridRow || '1 / 4'}
                onResize={resizeWidget}
                onMove={moveWidget}
                onRemove={removeWidget}
                onDragStart={() => {
                  draggedWidgetId.current = 'pulse';
                  setActiveDragId('pulse');
                }}
              />
            )}
            <div
              className={`prism-bento-tile ${isEditMode ? 'is-edit-mode' : ''}`}
              onDoubleClick={() => !isEditMode && setTasksQuotesModalOpen(true)}
              style={tileStyle('pulse', { justifyContent: 'center' })}
            >
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242,242,242,0.4)',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                STEM PULSE • DOUBLE CLICK TO EDIT
              </span>
              <p
                style={{
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  margin: 0,
                  color: 'rgba(242,242,242,0.85)',
                  fontStyle: 'italic',
                }}
              >
                "{customQuote}"
              </p>
            </div>
          </div>
        )}

        {/* 5. Formula Rotator Widget */}
        {layout.some((w) => w.id === 'formula') && (
          <div
            style={{ ...getWidgetPos('formula'), position: 'relative' }}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, 'formula')}
            onDragOver={(e) => handleDragOver(e, 'formula')}
            onDragLeave={(e) => handleDragLeave(e, 'formula')}
            onDrop={(e) => handleDrop(e, 'formula')}
          >
            {isEditMode && (
              <BentoEditToolbar
                id="formula"
                label="Formula Rotator"
                gridColumn={layout.find((w) => w.id === 'formula')?.gridColumn || '1 / 5'}
                gridRow={layout.find((w) => w.id === 'formula')?.gridRow || '4 / 6'}
                onResize={resizeWidget}
                onMove={moveWidget}
                onRemove={removeWidget}
                onDragStart={() => {
                  draggedWidgetId.current = 'formula';
                  setActiveDragId('formula');
                }}
              />
            )}
            <div
              className={`prism-bento-tile ${isEditMode ? 'is-edit-mode' : ''}`}
              onDoubleClick={() => !isEditMode && setFormulaIdx((i) => (i + 1) % formulas.length)}
              style={tileStyle('formula', {
                cursor: isEditMode ? 'grab' : 'pointer',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
              })}
            >
              <h4
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  color: 'rgba(242,242,242,0.6)',
                  margin: '0 0 6px',
                  letterSpacing: '1px',
                }}
              >
                {currentFormula.name}
              </h4>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#F2F2F2',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(242,242,242,0.1)',
                  display: 'inline-block',
                }}
              >
                {currentFormula.eq}
              </div>
              <span
                style={{
                  fontSize: '10px',
                  color: 'rgba(242,242,242,0.3)',
                  marginTop: '6px',
                  fontFamily: 'var(--font-subheading)',
                }}
              >
                Double-click for next formula
              </span>
            </div>
          </div>
        )}

        {/* 6. CENTRE WELCOME BLOCK (with Particle Glow Reactive Title) */}
        {layout.some((w) => w.id === 'welcome') && (
          <div
            style={{ ...getWidgetPos('welcome'), position: 'relative' }}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, 'welcome')}
            onDragOver={(e) => handleDragOver(e, 'welcome')}
            onDragLeave={(e) => handleDragLeave(e, 'welcome')}
            onDrop={(e) => handleDrop(e, 'welcome')}
          >
            {isEditMode && (
              <BentoEditToolbar
                id="welcome"
                label="Welcome Centre"
                gridColumn={layout.find((w) => w.id === 'welcome')?.gridColumn || '5 / 11'}
                gridRow={layout.find((w) => w.id === 'welcome')?.gridRow || '4 / 6'}
                onResize={resizeWidget}
                onMove={moveWidget}
                onRemove={undefined}
                onDragStart={() => {
                  draggedWidgetId.current = 'welcome';
                  setActiveDragId('welcome');
                }}
              />
            )}
            <div
              className={`prism-bento-tile ${isEditMode ? 'is-edit-mode' : ''}`}
              style={tileStyle('welcome', {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '24px',
                background: 'linear-gradient(135deg, rgba(22,22,22,0.95), rgba(12,12,12,0.88))',
                borderColor: 'rgba(242,242,242,0.22)',
              })}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#F2F2F2',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '22px',
                  flexShrink: 0,
                }}
              >
                {userAvatar || (loggedInUser ? loggedInUser[0] : 'U')}
              </div>
              <div>
                <GlowingTitle
                  text={loggedInUser ? `WELCOME, ${loggedInUser.toUpperCase()}` : 'WELCOME, YOU'}
                  fontSize="clamp(20px, 2vw, 30px)"
                  letterSpacing="3px"
                />
              </div>
            </div>
          </div>
        )}

        {/* 7. Diagram Rotator Widget */}
        {layout.some((w) => w.id === 'diagram') && (
          <div
            style={{ ...getWidgetPos('diagram'), position: 'relative' }}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, 'diagram')}
            onDragOver={(e) => handleDragOver(e, 'diagram')}
            onDragLeave={(e) => handleDragLeave(e, 'diagram')}
            onDrop={(e) => handleDrop(e, 'diagram')}
          >
            {isEditMode && (
              <BentoEditToolbar
                id="diagram"
                label="Diagram Rotator"
                gridColumn={layout.find((w) => w.id === 'diagram')?.gridColumn || '11 / 17'}
                gridRow={layout.find((w) => w.id === 'diagram')?.gridRow || '4 / 6'}
                onResize={resizeWidget}
                onMove={moveWidget}
                onRemove={removeWidget}
                onDragStart={() => {
                  draggedWidgetId.current = 'diagram';
                  setActiveDragId('diagram');
                }}
              />
            )}
            <div
              className={`prism-bento-tile ${isEditMode ? 'is-edit-mode' : ''}`}
              onDoubleClick={() => !isEditMode && setDiagIdx((i) => (i + 1) % INITIAL_DIAGRAMS.length)}
              style={tileStyle('diagram', {
                cursor: isEditMode ? 'grab' : 'pointer',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
              })}
            >
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '11px',
                  letterSpacing: '1px',
                  color: 'rgba(242,242,242,0.4)',
                  marginBottom: '6px',
                }}
              >
                DIAGRAM ROTATOR ({diagIdx + 1}/{INITIAL_DIAGRAMS.length})
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '14px',
                  color: '#F2F2F2',
                  letterSpacing: '1px',
                  marginBottom: '4px',
                }}
              >
                {currentDiagram.title}
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(242,242,242,0.4)', textTransform: 'uppercase' }}>
                {currentDiagram.subject} • Double-click for next diagram
              </span>
            </div>
          </div>
        )}

        {/* 8. Active Quiz Widget (Answering Auto-Advances) */}
        {layout.some((w) => w.id === 'quiz') && (
          <div
            style={{ ...getWidgetPos('quiz'), position: 'relative' }}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, 'quiz')}
            onDragOver={(e) => handleDragOver(e, 'quiz')}
            onDragLeave={(e) => handleDragLeave(e, 'quiz')}
            onDrop={(e) => handleDrop(e, 'quiz')}
          >
            {isEditMode && (
              <BentoEditToolbar
                id="quiz"
                label="Active Quiz"
                gridColumn={layout.find((w) => w.id === 'quiz')?.gridColumn || '1 / 7'}
                gridRow={layout.find((w) => w.id === 'quiz')?.gridRow || '6 / 9'}
                onResize={resizeWidget}
                onMove={moveWidget}
                onRemove={removeWidget}
                onDragStart={() => {
                  draggedWidgetId.current = 'quiz';
                  setActiveDragId('quiz');
                }}
              />
            )}
            <div
              className={`prism-bento-tile ${isEditMode ? 'is-edit-mode' : ''}`}
              onDoubleClick={() => !isEditMode && setActiveQuizModalOpen(true)}
              style={tileStyle('quiz', { justifyContent: 'center' })}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: 'rgba(242,242,242,0.45)',
                    textTransform: 'uppercase',
                  }}
                >
                  ACTIVE DRILL ({activeFilter.toUpperCase()} • {subjectFilter.toUpperCase()})
                </span>
                <span style={{ fontSize: '10px', color: 'rgba(242,242,242,0.4)', fontFamily: 'monospace' }}>
                  {activeQuizIdx + 1}/{filteredQuizQuestions.length}
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  margin: '0 0 10px',
                  lineHeight: 1.4,
                  color: '#F2F2F2',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {currentQuizQ.question}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {currentQuizQ.options.map((opt, idx) => {
                  const isChecked = activeQuizAnswered !== null;
                  const isThisCorrect = idx === currentQuizQ.correctIndex;
                  const isThisSelected = activeQuizAnswered === idx;

                  let btnBg = 'rgba(242,242,242,0.06)';
                  let btnColor = '#F2F2F2';

                  if (isChecked) {
                    if (isThisCorrect) {
                      btnBg = '#F2F2F2';
                      btnColor = '#000000';
                    } else if (isThisSelected) {
                      btnBg = '#EB104B';
                      btnColor = '#FFFFFF';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleActiveQuizOption(idx)}
                      style={{
                        background: btnBg,
                        color: btnColor,
                        border: '1px solid rgba(242,242,242,0.15)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontFamily: 'var(--font-content)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 9. Mistakes / History Widget */}
        {layout.some((w) => w.id === 'history') && (
          <div
            style={{ ...getWidgetPos('history'), position: 'relative' }}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, 'history')}
            onDragOver={(e) => handleDragOver(e, 'history')}
            onDragLeave={(e) => handleDragLeave(e, 'history')}
            onDrop={(e) => handleDrop(e, 'history')}
          >
            {isEditMode && (
              <BentoEditToolbar
                id="history"
                label="History"
                gridColumn={layout.find((w) => w.id === 'history')?.gridColumn || '7 / 12'}
                gridRow={layout.find((w) => w.id === 'history')?.gridRow || '6 / 9'}
                onResize={resizeWidget}
                onMove={moveWidget}
                onRemove={removeWidget}
                onDragStart={() => {
                  draggedWidgetId.current = 'history';
                  setActiveDragId('history');
                }}
              />
            )}
            <div
              className={`prism-bento-tile ${isEditMode ? 'is-edit-mode' : ''}`}
              onDoubleClick={() => !isEditMode && setHistoryModalOpen(true)}
              style={tileStyle('history', { justifyContent: 'flex-start', overflowY: 'auto' })}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    color: 'rgba(242,242,242,0.4)',
                  }}
                >
                  PAST MISTAKES • DOUBLE-CLICK
                </span>
                <span style={{ fontSize: '10px', color: '#EB104B', fontFamily: 'monospace' }}>
                  {weaklist.length} issues
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {historyEntries.slice(0, 2).map((h) => (
                  <div key={h.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '10px',
                          color: h.isCorrect ? '#F2F2F2' : '#EB104B',
                        }}
                      >
                        {h.isCorrect ? '✓ CORRECT' : '✗ MISTAKE'} • {h.subject}
                      </span>
                      <span style={{ fontSize: '9px', color: 'rgba(242,242,242,0.3)', fontFamily: 'monospace' }}>
                        {h.timestamp}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-content)',
                        fontSize: '11px',
                        color: 'rgba(242,242,242,0.7)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h.question}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 10. Studytube Distraction-Free Widget */}
        {layout.some((w) => w.id === 'studytube') && (
          <div
            style={{ ...getWidgetPos('studytube'), position: 'relative' }}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, 'studytube')}
            onDragOver={(e) => handleDragOver(e, 'studytube')}
            onDragLeave={(e) => handleDragLeave(e, 'studytube')}
            onDrop={(e) => handleDrop(e, 'studytube')}
          >
            {isEditMode && (
              <BentoEditToolbar
                id="studytube"
                label="Studytube"
                gridColumn={layout.find((w) => w.id === 'studytube')?.gridColumn || '12 / 17'}
                gridRow={layout.find((w) => w.id === 'studytube')?.gridRow || '6 / 9'}
                onResize={resizeWidget}
                onMove={moveWidget}
                onRemove={removeWidget}
                onDragStart={() => {
                  draggedWidgetId.current = 'studytube';
                  setActiveDragId('studytube');
                }}
              />
            )}
            <div
              className={`prism-bento-tile ${isEditMode ? 'is-edit-mode' : ''}`}
              onDoubleClick={() => !isEditMode && setStudyTubeModalOpen(true)}
              style={tileStyle('studytube', {
                justifyContent: 'center',
                alignItems: 'center',
                background: customPictureUrl
                  ? `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url(${customPictureUrl}) center/cover`
                  : 'linear-gradient(135deg, rgba(20,20,20,0.9), rgba(10,10,10,0.8))',
              })}
            >
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  letterSpacing: '2px',
                  color: '#F2F2F2',
                }}
              >
                ▶ PLAY: STUDY TUBE
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-content)',
                  fontSize: '11px',
                  color: 'rgba(242,242,242,0.45)',
                  marginTop: '4px',
                }}
              >
                Zero-distraction Class 12 lectures
              </span>
            </div>
          </div>
        )}

        {/* 11. Custom Picture Widget (No "CHANGE IMAGE" button text on tile face) */}
        {layout.some((w) => w.id === 'custom_pic') && (
          <div
            style={{ ...getWidgetPos('custom_pic'), position: 'relative' }}
            draggable={isEditMode}
            onDragStart={(e) => handleDragStart(e, 'custom_pic')}
            onDragOver={(e) => handleDragOver(e, 'custom_pic')}
            onDragLeave={(e) => handleDragLeave(e, 'custom_pic')}
            onDrop={(e) => handleDrop(e, 'custom_pic')}
          >
            {isEditMode && (
              <BentoEditToolbar
                id="custom_pic"
                label="Custom Picture"
                gridColumn={layout.find((w) => w.id === 'custom_pic')?.gridColumn || '1 / 5'}
                gridRow={layout.find((w) => w.id === 'custom_pic')?.gridRow || '1 / 4'}
                onResize={resizeWidget}
                onMove={moveWidget}
                onRemove={removeWidget}
                onDragStart={() => {
                  draggedWidgetId.current = 'custom_pic';
                  setActiveDragId('custom_pic');
                }}
              />
            )}
            <div
              className={`prism-bento-tile ${isEditMode ? 'is-edit-mode' : ''}`}
              onDoubleClick={() => !isEditMode && fileInputRef.current?.click()}
              style={tileStyle('custom_pic', { padding: 0, overflow: 'hidden' })}
            >
              {customPictureUrl ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${customPictureUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(10,10,10,0.85)',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '28px', marginBottom: '8px' }}>🖼</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '12px',
                      letterSpacing: '1px',
                      color: '#F2F2F2',
                    }}
                  >
                    CUSTOM PICTURE
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-content)',
                      fontSize: '10px',
                      color: 'rgba(242,242,242,0.4)',
                      marginTop: '4px',
                    }}
                  >
                    Double-click to choose image file
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── All Double-Click Popups & Modals ───────────────────────────────── */}
      <ClockModal
        isOpen={clockModalOpen}
        onClose={() => setClockModalOpen(false)}
        config={clockConfig}
        onUpdateConfig={setClockConfig}
        alarms={alarms}
        onUpdateAlarms={setAlarms}
        coolTimeRemaining={coolTimeRemaining}
        onStartCoolTime={(secs) => {
          setCoolTimeRemaining(secs);
          setClockModalOpen(false);
        }}
        onStopCoolTime={() => setCoolTimeRemaining(null)}
      />

      <PomodoroModal
        isOpen={pomoModalOpen}
        onClose={() => setPomoModalOpen(false)}
        settings={pomoSettings}
        onUpdateSettings={setPomoSettings}
        currentCycle={pomoCycle}
        currentMode={pomoMode}
        onResetCycle={() => {
          setPomoCycle(1);
          setPomoMode('focus');
          setPomoSeconds(pomoSettings.focusMinutes * 60);
          setPomoRunning(false);
        }}
      />

      <TasksQuotesModal
        isOpen={tasksQuotesModalOpen}
        onClose={() => setTasksQuotesModalOpen(false)}
        todos={todos}
        onUpdateTodos={setTodos}
        quote={customQuote}
        onUpdateQuote={setCustomQuote}
      />

      <ActiveQuizModal
        isOpen={activeQuizModalOpen}
        onClose={() => setActiveQuizModalOpen(false)}
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        subjectFilter={subjectFilter}
        onSelectSubjectFilter={setSubjectFilter}
        weaklist={weaklist}
        stronglist={stronglist}
        studylist={studylist}
        totalAnswered={totalQuizAnswered}
      />

      <HistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={historyEntries}
        weaklist={weaklist}
        onResetHistory={handleResetHistory}
      />

      <StudyTubeModal
        isOpen={studyTubeModalOpen}
        onClose={() => setStudyTubeModalOpen(false)}
      />

      {/* ── Bottom Starter Widgets Dock (§5.1) ───────────────────────────── */}
      {isEditMode && (
        <HomeWidgetDock
          activeWidgetIds={layout.map((w) => w.id)}
          onAddWidget={addWidget}
          onCloseEditMode={() => setEditModeScreen(null)}
          onResetLayout={handleResetLayout}
        />
      )}
    </div>
  );
};

export default HomePage;
