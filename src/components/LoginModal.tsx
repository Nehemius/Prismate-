import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/useApp';
import type { ProfileSummary } from '../services/cloudStore';

/**
 * Login Modal — triggered by LOG IN / SWITCH button or TAP TO BEGIN.
 * Centered modal with #000000 background, #F2F2F2 borders/text.
 * Shows all selectable user profiles (including custom cloud-synced profiles).
 * Allows adding custom student profiles right from the login popup.
 */

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
}

const AVATAR_OPTIONS = ['A', 'P', 'T', 'Z', 'Ω', '⚛', '⚡', '★', '◈'];
const DEFAULT_PASSWORD = 'prismate1.5';

export const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onLogin }) => {
  const { profiles, addProfile } = useApp();

  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // New Profile Form State
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newAvatar, setNewAvatar] = useState('Z');
  const [newPassword, setNewPassword] = useState('');
  const [createError, setCreateError] = useState('');
  const newProfileFileInputRef = useRef<HTMLInputElement>(null);

  const handleNewProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setNewAvatar(canvas.toDataURL('image/jpeg', 0.88));
        } else {
          setNewAvatar(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleUserClick = useCallback((profile: ProfileSummary) => {
    setIsCreatingProfile(false);
    if (profile.id === 'universal_guest' || !profile.password) {
      onLogin(profile.username);
      onClose();
      return;
    }
    if (expandedUser === profile.username) {
      setExpandedUser(null);
      setPassword('');
      setError(false);
    } else {
      setExpandedUser(profile.username);
      setPassword('');
      setError(false);
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 50);
    }
  }, [expandedUser, onLogin, onClose]);

  const handleSubmit = useCallback(
    (e: React.FormEvent, profile: ProfileSummary) => {
      e.preventDefault();
      const requiredPassword = profile.password || DEFAULT_PASSWORD;
      if (password === requiredPassword || password === DEFAULT_PASSWORD) {
        onLogin(profile.username);
        onClose();
        setExpandedUser(null);
        setPassword('');
        setError(false);
      } else {
        setError(true);
      }
    },
    [password, onLogin, onClose]
  );

  const handleCreateProfile = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = newUsername.trim();
      if (!trimmed) {
        setCreateError('Please enter a profile name');
        return;
      }
      if (profiles.some((p) => p.username.toLowerCase() === trimmed.toLowerCase())) {
        setCreateError('Profile name already exists');
        return;
      }

      setCreateError('');
      const pwd = newPassword.trim() || DEFAULT_PASSWORD;
      await addProfile(trimmed, newAvatar, pwd);
      onLogin(trimmed);
      onClose();
      setIsCreatingProfile(false);
      setNewUsername('');
      setNewPassword('');
    },
    [newUsername, newAvatar, newPassword, profiles, addProfile, onLogin, onClose]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
              setExpandedUser(null);
              setPassword('');
              setError(false);
              setIsCreatingProfile(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: '#000000',
              border: '1.5px solid #F2F2F2',
              borderRadius: '16px',
              padding: '28px 32px',
              minWidth: '320px',
              maxWidth: '440px',
              width: '92vw',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0,0,0,0.9), inset 0 1px 0 rgba(242,242,242,0.2)',
              boxSizing: 'border-box',
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '22px',
                  color: '#F2F2F2',
                  margin: '0 0 4px 0',
                  letterSpacing: '2px',
                }}
              >
                SELECT PROFILE
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  color: 'rgba(242, 242, 242, 0.5)',
                  margin: 0,
                }}
              >
                Choose an account or create a custom profile
              </p>
            </div>

            {/* Existing Profiles List */}
            {profiles.map((profile) => {
              const isExpanded = expandedUser === profile.username;
              return (
                <div
                  key={profile.id}
                  style={{
                    marginBottom: '10px',
                    borderRadius: '10px',
                    border: isExpanded ? '1px solid rgba(242,242,242,0.45)' : '1px solid rgba(242,242,242,0.14)',
                    overflow: 'hidden',
                    background: isExpanded ? 'rgba(242,242,242,0.05)' : 'transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <button
                    onClick={() => handleUserClick(profile)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: '#F2F2F2',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(242,242,242,0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: profile.id === 'universal_guest' ? '#33F0FF' : '#F2F2F2',
                          color: '#000000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          overflow: 'hidden',
                        }}
                      >
                        {profile.avatar && (profile.avatar.startsWith('data:image') || profile.avatar.startsWith('http') || profile.avatar.startsWith('/')) ? (
                          <img src={profile.avatar} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          profile.avatar
                        )}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '17px' }}>
                          {profile.username}
                        </span>
                        {profile.id === 'universal_guest' && (
                          <span style={{ fontFamily: 'var(--font-subheading)', fontSize: '9px', color: '#33F0FF', letterSpacing: '1px' }}>
                            ⚡ 1-TAP INSTANT LOGIN (NO PASSWORD)
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        color: profile.id === 'universal_guest' ? '#33F0FF' : 'rgba(242,242,242,0.45)',
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      {profile.id === 'universal_guest' ? 'ENTER ➔' : '▶'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <form onSubmit={(e) => handleSubmit(e, profile)} style={{ padding: '0 16px 16px' }}>
                          <label
                            style={{
                              display: 'block',
                              fontFamily: 'var(--font-content)',
                              fontSize: '11px',
                              color: 'rgba(242,242,242,0.6)',
                              marginBottom: '6px',
                            }}
                          >
                            Enter Password:
                          </label>
                          <motion.div
                            animate={error ? { x: [0, -8, 8, -4, 4, 0] } : {}}
                            transition={{ duration: 0.35 }}
                          >
                            <input
                              ref={passwordInputRef}
                              type="password"
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                setError(false);
                              }}
                              style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                background: 'rgba(242,242,242,0.08)',
                                border: error
                                  ? '1.5px solid #FF6B6B'
                                  : '1.5px solid rgba(242,242,242,0.25)',
                                borderRadius: '6px',
                                padding: '9px 12px',
                                color: '#F2F2F2',
                                fontFamily: 'var(--font-content)',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                              }}
                              placeholder="prismate1.5"
                              autoComplete="off"
                            />
                          </motion.div>
                          {error && (
                            <p
                              style={{
                                fontFamily: 'var(--font-content)',
                                fontSize: '11px',
                                color: '#FF6B6B',
                                marginTop: '5px',
                                marginBottom: 0,
                              }}
                            >
                              Incorrect password. (Default: prismate1.5)
                            </p>
                          )}
                          <button
                            type="submit"
                            style={{
                              marginTop: '10px',
                              width: '100%',
                              padding: '9px 0',
                              background: '#F2F2F2',
                              color: '#000000',
                              border: 'none',
                              borderRadius: '6px',
                              fontFamily: 'var(--font-heading)',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              letterSpacing: '1px',
                            }}
                          >
                            LOG IN
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* ── Add Custom Profile Section ── */}
            <div style={{ marginTop: '14px', borderTop: '1px solid rgba(242,242,242,0.12)', paddingTop: '14px' }}>
              {!isCreatingProfile ? (
                <button
                  onClick={() => {
                    setIsCreatingProfile(true);
                    setExpandedUser(null);
                    setCreateError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'transparent',
                    border: '1.5px dashed rgba(242,242,242,0.3)',
                    borderRadius: '8px',
                    color: 'rgba(242,242,242,0.8)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FFFFFF';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(242,242,242,0.3)';
                    e.currentTarget.style.color = 'rgba(242,242,242,0.8)';
                  }}
                >
                  <span>+</span>
                  <span>CREATE NEW PROFILE</span>
                </button>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleCreateProfile}
                  style={{
                    background: 'rgba(242,242,242,0.04)',
                    border: '1px solid rgba(242,242,242,0.22)',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '11px',
                        letterSpacing: '1px',
                        color: '#FFFFFF',
                      }}
                    >
                      NEW STUDENT PROFILE
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingProfile(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(242,242,242,0.4)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '0 4px',
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-content)',
                        fontSize: '11px',
                        color: 'rgba(242,242,242,0.6)',
                        marginBottom: '4px',
                      }}
                    >
                      Profile Name:
                    </label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. Zenith, Gojo, Levi"
                      autoFocus
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(242,242,242,0.08)',
                        border: '1px solid rgba(242,242,242,0.25)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: '#F2F2F2',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Avatar Picker */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-content)',
                        fontSize: '11px',
                        color: 'rgba(242,242,242,0.6)',
                        marginBottom: '4px',
                      }}
                    >
                      Avatar (Choose Symbol or Upload Any Photo):
                    </label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        ref={newProfileFileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleNewProfileImageUpload}
                      />
                      <button
                        type="button"
                        onClick={() => newProfileFileInputRef.current?.click()}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: newAvatar.startsWith('data:image') ? '1.5px solid #33F0FF' : '1px solid rgba(242,242,242,0.3)',
                          background: newAvatar.startsWith('data:image') ? 'rgba(51, 240, 255, 0.15)' : 'rgba(242,242,242,0.08)',
                          color: '#FFFFFF',
                          fontFamily: 'var(--font-heading)',
                          fontSize: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        {newAvatar.startsWith('data:image') ? (
                          <>
                            <img src={newAvatar} alt="Photo" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                            <span>PHOTO READY ✓</span>
                          </>
                        ) : (
                          <>
                            <span>📷</span>
                            <span>UPLOAD PHOTO</span>
                          </>
                        )}
                      </button>
                      {AVATAR_OPTIONS.map((av) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setNewAvatar(av)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: newAvatar === av ? '1.5px solid #FFFFFF' : '1px solid rgba(242,242,242,0.2)',
                            background: newAvatar === av ? '#FFFFFF' : 'transparent',
                            color: newAvatar === av ? '#000000' : '#FFFFFF',
                            fontFamily: 'var(--font-heading)',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-content)',
                        fontSize: '11px',
                        color: 'rgba(242,242,242,0.6)',
                        marginBottom: '4px',
                      }}
                    >
                      Password (Optional):
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Defaults to prismate1.5"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(242,242,242,0.08)',
                        border: '1px solid rgba(242,242,242,0.25)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: '#F2F2F2',
                        fontFamily: 'var(--font-content)',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {createError && (
                    <p style={{ fontFamily: 'var(--font-content)', fontSize: '11px', color: '#FF6B6B', margin: 0 }}>
                      {createError}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="submit"
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        background: '#F2F2F2',
                        color: '#000000',
                        border: 'none',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        letterSpacing: '1px',
                      }}
                    >
                      SAVE & LOG IN
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingProfile(false)}
                      style={{
                        padding: '8px 12px',
                        background: 'transparent',
                        color: 'rgba(242,242,242,0.7)',
                        border: '1px solid rgba(242,242,242,0.2)',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-subheading)',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      CANCEL
                    </button>
                  </div>
                </motion.form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
