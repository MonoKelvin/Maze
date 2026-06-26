import type { Theme } from '@/types/theme';
import { ThemeName } from '@/types/theme';

export const THEMES: Record<ThemeName, Theme> = {
    warm: {
        background: '#F5F2EA',
        panelBackground: 'rgba(245, 242, 234, 0.7)',
        wallColor: '#4A3B2A',
        wallGlow: '#E07B39',
        playerColor: '#5C4A3A',
        playerGlow: '#FF8C42',
        accentColor: '#E07B39',
        primaryText: '#2D241D',
        secondaryText: '#8B7355',
        accentLight: 'rgba(224, 123, 57, 0.1)',
        borderColor: 'rgba(74, 59, 42, 0.1)',
        entryGlow: 'rgba(100, 200, 100, 0.5)',
        exitGlow: 'rgba(255, 100, 100, 0.5)'
    },
    ocean: {
        background: '#F0F9FF',
        panelBackground: 'rgba(240, 249, 255, 0.7)',
        wallColor: '#1E3A8A',
        wallGlow: '#0EA5E9',
        playerColor: '#0369A1',
        playerGlow: '#38BDF8',
        accentColor: '#0EA5E9',
        primaryText: '#0C4A6E',
        secondaryText: '#0284C7',
        accentLight: 'rgba(14, 165, 233, 0.1)',
        borderColor: 'rgba(30, 58, 138, 0.1)',
        entryGlow: 'rgba(100, 200, 255, 0.5)',
        exitGlow: 'rgba(255, 100, 150, 0.5)'
    },
    forest: {
        background: '#F0FDF4',
        panelBackground: 'rgba(240, 253, 244, 0.7)',
        wallColor: '#14532D',
        wallGlow: '#22C55E',
        playerColor: '#166534',
        playerGlow: '#4ADE80',
        accentColor: '#22C55E',
        primaryText: '#14532D',
        secondaryText: '#15803D',
        accentLight: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgba(20, 83, 45, 0.1)',
        entryGlow: 'rgba(100, 255, 100, 0.5)',
        exitGlow: 'rgba(255, 200, 100, 0.5)'
    },
    purple: {
        background: '#FAF5FF',
        panelBackground: 'rgba(250, 245, 255, 0.7)',
        wallColor: '#581C87',
        wallGlow: '#A855F7',
        playerColor: '#6B21A8',
        playerGlow: '#C084FC',
        accentColor: '#A855F7',
        primaryText: '#3B0764',
        secondaryText: '#7E22CE',
        accentLight: 'rgba(168, 85, 247, 0.1)',
        borderColor: 'rgba(88, 28, 135, 0.1)',
        entryGlow: 'rgba(200, 100, 255, 0.5)',
        exitGlow: 'rgba(255, 100, 200, 0.5)'
    }
};

export const DEFAULT_THEME: ThemeName = 'warm';
