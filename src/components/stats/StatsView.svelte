<script lang="ts">
  import CompletionChart from './CompletionChart.svelte'
  import StreakCard from './StreakCard.svelte'
  import { habitStore } from '../../stores/habitStore.svelte'
  import type { TimeRange } from '../../types'
  import { computeChartData, computeHabitStats } from '../../utils/stats'
  import { Award, BarChart3, TrendingUp, Zap } from 'lucide-svelte'

  let chartRange = $state<TimeRange>('7d')
  let stats = $derived(computeHabitStats(habitStore.habits, habitStore.completions))
  let chartData = $derived(computeChartData(habitStore.habits, habitStore.completions, chartRange))
  let bestHabit = $derived(
    stats.perHabit.reduce(
      (best, current) =>
        current.completionRate7d > (best?.completionRate7d ?? 0) ? current : best,
      stats.perHabit[0],
    ),
  )
</script>

{#if stats.totalHabits === 0}
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-500/10">
      <BarChart3 size={36} class="text-violet-500" />
    </div>
    <h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">No stats yet</h3>
    <p class="max-w-xs text-sm text-gray-500 dark:text-slate-400">
      Start tracking habits to see your statistics here.
    </p>
  </div>
{:else}
  <div class="space-y-4">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <StreakCard
        label="Current best streak"
        value={Math.max(0, ...stats.perHabit.map((habit) => habit.currentStreak))}
        type="current"
      />
      <StreakCard label="All-time best streak" value={stats.bestOverallStreak} type="best" />
    </div>

    <CompletionChart
      data={chartData}
      range={chartRange}
      onRangeChange={(range) => (chartRange = range)}
    />

    <div class="grid grid-cols-2 gap-3">
      <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-2 flex items-center gap-2">
          <TrendingUp size={16} class="text-green-500" />
          <span class="text-xs font-medium text-gray-500 dark:text-slate-400">7-day rate</span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {Math.round(stats.overallRate7d * 100)}%
        </p>
      </div>
      <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div class="mb-2 flex items-center gap-2">
          <TrendingUp size={16} class="text-blue-500" />
          <span class="text-xs font-medium text-gray-500 dark:text-slate-400">30-day rate</span>
        </div>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {Math.round(stats.overallRate30d * 100)}%
        </p>
      </div>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div class="mb-1 flex items-center gap-2">
        <Zap size={16} class="text-indigo-500" />
        <span class="text-xs font-medium text-gray-500 dark:text-slate-400">Total completions</span>
      </div>
      <p class="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCompletions}</p>
    </div>

    {#if bestHabit}
      <div
        class="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 p-4 dark:border-indigo-500/20"
      >
        <div class="mb-2 flex items-center gap-2">
          <Award size={16} class="text-indigo-500" />
          <span class="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            Most consistent (7d)
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-lg">{bestHabit.habit.emoji}</span>
          <span class="font-semibold text-gray-900 dark:text-white">{bestHabit.habit.name}</span>
          <span class="ml-auto text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {Math.round(bestHabit.completionRate7d * 100)}%
          </span>
        </div>
      </div>
    {/if}

    <div>
      <h3 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Per habit</h3>
      <div class="space-y-2">
        {#each stats.perHabit as habitStats (habitStats.habit.id)}
          <div
            class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
          >
            <span class="text-lg">{habitStats.habit.emoji}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {habitStats.habit.name}
              </p>
              <div class="mt-1 flex gap-3">
                <span class="text-xs text-gray-500 dark:text-slate-400">
                  Streak: {habitStats.currentStreak}d
                </span>
                <span class="text-xs text-gray-500 dark:text-slate-400">
                  Best: {habitStats.bestStreak}d
                </span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {Math.round(habitStats.completionRate7d * 100)}%
              </p>
              <p class="text-[10px] text-gray-400 dark:text-slate-500">7-day</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}
