'use client'

import { ListChecks, BarChart3 } from 'lucide-react'

export type View = 'list' | 'stats'

type Props = {
  view: View
  onChange: (v: View) => void
  listBadge?: number
}

export default function BottomNav({ view, onChange, listBadge = 0 }: Props) {
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 inset-x-0 z-30 safe-bottom pointer-events-none"
    >
      <div className="max-w-2xl mx-auto px-4 pb-2 pointer-events-auto">
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/40 dark:border-slate-700/40 rounded-2xl shadow-[0_8px_30px_-8px_rgba(139,92,246,0.25)] dark:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)] flex p-1.5 gap-1">
          <TabButton
            active={view === 'list'}
            onClick={() => onChange('list')}
            icon={<ListChecks size={20} strokeWidth={2.2} />}
            label="Liste"
            badge={listBadge}
          />
          <TabButton
            active={view === 'stats'}
            onClick={() => onChange('stats')}
            icon={<BarChart3 size={20} strokeWidth={2.2} />}
            label="Stats"
          />
        </div>
      </div>
    </nav>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge = 0,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex-1 flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-sm transition-all touch-press ${
        active
          ? 'bg-violet-600 text-white shadow-md shadow-violet-300/50 dark:shadow-none'
          : 'text-slate-500 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-800'
      }`}
    >
      <span className="relative flex items-center justify-center">
        {icon}
        {badge > 0 && !active && (
          <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      <span>{label}</span>
    </button>
  )
}
