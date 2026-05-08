<script lang="ts">
  import type { View } from '../../types'
  import { BarChart3, Calendar, CheckCircle2, ListChecks } from 'lucide-svelte'

  interface Props {
    activeView: View
    routes: Record<View, string>
    onViewChange: (view: View) => void
  }

  let { activeView, routes, onViewChange }: Props = $props()

  function handleNavigate(event: MouseEvent, view: View): void {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return
    }

    event.preventDefault()
    onViewChange(view)
  }
</script>

<nav
  class="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/90 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-1 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:static sm:mb-6 sm:border-t-0 sm:bg-transparent sm:pb-0 sm:pt-0 sm:backdrop-blur-none sm:dark:bg-transparent"
  aria-label="Habit views"
>
  <div class="mx-auto flex max-w-4xl items-center justify-around px-4 sm:justify-start sm:gap-1 sm:px-0">
    <a
      href={routes.today}
      onclick={(event) => handleNavigate(event, 'today')}
      class={[
        'flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition-all duration-150 sm:min-h-0 sm:flex-row sm:gap-2 sm:py-2 sm:text-sm',
        activeView === 'today'
          ? 'text-indigo-600 dark:text-indigo-400 sm:bg-indigo-50 sm:dark:bg-indigo-500/10'
          : 'text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 sm:hover:bg-gray-50 sm:dark:hover:bg-slate-800',
      ]}
      aria-current={activeView === 'today' ? 'page' : undefined}
    >
      <CheckCircle2 size={20} strokeWidth={activeView === 'today' ? 2.5 : 2} />
      <span>Today</span>
    </a>

    <a
      href={routes.calendar}
      onclick={(event) => handleNavigate(event, 'calendar')}
      class={[
        'flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition-all duration-150 sm:min-h-0 sm:flex-row sm:gap-2 sm:py-2 sm:text-sm',
        activeView === 'calendar'
          ? 'text-indigo-600 dark:text-indigo-400 sm:bg-indigo-50 sm:dark:bg-indigo-500/10'
          : 'text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 sm:hover:bg-gray-50 sm:dark:hover:bg-slate-800',
      ]}
      aria-current={activeView === 'calendar' ? 'page' : undefined}
    >
      <Calendar size={20} strokeWidth={activeView === 'calendar' ? 2.5 : 2} />
      <span>Calendar</span>
    </a>

    <a
      href={routes.stats}
      onclick={(event) => handleNavigate(event, 'stats')}
      class={[
        'flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition-all duration-150 sm:min-h-0 sm:flex-row sm:gap-2 sm:py-2 sm:text-sm',
        activeView === 'stats'
          ? 'text-indigo-600 dark:text-indigo-400 sm:bg-indigo-50 sm:dark:bg-indigo-500/10'
          : 'text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 sm:hover:bg-gray-50 sm:dark:hover:bg-slate-800',
      ]}
      aria-current={activeView === 'stats' ? 'page' : undefined}
    >
      <BarChart3 size={20} strokeWidth={activeView === 'stats' ? 2.5 : 2} />
      <span>Stats</span>
    </a>

    <a
      href={routes.habits}
      onclick={(event) => handleNavigate(event, 'habits')}
      class={[
        'flex min-h-14 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition-all duration-150 sm:min-h-0 sm:flex-row sm:gap-2 sm:py-2 sm:text-sm',
        activeView === 'habits'
          ? 'text-indigo-600 dark:text-indigo-400 sm:bg-indigo-50 sm:dark:bg-indigo-500/10'
          : 'text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 sm:hover:bg-gray-50 sm:dark:hover:bg-slate-800',
      ]}
      aria-current={activeView === 'habits' ? 'page' : undefined}
    >
      <ListChecks size={20} strokeWidth={activeView === 'habits' ? 2.5 : 2} />
      <span>Habits</span>
    </a>
  </div>
</nav>
