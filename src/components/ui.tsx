import { type ReactNode } from 'react'
import { Pencil, X, Plus } from 'lucide-react'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  accent?: boolean
}

export function Card({ children, className = '', glow, accent }: CardProps) {
  return (
    <div
      className={`glass rounded-2xl p-5 sm:p-6 relative ${glow ? 'pulse-glow' : ''} ${
        accent ? 'chart-card overflow-hidden' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: ReactNode
  subtitle?: string
  action?: ReactNode
  badge?: string
}

export function PageHeader({ title, subtitle, action, badge }: PageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-1">
      <div>
        {badge && <span className="category-pill mb-2">{badge}</span>}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight theme-text">{title}</h2>
        {subtitle && <p className="theme-muted text-sm mt-1.5">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </header>
  )
}

interface SectionTitleProps {
  icon?: ReactNode
  title: string
  subtitle?: string
  className?: string
  iconBare?: boolean
}

export function SectionTitle({ icon, title, subtitle, className = '', iconBare }: SectionTitleProps) {
  return (
    <div className={`flex items-center gap-2.5 mb-4 ${className}`}>
      {icon && (
        iconBare ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : (
          <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 flex-shrink-0">{icon}</div>
        )
      )}
      <div>
        <h3 className="font-semibold theme-text text-base">{title}</h3>
        {subtitle && <p className="text-xs theme-muted mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

interface TabGroupProps {
  tabs: { id: string; label: string; icon?: ReactNode }[]
  value: string
  onChange: (id: string) => void
  className?: string
}

export function TabGroup({ tabs, value, onChange, className = '' }: TabGroupProps) {
  return (
    <div className={`inline-flex flex-wrap gap-1 p-1 rounded-xl glass-light ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            value === tab.id
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/20'
              : 'theme-muted hover:theme-text hover:bg-white/5'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: ReactNode
  color: string
  progress?: number
  compact?: boolean
  editing?: boolean
  onEdit?: () => void
  onRemove?: () => void
}

export function StatCard({
  label, value, sub, icon, color, progress,
  editing, onEdit, onRemove,
}: StatCardProps) {
  return (
    <Card
      className={`relative overflow-hidden !p-0 ${
        editing ? 'ring-2 ring-dashed ring-teal-500/50' : 'hover:-translate-y-0.5'
      } transition-transform duration-200`}
    >
      <div className="p-3.5 sm:p-4">
        {editing && (
          <div className="absolute top-2 right-2 flex gap-1 z-10">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="p-1.5 rounded-lg glass-light text-teal-400 hover:bg-teal-500/20 transition-colors"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 rounded-lg glass-light text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        <div
          className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.08]"
          style={{ background: color }}
        />
        <div className="flex items-start justify-between gap-2 relative">
          <div className="min-w-0 flex-1">
            <p className="theme-muted font-medium truncate text-xs">{label}</p>
            <p className="font-bold mt-1 truncate text-xl" style={{ color }}>{value}</p>
            {sub && <p className="theme-muted mt-1 truncate text-[10px] leading-relaxed">{sub}</p>}
          </div>
          <div className="p-2 rounded-xl flex-shrink-0" style={{ background: `${color}18`, color }}>
            {icon}
          </div>
        </div>
        {progress !== undefined && (
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--progress-track)' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: `linear-gradient(90deg, ${color}, ${color}99)`,
              }}
            />
          </div>
        )}
      </div>
    </Card>
  )
}

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function Button({
  children, onClick, variant = 'primary', size = 'md',
  className = '', type = 'button', disabled,
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white shadow-lg shadow-teal-500/20',
    secondary: 'glass-light theme-secondary hover:bg-white/8 border border-transparent hover:border-teal-500/20',
    danger: 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/25',
    ghost: 'theme-muted hover:theme-text hover:bg-white/5',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-3 text-base' }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

interface InputProps {
  label?: string
  value: string | number
  onChange: (val: string) => void
  type?: string
  placeholder?: string
  className?: string
}

export function Input({ label, value, onChange, type = 'text', placeholder, className = '' }: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium theme-muted mb-1.5 uppercase tracking-wide">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  )
}

interface SelectProps {
  label?: string
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
  className?: string
}

export function Select({ label, value, onChange, options, className = '' }: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium theme-muted mb-1.5 uppercase tracking-wide">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field cursor-pointer appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          paddingRight: '2.5rem',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-slate-900">{o.label}</option>
        ))}
      </select>
    </div>
  )
}

