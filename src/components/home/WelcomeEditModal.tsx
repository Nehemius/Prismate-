import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface WelcomeConfig {
  prefix: string;
  customMotto: string;
  showMotto: boolean;
}

interface WelcomeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WelcomeConfig;
  onUpdateConfig: (newConfig: WelcomeConfig) => void;
  currentUsername: string;
  currentAvatar: string;
  onUpdateAvatar: (newAvatar: string) => void;
}

const PREFIX_PRESETS = ['WELCOME,', 'HELLO,', 'FOCUS,', 'TARGET:', 'LEVEL UP:', 'CRUSH BOARDS:'];

export const WelcomeEditModal: React.FC<WelcomeEditModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  currentUsername,
  currentAvatar,
  onUpdateAvatar,
}) => {
  const [prefix, setPrefix] = useState(config.prefix);
  const [customMotto, setCustomMotto] = useState(config.customMotto);
  const [showMotto, setShowMotto] = useState(config.showMotto);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const rawDataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          onUpdateAvatar(canvas.toDataURL('image/jpeg', 0.88));
        } else {
          onUpdateAvatar(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      prefix: prefix.trim() || 'WELCOME,',
      customMotto: customMotto.trim(),
      showMotto,
    });
    onClose();
  };

  const isImageAvatar =
    currentAvatar &&
    (currentAvatar.startsWith('data:image') || currentAvatar.startsWith('http') || currentAvatar.startsWith('/'));

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
          background: 'rgba(0, 0, 0, 0.78)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
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
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)',
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
                CUSTOMIZE BENTO
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
                WELCOME CENTRE WIDGET
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
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Live Preview Box */}
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(22,22,22,0.95), rgba(12,12,12,0.88))',
                border: '1px solid rgba(242,242,242,0.18)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#F2F2F2',
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '20px',
                  flexShrink: 0,
                  overflow: 'hidden',
                  border: '1.5px solid rgba(242,242,242,0.3)',
                }}
              >
                {isImageAvatar ? (
                  <img src={currentAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  currentAvatar || (currentUsername ? currentUsername[0] : 'U')
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '16px',
                    letterSpacing: '1px',
                    color: '#FFFFFF',
                    display: 'block',
                    textTransform: 'uppercase',
                  }}
                >
                  {prefix} {currentUsername || 'YOU'}
                </span>
                {showMotto && customMotto && (
                  <span
                    style={{
                      fontFamily: 'var(--font-subheading)',
                      fontSize: '9.5px',
                      letterSpacing: '1px',
                      color: 'rgba(242,242,242,0.6)',
                      display: 'block',
                      marginTop: '3px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {customMotto}
                  </span>
                )}
              </div>
            </div>

            {/* Avatar Photo Upload trigger */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  color: 'rgba(242, 242, 242, 0.7)',
                }}
              >
                Student Photo / Avatar:
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'rgba(242, 242, 242, 0.1)',
                  border: '1px solid rgba(242, 242, 242, 0.25)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '10px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                }}
              >
                📷 UPLOAD PHOTO
              </button>
            </div>

            {/* Greeting Prefix */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  color: 'rgba(242, 242, 242, 0.7)',
                  marginBottom: '6px',
                }}
              >
                Greeting Title / Prefix:
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(242, 242, 242, 0.08)',
                  border: '1px solid rgba(242, 242, 242, 0.22)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                {PREFIX_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrefix(p)}
                    style={{
                      background: prefix === p ? '#FFFFFF' : 'rgba(242, 242, 242, 0.06)',
                      color: prefix === p ? '#000000' : 'rgba(242, 242, 242, 0.7)',
                      border: '1px solid rgba(242, 242, 242, 0.18)',
                      borderRadius: '4px',
                      padding: '3px 8px',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '9px',
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Subtitle / Motto */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  color: 'rgba(242, 242, 242, 0.7)',
                  marginBottom: '6px',
                }}
              >
                Sub-Banner / Exam Target Motto:
              </label>
              <input
                type="text"
                value={customMotto}
                onChange={(e) => setCustomMotto(e.target.value)}
                placeholder="e.g. TN State Board Candidate • AIR 1 Aspirant"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(242, 242, 242, 0.08)',
                  border: '1px solid rgba(242, 242, 242, 0.22)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Toggle show motto */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-content)',
                fontSize: '12px',
                color: 'rgba(242, 242, 242, 0.8)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={showMotto}
                onChange={(e) => setShowMotto(e.target.checked)}
                style={{ accentColor: '#FFFFFF', cursor: 'pointer' }}
              />
              Show Motto / Subtitle on Banner
            </label>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  cursor: 'pointer',
                }}
              >
                SAVE BANNER
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(242, 242, 242, 0.2)',
                  borderRadius: '6px',
                  padding: '10px 18px',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeEditModal;
