<script lang="ts">
  import HabitCard from '../habits/HabitCard.svelte'
  import DayCell from './DayCell.svelte'
  import { getHabitsForDay, habitStore } from '../../stores/habitStore.svelte'
  import type { Habit } from '../../types'
  import { DAY_LABELS_SHORT } from '../../utils/constants'
  import { getCalendarDays, getDateKey } from '../../utils/date'
  import { addMonths, format, isSameDay, subMonths } from 'date-fns'
  import { cubicOut } from 'svelte/easing'
  import { fade, fly } from 'svelte/transition'
  import { ChevronLeft, ChevronRight } from 'lucide-svelte'

  interface Props {
    onEditHabit: (habit: Habit) => void
  }

  let { onEditHabit }: Props = $props()
  let currentMonth = $state(new Date())
  let selectedDate = $state<Date | null>(null)

  let calendarDays = $derived(getCalendarDays(currentMonth.getFullYear(), currentMonth.getMonth()))
  let dayCellData = $derived(
    calendarDays.map((date) => {
      const dateKey = getDateKey(date)
      const dayHabits = getHabitsForDay(habitStore.habits, date.getDay())
      const dayCompletions = habitStore.completions[dateKey] ?? []
      const completedCount = dayHabits.filter((habit) => dayCompletions.includes(habit.id)).length
      return { completedCount, total: dayHabits.length }
    }),
  )
  let selectedHabits = $derived(
    selectedDate ? getHabitsForDay(habitStore.habits, selectedDate.getDay()) : [],
  )
</script>

<div>
  <div class="mb-4 flex items-center justify-between gap-3">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
      {format(currentMonth, 'MMMM yyyy')}
    </h2>
    <div class="flex gap-1">
      <button
        type="button"
        onclick={() => (currentMonth = subMonths(currentMonth, 1))}
        class="cursor-pointer rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Previous month"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onclick={() => (currentMonth = new Date())}
        class="cursor-pointer rounded-xl px-3 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        Today
      </button>
      <button
        type="button"
        onclick={() => (currentMonth = addMonths(currentMonth, 1))}
        class="cursor-pointer rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Next month"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  </div>

  <div class="mb-1 grid grid-cols-7 gap-1">
    {#each DAY_LABELS_SHORT as label, index (`${label}-${index}`)}
      <div class="py-2 text-center text-xs font-medium text-gray-400 dark:text-slate-500">
        {label}
      </div>
    {/each}
  </div>

  {#key `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`}
    <div class="grid grid-cols-7 gap-1" in:fade={{ duration: 150 }}>
      {#each calendarDays as date, index (date.toISOString())}
        <DayCell
          {date}
          {currentMonth}
          selected={selectedDate != null && isSameDay(date, selectedDate)}
          onSelect={(nextDate) => (selectedDate = nextDate)}
          completedCount={dayCellData[index].completedCount}
          total={dayCellData[index].total}
        />
      {/each}
    </div>
  {/key}

  {#if selectedDate}
    <div class="mt-6" in:fly={{ y: 8, duration: 170, easing: cubicOut }} out:fade={{ duration: 100 }}>
      <h3 class="mb-3 text-sm font-medium text-gray-500 dark:text-slate-400">
        {format(selectedDate, 'EEEE, MMMM d')}
      </h3>
      {#if selectedHabits.length === 0}
        <p class="py-4 text-center text-sm text-gray-400 dark:text-slate-500">
          No habits scheduled for this day
        </p>
      {:else}
        <div class="space-y-2">
          {#each selectedHabits as habit (habit.id)}
            <HabitCard {habit} date={getDateKey(selectedDate)} onEdit={onEditHabit} />
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
