import type { Theme, ThemeName } from '@/types/theme';

export const THEMES: Record<ThemeName, Theme> = {
  dark: {
    name: '深色',
    background: '#1A1D23',
    panelBg: 'rgba(30,33,40,0.75)',
    panelBorder: 'rgba(255,255,255,0.06)',
    wallColor: '#7C8BA0',
    wallGlow: '#60A5FA',
    playerColor: '#60A5FA',
    playerGlow: '#93C5FD',
    accent: '#60A5FA',
    accentSoft: 'rgba(96,165,250,0.15)',
    text: '#E2E8F0',
    textSecondary: '#94A3B8',
    entryGlow: 'rgba(74, 222, 128, 0.65)',
    exitGlow: 'rgba(248, 113, 113, 0.65)'
  },
  warm: {
    name: '暖色',
    background: '#FAF7F2',
    panelBg: 'rgba(255,255,255,0.60)',
    panelBorder: 'rgba(0,0,0,0.06)',
    wallColor: '#8B7355',
    wallGlow: '#E07B39',
    playerColor: '#E07B39',
    playerGlow: '#FF8C42',
    accent: '#E07B39',
    accentSoft: 'rgba(224,123,57,0.10)',
    text: '#2D241D',
    textSecondary: '#8B7355',
    entryGlow: 'rgba(74, 222, 128, 0.55)',
    exitGlow: 'rgba(239, 68, 68, 0.55)'
  },
  ocean: {
    name: '海洋',
    background: '#F4F8FB',
    panelBg: 'rgba(255,255,255,0.60)',
    panelBorder: 'rgba(0,0,0,0.06)',
    wallColor: '#1E3A5F',
    wallGlow: '#0EA5E9',
    playerColor: '#0EA5E9',
    playerGlow: '#38BDF8',
    accent: '#0EA5E9',
    accentSoft: 'rgba(14,165,233,0.10)',
    text: '#0C4A6E',
    textSecondary: '#64748B',
    entryGlow: 'rgba(74, 222, 128, 0.55)',
    exitGlow: 'rgba(239, 68, 68, 0.55)'
  },
  forest: {
    name: '森林',
    background: '#F2F7F4',
    panelBg: 'rgba(255,255,255,0.60)',
    panelBorder: 'rgba(0,0,0,0.06)',
    wallColor: '#14532D',
    wallGlow: '#22C55E',
    playerColor: '#22C55E',
    playerGlow: '#4ADE80',
    accent: '#22C55E',
    accentSoft: 'rgba(34,197,94,0.10)',
    text: '#14532D',
    textSecondary: '#64748B',
    entryGlow: 'rgba(74, 222, 128, 0.55)',
    exitGlow: 'rgba(239, 68, 68, 0.55)'
  },
  purple: {
    name: '紫色',
    background: '#FAF6FE',
    panelBg: 'rgba(255,255,255,0.60)',
    panelBorder: 'rgba(0,0,0,0.06)',
    wallColor: '#581C87',
    wallGlow: '#A855F7',
    playerColor: '#A855F7',
    playerGlow: '#C084FC',
    accent: '#A855F7',
    accentSoft: 'rgba(168,85,247,0.10)',
    text: '#3B0764',
    textSecondary: '#64748B',
    entryGlow: 'rgba(74, 222, 128, 0.55)',
    exitGlow: 'rgba(239, 68, 68, 0.55)'
  }
};

export const DEFAULT_THEME: ThemeName = 'dark';
