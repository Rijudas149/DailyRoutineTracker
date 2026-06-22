import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { LineChart as LineChartIcon } from 'lucide-react'
import { useTracker } from '../context/TrackerContext'
import { getWeekOptions } from '../lib/dates'
import { getWeekProgressData, PROGRESS_METRICS } from '../lib/progress'
import { formatTime } from '../lib/dates'
import { Card, SectionTitle, Select, EmptyState } from './ui'
import { useTheme } from '../context/ThemeContext'
import { getChartTooltipStyle, getChartGridColor, getChartAxisColor } from '../lib/chartTheme'

export function CheckProgress() {
  const { data } = useTracker()
  const { theme } = useTheme()
  const weeks = useMemo(() => getWeekOptions(20), [])
  const [weekId, setWeekId] = useState(weeks[0]?.id ?? '')

  const tooltipStyle = getChartTooltipStyle(theme)
  const gridColor = getChartGridColor(theme)
  const axisColor = getChartAxisColor(theme)

  const selectedWeek = weeks.find((w) => w.id === weekId) ?? weeks[0]
  const chartData = selectedWeek
    ? getWeekProgressData(data, selectedWeek.start, selectedWeek.end)
    : []

  const hasData = chartData.some(
    (d) => d.study + d.exercise + d.reading + d.meditation + d.work + d.sleep > 0
  )

  const activeMetrics = PROGRESS_METRICS.filter((m) =>
    chartData.some((d) => (d[m.key as keyof typeof d] as number) > 0)
  )

  return (
    <div className="space-y-5">
      <Card accent>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
          <SectionTitle
            icon={<LineChartIcon className="w-4 h-4" />}
            title="Weekly Progress"
            subtitle="Daily minutes for each activity — connected dot graph"
            className="mb-0"
          />
          <Select
            label="Select Week"
            value={weekId}
            onChange={setWeekId}
            options={weeks.map((w) => ({ value: w.id, label: w.label }))}
            className="sm:min-w-[220px]"
          />
        </div>

        {!hasData ? (
          <EmptyState
            icon={<LineChartIcon className="w-8 h-8" />}
            title="No data this week"
            description="Log activities in Log Progress to see your weekly trend graph."
          />
        ) : (
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="dayLabel" stroke={axisColor} fontSize={12} />
              <YAxis stroke={axisColor} fontSize={12} tickFormatter={(v) => `${v}m`} />
              <Tooltip
                {...tooltipStyle}
                formatter={(value) => formatTime(Number(value ?? 0))}
              />
              <Legend />
              {(activeMetrics.length > 0 ? activeMetrics : PROGRESS_METRICS).map((m) => (
                <Line
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  name={m.label}
                  stroke={m.color}
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: m.color, strokeWidth: 2, stroke: '#0f172a' }}
                  activeDot={{ r: 7 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {hasData && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PROGRESS_METRICS.map((m) => {
            const total = chartData.reduce(
              (sum, d) => sum + (d[m.key as keyof typeof d] as number),
              0
            )
            return (
              <Card key={m.key} className="!p-3 text-center">
                <p className="text-lg font-bold" style={{ color: m.color }}>
                  {formatTime(total)}
                </p>
                <p className="text-[10px] theme-muted mt-1 uppercase tracking-wide">{m.label}</p>
                <p className="text-[9px] theme-muted">week total</p>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
