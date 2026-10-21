import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { ScreenType, ListType, ListItem } from '../types/prismate';
import { INITIAL_LIST_ITEMS } from '../data/mockData';
import { AppContext } from './appContextDefinition';
import type { UniversalLoaderMetadata } from '../components/UniversalLoader';
import {
  type ProfileSummary,
  type UserFullData,
  getLocalProfiles,
  saveLocalProfiles,
  syncProfilesFromCloud,
  pushProfilesToCloud,
  loadUserDataFromCloud,
  saveUserDataToCloud,
  DEFAULT_PROFILES,
} from '../services/cloudStore';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inApp, setInAppState] = useState<boolean>(() => {
    return localStorage.getItem('prismate_in_app') === 'true';
  });

  const setInApp = useCallback((val: boolean) => {
    setInAppState(val);
    if (val) {
      localStorage.setItem('prismate_in_app', 'true');
    } else {
      localStorage.removeItem('prismate_in_app');
    }
  }, []);

  const [currentScreen, setCurrentScreenState] = useState<ScreenType>(() => {
    const hash = window.location.hash.replace('#', '') as ScreenType;
    if (['home', 'chemistry', 'physics', 'mathematics', 'stacks', 'profile'].includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem('prismate_current_screen') as ScreenType | null;
    return saved || 'chemistry';
  });

  const [loggedInUser, setLoggedInUser] = useState<string | null>(() => {
    return localStorage.getItem('prismate_active_user') || null;
  });

  const [userAvatar, setUserAvatarState] = useState<string>(() => {
    return localStorage.getItem('prismate_user_avatar') || 'A';
  });

  const [homePageEnabled, setHomePageEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('prismate_home_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [defaultStartupScreen, setDefaultStartupScreenState] = useState<ScreenType>(() => {
    return (localStorage.getItem('prismate_startup_screen') as ScreenType) || 'chemistry';
  });

  const [editModeScreen, setEditModeScreen] = useState<ScreenType | null>(null);
  const isEditMode = editModeScreen === 'home';
  const setIsEditMode = useCallback((val: boolean) => {
    setEditModeScreen(val ? 'home' : null);
  }, []);

  const [weaklist, setWeaklist] = useState<ListItem[]>(() => {
    const saved = localStorage.getItem('prismate_weaklist');
    return saved ? JSON.parse(saved) : INITIAL_LIST_ITEMS;
  });

  const [stronglist, setStronglist] = useState<ListItem[]>(() => {
    const saved = localStorage.getItem('prismate_stronglist');
    return saved ? JSON.parse(saved) : [];
  });

  const [studylist, setStudylist] = useState<ListItem[]>(() => {
    const saved = localStorage.getItem('prismate_studylist');
    return saved ? JSON.parse(saved) : [];
  });

  const [globalLoader, setGlobalLoader] = useState(false);
  const [globalLoaderMetadata, setGlobalLoaderMetadata] = useState<UniversalLoaderMetadata | null>(null);

  // Cloud & Profiles State
  const [profiles, setProfiles] = useState<ProfileSummary[]>(() => getLocalProfiles());
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('prismate_last_cloud_sync');
    return saved ? parseInt(saved, 10) : null;
  });

  // Sync profiles directory from cloud on mount
  useEffect(() => {
    syncProfilesFromCloud().then((cloudList) => {
      if (cloudList && cloudList.length > 0) {
        setProfiles(cloudList);
      }
    });
  }, []);

  // Sync active user to LocalStorage
  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem('prismate_active_user', loggedInUser);
    } else {
      localStorage.removeItem('prismate_active_user');
    }
  }, [loggedInUser]);

  useEffect(() => {
    localStorage.setItem('prismate_current_screen', currentScreen);
  }, [currentScreen]);

  const currentScreenRef = useRef<ScreenType>(currentScreen);
  useEffect(() => {
    currentScreenRef.current = currentScreen;
  }, [currentScreen]);

  // Handle browser back/forward without kicking out of session
  useEffect(() => {
    if (inApp) {
      const hash = window.location.hash.replace('#', '') || currentScreenRef.current;
      window.history.replaceState({ screen: hash, inApp: true }, '', '#' + hash);
    }

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.screen) {
        setCurrentScreenState(e.state.screen);
        localStorage.setItem('prismate_current_screen', e.state.screen);
      } else {
        const hash = window.location.hash.replace('#', '') as ScreenType;
        if (['home', 'chemistry', 'physics', 'mathematics', 'stacks', 'profile'].includes(hash)) {
          setCurrentScreenState(hash);
          localStorage.setItem('prismate_current_screen', hash);
        } else if (inApp) {
          window.history.pushState({ screen: currentScreenRef.current, inApp: true }, '', '#' + currentScreenRef.current);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [inApp]);

  useEffect(() => {
    localStorage.setItem('prismate_user_avatar', userAvatar);
  }, [userAvatar]);

  useEffect(() => {
    localStorage.setItem('prismate_home_enabled', String(homePageEnabled));
  }, [homePageEnabled]);

  useEffect(() => {
    localStorage.setItem('prismate_startup_screen', defaultStartupScreen);
  }, [defaultStartupScreen]);

  useEffect(() => {
    localStorage.setItem('prismate_weaklist', JSON.stringify(weaklist));
  }, [weaklist]);

  useEffect(() => {
    localStorage.setItem('prismate_stronglist', JSON.stringify(stronglist));
  }, [stronglist]);

  useEffect(() => {
    localStorage.setItem('prismate_studylist', JSON.stringify(studylist));
  }, [studylist]);

  // Global Loader trigger using Universal Loader's unique peak morphing animation
  const loaderTimeoutRef = useRef<number | null>(null);
  const triggerLoader = useCallback(
    (durationMs = 900, onComplete?: () => void, metadata?: UniversalLoaderMetadata) => {
      if (loaderTimeoutRef.current) {
        clearTimeout(loaderTimeoutRef.current);
      }
      setGlobalLoaderMetadata(metadata || null);
      setGlobalLoader(true);
      loaderTimeoutRef.current = window.setTimeout(() => {
        setGlobalLoader(false);
        setGlobalLoaderMetadata(null);
        loaderTimeoutRef.current = null;
        if (onComplete) onComplete();
      }, durationMs);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (loaderTimeoutRef.current) clearTimeout(loaderTimeoutRef.current);
    };
  }, []);

  // Page Switch with Universal Loader's Unique Morphing Animation
  const setCurrentScreen = useCallback(
    (screen: ScreenType) => {
      if (screen === currentScreenRef.current) return;
      const screenNames: Record<ScreenType, string> = {
        home: 'YOU / HOME',
        chemistry: 'CHEMISTRY',
        physics: 'PHYSICS',
        mathematics: 'MATHEMATICS',
        stacks: '3D STACKS',
        profile: 'SETTINGS',
      };
      triggerLoader(
        700,
        () => {
          setCurrentScreenState(screen);
          localStorage.setItem('prismate_current_screen', screen);
          window.history.pushState({ screen, inApp: true }, '', '#' + screen);
          setIsEditMode(false);
        },
        { subject: screenNames[screen] || screen.toUpperCase(), subtitle: 'WORKSPACE' }
      );
    },
    [triggerLoader, setIsEditMode]
  );

  // Sync current user's full data record to the cloud
  const syncCloudData = useCallback(async () => {
    if (!loggedInUser) return;
    setIsCloudSyncing(true);

    const fullData: UserFullData = {
      id: loggedInUser.toLowerCase().replace(/\s+/g, '_'),
      username: loggedInUser,
      avatar: userAvatar,
      homePageEnabled,
      defaultStartupScreen,
      weaklist,
      stronglist,
      studylist,
      clockConfig: JSON.parse(localStorage.getItem('prismate_clock_config') || '{}'),
      alarms: JSON.parse(localStorage.getItem('prismate_alarms') || '[]'),
      pomoSettings: JSON.parse(localStorage.getItem('prismate_pomodoro_settings') || '{}'),
      bentoLayouts: JSON.parse(localStorage.getItem('prismate_bento_layouts') || '{}'),
    };

    await saveUserDataToCloud(fullData);
    const now = Date.now();
    setLastCloudSyncTime(now);
    localStorage.setItem('prismate_last_cloud_sync', String(now));
    setIsCloudSyncing(false);
  }, [loggedInUser, userAvatar, homePageEnabled, defaultStartupScreen, weaklist, stronglist, studylist]);

  // Login: loads user's preserved data from cloud if logging in on a different device
  const login = useCallback(
    async (username: string) => {
      setLoggedInUser(username);
      localStorage.setItem('prismate_active_user', username);
      setInApp(true);

      // Attempt to load user data from cloud
      setIsCloudSyncing(true);
      try {
        const cloudData = await loadUserDataFromCloud(username);
        if (cloudData) {
          if (cloudData.avatar) setUserAvatarState(cloudData.avatar);
          if (typeof cloudData.homePageEnabled === 'boolean') setHomePageEnabledState(cloudData.homePageEnabled);
          if (cloudData.defaultStartupScreen) setDefaultStartupScreenState(cloudData.defaultStartupScreen);
          if (Array.isArray(cloudData.weaklist)) setWeaklist(cloudData.weaklist);
          if (Array.isArray(cloudData.stronglist)) setStronglist(cloudData.stronglist);
          if (Array.isArray(cloudData.studylist)) setStudylist(cloudData.studylist);
          if (cloudData.clockConfig) localStorage.setItem('prismate_clock_config', JSON.stringify(cloudData.clockConfig));
          if (cloudData.alarms) localStorage.setItem('prismate_alarms', JSON.stringify(cloudData.alarms));
          if (cloudData.pomoSettings) localStorage.setItem('prismate_pomodoro_settings', JSON.stringify(cloudData.pomoSettings));
          if (cloudData.bentoLayouts) localStorage.setItem('prismate_bento_layouts', JSON.stringify(cloudData.bentoLayouts));
          const now = Date.now();
          setLastCloudSyncTime(now);
          localStorage.setItem('prismate_last_cloud_sync', String(now));
        } else {
          // New session or offline: push initial data to cloud
          const matchProfile = profiles.find((p) => p.username.toLowerCase() === username.toLowerCase());
          if (matchProfile) {
            setUserAvatarState(matchProfile.avatar);
          }
        }
      } catch (err) {
        console.warn('Could not load user data from cloud:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    },
    [setInApp, profiles]
  );

  const logout = useCallback(() => {
    setLoggedInUser(null);
    localStorage.removeItem('prismate_active_user');
    setInApp(false);
    setIsEditMode(false);
  }, [setInApp, setIsEditMode]);

  const updateUsername = useCallback((name: string) => {
    setLoggedInUser(name);
    // Update profile entry
    setProfiles((prev) => {
      const updated = prev.map((p) =>
        p.username.toLowerCase() === (loggedInUser || '').toLowerCase()
          ? { ...p, username: name, updatedAt: Date.now() }
          : p
      );
      pushProfilesToCloud(updated);
      return updated;
    });
    // Trigger cloud sync
    setTimeout(() => {
      syncCloudData();
    }, 100);
  }, [loggedInUser, syncCloudData]);

  const setUserAvatar = useCallback((avatar: string) => {
    setUserAvatarState(avatar);
    setProfiles((prev) => {
      const updated = prev.map((p) =>
        p.username.toLowerCase() === (loggedInUser || '').toLowerCase()
          ? { ...p, avatar, updatedAt: Date.now() }
          : p
      );
      pushProfilesToCloud(updated);
      return updated;
    });
    setTimeout(() => {
      syncCloudData();
    }, 100);
  }, [loggedInUser, syncCloudData]);

  const setHomePageEnabled = useCallback((enabled: boolean) => {
    setHomePageEnabledState(enabled);
    setTimeout(() => {
      syncCloudData();
    }, 100);
  }, [syncCloudData]);

  const setDefaultStartupScreen = useCallback((screen: ScreenType) => {
    setDefaultStartupScreenState(screen);
    setTimeout(() => {
      syncCloudData();
    }, 100);
  }, [syncCloudData]);

  const addToList = useCallback((type: ListType, itemData: Omit<ListItem, 'id' | 'addedAt'>) => {
    const newItem: ListItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      addedAt: Date.now(),
    };
    if (type === 'weaklist') setWeaklist((prev) => [newItem, ...prev.filter((i) => i.title !== itemData.title)]);
    if (type === 'stronglist') setStronglist((prev) => [newItem, ...prev.filter((i) => i.title !== itemData.title)]);
    if (type === 'studylist') setStudylist((prev) => [newItem, ...prev.filter((i) => i.title !== itemData.title)]);

    setTimeout(() => {
      syncCloudData();
    }, 200);
  }, [syncCloudData]);

  const removeFromList = useCallback((type: ListType, itemId: string) => {
    if (type === 'weaklist') setWeaklist((prev) => prev.filter((i) => i.id !== itemId));
    if (type === 'stronglist') setStronglist((prev) => prev.filter((i) => i.id !== itemId));
    if (type === 'studylist') setStudylist((prev) => prev.filter((i) => i.id !== itemId));

    setTimeout(() => {
      syncCloudData();
    }, 200);
  }, [syncCloudData]);

  const isInList = useCallback(
    (type: ListType, title: string) => {
      const list = type === 'weaklist' ? weaklist : type === 'stronglist' ? stronglist : studylist;
      return list.some((i) => i.title.toLowerCase() === title.toLowerCase());
    },
    [weaklist, stronglist, studylist]
  );

  // Add custom profile and sync to cloud
  const addProfile = useCallback(
    async (username: string, avatar: string, password = 'prismate1.5') => {
      const newProfile: ProfileSummary = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        username: username.trim(),
        avatar: avatar || username[0].toUpperCase(),
        password,
        updatedAt: Date.now(),
      };

      const updated = [...profiles.filter((p) => p.username.toLowerCase() !== username.toLowerCase()), newProfile];
      setProfiles(updated);
      saveLocalProfiles(updated);
      await pushProfilesToCloud(updated);

      // Create initial cloud user data
      const initialUserData: UserFullData = {
        id: newProfile.id,
        username: newProfile.username,
        avatar: newProfile.avatar,
        password: newProfile.password,
        homePageEnabled: true,
        defaultStartupScreen: 'chemistry',
        weaklist: INITIAL_LIST_ITEMS,
        stronglist: [],
        studylist: [],
        lastSyncedAt: Date.now(),
      };
      await saveUserDataToCloud(initialUserData);
    },
    [profiles]
  );

  // Delete custom profile (cannot delete default profiles)
  const deleteProfile = useCallback(
    async (id: string) => {
      const isDefault = DEFAULT_PROFILES.some((p) => p.id === id);
      if (isDefault) return;

      const updated = profiles.filter((p) => p.id !== id);
      setProfiles(updated);
      saveLocalProfiles(updated);
      await pushProfilesToCloud(updated);
    },
    [profiles]
  );

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        loggedInUser,
        login,
        logout,
        updateUsername,
        userAvatar,
        setUserAvatar,
        homePageEnabled,
        setHomePageEnabled,
        defaultStartupScreen,
        setDefaultStartupScreen,
        editModeScreen,
        setEditModeScreen,
        isEditMode,
        setIsEditMode,
        weaklist,
        stronglist,
        studylist,
        addToList,
        removeFromList,
        isInList,
        globalLoader,
        globalLoaderMetadata,
        triggerLoader,
        inApp,
        setInApp,
        profiles,
        addProfile,
        deleteProfile,
        syncCloudData,
        isCloudSyncing,
        lastCloudSyncTime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
