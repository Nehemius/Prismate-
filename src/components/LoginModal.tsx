import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Login Modal — triggered by LOG IN / SWITCH button or TAP TO BEGIN.
 * Centered modal with #000000 background, #F2F2F2 borders/text.
 * Shows 3 selectable user profiles. Clicking one expands that row
 * to reveal a password input field.
 * Password for all users: prismate1.5
 */

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (username: string) => void;
}

const USERS = ['Aqua √X', 'Pyroo', 'Tanjiro'];
const CORRECT_PASSWORD = 'prismate1.5';

export const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onLogin }) => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleUserClick = useCallback((username: string) => {
    if (expandedUser === username) {
      setExpandedUser(null);
      setPassword('');
      setError(false);
    } else {
      setExpandedUser(username);
      setPassword('');
      setError(false);
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 50);
    }
  }, [expandedUser]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (password === CORRECT_PASSWORD && expandedUser) {
        onLogin(expandedUser);
        onClose();
        setExpandedUser(null);
        setPassword('');
        setError(false);
      } else {
        setError(true);
      }
    },
    [password, expandedUser, onLogin, onClose]
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
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
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
              borderRadius: '12px',
              padding: '32px 36px',
              minWidth: '320px',
              maxWidth: '420px',
              width: '90vw',
              boxShadow: '0 24px 60px rgba(0,0,0,0.9), inset 0 1px 0 rgba(242,242,242,0.2)',
            }}
          >
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '24px',
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
                  fontSize: '13px',
                  color: 'rgba(242, 242, 242, 0.5)',
                  margin: 0,
                }}
              >
                Choose an account to continue
              </p>
            </div>

            {USERS.map((user) => {
              const isExpanded = expandedUser === user;
              return (
                <div
                  key={user}
                  style={{
                    marginBottom: '12px',
                    borderRadius: '8px',
                    border: isExpanded ? '1px solid rgba(242,242,242,0.4)' : '1px solid rgba(242,242,242,0.12)',
                    overflow: 'hidden',
                    background: isExpanded ? 'rgba(242,242,242,0.04)' : 'transparent',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  <button
                    onClick={() => handleUserClick(user)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: '#F2F2F2',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '20px',
                      padding: '14px 18px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(242,242,242,0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                  >
                    <span>{user}</span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'rgba(242,242,242,0.45)',
                        transform: isExpanded ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      ▶
                    </span>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <form onSubmit={handleSubmit} style={{ padding: '0 18px 18px' }}>
                          <label
                            style={{
                              display: 'block',
                              fontFamily: 'var(--font-content)',
                              fontSize: '12px',
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
                                padding: '10px 14px',
                                color: '#F2F2F2',
                                fontFamily: 'var(--font-content)',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                              }}
                              onFocus={(e) => {
                                if (!error) e.currentTarget.style.borderColor = 'rgba(242,242,242,0.6)';
                              }}
                              onBlur={(e) => {
                                if (!error) e.currentTarget.style.borderColor = 'rgba(242,242,242,0.25)';
                              }}
                              placeholder="prismate1.5"
                              autoComplete="off"
                            />
                          </motion.div>
                          {error && (
                            <p
                              style={{
                                fontFamily: 'var(--font-content)',
                                fontSize: '12px',
                                color: '#FF6B6B',
                                marginTop: '6px',
                                marginBottom: 0,
                              }}
                            >
                              Incorrect password. (Hint: prismate1.5)
                            </p>
                          )}
                          <button
                            type="submit"
                            style={{
                              marginTop: '12px',
                              width: '100%',
                              padding: '10px 0',
                              background: '#F2F2F2',
                              color: '#000000',
                              border: 'none',
                              borderRadius: '6px',
                              fontFamily: 'var(--font-heading)',
                              fontSize: '14px',
                              cursor: 'pointer',
                              letterSpacing: '1px',
                              transition: 'opacity 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
