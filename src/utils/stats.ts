import type { ChartDataPoint, Completions, Habit, OverallStats, TimeRange } from '../types'
import {
  formatDate,
  getDateKey,
  getDateRange,
  getLast7Days,
  getMonthBuckets,
  getWeekBuckets,
} from './date'
import { eachDayOfInterval, subDays } from 'date-fns'

function computeStreak(
  habitId: string,
  targetDays: number[],
  completions: Completions,
): { current: number; best: number } {
  const today = new Date()
  let current = 0
  let best = 0
  let streak = 0
  let broken = false

  for (let i = 0; i < 365; i += 1) {
    const date = subDays(today, i)
    if (!targetDays.includes(date.getDay())) continue

    const completed = completions[getDateKey(date)]?.includes(habitId) ?? false
    if (completed) {
      streak += 1
      if (!broken) current = streak
      best = Math.max(best, streak)
    } else {
      if (!broken) broken = true
      streak = 0
      if (best >= 365 - i) break
    }
  }

  return { current, best }
}

function computeRate(
  habitId: string,
  targetDays: number[],
  completions: Completions,
  days: number,
): number {
  const today = new Date()
  let eligible = 0
  let completed = 0

  for (let i = 0; i < days; i += 1) {
    const date = subDays(today, i)
    if (!targetDays.includes(date.getDay())) continue
    eligible += 1
    if (completions[getDateKey(date)]?.includes(habitId)) completed += 1
  }

  return eligible === 0 ? 0 : completed / eligible
}

export function computeHabitStats(habits: Habit[], completions: Completions): OverallStats {
  const active = habits.filter((habit) => !habit.archived)
  const today = new Date()
  const todayKey = getDateKey(today)
  const todayHabits = active.filter((habit) => habit.targetDays.includes(today.getDay()))
  const todayCompleted = todayHabits.filter((habit) =>
    completions[todayKey]?.includes(habit.id),
  ).length

  const perHabit = active.map((habit) => {
    const { current, best } = computeStreak(habit.id, habit.targetDays, completions)
    return {
      habit,
      currentStreak: current,
      bestStreak: best,
      completionRate7d: computeRate(habit.id, habit.targetDays, completions, 7),
      completionRate30d: computeRate(habit.id, habit.targetDays, completions, 30),
      totalCompletions: Object.values(completions).filter((ids) => ids.includes(habit.id)).length,
    }
  })

  const last7Days = getLast7Days().map((date) => {
    const key = getDateKey(date)
    const dayHabits = active.filter((habit) => habit.targetDays.includes(date.getDay()))
    const completed = dayHabits.filter((habit) => completions[key]?.includes(habit.id)).length
    return { date, completed, total: dayHabits.length }
  })

  const rates7d = perHabit.map((habit) => habit.completionRate7d)
  const rates30d = perHabit.map((habit) => habit.completionRate30d)

  return {
    totalHabits: active.length,
    totalCompletions: Object.values(completions).reduce((sum, ids) => sum + ids.length, 0),
    overallRate7d: rates7d.length > 0 ? rates7d.reduce((a, b) => a + b, 0) / rates7d.length : 0,
    overallRate30d:
      rates30d.length > 0 ? rates30d.reduce((a, b) => a + b, 0) / rates30d.length : 0,
    bestOverallStreak: Math.max(0, ...perHabit.map((habit) => habit.bestStreak)),
    todayCompleted,
    todayTotal: todayHabits.length,
    last7Days,
    perHabit,
  }
}

const RANGE_DAYS: Record<TimeRange, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '180d': 180,
  '365d': 365,
}

function computeBucketData(
  daysInBucket: Date[],
  activeHabits: Pick<Habit, 'id' | 'targetDays'>[],
  completions: Completions,
): { completed: number; total: number } {
  let completed = 0
  let total = 0

  for (const date of daysInBucket) {
    const key = getDateKey(date)
    const dayHabits = activeHabits.filter((habit) => habit.targetDays.includes(date.getDay()))
    total += dayHabits.length
    completed += dayHabits.filter((habit) => completions[key]?.includes(habit.id)).length
  }

  return { completed, total }
}

export function computeChartData(
  habits: Habit[],
  completions: Completions,
  range: TimeRange,
): ChartDataPoint[] {
  const active = habits.filter((habit) => !habit.archived)
  const days = RANGE_DAYS[range]
  const today = new Date()
  const startDate = subDays(today, days - 1)

  if (range === '7d' || range === '30d') {
    return getDateRange(days).map((date) => {
      const key = getDateKey(date)
      const dayHabits = active.filter((habit) => habit.targetDays.includes(date.getDay()))
      const completed = dayHabits.filter((habit) => completions[key]?.includes(habit.id)).length
      return {
        label: formatDate(date, range === '7d' ? 'EEE' : 'd'),
        completed,
        total: dayHabits.length,
        startDate: date,
        endDate: date,
      }
    })
  }

  const buckets =
    range === '365d' ? getMonthBuckets(startDate, today) : getWeekBuckets(startDate, today)

  return buckets.map((bucket) => {
    const daysInBucket = eachDayOfInterval({ start: bucket.start, end: bucket.end })
    const { completed, total } = computeBucketData(daysInBucket, active, completions)
    return {
      label: bucket.label,
      completed,
      total,
      startDate: bucket.start,
      endDate: bucket.end,
    }
  })
}
