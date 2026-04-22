import type { TimeOfDay } from '../types';

export interface DSTheme {
  id: string;
  bg: string;
  surface: string;
  surfaceSolid: string;
  chrome: string;
  chromeDark: string;
  chromeLight: string;
  titleBar: string;
  titleText: string;
  text: string;
  textMuted: string;
  accent1: string;
  accent2: string;
  accent3: string;
  accent4: string;
  postit: string;
  postitShadow: string;
  bevelLight: string;
  bevelDark: string;
  glass: string;
  glassBorder: string;
  blur: string;
}

export const DS_THEMES: Record<TimeOfDay, DSTheme> = {
  // 5–7 AM / 5–7 PM — Dawn Light
  dawn: {
    id: 'dawn',
    bg: 'linear-gradient(160deg, #f7d6c0 0%, #f9c5a0 20%, #f5b8c8 50%, #d4b8e8 80%, #b8cef5 100%)',
    surface: 'rgba(255,230,210,0.25)',
    surfaceSolid: '#fef0e8',
    chrome: '#d4a090',
    chromeDark: '#a06050',
    chromeLight: '#ffe8d8',
    titleBar: 'linear-gradient(90deg, #e08060 0%, #e8a070 100%)',
    titleText: '#fff',
    text: '#3a1808',
    textMuted: '#a06848',
    accent1: '#e07040',
    accent2: '#c050a0',
    accent3: '#7060d0',
    accent4: '#e0a020',
    postit: '#fff5c0',
    postitShadow: '#d4c060',
    bevelLight: '#ffe8d0',
    bevelDark: '#904030',
    glass: 'rgba(255,220,200,0.18)',
    glassBorder: 'rgba(220,160,120,0.35)',
    blur: 'blur(20px)',
  },

  // 7 AM–noon — Sage & Cream
  morning: {
    id: 'sage',
    bg: 'linear-gradient(135deg, #e8ede0 0%, #dde8d8 40%, #ede8e0 100%)',
    surface: 'rgba(230,240,225,0.55)',
    surfaceSolid: '#f0f5ec',
    chrome: '#90a880',
    chromeDark: '#506040',
    chromeLight: '#d8ead0',
    titleBar: 'linear-gradient(90deg, #507040 0%, #709060 100%)',
    titleText: '#fff',
    text: '#202c18',
    textMuted: '#607050',
    accent1: '#508040',
    accent2: '#c06040',
    accent3: '#4060c0',
    accent4: '#c0a020',
    postit: '#fef3a0',
    postitShadow: '#c8c050',
    bevelLight: '#d8ead0',
    bevelDark: '#304020',
    glass: 'rgba(200,230,190,0.18)',
    glassBorder: 'rgba(140,180,120,0.3)',
    blur: 'blur(20px)',
  },

  // Noon–5 PM — Blush Pixel
  afternoon: {
    id: 'blush',
    bg: 'linear-gradient(135deg, #f5ddd5 0%, #f0c8d0 40%, #e8d5c4 100%)',
    surface: 'rgba(255,240,235,0.55)',
    surfaceSolid: '#fdf0ea',
    chrome: '#c0a0a0',
    chromeDark: '#8b6060',
    chromeLight: '#ffd0d0',
    titleBar: 'linear-gradient(90deg, #c05050 0%, #e07070 100%)',
    titleText: '#fff',
    text: '#3a1a1a',
    textMuted: '#8a5a5a',
    accent1: '#e05050',
    accent2: '#e08020',
    accent3: '#5080e0',
    accent4: '#50c080',
    postit: '#fef08a',
    postitShadow: '#d4c060',
    bevelLight: '#ffe0e0',
    bevelDark: '#804040',
    glass: 'rgba(255,220,210,0.18)',
    glassBorder: 'rgba(255,180,160,0.3)',
    blur: 'blur(20px)',
  },

  // 7 PM–5 AM — Midnight Amber
  night: {
    id: 'midnight',
    bg: 'linear-gradient(135deg, #1a1010 0%, #201020 40%, #101520 100%)',
    surface: 'rgba(60,30,20,0.6)',
    surfaceSolid: '#2a1810',
    chrome: '#604020',
    chromeDark: '#201008',
    chromeLight: '#c08040',
    titleBar: 'linear-gradient(90deg, #804010 0%, #c06010 100%)',
    titleText: '#ffeedd',
    text: '#ffd0a0',
    textMuted: '#a07040',
    accent1: '#e08020',
    accent2: '#e04040',
    accent3: '#40c0a0',
    accent4: '#a060e0',
    postit: '#b8860b',
    postitShadow: '#6b4e08',
    bevelLight: '#c08040',
    bevelDark: '#201008',
    glass: 'rgba(255,160,60,0.08)',
    glassBorder: 'rgba(200,120,40,0.25)',
    blur: 'blur(22px)',
  },
};
