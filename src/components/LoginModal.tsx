import React, { useState, useRef, useEffect, useCallback } from 'react';
import { animate } from 'motion';

/**
 * Login Modal — triggered by LOG IN / SWITCH button or TAP TO BEGIN.
 * Centered modal with #3A3A3A background, #F2F2F2 borders/text.
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

const LoginModal: React.FC<LoginModalProps> = ({ open, onClose, onLogin }) => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const expandRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Handle open/close with animation
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      // Reset state when opening
      setExpandedUser(null);
      setPassword('');
      setError(false);
    }
  }, [open]);

  useEffect(() => {
    if (isVisible && overlayRef.current) {
      if (open) {
        animate(overlayRef.current, { opacity: [0, 1] }, { duration: 0.3, ease: 'easeOut' });
      }
    }
  }, [isVisible, open]);

  const handleClose = useCallback(() => {
    if (overlayRef.current) {
      animate(overlayRef.current, { opacity: [1, 0] }, { duration: 0.25, ease: 'easeIn' }).then(() => {
        setIsVisible(false);
        onClose();
      });
    }
  }, [onClose]);

  // Expand user row with Motion
  const handleUserClick = useCallback((username: string) => {
    if (expandedUser === username) {
      // Collapse
      const el = expandRefs.current[username];
      if (el) {
        animate(el, { height: [el.scrollHeight + 'px', '0px'], opacity: [1, 0] }, { duration: 0.3, ease: 'easeInOut' }).then(() => {
          setExpandedUser(null);
          setPassword('');
          setError(false);
        });
      }
    } else {
      // Collapse previous if any
      if (expandedUser) {
        const prevEl = expandRefs.current[expandedUser];
        if (prevEl) {
          animate(prevEl, { height: '0px', opacity: 0 }, { duration: 0.2, ease: 'easeIn' });
        }
      }
      setExpandedUser(username);
      setPassword('');
      setError(false);
      // Expand new row after state updates
      requestAnimationFrame(() => {
        const el = expandRefs.current[username];
        if (el) {
          animate(el, { height: ['0px', el.scrollHeight + 'px'], opacity: [0, 1] }, { duration: 0.35, ease: 'easeOut' });
        }
        passwordInputRef.current?.focus();
      });
    }
  }, [expandedUser]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD && expandedUser) {
      // Success — close modal and notify parent
      if (overlayRef.current) {
        animate(overlayRef.current, { opacity: [1, 0] }, { duration: 0.3, ease: 'easeIn' }).then(() => {
          setIsVisible(false);
          onLogin(expandedUser);
        });
      }
    } else {
      setError(true);
      // Shake the input
      if (passwordInputRef.current) {
        animate(
          passwordInputRef.current,
          { x: [0, -8, 8, -4, 4, 0] },
          { duration: 0.4 }
        );
      }
    }
  }, [password, expandedUser, onLogin]);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        opacity: 0,
      }}
    >
      <div
        style={{
          background: '#000000',
          border: '1.5px solid #F2F2F2',
          borderRadius: '8px',
          padding: '32px 40px',
          minWidth: '320px',
          maxWidth: '400px',
          width: '90vw',
        }}
      >
        {USERS.map((user) => (
          <div key={user} style={{ marginBottom: '12px' }}>
            {/* User name row */}
            <button
              onClick={() => handleUserClick(user)}
              style={{
                display: 'block',
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#F2F2F2',
                fontFamily: 'var(--font-heading)',
                fontSize: '22px',
                padding: '14px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                borderBottom: expandedUser === user ? 'none' : '1px solid rgba(242,242,242,0.15)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(242,242,242,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {user}
            </button>

            {/* Expandable password section */}
            <div
              ref={(el) => { expandRefs.current[user] = el; }}
              style={{
                height: expandedUser === user ? 'auto' : '0px',
                opacity: expandedUser === user ? 1 : 0,
                overflow: 'hidden',
                background: 'rgba(242,242,242,0.03)',
                borderBottom: '1px solid rgba(242,242,242,0.15)',
              }}
            >
              <form onSubmit={handleSubmit} style={{ padding: '12px 16px 16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-content)',
                    fontSize: '13px',
                    color: 'rgba(242,242,242,0.6)',
                    marginBottom: '6px',
                  }}
                >
                  Password
                </label>
                <input
                  ref={passwordInputRef}
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(false); }}
                  style={{
                    width: '100%',
                    background: 'rgba(242,242,242,0.08)',
                    border: error ? '1.5px solid #FF6B6B' : '1.5px solid rgba(242,242,242,0.25)',
                    borderRadius: '4px',
                    padding: '10px 12px',
                    color: '#F2F2F2',
                    fontFamily: 'var(--font-content)',
                    fontSize: '15px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => { if (!error) e.currentTarget.style.borderColor = 'rgba(242,242,242,0.5)'; }}
                  onBlur={(e) => { if (!error) e.currentTarget.style.borderColor = 'rgba(242,242,242,0.25)'; }}
                  placeholder=""
                  autoComplete="off"
                />
                {error && (
                  <p style={{
                    fontFamily: 'var(--font-content)',
                    fontSize: '12px',
                    color: '#FF6B6B',
                    marginTop: '6px',
                  }}>
                    Incorrect password
                  </p>
                )}
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoginModal;
