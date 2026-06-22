export function getChartTooltipStyle(theme: 'light' | 'dark') {
  if (theme === 'light') {
    return {
      contentStyle: {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        color: '#0f172a',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
      },
    }
  }
  return {
    contentStyle: {
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      borderRadius: '12px',
      color: '#f1f5f9',
    },
  }
}

export function getChartGridColor(theme: 'light' | 'dark') {
  return theme === 'light' ? '#e2e8f0' : '#334155'
}

export function getChartAxisColor(theme: 'light' | 'dark') {
  return theme === 'light' ? '#64748b' : '#64748b'
}
