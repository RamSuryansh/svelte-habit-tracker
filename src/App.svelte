<script lang="ts">
  import CalendarView from './components/calendar/CalendarView.svelte'
  import AllHabitsView from './components/habits/AllHabitsView.svelte'
  import HabitForm from './components/habits/HabitForm.svelte'
  import HabitList from './components/habits/HabitList.svelte'
  import Header from './components/layout/Header.svelte'
  import Navigation from './components/layout/Navigation.svelte'
  import StatsView from './components/stats/StatsView.svelte'
  import {
    habitStore,
    markNotified,
    resetDailyReminders,
  } from './stores/habitStore.svelte'
  import type { Habit, View } from './types'
  import { getToday } from './utils/date'
  import { getPermissionStatus, requestPermission, showNotification } from './utils/notifications'

  const VIEW_ROUTES = {
    today: '/',
    calendar: '/calendar',
    stats: '/stats',
    habits: '/habits',
  } satisfies Record<View, string>

  const ROUTE_VIEWS: Record<string, View> = {
    '/': 'today',
    '/today': 'today',
    '/calendar': 'calendar',
    '/stats': 'stats',
    '/habits': 'habits',
  }

  const VIEW_TITLES = {
    today: 'Today',
    calendar: 'Calendar',
    stats: 'Stats',
    habits: 'Habits',
  } satisfies Record<View, string>

  function normalizePath(pathname: string): string {
    const path = pathname.replace(/\/+$/, '')
    return path || '/'
  }

  function viewFromPath(pathname: string): View {
    return ROUTE_VIEWS[normalizePath(pathname)] ?? 'today'
  }

  let activeView = $state<View>(viewFromPath(window.location.pathname))
  let showForm = $state(false)
  let editingHabit = $state<Habit | null>(null)
  let lastReminderDate = getToday()

  $effect(() => {
    const currentPath = normalizePath(window.location.pathname)
    const canonicalPath = VIEW_ROUTES[activeView]
    if (currentPath !== canonicalPath) {
      window.history.replaceState({ view: activeView }, '', canonicalPath)
    }
  })

  $effect(() => {
    const title = VIEW_TITLES[activeView]
    document.title = title === 'Today' ? 'Habit Tracker' : `${title} | Habit Tracker`
  })

  $effect(() => {
    document.documentElement.classList.toggle('dark', habitStore.theme === 'dark')
  })

  $effect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  })

  $effect(() => {
    const hasAnyReminder = habitStore.habits.some((habit) => habit.reminderEnabled && !habit.archived)
    if (hasAnyReminder && getPermissionStatus() === 'default') {
      requestPermission()
    }
  })

  $effect(() => {
    function checkReminders(): void {
      const now = new Date()
      const todayKey = getToday()
      const dayOfWeek = now.getDay()
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes(),
      ).padStart(2, '0')}`

      if (lastReminderDate !== todayKey) {
        resetDailyReminders(todayKey)
        lastReminderDate = todayKey
      }

      for (const habit of habitStore.habits) {
        if (habit.archived) continue
        if (!habit.reminderEnabled) continue
        if (!habit.targetDays.includes(dayOfWeek)) continue
        if (habitStore.completions[todayKey]?.includes(habit.id)) continue
        if (currentTime < habit.reminderTime) continue
        if (habitStore.notifiedToday[todayKey]?.includes(habit.id)) continue

        showNotification(
          `${habit.emoji} ${habit.name}`,
          habit.description || 'Time to work on your habit!',
          `habit-${habit.id}-${todayKey}`,
        )
        markNotified(habit.id, todayKey)
      }
    }

    checkReminders()
    const interval = window.setInterval(checkReminders, 30_000)

    function handleVisibilityChange(): void {
      if (document.visibilityState === 'visible') checkReminders()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  })

  function handleAddHabit(): void {
    editingHabit = null
    showForm = true
  }

  function handleEditHabit(habit: Habit): void {
    editingHabit = habit
    showForm = true
  }

  function handleCloseForm(): void {
    showForm = false
    editingHabit = null
  }

  function navigateToView(view: View): void {
    const nextPath = VIEW_ROUTES[view]
    if (normalizePath(window.location.pathname) !== nextPath) {
      window.history.pushState({ view }, '', nextPath)
    }
    activeView = view
  }

  function handlePopState(): void {
    activeView = viewFromPath(window.location.pathname)
  }
</script>

<svelte:window onpopstate={handlePopState} />

<div
  class="min-h-[100svh] bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-slate-950 dark:text-white"
>
  <div
    class="mx-auto flex min-h-[100svh] max-w-2xl flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+5.75rem)] pt-[env(safe-area-inset-top)] sm:pb-8"
  >
    <Header onAddHabit={handleAddHabit} />
    <Navigation {activeView} routes={VIEW_ROUTES} onViewChange={navigateToView} />

    <main class="flex-1">
      {#if activeView === 'today'}
        <HabitList onEditHabit={handleEditHabit} onAddHabit={handleAddHabit} />
      {:else if activeView === 'calendar'}
        <CalendarView onEditHabit={handleEditHabit} />
      {:else if activeView === 'stats'}
        <StatsView />
      {:else if activeView === 'habits'}
        <AllHabitsView onEditHabit={handleEditHabit} />
      {/if}
    </main>
  </div>

  {#if showForm}
    <HabitForm open={showForm} onClose={handleCloseForm} {editingHabit} />
  {/if}
</div>
