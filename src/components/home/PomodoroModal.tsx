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
