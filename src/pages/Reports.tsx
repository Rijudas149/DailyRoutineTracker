import { useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useTracker } from '../context/TrackerContext'
import {
  getPeriodStats,
  getChartData,
  getActivityDistribution,
  getSleepQualityData,
} from '../lib/analytics'
import { Card, StatCard, PeriodSelector, PageHeader, SectionTitle, EmptyState } from '../components/ui'
import type { Period } from '../types'
import { BookOpen, Moon, Dumbbell, CheckCircle2, Activity, BarChart2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { getChartTooltipStyle, getChartGridColor, getChartAxisColor } from '../lib/chartTheme'

const CHART_COLORS = ['#0d9488', '#0891b2', '#14b8a6', '#d97706', '#e11d48', '#7c3aed', '#0284c7']

export function Reports() {
  const { data } = useTracker()
  const { theme } = useTheme()
  const [period, setPeriod] = useState<Period>('week')

  const tooltipStyle = getChartTooltipStyle(theme)
  const gridColor = getChartGridColor(theme)
  const axisColor = getChartAxisColor(theme)

  const stats = getPeriodStats(data, period)
  const chartData = getChartData(data, period)
  const distribution = getActivityDistribution(data, period)
  const sleepData = getSleepQualityData(data, period)

  const radarData = [
    { subject: 'Study', value: Math.min(stats.studyHours / 2, 100) },
    { subject: 'Sleep', value: Math.min((stats.sleepHours / 7) * 10, 100) },
    { subject: 'Exercise', value: Math.min(stats.exerciseMinutes / 3, 100) },
    { subject: 'Reading', value: Math.min(stats.readingMinutes / 2, 100) },
    { subject: 'Habits', value: stats.checklistRate },
  ]

  const hasData = stats.daysTracked > 0

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        badge="Analytics"
        title="Reports"
        subtitle={stats.label}
        action={<PeriodSelector value={period} onChange={(v) => setPeriod(v as Period)} />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          label="Study"
          value={`${stats.studyHours.toFixed(1)}h`}
          icon={<BookOpen className="w-5 h-5" />}
          color="#14b8a6"
        />
        <StatCard
          label="Sleep"
          value={`${stats.sleepHours.toFixed(1)}h`}
          sub={stats.avgSleepQuality > 0 ? `★ ${stats.avgSleepQuality.toFixed(1)}` : undefined}
          icon={<Moon className="w-5 h-5" />}
          color="#8b5cf6"
        />
        <StatCard
          label="Exercise"
          value={`${stats.exerciseMinutes}m`}
          icon={<Dumbbell className="w-5 h-5" />}
          color="#22c55e"
        />
        <StatCard
          label="Habits"
          value={`${Math.round(stats.checklistRate)}%`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="#f59e0b"
        />
        <StatCard
          label="Active"
          value={`${stats.totalActiveHours.toFixed(1)}h`}
          sub={`${stats.daysTracked} days tracked`}
          icon={<Activity className="w-5 h-5" />}
          color="#ec4899"
        />
      </div>

      {!hasData ? (
        <Card>
          <EmptyState
            icon={<BarChart2 className="w-8 h-8" />}
            title="No data yet"
            description="Start tracking in Goals to see your reports and charts here."
          />
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card accent>
            <SectionTitle title="Study & Sleep Trends" />
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="label" stroke={axisColor} fontSize={12} />
                <YAxis stroke={axisColor} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="study"
                  name="Study (h)"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={{ fill: '#14b8a6', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="sleep"
                  name="Sleep (h)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card accent>
            <SectionTitle title="Daily Activity Breakdown" />
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="label" stroke={axisColor} fontSize={12} />
                <YAxis stroke={axisColor} fontSize={12} />
                <Tooltip {...tooltipStyle} />
                <Legend />
                <Bar dataKey="study" name="Study (h)" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exercise" name="Exercise (m)" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reading" name="Reading (m)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card accent>
            <SectionTitle title="Habit Completion Rate" />
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="label" stroke={axisColor} fontSize={12} />
                <YAxis stroke={axisColor} fontSize={12} domain={[0, 100]} />
                <Tooltip {...tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="checklist"
                  name="Completion %"
                  stroke="#22c55e"
                  fill="url(#greenGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Activity distribution pie */}
          {distribution.length > 0 && (
            <Card accent>
              <SectionTitle title="Time Distribution" />
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {distribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Sleep quality */}
          {sleepData.length > 0 && (
            <Card accent>
              <SectionTitle title="Sleep Quality & Duration" />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="label" stroke={axisColor} fontSize={12} />
                  <YAxis yAxisId="left" stroke={axisColor} fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke={axisColor} fontSize={12} domain={[0, 5]} />
                  <Tooltip {...tooltipStyle} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="hours"
                    name="Hours"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="quality"
                    name="Quality"
                    stroke="#f59e0b"
                    strokeWidth={2}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Overall balance radar */}
          <Card accent className="lg:col-span-2">
            <SectionTitle title="Life Balance Overview" />
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis dataKey="subject" stroke={axisColor} fontSize={13} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#14b8a6"
                  fill="#14b8a6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip {...tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  )
}
