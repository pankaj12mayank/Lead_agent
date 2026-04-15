/**
 * Recharts palettes: muted gold, emerald, slate, amber for light + dark themes.
 */
import { useThemeStore } from '@/store/themeStore'

export type ChartPalette = {
  grid: string
  axis: string
  tick: string
  tooltipBg: string
  tooltipBorder: string
  tooltipLabel: string
  linePrimary: string
  barPrimary: string
  pie: string[]
  hot: string
  warm: string
  cold: string
  emerald: string
}

const light: ChartPalette = {
  grid: '#e7e5e4',
  axis: '#d6d3d1',
  tick: '#78716c',
  tooltipBg: 'rgba(255,255,255,0.96)',
  tooltipBorder: '#e7e5e4',
  tooltipLabel: '#292524',
  linePrimary: '#b45309',
  barPrimary: '#a16207',
  pie: ['#a16207', '#059669', '#78716c', '#ca8a04', '#64748b', '#57534e', '#94a3b8'],
  hot: '#dc2626',
  warm: '#d97706',
  cold: '#64748b',
  emerald: '#059669',
}

const dark: ChartPalette = {
  grid: '#27272a',
  axis: '#3f3f46',
  tick: '#a1a1aa',
  tooltipBg: 'rgba(9, 9, 11, 0.96)',
  tooltipBorder: '#3f3f46',
  tooltipLabel: '#f4f4f5',
  linePrimary: '#eab308',
  barPrimary: '#ca8a04',
  pie: ['#ca8a04', '#34d399', '#94a3b8', '#eab308', '#64748b', '#71717a', '#a8a29e'],
  hot: '#f87171',
  warm: '#fbbf24',
  cold: '#94a3b8',
  emerald: '#34d399',
}

export function getChartPalette(resolved: 'light' | 'dark'): ChartPalette {
  return resolved === 'dark' ? dark : light
}

export function useChartPalette(): ChartPalette {
  const resolved = useThemeStore((s) => s.resolved)
  return getChartPalette(resolved)
}

export function tooltipStyles(p: ChartPalette) {
  return {
    background: p.tooltipBg,
    border: `1px solid ${p.tooltipBorder}`,
    borderRadius: 12,
    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
  }
}

export function tooltipLabelStyle(p: ChartPalette) {
  return { color: p.tooltipLabel, fontWeight: 600 }
}

/** @deprecated use useChartPalette() */
export const CHART_GRID = dark.grid
export const CHART_AXIS = dark.axis
export const CHART_TICK = dark.tick
export const CHART_PURPLE = dark.linePrimary
export const CHART_PURPLE_SOFT = dark.barPrimary
export const CHART_HOT = dark.hot
export const CHART_WARM = dark.warm
export const CHART_COLD = dark.cold
export const CHART_GREEN = dark.emerald
export const CHART_PIE = dark.pie
export const CHART_TOOLTIP_BG = dark.tooltipBg
export const CHART_TOOLTIP_BORDER = dark.tooltipBorder

export const tooltipContentStyle = {
  background: dark.tooltipBg,
  border: `1px solid ${dark.tooltipBorder}`,
  borderRadius: 12,
  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
}
