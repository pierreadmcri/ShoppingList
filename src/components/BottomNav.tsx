'use client'

import { ShoppingBasket, ChartNoAxesColumnIncreasing } from 'lucide-react'

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
      <div className="max-w-2xl mx-auto px-3 pb-2 pointer-events-auto">
        <div className="bottom-bar flex p-1.5 gap-1">
          <TabButton
            active={view === 'list'}
            onClick={() => onChange('list')}
            icon={<ShoppingBasket size={20} strokeWidth={2.2} />}
            label="List"
            badge={listBadge}
          />
          <TabButton
            active={view === 'stats'}
            onClick={() => onChange('stats')}
            icon={<ChartNoAxesColumnIncreasing size={20} strokeWidth={2.2} />}
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
      className={`relative flex-1 flex items-center justify-center gap-2 h-12 rounded-full font-semibold text-sm transition-all touch-press ${
        active
          ? 'bg-terracotta text-white shadow-sm'
          : 'text-olive dark:text-sage active:bg-sand dark:active:bg-olive/30'
      }`}
    >
      <span className="relative flex items-center justify-center">
        {icon}
        {badge > 0 && !active && (
          <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-cobalt text-white text-[10px] font-bold flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      <span>{label}</span>
    </button>
  )
}
