import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ScreenType, ListType, ListItem } from '../types/prismate';
import { INITIAL_LIST_ITEMS } from '../data/mockData';
import { syncListItemToSupabase, removeListItemFromSupabase } from '../lib/supabase';

interface AppContextType {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  loggedInUser: string | null;
  login: (username: string) => void;
  logout: () => void;
  updateUsername: (name: string) => void;
  userAvatar: string;
  setUserAvatar: (avatar: string) => void;
  homePageEnabled: boolean;
  setHomePageEnabled: (enabled: boolean) => void;
  defaultStartupScreen: ScreenType;
  setDefaultStartupScreen: (screen: ScreenType) => void;
  editModeScreen: ScreenType | null;
  setEditModeScreen: (screen: ScreenType | null) => void;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  weaklist: ListItem[];
  stronglist: ListItem[];
  studylist: ListItem[];
  addToList: (type: ListType, item: Omit<ListItem, 'id' | 'addedAt'>) => void;
  removeFromList: (type: ListType, itemId: string) => void;
  isInList: (type: ListType, title: string) => boolean;
  globalLoader: boolean;
  triggerLoader: (durationMs?: number, onComplete?: () => void) => void;
  inApp: boolean;
  setInApp: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

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
    if (['home', 'chemistry', 'physics', 'mathematics', 'profile'].includes(hash)) {
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

  // Sync state to LocalStorage
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

  // Handle Android back button & browser back/forward without kicking to login
  useEffect(() => {
    if (inApp) {
      const hash = window.location.hash.replace('#', '') || currentScreen;
      window.history.replaceState({ screen: hash, inApp: true }, '', '#' + hash);
    }

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.screen) {
        setCurrentScreenState(e.state.screen);
        localStorage.setItem('prismate_current_screen', e.state.screen);
      } else {
        const hash = window.location.hash.replace('#', '') as ScreenType;
        if (['home', 'chemistry', 'physics', 'mathematics', 'profile'].includes(hash)) {
          setCurrentScreenState(hash);
          localStorage.setItem('prismate_current_screen', hash);
        } else if (inApp) {
          // Stay inside the active session
          window.history.pushState({ screen: currentScreen, inApp: true }, '', '#' + currentScreen);
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [inApp, currentScreen]);

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

  const triggerLoader = useCallback((durationMs = 900, onComplete?: () => void) => {
    setGlobalLoader(true);
    setTimeout(() => {
      setGlobalLoader(false);
      if (onComplete) onComplete();
    }, durationMs);
  }, []);

  const setCurrentScreen = useCallback(
    (screen: ScreenType) => {
      triggerLoader(750, () => {
        setCurrentScreenState(screen);
        localStorage.setItem('prismate_current_screen', screen);
        window.history.pushState({ screen, inApp: true }, '', '#' + screen);
        setIsEditMode(false);
      });
    },
    [triggerLoader, setIsEditMode]
  );

  const login = useCallback(
    (username: string) => {
      setLoggedInUser(username);
      localStorage.setItem('prismate_active_user', username);
      setInApp(true);
    },
    [setInApp]
  );

  const logout = useCallback(() => {
    setLoggedInUser(null);
    localStorage.removeItem('prismate_active_user');
    setInApp(false);
    setIsEditMode(false);
  }, [setInApp, setIsEditMode]);

  const updateUsername = useCallback((name: string) => {
    setLoggedInUser(name);
  }, []);

  const setUserAvatar = useCallback((avatar: string) => {
    setUserAvatarState(avatar);
  }, []);

  const setHomePageEnabled = useCallback((enabled: boolean) => {
    setHomePageEnabledState(enabled);
  }, []);

  const setDefaultStartupScreen = useCallback((screen: ScreenType) => {
    setDefaultStartupScreenState(screen);
  }, []);

  const addToList = useCallback((type: ListType, itemData: Omit<ListItem, 'id' | 'addedAt'>) => {
    const newItem: ListItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      addedAt: Date.now(),
    };
    if (type === 'weaklist') setWeaklist((prev) => [newItem, ...prev.filter((i) => i.title !== itemData.title)]);
    if (type === 'stronglist') setStronglist((prev) => [newItem, ...prev.filter((i) => i.title !== itemData.title)]);
    if (type === 'studylist') setStudylist((prev) => [newItem, ...prev.filter((i) => i.title !== itemData.title)]);

    // Sync to Supabase in background
    syncListItemToSupabase(loggedInUser || 'default_user', type, newItem).catch(() => {});
  }, [loggedInUser]);

  const removeFromList = useCallback((type: ListType, itemId: string) => {
    if (type === 'weaklist') setWeaklist((prev) => prev.filter((i) => i.id !== itemId));
    if (type === 'stronglist') setStronglist((prev) => prev.filter((i) => i.id !== itemId));
    if (type === 'studylist') setStudylist((prev) => prev.filter((i) => i.id !== itemId));

    // Remove from Supabase in background
    removeListItemFromSupabase(loggedInUser || 'default_user', type, itemId).catch(() => {});
  }, [loggedInUser]);

  const isInList = useCallback(
    (type: ListType, title: string) => {
      const list = type === 'weaklist' ? weaklist : type === 'stronglist' ? stronglist : studylist;
      return list.some((i) => i.title.toLowerCase() === title.toLowerCase());
    },
    [weaklist, stronglist, studylist]
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
        triggerLoader,
        inApp,
        setInApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