interface ProgressRingProps {
  value: number
  max: number
  size?: number
  stroke?: number
  color?: string
  label?: string
}

export function ProgressRing({
  value, max, size = 80, stroke = 6, color = '#14b8a6', label,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const offset = circumference * (1 - pct)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--ring-bg)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-base font-bold" style={{ color }}>{Math.round(pct * 100)}%</span>
        {label && <p className="text-[9px] theme-muted mt-0.5 font-medium">{label}</p>}
      </div>
    </div>
  )
}

export function PeriodSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const periods = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ]
  return (
    <div className="flex gap-0.5 p-1 rounded-xl glass-light">
      {periods.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
            value === p.value
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-sm'
              : 'theme-muted hover:theme-text'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}

export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="p-5 rounded-2xl glass-light theme-muted mb-4 opacity-80">{icon}</div>
      <h3 className="text-base font-semibold theme-secondary">{title}</h3>
      <p className="text-sm theme-muted mt-1.5 max-w-xs leading-relaxed">{description}</p>
    </div>
  )
}

export function InfoBanner({
  children, variant = 'info', icon,
}: { children: ReactNode; variant?: 'info' | 'warning' | 'success'; icon?: ReactNode }) {
  const styles = {
    info: 'border-teal-500/25 bg-teal-500/8',
    warning: 'border-amber-500/30 bg-amber-500/10',
    success: 'border-emerald-500/30 bg-emerald-500/10',
  }
  return (
    <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${styles[variant]}`}>
      {icon && <span className="flex-shrink-0 mt-0.5">{icon}</span>}
      <div className="text-sm theme-muted leading-relaxed">{children}</div>
    </div>
  )
}

export function ActivityRow({
  color, title, subtitle, value, onRemove,
}: { color: string; title: string; subtitle?: string; value: string; onRemove?: () => void }) {
  return (
    <div className="list-item glass-light group">
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 8px ${color}55` }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium theme-text truncate">{title}</p>
        {subtitle && <p className="text-xs theme-muted truncate mt-0.5">{subtitle}</p>}
      </div>
      <span className="text-sm font-semibold flex-shrink-0" style={{ color }}>{value}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export function ProgressBar({
  pct, color, warning, height = 'md',
}: { pct: number; color?: string; warning?: boolean; height?: 'sm' | 'md' }) {
  const h = height === 'sm' ? 'h-1.5' : 'h-2'
  return (
    <div className={`${h} rounded-full overflow-hidden`} style={{ background: 'var(--progress-track)' }}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${Math.min(pct, 100)}%`,
          background: warning
            ? 'linear-gradient(90deg, #f59e0b, #f97316)'
            : color
              ? `linear-gradient(90deg, ${color}, ${color}aa)`
              : 'linear-gradient(90deg, #14b8a6, #2dd4bf)',
        }}
      />
    </div>
  )
}

export function MiniStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="text-center p-4 rounded-xl glass-light transition-transform hover:-translate-y-0.5">
      <p className="text-2xl font-bold tracking-tight" style={{ color }}>{value}</p>
      <p className="text-[10px] theme-muted mt-1.5 font-semibold uppercase tracking-wider">{label}</p>
    </div>
  )
}

export function DashedAddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass rounded-2xl p-3.5 border-2 border-dashed border-teal-500/30 hover:border-teal-500/60 flex flex-col items-center justify-center gap-2 min-h-[100px] transition-all theme-muted hover:text-teal-400"
    >
      <Plus className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}
