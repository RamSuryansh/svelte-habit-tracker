<script lang="ts">
  import ProgressRing from '../ui/ProgressRing.svelte'
  import HabitCard from './HabitCard.svelte'
  import { getHabitsForDay, habitStore } from '../../stores/habitStore.svelte'
  import type { Habit } from '../../types'
  import { computeHabitStats } from '../../utils/stats'
  import { Target } from 'lucide-svelte'

  interface Props {
    onEditHabit: (habit: Habit) => void
    onAddHabit: () => void
  }

  let { onEditHabit, onAddHabit }: Props = $props()
  let stats = $derived(computeHabitStats(habitStore.habits, habitStore.completions))
  let todayHabits = $derived(getHabitsForDay(habitStore.habits, new Date().getDay()))
  let progress = $derived(stats.todayTotal > 0 ? stats.todayCompleted / stats.todayTotal : 0)
  let perHabitMap = $derived(new Map(stats.perHabit.map((item) => [item.habit.id, item])))
  let remaining = $derived(stats.todayTotal - stats.todayCompleted)
</script>

{#if todayHabits.length === 0}
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
      <Target size={36} class="text-indigo-500" />
    </div>
    <h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">No habits yet</h3>
    <p class="mb-6 max-w-xs text-sm text-gray-500 dark:text-slate-400">
      Start building better habits today. Add your first habit to get started.
    </p>
    <button
      type="button"
      onclick={onAddHabit}
      class="cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
    >
      Create your first habit
    </button>
  </div>
{:else}
  <div>
    <div class="mb-6 flex items-center gap-5 rounded-3xl border border-indigo-100 bg-white p-4 shadow-sm dark:border-indigo-500/10 dark:bg-slate-800/70">
      <ProgressRing {progress} size={80} strokeWidth={6}>
        <div class="text-center">
          <p class="text-lg font-bold leading-none text-gray-900 dark:text-white">
            {stats.todayCompleted}
          </p>
          <p class="text-[10px] text-gray-400 dark:text-slate-500">of {stats.todayTotal}</p>
        </div>
      </ProgressRing>
      <div class="min-w-0">
        <p class="text-sm font-medium text-gray-900 dark:text-white">
          {progress === 1
            ? 'All done! Great job!'
            : progress >= 0.5
              ? 'Keep going, almost there!'
              : "Let's build those habits!"}
        </p>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
          {remaining === 0
            ? 'You completed all habits today'
            : `${remaining} habit${remaining > 1 ? 's' : ''} remaining`}
        </p>
      </div>
    </div>

    <div class="space-y-3">
      {#each todayHabits as habit (habit.id)}
        <HabitCard
          {habit}
          streak={perHabitMap.get(habit.id)?.currentStreak ?? 0}
          onEdit={onEditHabit}
        />
      {/each}
    </div>
  </div>
{/if}
