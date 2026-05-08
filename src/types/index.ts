export type Theme = 'light' | 'dark'
export type TimeFormat = '12h' | '24h'
export type Frequency = 'daily' | 'custom'
export type View = 'today' | 'calendar' | 'stats' | 'habits'
export type TimeRange = '7d' | '30d' | '90d' | '180d' | '365d'

export interface ChartDataPoint {
  label: string
  completed: number
  total: number
  startDate: Date
  endDate: Date
}

export interface Habit {
  id: string
  name: string
  description: string
  emoji: string
  color: string
  category: string
  frequency: Frequency
  targetDays: number[]
  reminderEnabled: boolean
  reminderTime: string
  createdAt: string
  archived: boolean
}

export type HabitDraft = Omit<Habit, 'id' | 'createdAt' | 'archived'>
export type HabitUpdates = Partial<Omit<Habit, 'id' | 'createdAt'>>
export type Completions = Record<string, string[]>

export interface HabitState {
  habits: Habit[]
  completions: Completions
  theme: Theme
  timeFormat: TimeFormat
  notifiedToday: Record<string, string[]>
  dismissedReminders: string[]
}

export interface HabitStats {
  currentStreak: number
  bestStreak: number
  completionRate7d: number
  completionRate30d: number
  totalCompletions: number
}

export interface OverallStats {
  totalHabits: number
  totalCompletions: number
  overallRate7d: number
  overallRate30d: number
  bestOverallStreak: number
  todayCompleted: number
  todayTotal: number
  last7Days: { date: Date; completed: number; total: number }[]
  perHabit: (HabitStats & { habit: Habit })[]
}
