import { createContext } from 'react';
import type { ScreenType, ListType, ListItem } from '../types/prismate';

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
  triggerLoader: (durationMs?: number, onComplete?: () => void) => void;
  inApp: boolean;
  setInApp: (val: boolean) => void;
}

export const AppContext = createContext<AppContextType | null>(null);
