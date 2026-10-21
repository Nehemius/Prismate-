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
      {isOpen && (
        <motion.div
          key="studytube-modal-backdrop"
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
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            key="studytube-modal-card"
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
      </motion.div>
    )}
  </AnimatePresence>
  );
};

export default StudyTubeModal;
