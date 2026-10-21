import React, { useState } from 'react';
import type { ScreenType, ListType } from '../types/prismate';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * ProfilePage — Conventional Settings & Master List Manager
 *
 * SPECIFICATION & CORRECTIONS (PRISMATE_FIXES.md §1.3):
 *   - Belongs strictly to the currently logged-in user.
 *   - All other user profiles, switch-user lists, and multi-user clutter REMOVED.
 *   - Only contains:
 *       1. Editable username
 *       2. Editable profile picture (avatar)
 *       3. "Turn Off Home Page" toggle (Teacher Mode)
 *       4. Default startup page selector
 *       5. Global list manager (Stronglist, Studylist, Weaklist)
 *   - No artificial left-padding (Bento/canvas spans full viewport).
 */

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
  } = useApp();

  const [activeTab, setActiveTab] = useState<ListType>('weaklist');
  const [search, setSearch] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(loggedInUser || '');

  const currentList = activeTab === 'weaklist' ? weaklist : activeTab === 'stronglist' ? stronglist : studylist;

  const filteredItems = currentList.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase()) ||
      item.source.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      updateUsername(usernameInput.trim());
      setIsEditingUsername(false);
    }
  };

  const cycleAvatar = () => {
    const avatars = ['A', 'P', 'T', 'Ω', '⚛', '⚡'];
    const currentIdx = avatars.indexOf(userAvatar);
    const nextAvatar = avatars[(currentIdx + 1) % avatars.length];
    setUserAvatar(nextAvatar);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000000',
        color: '#F2F2F2',
        display: 'flex',
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: '24px 32px 24px 84px', // 84px on left so content is not occluded by floating dock
      }}
    >
      {/* ── Left Column: Single User Profile & Preferences (§1.3) ────────── */}
      <div
        style={{
          width: '380px',
          borderRight: '1px solid rgba(242,242,242,0.12)',
          paddingRight: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
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

        {/* Profile Card with Editable Avatar & Username (§1.3) */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(10,10,10,0.85))',
            border: '1px solid rgba(242,242,242,0.18)',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          {/* Editable Avatar */}
          <div
            onClick={cycleAvatar}
            title="Click to change avatar icon"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#F2F2F2',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              cursor: 'pointer',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(242,242,242,0.2)',
              transition: 'transform 0.2s ease',
            }}
          >
            {userAvatar || (loggedInUser ? loggedInUser[0] : 'U')}
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
                    color: '#F2F2F2',
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
                  title="Edit username"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(242,242,242,0.4)',
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
                color: 'rgba(242,242,242,0.45)',
                display: 'block',
                marginTop: '4px',
              }}
            >
              TN State Board Candidate
            </span>
          </div>
        </div>

        {/* Turn Off Home Page Toggle (Teacher Mode §1.3) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'rgba(242,242,242,0.04)',
            border: '1px solid rgba(242,242,242,0.12)',
            borderRadius: '12px',
          }}
        >
          <div>
            <p style={{ fontFamily: 'var(--font-subheading)', fontSize: '13px', margin: 0 }}>
              HOME / YOU CANVAS
            </p>
            <p style={{ fontFamily: 'var(--font-content)', fontSize: '11px', color: 'rgba(242,242,242,0.4)', margin: '2px 0 0' }}>
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

        {/* Default Startup Screen Selector (§1.3) */}
        <div>
          <label
            style={{
              fontFamily: 'var(--font-subheading)',
              fontSize: '11px',
              color: 'rgba(242,242,242,0.5)',
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
              background: 'rgba(242,242,242,0.08)',
              border: '1px solid rgba(242,242,242,0.2)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#F2F2F2',
              fontFamily: 'var(--font-heading)',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {homePageEnabled && <option value="home" style={{ background: '#000' }}>HOME (YOU)</option>}
            <option value="chemistry" style={{ background: '#000' }}>CHEMISTRY</option>
            <option value="physics" style={{ background: '#000' }}>PHYSICS</option>
            <option value="mathematics" style={{ background: '#000' }}>MATHEMATICS</option>
          </select>
        </div>

        {/* Supabase Connection Status */}
        <div
          style={{
            background: 'rgba(242,242,242,0.04)',
            border: '1px solid rgba(242,242,242,0.14)',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-subheading)',
                fontSize: '11px',
                color: 'rgba(242,242,242,0.5)',
                letterSpacing: '1px',
                margin: 0,
              }}
            >
              DATABASE ENGINE
            </p>
            <p
              style={{
                fontFamily: 'var(--font-content)',
                fontSize: '12px',
                color: isSupabaseConfigured ? '#F2F2F2' : 'rgba(242,242,242,0.7)',
                margin: '2px 0 0',
              }}
            >
              {isSupabaseConfigured ? 'Supabase PostgreSQL' : 'Local Storage (Offline)'}
            </p>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '10px',
              letterSpacing: '1px',
              color: isSupabaseConfigured ? '#000000' : '#F2F2F2',
              background: isSupabaseConfigured ? '#F2F2F2' : 'rgba(242,242,242,0.12)',
              border: '1px solid rgba(242,242,242,0.25)',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            {isSupabaseConfigured ? 'CONNECTED' : 'LOCAL CACHE'}
          </span>
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

      {/* ── Right Column: Master List Manager (§1.3, §8) ──────────────────── */}
      <div
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
              background: 'rgba(242,242,242,0.06)',
              border: '1px solid rgba(242,242,242,0.18)',
              borderRadius: '6px',
              padding: '8px 16px',
              color: '#F2F2F2',
              fontFamily: 'var(--font-content)',
              fontSize: '13px',
              width: '240px',
              outline: 'none',
            }}
          />
        </div>

        {/* List Tabs (Stronglist, Studylist, Weaklist §1.3) */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(242,242,242,0.1)', paddingBottom: '12px' }}>
          {(
            [
              { id: 'weaklist', label: `WEAKLIST (${weaklist.length})` },
              { id: 'stronglist', label: `STRONGLIST (${stronglist.length})` },
              { id: 'studylist', label: `STUDYLIST (${studylist.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? '#F2F2F2' : 'transparent',
                color: activeTab === tab.id ? '#000000' : '#F2F2F2',
                border: '1px solid rgba(242,242,242,0.2)',
                borderRadius: '20px',
                padding: '8px 18px',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'rgba(242,242,242,0.4)', fontFamily: 'var(--font-content)' }}>
              <p style={{ fontSize: '18px', marginBottom: '4px' }}>No items in this list yet.</p>
              <p style={{ fontSize: '12px' }}>Tag reactions, diagrams, or quiz questions to review them here.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'linear-gradient(135deg, rgba(16,16,16,0.92), rgba(28,28,28,0.76))',
                  border: '1px solid rgba(242,242,242,0.12)',
                  borderRadius: '12px',
                  padding: '18px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-subheading)',
                        fontSize: '10px',
                        letterSpacing: '1px',
                        color: 'rgba(242,242,242,0.4)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.subject} • {item.category}
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgba(242,242,242,0.3)' }}>| {item.source}</span>
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '15px', margin: '0 0 4px' }}>
                    {item.title}
                  </h4>
                  <p style={{ fontFamily: 'var(--font-content)', fontSize: '13px', color: 'rgba(242,242,242,0.7)', margin: 0 }}>
                    {item.content}
                  </p>
                </div>

                <button
                  onClick={() => removeFromList(activeTab, item.id)}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(242,242,242,0.2)',
                    color: 'rgba(242,242,242,0.6)',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontFamily: 'var(--font-subheading)',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EB104B')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(242,242,242,0.6)')}
                >
                  REMOVE
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
