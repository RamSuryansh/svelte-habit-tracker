<script lang="ts">
  import {
    archiveHabit,
    deleteHabit,
    habitStore,
    toggleCompletion,
  } from '../../stores/habitStore.svelte'
  import type { Habit } from '../../types'
  import { formatTime, getToday } from '../../utils/date'
  import { Archive, Check, Clock, Flame, MoreHorizontal, Pencil, Trash2 } from 'lucide-svelte'

  interface Props {
    habit: Habit
    date?: string
    streak?: number
    onEdit: (habit: Habit) => void
  }

  let { habit, date, streak = 0, onEdit }: Props = $props()
  let showMenu = $state(false)
  let dateKey = $derived(date ?? getToday())
  let isCompleted = $derived(habitStore.completions[dateKey]?.includes(habit.id) ?? false)
</script>

<div
  class={[
    'group relative flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200',
    isCompleted
      ? 'border-gray-200 bg-gray-50 dark:border-slate-700/50 dark:bg-slate-800/50'
      : 'border-gray-200 bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:shadow-slate-950/50',
  ]}
>
  <button
    type="button"
    onclick={() => toggleCompletion(habit.id, dateKey)}
    class="shrink-0 cursor-pointer"
    aria-label={isCompleted ? `Mark ${habit.name} incomplete` : `Complete ${habit.name}`}
  >
    <div
      class={[
        'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200',
        isCompleted ? 'scale-95' : 'hover:scale-105',
      ]}
      style={`background-color: ${isCompleted ? habit.color : `${habit.color}15`}; border: ${
        isCompleted ? '0' : `2px solid ${habit.color}40`
      }`}
    >
      {#if isCompleted}
        <Check size={20} class="text-white" strokeWidth={3} />
      {:else}
        <span class="text-lg">{habit.emoji}</span>
      {/if}
    </div>
  </button>

  <div class="min-w-0 flex-1">
    <div class="flex items-center gap-2">
      <p
        class={[
          'truncate font-medium transition-all duration-200',
          isCompleted
            ? 'text-gray-400 line-through dark:text-slate-500'
            : 'text-gray-900 dark:text-white',
        ]}
      >
        {habit.name}
      </p>
      {#if streak >= 3 && !isCompleted}
        <span class="flex items-center gap-0.5 text-xs font-medium text-orange-500 dark:text-orange-400">
          <Flame size={14} /> {streak}
        </span>
      {/if}
    </div>
    {#if habit.description}
      <p class="mt-0.5 truncate text-xs text-gray-500 dark:text-slate-400">{habit.description}</p>
    {/if}
    {#if habit.reminderEnabled}
      <p class="mt-0.5 flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
        <Clock size={12} />
        {formatTime(habit.reminderTime, habitStore.timeFormat)}
      </p>
    {/if}
  </div>

  <div class="relative">
    <button
      type="button"
      onclick={() => (showMenu = !showMenu)}
      class="cursor-pointer rounded-lg p-1.5 text-gray-300 opacity-100 transition-colors hover:bg-gray-100 hover:text-gray-500 focus:opacity-100 dark:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300 sm:opacity-0 sm:group-hover:opacity-100"
      aria-label={`Open actions for ${habit.name}`}
    >
      <MoreHorizontal size={18} />
    </button>

    {#if showMenu}
      <button
        type="button"
        class="fixed inset-0 z-40 cursor-default"
        aria-label="Close habit actions"
        onclick={() => (showMenu = false)}
      ></button>
      <div
        class="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-gray-200 bg-white py-1 shadow-xl dark:border-slate-600 dark:bg-slate-700"
      >
        <button
          type="button"
          onclick={() => {
            onEdit(habit)
            showMenu = false
          }}
          class="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-600"
        >
          <Pencil size={15} /> Edit
        </button>
        <button
          type="button"
          onclick={() => {
            archiveHabit(habit.id)
            showMenu = false
          }}
          class="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-slate-600"
        >
          <Archive size={15} /> Archive
        </button>
        <button
          type="button"
          onclick={() => {
            if (confirm('Delete this habit and all its data?')) deleteHabit(habit.id)
            showMenu = false
          }}
          class="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <Trash2 size={15} /> Delete
        </button>
      </div>
    {/if}
  </div>
</div>
