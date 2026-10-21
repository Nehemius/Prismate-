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
      {isOpen && (
        <motion.div
          key="clock-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
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
            key="clock-modal-card"
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
      </motion.div>
    )}
  </AnimatePresence>
  );
};

export default ClockModal;
