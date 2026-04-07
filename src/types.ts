export const MILESTONE_DAYS = [1000, 5000, 10000, 20000, 25000, 30000] as const

export type ThemeId =
  | 'ocean'
  | 'sunset'
  | 'forest'
  | 'plum'
  | 'slate'
  | 'ember'

export interface DayCounter {
  id: string
  title: string
  /** ISO date string YYYY-MM-DD (local calendar day) */
  startDate: string
  themeId: ThemeId
}

export const THEMES: Record<
  ThemeId,
  { label: string; bg: string; card: string; accent: string; text: string; muted: string }
> = {
  ocean: {
    label: 'Ocean',
    bg: '#0c1929',
    card: '#132f4c',
    accent: '#29b6f6',
    text: '#e3f2fd',
    muted: '#90caf9',
  },
  sunset: {
    label: 'Sunset',
    bg: '#2d1b2e',
    card: '#4a2c4a',
    accent: '#ff8a65',
    text: '#fff3e0',
    muted: '#ffccbc',
  },
  forest: {
    label: 'Forest',
    bg: '#0d1f12',
    card: '#1b3d2f',
    accent: '#66bb6a',
    text: '#e8f5e9',
    muted: '#a5d6a7',
  },
  plum: {
    label: 'Plum',
    bg: '#1a1025',
    card: '#2d1f3d',
    accent: '#ba68c8',
    text: '#f3e5f5',
    muted: '#e1bee7',
  },
  slate: {
    label: 'Slate',
    bg: '#121417',
    card: '#1e2328',
    accent: '#90a4ae',
    text: '#eceff1',
    muted: '#b0bec5',
  },
  ember: {
    label: 'Ember',
    bg: '#1f1410',
    card: '#3e2723',
    accent: '#ff7043',
    text: '#fff8e1',
    muted: '#ffab91',
  },
}
