import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { StackClass3D, Template3D } from '../../types/stacks';

interface StackClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    subject: string;
    template: Template3D;
    accentColor: string;
    description: string;
  }) => void;
  onDelete?: (classId: string) => void;
  initialClass?: StackClass3D | null;
}

const TEMPLATES: Template3D[] = ['SPHERE', 'RING', 'HELIX', 'GRID', 'COVERFLOW', 'STACK'];
const SUBJECTS = ['Chemistry', 'Physics', 'Mathematics', 'General'];
const ACCENT_COLORS = [
  '#33F0FF',
  '#00B8FF',
  '#0055FF',
  '#00F5A0',
  '#FFB800',
  '#FF3366',
  '#FFFFFF',
];

const StackClassModalInner: React.FC<Omit<StackClassModalProps, 'isOpen'>> = ({
  onClose,
  onSave,
  onDelete,
  initialClass,
}) => {
  const [name, setName] = useState(() => initialClass?.name || '');
  const [subject, setSubject] = useState(() => initialClass?.subject || 'Chemistry');
  const [template, setTemplate] = useState<Template3D>(() => initialClass?.template || 'SPHERE');
  const [accentColor, setAccentColor] = useState(() => initialClass?.accentColor || '#33F0FF');
  const [description, setDescription] = useState(() => initialClass?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: initialClass?.id,
      name: name.trim(),
      subject,
      template,
      accentColor,
      description: description.trim(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: '#0D0D0E',
            border: '1px solid rgba(242, 242, 242, 0.22)',
            borderRadius: '16px',
            padding: '28px 32px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95)',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: 'rgba(242, 242, 242, 0.5)',
                  textTransform: 'uppercase',
                }}
              >
                SPATIAL WORKSPACE
              </span>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '18px',
                  letterSpacing: '2px',
                  color: '#FFFFFF',
                  margin: '4px 0 0',
                  textTransform: 'uppercase',
                }}
              >
                {initialClass ? 'EDIT 3D STACK' : 'CREATE NEW 3D STACK'}
              </h3>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(242, 242, 242, 0.5)',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Stack Name */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                STACK NAME *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Coordination Compounds & Isomerism"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#141416',
                  border: '1px solid rgba(242, 242, 242, 0.2)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  color: '#FFFFFF',
                  outline: 'none',
                }}
              />
            </div>

            {/* Subject Selector */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                SUBJECT DISCIPLINE
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {SUBJECTS.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubject(sub)}
                    style={{
                      background: subject === sub ? '#FFFFFF' : 'rgba(242, 242, 242, 0.06)',
                      color: subject === sub ? '#000000' : 'rgba(242, 242, 242, 0.75)',
                      border: '1px solid',
                      borderColor: subject === sub ? '#FFFFFF' : 'rgba(242, 242, 242, 0.16)',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '11px',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Structure Template */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                3D STRUCTURE TEMPLATE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => setTemplate(tpl)}
                    style={{
                      background: template === tpl ? '#FFFFFF' : 'rgba(242, 242, 242, 0.06)',
                      color: template === tpl ? '#000000' : 'rgba(242, 242, 242, 0.75)',
                      border: '1px solid',
                      borderColor: template === tpl ? '#FFFFFF' : 'rgba(242, 242, 242, 0.16)',
                      borderRadius: '6px',
                      padding: '8px 6px',
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '10px',
                      letterSpacing: '1px',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color Swatches */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                ACCENT GLOW COLOR
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAccentColor(c)}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: c,
                      border: accentColor === c ? '2.5px solid #FFFFFF' : '1px solid rgba(0,0,0,0.4)',
                      boxShadow: accentColor === c ? `0 0 10px ${c}` : 'none',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease',
                      transform: accentColor === c ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  color: 'rgba(242, 242, 242, 0.65)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                DESCRIPTION / CHAPTER FOCUS
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of concepts and problem drills covered in this 3D stack..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#141416',
                  border: '1px solid rgba(242, 242, 242, 0.2)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  color: '#FFFFFF',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              {initialClass && onDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete stack "${initialClass.name}"?`)) {
                      onDelete(initialClass.id);
                      onClose();
                    }
                  }}
                  style={{
                    background: 'rgba(255, 60, 60, 0.12)',
                    border: '1px solid rgba(255, 60, 60, 0.35)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    color: '#FF6B6B',
                    cursor: 'pointer',
                  }}
                >
                  DELETE STACK
                </button>
              ) : (
                <div />
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(242, 242, 242, 0.2)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    letterSpacing: '1px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                    fontWeight: 700,
                    color: '#000000',
                    cursor: 'pointer',
                  }}
                >
                  {initialClass ? 'SAVE CHANGES' : 'CREATE STACK'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const StackClassModal: React.FC<StackClassModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <StackClassModalInner key={props.initialClass?.id || 'new'} {...props} />;
};

export default StackClassModal;
