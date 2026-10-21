import React, { useState } from 'react';
import { motion } from 'motion/react';
import { INITIAL_PAPERS } from '../data/mockData';

interface PapersModalProps {
  type: 'pta' | 'board';
  subject: string;
  onClose: () => void;
}

export const PapersModal: React.FC<PapersModalProps> = ({ type, subject, onClose }) => {
  const [previewPdf, setPreviewPdf] = useState<{ url: string; title: string } | null>(null);

  const title = type === 'pta' ? 'PTA QUESTION PAPERS' : 'BOARD EXAM QUESTION PAPERS';
  const subKey = subject.toLowerCase() as 'chemistry' | 'physics' | 'mathematics';
  const papers = INITIAL_PAPERS.filter(
    (p) => p.subject === subKey && (type === 'pta' ? p.id.startsWith('pta') : p.id.startsWith('board'))
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        background: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 32px',
          borderBottom: '1px solid rgba(242,242,242,0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid rgba(242,242,242,0.25)',
              borderRadius: '6px',
              color: '#F2F2F2',
              fontFamily: 'var(--font-subheading)',
              fontSize: '11px',
              letterSpacing: '2px',
              padding: '6px 14px',
              cursor: 'pointer',
            }}
          >
            ← BACK
          </button>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-subheading)',
                fontSize: '11px',
                color: 'rgba(242,242,242,0.4)',
                letterSpacing: '1px',
              }}
            >
              {subject.toUpperCase()} • {papers.length} OFFICIAL PAPERS LOADED
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                letterSpacing: '3px',
                margin: '2px 0 0',
              }}
            >
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* Papers List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: '20px',
          alignContent: 'start',
        }}
      >
        {papers.map((paper) => (
          <div
            key={paper.id}
            style={{
              background: 'linear-gradient(135deg, rgba(16,16,16,0.92), rgba(28,28,28,0.76))',
              border: '1px solid rgba(242,242,242,0.14)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    color: 'rgba(242,242,242,0.4)',
                  }}
                >
                  {paper.yearOrType}
                </span>
                {paper.answerKeyUrl && (
                  <span
                    style={{
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '9px',
                      color: '#4ADE80',
                      border: '1px solid rgba(74,222,128,0.3)',
                      borderRadius: '10px',
                      padding: '2px 8px',
                      letterSpacing: '0.5px',
                    }}
                  >
                    OFFICIAL KEY
                  </span>
                )}
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '18px',
                  letterSpacing: '1.5px',
                  margin: '8px 0 16px',
                }}
              >
                {paper.title}
              </h3>
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  fontFamily: 'var(--font-content)',
                  fontSize: '13px',
                  color: 'rgba(242,242,242,0.6)',
                }}
              >
                <span>Questions: {paper.questionCount}</span>
                <span>Duration: {paper.duration}</span>
                <span>Max Marks: {paper.marks}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
              {paper.fileUrl && (
                <button
                  onClick={() => setPreviewPdf({ url: paper.fileUrl!, title: paper.title })}
                  style={{
                    flex: 1,
                    background: '#F2F2F2',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                  }}
                >
                  VIEW QUESTION PAPER PDF
                </button>
              )}

              {paper.answerKeyUrl && (
                <button
                  onClick={() =>
                    setPreviewPdf({
                      url: paper.answerKeyUrl!,
                      title: `${paper.title} — Official Answer Key`,
                    })
                  }
                  style={{
                    background: 'rgba(74, 222, 128, 0.12)',
                    color: '#4ADE80',
                    border: '1px solid rgba(74, 222, 128, 0.35)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  KEY
                </button>
              )}

              {paper.fileUrl && (
                <a
                  href={paper.fileUrl}
                  download
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    color: '#F2F2F2',
                    border: '1px solid rgba(242,242,242,0.25)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    textDecoration: 'none',
                  }}
                >
                  DOWNLOAD
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* In-App Embedded PDF Viewer Overlay */}
      {previewPdf && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5000,
            background: 'rgba(0,0,0,0.96)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(242,242,242,0.15)',
              background: '#0a0a0a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => setPreviewPdf(null)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(242,242,242,0.3)',
                  borderRadius: '6px',
                  color: '#F2F2F2',
                  padding: '6px 14px',
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                ← CLOSE PREVIEW
              </button>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '14px',
                  letterSpacing: '1px',
                  color: '#F2F2F2',
                }}
              >
                {previewPdf.title}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <a
                href={previewPdf.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'none',
                  border: '1px solid rgba(242,242,242,0.3)',
                  borderRadius: '6px',
                  color: '#F2F2F2',
                  padding: '6px 14px',
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  textDecoration: 'none',
                }}
              >
                OPEN IN NEW TAB ↗
              </a>
              <a
                href={previewPdf.url}
                download
                style={{
                  background: '#F2F2F2',
                  color: '#000000',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '11px',
                  textDecoration: 'none',
                }}
              >
                DOWNLOAD PDF
              </a>
            </div>
          </div>
          <iframe
            src={previewPdf.url}
            title={previewPdf.title}
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              border: 'none',
              background: '#1a1a1a',
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default PapersModal;

