/**
 * Prismate 1.5 — Cloud Profile & Data Synchronization Service
 * 
 * Provides cross-device cloud persistence for:
 *   1. Custom user profiles & master profile directory
 *   2. Student details (username, candidate title, avatar)
 *   3. Bento layouts, alarms, clock, and pomodoro timer configurations
 *   4. Master knowledge vault lists (weaklist, stronglist, studylist)
 *   5. Seamless local-first caching with background cloud sync
 */

import type { ScreenType, ListItem } from '../types/prismate';

export interface UserFullData {
  id: string; // unique profile key, e.g. "aqua", "tanjiro", "user_17295..."
  username: string;
  avatar: string;
  password?: string;
  candidateTitle?: string;
  homePageEnabled: boolean;
  defaultStartupScreen: ScreenType;
  weaklist: ListItem[];
  stronglist: ListItem[];
  studylist: ListItem[];
  clockConfig?: any;
  alarms?: any[];
  pomoSettings?: any;
  bentoLayouts?: Record<string, any>;
  lastSyncedAt?: number;
}

export interface ProfileSummary {
  id: string;
  username: string;
  avatar: string;
  password?: string;
  cloudObjectId?: string;
  updatedAt: number;
}

const CLOUD_API_BASE = 'https://api.restful-api.dev/objects';
const REGISTRY_OBJECT_ID_KEY = 'prismate_cloud_registry_id';
const LOCAL_PROFILES_KEY = 'prismate_profiles_summary';
const USER_DATA_PREFIX = 'prismate_userdata_';

export const DEFAULT_PROFILES: ProfileSummary[] = [
  { id: 'aqua', username: 'Aqua √X', avatar: 'A', password: 'prismate1.5', updatedAt: 0 },
  { id: 'pyroo', username: 'Pyroo', avatar: 'P', password: 'prismate1.5', updatedAt: 0 },
  { id: 'tanjiro', username: 'Tanjiro', avatar: 'T', password: 'prismate1.5', updatedAt: 0 },
];

/**
 * Get all cached profiles locally first
 */
export function getLocalProfiles(): ProfileSummary[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
    if (!raw) return DEFAULT_PROFILES;
    const parsed = JSON.parse(raw) as ProfileSummary[];
    return parsed.length > 0 ? parsed : DEFAULT_PROFILES;
  } catch {
    return DEFAULT_PROFILES;
  }
}

/**
 * Save profiles summary list locally
 */
export function saveLocalProfiles(profiles: ProfileSummary[]): void {
  localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(profiles));
}

/**
 * Fetch the master cloud profile registry (synchronizes profiles across different devices)
 */
export async function syncProfilesFromCloud(): Promise<ProfileSummary[]> {
  const localList = getLocalProfiles();
  const registryId = localStorage.getItem(REGISTRY_OBJECT_ID_KEY);

  try {
    if (registryId) {
      const res = await fetch(`${CLOUD_API_BASE}/${registryId}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data.profiles)) {
          const cloudProfiles: ProfileSummary[] = json.data.profiles;
          // Merge cloud profiles with local profiles (cloud takes precedence for matches)
          const mergedMap = new Map<string, ProfileSummary>();
          DEFAULT_PROFILES.forEach((p) => mergedMap.set(p.username.toLowerCase(), p));
          localList.forEach((p) => mergedMap.set(p.username.toLowerCase(), p));
          cloudProfiles.forEach((p) => mergedMap.set(p.username.toLowerCase(), p));

          const merged = Array.from(mergedMap.values());
          saveLocalProfiles(merged);
          return merged;
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch cloud profiles registry, using local cache:', err);
  }

  return localList;
}

/**
 * Push updated profiles directory to the cloud
 */
export async function pushProfilesToCloud(profiles: ProfileSummary[]): Promise<void> {
  saveLocalProfiles(profiles);

  try {
    const registryId = localStorage.getItem(REGISTRY_OBJECT_ID_KEY);
    if (registryId) {
      await fetch(`${CLOUD_API_BASE}/${registryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'prismate_master_profile_registry',
          data: { profiles, updatedAt: Date.now() },
        }),
      });
    } else {
      const res = await fetch(CLOUD_API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'prismate_master_profile_registry',
          data: { profiles, updatedAt: Date.now() },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.id) {
          localStorage.setItem(REGISTRY_OBJECT_ID_KEY, json.id);
        }
      }
    }
  } catch (err) {
    console.warn('Failed to push profile registry to cloud:', err);
  }
}

/**
 * Fetch a user's full data record from the cloud by username/cloudObjectId
 */
export async function loadUserDataFromCloud(username: string): Promise<UserFullData | null> {
  const localKey = `${USER_DATA_PREFIX}${username.toLowerCase()}`;
  let localData: UserFullData | null = null;
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) localData = JSON.parse(raw);
  } catch {
    localData = null;
  }

  // Find profile summary to check cloudObjectId
  const profiles = getLocalProfiles();
  const profile = profiles.find((p) => p.username.toLowerCase() === username.toLowerCase());

  if (profile && profile.cloudObjectId) {
    try {
      const res = await fetch(`${CLOUD_API_BASE}/${profile.cloudObjectId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.userData) {
          const cloudData = json.data.userData as UserFullData;
          localStorage.setItem(localKey, JSON.stringify(cloudData));
          return cloudData;
        }
      }
    } catch (err) {
      console.warn(`Cloud fetch error for ${username}:`, err);
    }
  }

  return localData;
}

/**
 * Save and sync a user's entire data record to the cloud
 */
export async function saveUserDataToCloud(data: UserFullData): Promise<void> {
  const username = data.username;
  const localKey = `${USER_DATA_PREFIX}${username.toLowerCase()}`;
  const updatedData: UserFullData = {
    ...data,
    lastSyncedAt: Date.now(),
  };

  localStorage.setItem(localKey, JSON.stringify(updatedData));

  // Sync to cloud
  const profiles = getLocalProfiles();
  const profileIndex = profiles.findIndex((p) => p.username.toLowerCase() === username.toLowerCase());

  try {
    if (profileIndex >= 0 && profiles[profileIndex].cloudObjectId) {
      // Update existing cloud object
      const objectId = profiles[profileIndex].cloudObjectId;
      await fetch(`${CLOUD_API_BASE}/${objectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `prismate_user_${username.toLowerCase()}`,
          data: { userData: updatedData },
        }),
      });
    } else {
      // Create new cloud object
      const res = await fetch(CLOUD_API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `prismate_user_${username.toLowerCase()}`,
          data: { userData: updatedData },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.id) {
          if (profileIndex >= 0) {
            profiles[profileIndex].cloudObjectId = json.id;
            profiles[profileIndex].updatedAt = Date.now();
          } else {
            profiles.push({
              id: data.id || `user_${Date.now()}`,
              username: data.username,
              avatar: data.avatar || 'U',
              password: data.password || 'prismate1.5',
              cloudObjectId: json.id,
              updatedAt: Date.now(),
            });
          }
          await pushProfilesToCloud(profiles);
        }
      }
    }
  } catch (err) {
    console.warn(`Failed to sync user data to cloud for ${username}:`, err);
  }
}
