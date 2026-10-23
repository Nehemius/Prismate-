import React, { useState, useMemo, useRef } from 'react';
import type { ScreenType, ListType } from '../types/prismate';
import { useApp } from '../context/useApp';
import { IMMERSIVE_WALLPAPERS } from '../data/wallpapers';
import { Sparkles, Check, Lock, RefreshCw } from 'lucide-react';

/**
 * ProfilePage — Conventional Settings & Master List Manager
 *
 * SPECIFICATION & CORRECTIONS:
 *   - Student Profile details (editable username, candidate status, customizable avatar)
 *   - Secure: Account switching belongs exclusively on Login screen
 *   - Cross-device Cloud Synchronization (saves name, details, bento layout & lists to cloud)
 *   - Master List Vault (Weaklist, Stronglist, Studylist)
 */

const AVATAR_PRESETS = ['A', 'P', 'T', 'Z', 'Ω', '⚛', '⚡', '★', '◈'];

export const ProfilePage: React.FC = () => {
  const {
    loggedInUser,
    updateUsername,
    userAvatar,
    setUserAvatar,
    logout,
    homePageEnabled,
    setHomePageEnabled,
    defaultStartupScreen,
    setDefaultStartupScreen,
    weaklist,
    stronglist,
    studylist,
    removeFromList,
    syncCloudData,
    isCloudSyncing,
    lastCloudSyncTime,
    theme,
    setTheme,
    bentoGlassStyle,
    setBentoGlassStyle,
    immersiveWallpaperMode,
    setImmersiveWallpaperMode,
    immersiveCycleMinutes,
    setImmersiveCycleMinutes,
    immersiveFixedWallpaper,
    setImmersiveFixedWallpaper,
    currentWallpaperIndex,
    setCurrentWallpaperIndex,
  } = useApp();

  const [activeTab, setActiveTab] = useState<ListType>('weaklist');
  const [search, setSearch] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(loggedInUser || '');
  const [prevLoggedInUser, setPrevLoggedInUser] = useState(loggedInUser);

  // Custom photo upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          const compressed = canvas.toDataURL('image/jpeg', 0.88);
          setUserAvatar(compressed);
        } else {
          setUserAvatar(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  if (loggedInUser !== prevLoggedInUser) {
    setPrevLoggedInUser(loggedInUser);
    setUsernameInput(loggedInUser || '');
  }

  const currentList = activeTab === 'weaklist' ? weaklist : activeTab === 'stronglist' ? stronglist : studylist;

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return currentList;
    return currentList.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q)
    );
  }, [currentList, search]);

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      updateUsername(usernameInput.trim());
      setIsEditingUsername(false);
    }
  };

  const cycleAvatar = () => {
    const currentIdx = AVATAR_PRESETS.indexOf(userAvatar);
    const nextAvatar = AVATAR_PRESETS[(currentIdx + 1) % AVATAR_PRESETS.length];
    setUserAvatar(nextAvatar);
  };

  const formattedSyncTime = lastCloudSyncTime
    ? new Date(lastCloudSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Pending Sync';

  return (
    <div
      className="prismate-profile-container"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--color-bg, #000000)',
        color: 'var(--color-fg, #F2F2F2)',
        display: 'flex',
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: '24px 32px 24px 84px',
      }}
    >
      <style>{`
        @media (max-width: 900px), (max-height: 520px) {
          .prismate-profile-container {
            padding: 12px 16px 12px 64px !important;
            flex-direction: column !important;
            overflow-y: auto !important;
          }
          .prismate-profile-left-col {
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(242,242,242,0.12) !important;
            padding-right: 0 !important;
            padding-bottom: 24px !important;
            margin-bottom: 24px !important;
          }
          .prismate-profile-right-col {
            padding-left: 0 !important;
          }
        }
      `}</style>

      {/* ── Left Column: Single User Profile & Preferences ────────── */}
      <div
        className="prismate-profile-left-col"
        style={{
          width: '380px',
          borderRight: '1px solid rgba(242,242,242,0.12)',
          paddingRight: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: 'var(--font-subheading)',
              fontSize: '11px',
              color: 'rgba(242,242,242,0.4)',
              letterSpacing: '2px',
            }}
          >
            STUDENT PROFILE
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '24px',
              letterSpacing: '3px',
              margin: '4px 0 0',
            }}
          >
            SETTINGS
          </h2>
        </div>

        {/* Profile Card with Editable Avatar & Username */}
        <div
          className="prismate-user-profile-card"
          style={{
            background: 'var(--tile-bg, linear-gradient(135deg, rgba(20,20,20,0.95), rgba(10,10,10,0.85)))',
            border: '1px solid var(--tile-border, rgba(242,242,242,0.18))',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--tile-shadow, none)',
          }}
        >
          {/* Hidden File Input for Any Custom Image/Photo */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />

          {/* Editable Avatar */}
          <div
            onClick={() => fileInputRef.current?.click()}
            title="Click to upload any custom photo from your device"
            style={{
              position: 'relative',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--banner-btn-bg, #F2F2F2)',
              color: 'var(--banner-btn-fg, #000000)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s ease',
              overflow: 'hidden',
              border: '2px solid var(--tile-border, rgba(242,242,242,0.3))',
            }}
          >
            {userAvatar && (userAvatar.startsWith('data:image') || userAvatar.startsWith('http') || userAvatar.startsWith('/')) ? (
              <img
                src={userAvatar}
                alt="Profile Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              userAvatar || (loggedInUser ? loggedInUser[0] : 'U')
            )}
          </div>

          {/* Editable Username */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditingUsername ? (
              <form onSubmit={handleSaveUsername} style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  autoFocus
                  style={{
                    background: 'rgba(242,242,242,0.1)',
                    border: '1px solid rgba(242,242,242,0.3)',
                    borderRadius: '4px',
                    color: '#F2F2F2',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '14px',
                    padding: '4px 8px',
                    width: '100%',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#F2F2F2',
                    color: '#000000',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  SAVE
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '18px',
                    letterSpacing: '1px',
                    color: 'var(--color-text-primary, #F2F2F2)',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {loggedInUser}
                </span>
                <button
                  onClick={() => {
                    setUsernameInput(loggedInUser || '');
                    setIsEditingUsername(true);
                  }}
                  title="Edit username (saves to cloud)"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted, rgba(242,242,242,0.4))',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '2px',
                  }}
                >
                  ✎
                </button>
              </div>
            )}
            <span
              style={{
                fontFamily: 'var(--font-content)',
                fontSize: '12px',
                color: 'var(--color-text-muted, rgba(242,242,242,0.45))',
                display: 'block',
                marginTop: '4px',
              }}
            >
              TN State Board Candidate
            </span>

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  background: 'var(--banner-btn-bg, #F2F2F2)',
                  border: '1px solid var(--tile-border, rgba(242,242,242,0.28))',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  color: 'var(--banner-btn-fg, #000000)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '9.5px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>📷</span> UPLOAD PHOTO
              </button>
              <button
                type="button"
                onClick={cycleAvatar}
                title="Or cycle through Greek/symbol presets"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--tile-border, rgba(242,242,242,0.16))',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  color: 'var(--color-text-muted, rgba(242,242,242,0.65))',
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '9px',
                  cursor: 'pointer',
                }}
              >
                PRESET SYMBOL
              </button>
            </div>
          </div>
        </div>

        {/* ── Cross-Device Cloud Persistence Card ── */}
        <div
          style={{
            background: 'var(--tile-bg, rgba(242,242,242,0.04))',
            border: '1px solid var(--tile-border, rgba(242,242,242,0.14))',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            boxShadow: 'var(--tile-shadow, none)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-subheading)',
                  fontSize: '11px',
                  color: 'var(--color-text-muted, rgba(242,242,242,0.5))',
                  letterSpacing: '1px',
                  margin: 0,
                }}
              >
                CLOUD SYNC STATUS
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  color: 'var(--color-text-primary, #F2F2F2)',
                  margin: '2px 0 0',
                }}
              >
                {isCloudSyncing ? 'Syncing to Cloud...' : `Synced: ${formattedSyncTime}`}
              </p>
            </div>
            <span
              data-keep-color="true"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '10px',
                letterSpacing: '1px',
                color: isCloudSyncing ? '#33F0FF' : '#FFFFFF',
                background: isCloudSyncing ? 'rgba(51, 240, 255, 0.15)' : '#10B981',
                border: isCloudSyncing ? '1px solid #33F0FF' : 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontWeight: 'bold',
              }}
            >
              {isCloudSyncing ? 'SYNCING' : 'ACTIVE'}
            </span>
          </div>

          <button
            onClick={() => syncCloudData()}
            disabled={isCloudSyncing}
            style={{
              background: 'transparent',
              border: '1px solid var(--tile-border, rgba(242,242,242,0.25))',
              borderRadius: '6px',
              padding: '8px',
              color: 'var(--color-text-primary, #F2F2F2)',
              fontFamily: 'var(--font-heading)',
              fontSize: '10px',
              letterSpacing: '1.5px',
              cursor: isCloudSyncing ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isCloudSyncing ? 'CONNECTING CLOUD...' : 'SYNC ALL DATA NOW ☁'}
          </button>
        </div>

        {/* Turn Off Home Page Toggle (Teacher Mode) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            background: 'rgba(242,242,242,0.04)',
            border: '1px solid rgba(242,242,242,0.12)',
            borderRadius: '12px',
          }}
        >
          <div>
            <p style={{ fontFamily: 'var(--font-subheading)', fontSize: '12px', margin: 0 }}>
              HOME / YOU CANVAS
            </p>
            <p style={{ fontFamily: 'var(--font-content)', fontSize: '10.5px', color: 'rgba(242,242,242,0.4)', margin: '2px 0 0' }}>
              Toggle student widget canvas (Teacher Mode)
            </p>
          </div>
          <button
            onClick={() => {
              const next = !homePageEnabled;
              setHomePageEnabled(next);
              if (!next && defaultStartupScreen === 'home') {
                setDefaultStartupScreen('chemistry');
              }
            }}
            style={{
              background: homePageEnabled ? '#F2F2F2' : 'rgba(242,242,242,0.1)',
              color: homePageEnabled ? '#000000' : '#F2F2F2',
              border: 'none',
              borderRadius: '16px',
              padding: '6px 14px',
              fontFamily: 'var(--font-heading)',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            {homePageEnabled ? 'ENABLED' : 'OFF'}
          </button>
        </div>

        {/* Appearance / Theme Selector (3-way) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            background: 'rgba(242,242,242,0.04)',
            border: '1px solid rgba(242,242,242,0.12)',
            borderRadius: '12px',
          }}
        >
          <div>
            <p style={{ fontFamily: 'var(--font-subheading)', fontSize: '12px', margin: 0 }}>
              APPEARANCE / THEME
            </p>
            <p style={{ fontFamily: 'var(--font-content)', fontSize: '10.5px', color: 'var(--color-text-muted, rgba(242,242,242,0.4))', margin: '2px 0 0' }}>
              Select Dark, crisp Light, or dynamic Immersive wallpaper mode
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setTheme('dark')}
              style={{
                background: theme === 'dark' ? '#F2F2F2' : 'transparent',
                color: theme === 'dark' ? '#000000' : 'var(--color-text-muted, rgba(242,242,242,0.6))',
                border: theme === 'dark' ? 'none' : '1px solid rgba(242,242,242,0.2)',
                borderRadius: '16px',
                padding: '6px 12px',
                fontFamily: 'var(--font-heading)',
                fontSize: '10.5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              🌙 DARK
            </button>
            <button
              onClick={() => setTheme('light')}
              style={{
                background: theme === 'light' ? '#111114' : 'transparent',
                color: theme === 'light' ? '#FFFFFF' : 'var(--color-text-muted, rgba(242,242,242,0.6))',
                border: theme === 'light' ? 'none' : '1px solid rgba(242,242,242,0.2)',
                borderRadius: '16px',
                padding: '6px 12px',
                fontFamily: 'var(--font-heading)',
                fontSize: '10.5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              ☀️ LIGHT
            </button>
            <button
              onClick={() => setTheme('immersive')}
              style={{
                background: theme === 'immersive' ? '#33F0FF' : 'transparent',
                color: theme === 'immersive' ? '#000000' : 'var(--color-text-muted, rgba(242,242,242,0.6))',
                border: theme === 'immersive' ? 'none' : '1px solid rgba(51, 240, 255, 0.3)',
                borderRadius: '16px',
                padding: '6px 12px',
                fontFamily: 'var(--font-heading)',
                fontSize: '10.5px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: theme === 'immersive' ? '0 0 14px rgba(51, 240, 255, 0.4)' : 'none',
              }}
            >
              🌌 IMMERSIVE
            </button>
          </div>
        </div>

        {/* ── Immersive Mode Customization Panel ── */}
        <div
          style={{
            background: 'var(--tile-bg, rgba(242,242,242,0.04))',
            border: theme === 'immersive' ? '1.5px solid rgba(51, 240, 255, 0.35)' : '1px solid var(--tile-border, rgba(242,242,242,0.12))',
            borderRadius: '14px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: theme === 'immersive' ? '0 10px 30px rgba(0, 0, 0, 0.25), 0 0 20px rgba(51, 240, 255, 0.08)' : 'none',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles style={{ width: '16px', height: '16px', color: '#33F0FF' }} />
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', letterSpacing: '1px', margin: 0, color: 'var(--color-text-primary, #FFFFFF)' }}>
                  IMMERSIVE MODE & BENTO GLASS SETTINGS
                </h4>
                <p style={{ fontFamily: 'var(--font-content)', fontSize: '10.5px', color: 'var(--color-text-muted, rgba(242,242,242,0.5))', margin: '2px 0 0' }}>
                  Wallpapers rotated from wallfolder, auto-cycle every 5-10m or lock one forever
                </p>
              </div>
            </div>
            {theme !== 'immersive' && (
              <button
                onClick={() => setTheme('immersive')}
                style={{
                  background: 'rgba(51, 240, 255, 0.12)',
                  color: '#33F0FF',
                  border: '1px solid rgba(51, 240, 255, 0.35)',
                  borderRadius: '14px',
                  padding: '5px 10px',
                  fontSize: '9.5px',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ACTIVATE NOW
              </button>
            )}
          </div>

          {/* 1. Bento Cube Glass Style Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-subheading)', fontSize: '11px', letterSpacing: '1px', color: 'var(--color-text-secondary, rgba(242,242,242,0.75))' }}>
                BENTO CUBE GLASS STYLE
              </span>
              <span style={{ fontSize: '10px', color: '#33F0FF', fontFamily: 'var(--font-subheading)' }}>
                {bentoGlassStyle === 'frosted' ? 'MATTE REFRACTIVE BLUR' : 'HIGH-GLOSS CHROMATIC SHEEN'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setBentoGlassStyle('frosted')}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: bentoGlassStyle === 'frosted' ? '1.5px solid #33F0FF' : '1px solid rgba(255,255,255,0.14)',
                  background: bentoGlassStyle === 'frosted' ? 'rgba(51, 240, 255, 0.12)' : 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  color: bentoGlassStyle === 'frosted' ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', letterSpacing: '1px', fontWeight: 'bold' }}>
                    FROSTED GLASS
                  </span>
                  {bentoGlassStyle === 'frosted' && <Check style={{ width: '14px', height: '14px', color: '#33F0FF' }} />}
                </div>
                <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-content)', opacity: 0.75 }}>
                  Subtle matte frosted glass with smooth blur & soft shadows
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBentoGlassStyle('liquid')}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: bentoGlassStyle === 'liquid' ? '1.5px solid #33F0FF' : '1px solid rgba(255,255,255,0.14)',
                  background: bentoGlassStyle === 'liquid' ? 'rgba(51, 240, 255, 0.16)' : 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(30px)',
                  boxShadow: bentoGlassStyle === 'liquid' ? '0 0 16px rgba(51, 240, 255, 0.2)' : 'none',
                  color: bentoGlassStyle === 'liquid' ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '11px', letterSpacing: '1px', fontWeight: 'bold' }}>
                    LIQUID GLASS ✨
                  </span>
                  {bentoGlassStyle === 'liquid' && <Check style={{ width: '14px', height: '14px', color: '#33F0FF' }} />}
                </div>
                <span style={{ fontSize: '9.5px', fontFamily: 'var(--font-content)', opacity: 0.75 }}>
                  Specular chromatic rim lighting, deep refractive gloss & sheen
                </span>
              </button>
            </div>
          </div>

          {/* 2. Wallpaper Cycling Mode */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-subheading)', fontSize: '11px', letterSpacing: '1px', color: 'var(--color-text-secondary, rgba(242,242,242,0.75))' }}>
              WALLPAPER TRANSITION & CYCLE MODE
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setImmersiveWallpaperMode('auto')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: immersiveWallpaperMode === 'auto' ? '#F2F2F2' : 'transparent',
                  color: immersiveWallpaperMode === 'auto' ? '#000000' : 'var(--color-text-primary, #FFFFFF)',
                  border: immersiveWallpaperMode === 'auto' ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '10.5px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw style={{ width: '13px', height: '13px' }} />
                AUTO-CYCLE (MOTION.DEV)
              </button>

              <button
                type="button"
                onClick={() => setImmersiveWallpaperMode('fixed')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: immersiveWallpaperMode === 'fixed' ? '#33F0FF' : 'transparent',
                  color: immersiveWallpaperMode === 'fixed' ? '#000000' : 'var(--color-text-primary, #FFFFFF)',
                  border: immersiveWallpaperMode === 'fixed' ? 'none' : '1px solid rgba(255,255,255,0.2)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '10.5px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Lock style={{ width: '13px', height: '13px' }} />
                SET WALLPAPER FOREVER
              </button>
            </div>

            {/* Cycle Interval Selector (When in Auto-Cycle) */}
            {immersiveWallpaperMode === 'auto' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-content)', color: 'var(--color-text-muted, rgba(255,255,255,0.65))' }}>
                  Crossfade cycle duration:
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[5, 7, 10].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setImmersiveCycleMinutes(mins)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: immersiveCycleMinutes === mins ? '#33F0FF' : 'rgba(255,255,255,0.08)',
                        color: immersiveCycleMinutes === mins ? '#000000' : '#FFFFFF',
                        border: 'none',
                        fontSize: '9.5px',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      {mins} MINS
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Interactive Wallpaper Gallery (10 Wallpapers Rotated from wallfolder) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-subheading)', fontSize: '11px', letterSpacing: '1px', color: 'var(--color-text-secondary, rgba(242,242,242,0.75))' }}>
                WALLPAPER VAULT (10 WALLPAPERS FROM WALLFOLDER)
              </span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted, rgba(255,255,255,0.5))', fontFamily: 'var(--font-subheading)' }}>
                CLICK TO PREVIEW OR LOCK
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '10px',
                maxHeight: '260px',
                overflowY: 'auto',
                padding: '4px',
              }}
            >
              {IMMERSIVE_WALLPAPERS.map((wall, idx) => {
                const isCurrentActive =
                  immersiveWallpaperMode === 'fixed'
                    ? immersiveFixedWallpaper === wall.url
                    : currentWallpaperIndex === idx;
                const isFixed = immersiveFixedWallpaper === wall.url && immersiveWallpaperMode === 'fixed';

                return (
                  <div
                    key={wall.id}
                    onClick={() => {
                      setCurrentWallpaperIndex(idx);
                      if (immersiveWallpaperMode === 'fixed') {
                        setImmersiveFixedWallpaper(wall.url);
                      }
                    }}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: isCurrentActive ? '2px solid #33F0FF' : '1px solid rgba(255,255,255,0.15)',
                      boxShadow: isCurrentActive ? '0 0 14px rgba(51, 240, 255, 0.45)' : 'none',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      aspectRatio: '16/9',
                    }}
                  >
                    <img
                      src={wall.thumbUrl}
                      alt={wall.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: isCurrentActive
                          ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)'
                          : 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 70%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '6px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '9px',
                          fontFamily: 'var(--font-heading)',
                          fontWeight: 'bold',
                          color: '#FFFFFF',
                          lineHeight: 1.1,
                          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        }}
                      >
                        {wall.name}
                      </span>
                      <span
                        style={{
                          fontSize: '7.5px',
                          fontFamily: 'var(--font-subheading)',
                          color: isCurrentActive ? '#33F0FF' : 'rgba(255,255,255,0.7)',
                          marginTop: '2px',
                        }}
                      >
                        {isFixed ? '🔒 LOCKED' : isCurrentActive ? '▶ ACTIVE' : wall.mood}
                      </span>
                    </div>

                    {isFixed && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: '#33F0FF',
                          color: '#000000',
                          borderRadius: '50%',
                          width: '16px',
                          height: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Lock style={{ width: '9px', height: '9px' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Lock Current Wallpaper Forever Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  const currentWall = IMMERSIVE_WALLPAPERS[currentWallpaperIndex] || IMMERSIVE_WALLPAPERS[0];
                  setImmersiveFixedWallpaper(currentWall.url);
                  setImmersiveWallpaperMode('fixed');
                }}
                style={{
                  background: immersiveWallpaperMode === 'fixed' ? 'rgba(51, 240, 255, 0.16)' : 'rgba(255,255,255,0.08)',
                  color: '#33F0FF',
                  border: '1px solid rgba(51, 240, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '9.5px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Lock style={{ width: '12px', height: '12px' }} />
                {immersiveWallpaperMode === 'fixed' ? 'WALLPAPER IS CURRENTLY LOCKED FOREVER' : 'LOCK CURRENT ACTIVE WALLPAPER FOREVER'}
              </button>
            </div>
          </div>
        </div>

        {/* Default Startup Screen Selector */}
        <div>
          <label
            style={{
              fontFamily: 'var(--font-subheading)',
              fontSize: '11px',
              color: 'var(--color-text-muted, rgba(242,242,242,0.5))',
              letterSpacing: '1px',
              display: 'block',
              marginBottom: '8px',
            }}
          >
            DEFAULT STARTUP PAGE
          </label>
          <select
            value={defaultStartupScreen}
            onChange={(e) => setDefaultStartupScreen(e.target.value as ScreenType)}
            style={{
              width: '100%',
              background: 'var(--tile-bg, rgba(242,242,242,0.08))',
              border: '1px solid var(--tile-border, rgba(242,242,242,0.2))',
              borderRadius: '8px',
              padding: '10px 14px',
              color: 'var(--color-text-primary, #F2F2F2)',
              fontFamily: 'var(--font-heading)',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {homePageEnabled && <option value="home" style={{ background: 'var(--color-surface, #000)', color: 'var(--color-text-primary, #fff)' }}>HOME (YOU)</option>}
            <option value="chemistry" style={{ background: 'var(--color-surface, #000)', color: 'var(--color-text-primary, #fff)' }}>CHEMISTRY</option>
            <option value="physics" style={{ background: 'var(--color-surface, #000)', color: 'var(--color-text-primary, #fff)' }}>PHYSICS</option>
            <option value="mathematics" style={{ background: 'var(--color-surface, #000)', color: 'var(--color-text-primary, #fff)' }}>MATHEMATICS</option>
            <option value="stacks" style={{ background: 'var(--color-surface, #000)', color: 'var(--color-text-primary, #fff)' }}>3D STACKS</option>
          </select>
        </div>

        {/* Log Out */}
        <button
          onClick={logout}
          style={{
            marginTop: 'auto',
            background: 'transparent',
            border: '1px solid rgba(235,16,75,0.4)',
            color: '#EB104B',
            borderRadius: '8px',
            padding: '12px',
            fontFamily: 'var(--font-heading)',
            fontSize: '11px',
            letterSpacing: '2px',
            cursor: 'pointer',
          }}
        >
          LOG OUT TO TITLE SCREEN
        </button>
      </div>

      {/* ── Right Column: Master List Vault ──────────────────── */}
      <div
        className="prismate-profile-right-col"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingLeft: '36px',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-subheading)',
                fontSize: '11px',
                color: 'rgba(242,242,242,0.4)',
                letterSpacing: '2px',
              }}
            >
              MASTER LIST VAULT
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '24px',
                letterSpacing: '3px',
                margin: '4px 0 0',
              }}
            >
              SAVED KNOWLEDGE ITEMS
            </h2>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search saved items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'var(--tile-bg, rgba(242,242,242,0.06))',
              border: '1px solid var(--tile-border, rgba(242,242,242,0.18))',
              borderRadius: '6px',
              padding: '8px 16px',
              color: 'var(--color-text-primary, #F2F2F2)',
              fontFamily: 'var(--font-content)',
              fontSize: '13px',
              width: '240px',
              outline: 'none',
            }}
          />
        </div>

        {/* Vault Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {(['weaklist', 'stronglist', 'studylist'] as ListType[]).map((tab) => {
            const count = tab === 'weaklist' ? weaklist.length : tab === 'stronglist' ? stronglist.length : studylist.length;
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: active ? 'var(--banner-btn-bg, #F2F2F2)' : 'var(--color-accent-subtle, rgba(242,242,242,0.06))',
                  color: active ? 'var(--banner-btn-fg, #000000)' : 'var(--color-text-muted, rgba(242,242,242,0.7))',
                  border: '1px solid var(--tile-border, transparent)',
                  borderRadius: '20px',
                  padding: '8px 18px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '12px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  fontWeight: active ? 'bold' : 'normal',
                }}
              >
                <span>{tab.toUpperCase()}</span>
                <span
                  data-keep-color="true"
                  style={{
                    background: active ? 'var(--banner-btn-fg, #000000)' : 'var(--color-accent-subtle, rgba(242,242,242,0.15))',
                    color: active ? 'var(--banner-btn-bg, #F2F2F2)' : 'var(--color-text-primary, rgba(242,242,242,0.9))',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '10px',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Vault Items List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '8px' }}>
          {filteredItems.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60%',
                color: 'var(--color-text-muted, rgba(242,242,242,0.3))',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '32px', marginBottom: '8px' }}>◈</span>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', letterSpacing: '2px', margin: 0, color: 'var(--color-text-primary, #F2F2F2)' }}>
                NO ITEMS IN {activeTab.toUpperCase()}
              </p>
              <p style={{ fontFamily: 'var(--font-content)', fontSize: '12px', margin: '4px 0 0', color: 'var(--color-text-muted, rgba(242,242,242,0.7))' }}>
                Save questions, formulas, and reactions from workspaces to track them here.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--tile-bg, rgba(242,242,242,0.03))',
                  border: '1px solid var(--tile-border, rgba(242,242,242,0.1))',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  boxShadow: 'var(--tile-shadow, none)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-subheading)',
                        fontSize: '9px',
                        letterSpacing: '1px',
                        color: 'var(--color-accent, #33F0FF)',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                      }}
                    >
                      {item.subject} • {item.category}
                    </span>
                    <span style={{ color: 'var(--color-text-muted, rgba(242,242,242,0.3))', fontSize: '10px' }}>•</span>
                    <span style={{ color: 'var(--color-text-muted, rgba(242,242,242,0.4))', fontSize: '10px', fontFamily: 'var(--font-content)' }}>
                      {item.source}
                    </span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '14px', margin: '0 0 2px 0', color: 'var(--color-text-primary, #F2F2F2)' }}>
                    {item.title}
                  </h4>
                  {item.content && (
                    <p style={{ fontFamily: 'var(--font-content)', fontSize: '12px', color: 'var(--color-text-secondary, rgba(242,242,242,0.7))', margin: 0 }}>
                      {item.content}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => removeFromList(activeTab, item.id)}
                  title="Remove from vault"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(242,242,242,0.3)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '4px',
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EB104B')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(242,242,242,0.3)')}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
