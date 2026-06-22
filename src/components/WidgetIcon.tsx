import {
  BookOpen,
  Moon,
  Dumbbell,
  CheckCircle2,
  Book,
  Brain,
  Briefcase,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { DashboardMetricType } from '../types'

const ICONS: Record<DashboardMetricType, LucideIcon> = {
  study: BookOpen,
  sleep: Moon,
  exercise: Dumbbell,
  reading: Book,
  meditation: Brain,
  work: Briefcase,
  checklist: CheckCircle2,
  custom: Sparkles,
}

export function WidgetIcon({
  type,
  className = 'w-5 h-5',
}: {
  type: DashboardMetricType
  className?: string
}) {
  const Icon = ICONS[type] ?? Sparkles
  return <Icon className={className} />
}
