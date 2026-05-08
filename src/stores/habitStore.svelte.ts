import type { Completions, Habit, HabitDraft, HabitState, HabitUpdates, Theme, TimeFormat } from '../types'

const STORAGE_KEY = 'habit-tracker-storage'

const initialState: HabitState = {
  habits: [],
  completions: {},
  theme: 'dark',
  timeFormat: '12h',
  notifiedToday: {},
  dismissedReminders: [],
}

function loadState(): HabitState {
  if (typeof localStorage === 'undefined') return structuredClone(initialState)

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(initialState)
    const saved = JSON.parse(raw) as Partial<HabitState>
    return {
      ...structuredClone(initialState),
      ...saved,
      habits: saved.habits ?? [],
      completions: saved.completions ?? {},
      notifiedToday: saved.notifiedToday ?? {},
      dismissedReminders: saved.dismissedReminders ?? [],
    }
  } catch {
    return structuredClone(initialState)
  }
}

export const habitStore = $state<HabitState>(loadState())

function persist(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      habits: habitStore.habits,
      completions: habitStore.completions,
      theme: habitStore.theme,
      timeFormat: habitStore.timeFormat,
      notifiedToday: habitStore.notifiedToday,
      dismissedReminders: habitStore.dismissedReminders,
    }),
  )
}

export function addHabit(habitData: HabitDraft): void {
  habitStore.habits = [
    ...habitStore.habits,
    {
      ...habitData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      archived: false,
    },
  ]
  persist()
}

export function editHabit(id: string, updates: HabitUpdates): void {
  habitStore.habits = habitStore.habits.map((habit) =>
    habit.id === id ? { ...habit, ...updates } : habit,
  )
  persist()
}

export function deleteHabit(id: string): void {
  const completions: Completions = Object.fromEntries(
    Object.entries(habitStore.completions).map(([date, ids]) => [
      date,
      ids.filter((habitId) => habitId !== id),
    ]),
  )
  habitStore.habits = habitStore.habits.filter((habit) => habit.id !== id)
  habitStore.completions = completions
  persist()
}

export function archiveHabit(id: string): void {
  editHabit(id, { archived: true })
}

export function unarchiveHabit(id: string): void {
  editHabit(id, { archived: false })
}

export function toggleCompletion(habitId: string, date: string): void {
  const dayCompletions = habitStore.completions[date] ?? []
  const isCompleted = dayCompletions.includes(habitId)
  habitStore.completions = {
    ...habitStore.completions,
    [date]: isCompleted
      ? dayCompletions.filter((id) => id !== habitId)
      : [...dayCompletions, habitId],
  }
  persist()
}

export function setTheme(theme: Theme): void {
  habitStore.theme = theme
  persist()
}

export function toggleTheme(): void {
  setTheme(habitStore.theme === 'dark' ? 'light' : 'dark')
}

export function setTimeFormat(timeFormat: TimeFormat): void {
  habitStore.timeFormat = timeFormat
  persist()
}

export function markNotified(habitId: string, date: string): void {
  habitStore.notifiedToday = {
    ...habitStore.notifiedToday,
    [date]: [...(habitStore.notifiedToday[date] ?? []), habitId],
  }
  persist()
}

export function resetDailyReminders(date: string): void {
  habitStore.notifiedToday =
    date in habitStore.notifiedToday ? { [date]: habitStore.notifiedToday[date] } : {}
  habitStore.dismissedReminders = []
  persist()
}

export function getActiveHabits(habits: Habit[]): Habit[] {
  return habits.filter((habit) => !habit.archived)
}

export function getArchivedHabits(habits: Habit[]): Habit[] {
  return habits.filter((habit) => habit.archived)
}

export function getHabitsForDay(habits: Habit[], dayOfWeek: number): Habit[] {
  return getActiveHabits(habits).filter((habit) => habit.targetDays.includes(dayOfWeek))
}
