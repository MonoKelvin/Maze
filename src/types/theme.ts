/** 主题配置 */
export interface Theme {
  name: string;
  background: string;
  panelBg: string;
  panelBorder: string;
  wallColor: string;
  wallGlow: string;
  playerColor: string;
  playerGlow: string;
  accent: string;
  accentSoft: string;
  text: string;
  textSecondary: string;
  entryGlow: string;
  exitGlow: string;
}

export type ThemeName = 'dark' | 'warm' | 'ocean' | 'forest' | 'purple';
