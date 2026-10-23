import { createContext } from 'react';
import type { ScreenType, ListType, ListItem } from '../types/prismate';
import type { ProfileSummary } from '../services/cloudStore';

import type { UniversalLoaderMetadata } from '../components/UniversalLoader';

export interface AppContextType {
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
  globalLoaderMetadata: UniversalLoaderMetadata | null;
  triggerLoader: (durationMs?: number, onComplete?: () => void, metadata?: UniversalLoaderMetadata) => void;
  inApp: boolean;
  setInApp: (val: boolean) => void;
  // Theme System
  theme: 'dark' | 'light' | 'immersive';
  setTheme: (theme: 'dark' | 'light' | 'immersive') => void;
  toggleTheme: () => void;
  // Immersive Mode & Bento Glass System
  bentoGlassStyle: 'frosted' | 'liquid';
  setBentoGlassStyle: (style: 'frosted' | 'liquid') => void;
  immersiveWallpaperMode: 'auto' | 'fixed';
  setImmersiveWallpaperMode: (mode: 'auto' | 'fixed') => void;
  immersiveCycleMinutes: number;
  setImmersiveCycleMinutes: (mins: number) => void;
  immersiveFixedWallpaper: string;
  setImmersiveFixedWallpaper: (url: string) => void;
  currentWallpaperIndex: number;
  setCurrentWallpaperIndex: (idx: number) => void;
  nextWallpaper: () => void;
  prevWallpaper: () => void;
  // Cloud & Profile Extension
  profiles: ProfileSummary[];
  addProfile: (username: string, avatar: string, password?: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  syncCloudData: () => Promise<void>;
  isCloudSyncing: boolean;
  lastCloudSyncTime: number | null;
}

export const AppContext = createContext<AppContextType | null>(null);
