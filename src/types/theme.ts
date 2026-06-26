/** 主题配置 */
export interface Theme {
  name: string;
  background: string;
  panelBg: string;
  wallColor: string;
  wallGlow: string;
  playerColor: string;
  playerGlow: string;
  accent: string;
  text: string;
  textSecondary: string;
  entryGlow: string;
  exitGlow: string;
}

export type ThemeName = 'warm' | 'ocean' | 'forest' | 'purple';
