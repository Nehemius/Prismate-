export interface MaterialYouPalette {
  primary: string;
  secondary: string;
  surfaceTint: string;
  glow: string;
  name: string;
}

export interface WallpaperItem {
  id: string;
  name: string;
  url: string;
  thumbUrl: string;
  mood: string;
  materialYou: MaterialYouPalette;
}

export const IMMERSIVE_WALLPAPERS: WallpaperItem[] = [
  {
    id: 'wall-1',
    name: 'Zenith Bloom',
    url: '/wallpapers/wallpaper_01.jpg',
    thumbUrl: '/wallpapers/thumbs/wallpaper_01_thumb.jpg',
    mood: 'Cosmic Prismatic',
    materialYou: {
      primary: '#38BDF8', // Cyan sky
      secondary: '#818CF8', // Indigo
      surfaceTint: 'rgba(56, 189, 248, 0.08)',
      glow: 'rgba(56, 189, 248, 0.45)',
      name: 'Prismatic Cyan',
    },
  },
  {
    id: 'wall-2',
    name: 'Astral Geometry',
    url: '/wallpapers/wallpaper_02.jpg',
    thumbUrl: '/wallpapers/thumbs/wallpaper_02_thumb.jpg',
    mood: 'Minimalist Vector',
    materialYou: {
      primary: '#A78BFA', // Soft violet
      secondary: '#F472B6', // Rose
      surfaceTint: 'rgba(167, 139, 250, 0.08)',
      glow: 'rgba(167, 139, 250, 0.45)',
      name: 'Astral Lavender',
    },
  },
  {
    id: 'wall-3',
    name: 'Prism Horizon',
    url: '/wallpapers/wallpaper_03.jpg',
    thumbUrl: '/wallpapers/thumbs/wallpaper_03_thumb.jpg',
    mood: 'Atmospheric Glow',
    materialYou: {
      primary: '#34D399', // Emerald mint
      secondary: '#38BDF8', // Sky
      surfaceTint: 'rgba(52, 211, 153, 0.08)',
      glow: 'rgba(52, 211, 153, 0.45)',
      name: 'Aurora Mint',
    },
  },
  {
    id: 'wall-4',
    name: 'Quantum Void',
    url: '/wallpapers/wallpaper_04.jpg',
    thumbUrl: '/wallpapers/thumbs/wallpaper_04_thumb.jpg',
    mood: 'Deep Monolith',
    materialYou: {
      primary: '#94A3B8', // Silver slate
      secondary: '#38BDF8',
      surfaceTint: 'rgba(148, 163, 184, 0.06)',
      glow: 'rgba(148, 163, 184, 0.35)',
      name: 'Monolith Silver',
    },
  },
  {
    id: 'wall-5',
    name: 'Chiaroscuro Nebula',
    url: '/wallpapers/wallpaper_05.jpg',
    thumbUrl: '/wallpapers/thumbs/wallpaper_05_thumb.jpg',
    mood: 'Ethereal Space',
    materialYou: {
      primary: '#F472B6', // Orchid Pink
      secondary: '#C084FC', // Purple
      surfaceTint: 'rgba(244, 114, 182, 0.08)',
      glow: 'rgba(244, 114, 182, 0.45)',
      name: 'Nebula Orchid',
    },
  },
  {
    id: 'wall-6',
    name: 'Solar Zenith',
    url: '/wallpapers/wallpaper_06.jpg',
    thumbUrl: '/wallpapers/thumbs/wallpaper_06_thumb.jpg',
    mood: 'High-Energy Flare',
    materialYou: {
      primary: '#FBBF24', // Radiant Amber
      secondary: '#FB923C', // Orange
      surfaceTint: 'rgba(251, 191, 36, 0.08)',
      glow: 'rgba(251, 191, 36, 0.45)',
      name: 'Solar Amber',
    },
  },
  {
    id: 'wall-7',
    name: 'Cybernetic Monolith',
    url: '/wallpapers/wallpaper_07.jpg',
    thumbUrl: '/wallpapers/thumbs/wallpaper_07_thumb.jpg',
    mood: 'Dark Tech Flow',
    materialYou: {
      primary: '#2DD4BF', // Teal
      secondary: '#0284C7', // Blue
      surfaceTint: 'rgba(45, 212, 191, 0.08)',
      glow: 'rgba(45, 212, 191, 0.45)',
      name: 'Cyber Teal',
    },
  },
  {
    id: 'wall-8',
    name: 'Ethereal Dawn',
    url: '/wallpapers/wallpaper_08.jpg',
    thumbUrl: '/wallpapers/thumbs/wallpaper_08_thumb.jpg',
    mood: 'Spectral Violet',
    materialYou: {
      primary: '#C084FC', // Violet
      secondary: '#818CF8', // Indigo
      surfaceTint: 'rgba(192, 132, 252, 0.08)',
      glow: 'rgba(192, 132, 252, 0.45)',
      name: 'Spectral Violet',
    },
  },
  {
    id: 'wall-9',
    name: 'Deep Space Orbit',
    url: '/wallpapers/wallpaper_09.jpg',
    thumbUrl: '/wallpapers/thumbs/wallpaper_09_thumb.jpg',
    mood: 'Stellar Horizon',
    materialYou: {
      primary: '#60A5FA', // Stellar Blue
      secondary: '#A78BFA',
      surfaceTint: 'rgba(96, 165, 250, 0.08)',
      glow: 'rgba(96, 165, 250, 0.45)',
      name: 'Stellar Blue',
    },
  },
  {
    id: 'wall-10',
    name: 'Prismatic Eclipse',
    url: '/wallpapers/wallpaper_10.jpg',
    thumbUrl: '/wallpapers/thumbs/wallpaper_10_thumb.jpg',
    mood: 'Aurora Resonance',
    materialYou: {
      primary: '#4ADE80', // Emerald Lime
      secondary: '#2DD4BF',
      surfaceTint: 'rgba(74, 222, 128, 0.08)',
      glow: 'rgba(74, 222, 128, 0.45)',
      name: 'Aurora Resonance',
    },
  },
];
