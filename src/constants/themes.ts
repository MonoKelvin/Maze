import type { Theme, ThemeName } from '@/types/theme';

export const THEMES: Record<ThemeName, Theme> = {
  warm: {
    name: '暖色',
    background: '#F5F2EA',
    panelBg: 'rgba(255,255,255,0.55)',
    wallColor: '#8B7355',
    wallGlow: '#E07B39',
    playerColor: '#E07B39',
    playerGlow: '#FF8C42',
    accent: '#E07B39',
    text: '#2D241D',
    textSecondary: '#8B7355',
    entryGlow: 'rgba(74, 222, 128, 0.5)',
    exitGlow: 'rgba(248, 113, 113, 0.5)'
  },
  ocean: {
    name: '海洋',
    background: '#F0F9FF',
    panelBg: 'rgba(255,255,255,0.55)',
    wallColor: '#1E3A8A',
    wallGlow: '#0EA5E9',
    playerColor: '#0EA5E9',
    playerGlow: '#38BDF8',
    accent: '#0EA5E9',
    text: '#0C4A6E',
    textSecondary: '#0284C7',
    entryGlow: 'rgba(74, 222, 128, 0.5)',
    exitGlow: 'rgba(248, 113, 113, 0.5)'
  },
  forest: {
    name: '森林',
    background: '#F0FDF4',
    panelBg: 'rgba(255,255,255,0.55)',
    wallColor: '#14532D',
    wallGlow: '#22C55E',
    playerColor: '#22C55E',
    playerGlow: '#4ADE80',
    accent: '#22C55E',
    text: '#14532D',
    textSecondary: '#15803D',
    entryGlow: 'rgba(74, 222, 128, 0.5)',
    exitGlow: 'rgba(248, 113, 113, 0.5)'
  },
  purple: {
    name: '紫色',
    background: '#FAF5FF',
    panelBg: 'rgba(255,255,255,0.55)',
    wallColor: '#581C87',
    wallGlow: '#A855F7',
    playerColor: '#A855F7',
    playerGlow: '#C084FC',
    accent: '#A855F7',
    text: '#3B0764',
    textSecondary: '#7E22CE',
    entryGlow: 'rgba(74, 222, 128, 0.5)',
    exitGlow: 'rgba(248, 113, 113, 0.5)'
  }
};

export const DEFAULT_THEME: ThemeName = 'warm';
