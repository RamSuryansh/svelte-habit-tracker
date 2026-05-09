<script lang="ts">
  import {
    archiveHabit,
    deleteHabit,
    getActiveHabits,
    getArchivedHabits,
    habitStore,
    unarchiveHabit,
  } from '../../stores/habitStore.svelte'
  import type { Habit } from '../../types'
  import { DAY_LABELS } from '../../utils/constants'
  import { flip } from 'svelte/animate'
  import { cubicOut } from 'svelte/easing'
  import { fade, fly } from 'svelte/transition'
  import { Archive, ArchiveRestore, ListChecks, Pencil, Trash2 } from 'lucide-svelte'

  type Filter = 'all' | 'active' | 'archived'

  interface Props {
    onEditHabit: (habit: Habit) => void
  }

  let { onEditHabit }: Props = $props()
  let filter = $state<Filter>('all')
  let confirmDeleteId = $state<string | null>(null)

  let active = $derived(getActiveHabits(habitStore.habits))
  let archived = $derived(getArchivedHabits(habitStore.habits))
  let filtered = $derived(
    filter === 'active' ? active : filter === 'archived' ? archived : [...active, ...archived],
  )
  let filters = $derived([
    { key: 'all' as const, label: 'All', count: habitStore.habits.length },
    { key: 'active' as const, label: 'Active', count: active.length },
    { key: 'archived' as const, label: 'Archived', count: archived.length },
  ])

  function formatFrequency(habit: Habit): string {
    if (habit.frequency === 'daily') return 'Every day'
    return habit.targetDays.map((day) => DAY_LABELS[day]).join(', ')
  }
</script>

{#if habitStore.habits.length === 0}
  <div class="flex flex-col items-center justify-center py-20 text-center" in:fade={{ duration: 160 }}>
    <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10">
      <ListChecks size={36} class="text-indigo-500" />
    </div>
    <h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">No habits yet</h3>
    <p class="max-w-xs text-sm text-gray-500 dark:text-slate-400">
      Create habits from the Today tab to see them here.
    </p>
  </div>
{:else}
  <div class="space-y-4">
    <div class="flex flex-wrap gap-2">
      {#each filters as option (option.key)}
        <button
          type="button"
          onclick={() => (filter = option.key)}
          class={[
            'cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-all',
            filter === option.key
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600',
          ]}
        >
          {option.label} ({option.count})
        </button>
      {/each}
    </div>

    {#if filtered.length === 0}
      <div
        class="flex flex-col items-center justify-center py-16 text-center"
        in:fade={{ duration: 140 }}
      >
        <p class="text-sm text-gray-500 dark:text-slate-400">
          No {filter === 'archived' ? 'archived' : 'active'} habits
        </p>
      </div>
    {:else}
      <div class="space-y-2">
        {#each filtered as habit (habit.id)}
          <div
            class={[
              'flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800',
              habit.archived ? 'opacity-60' : '',
            ]}
            animate:flip={{ duration: 180 }}
            in:fly={{ y: 8, duration: 170, easing: cubicOut }}
            out:fade={{ duration: 100 }}
          >
            <div
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={`background-color: ${habit.color}15; border: 2px solid ${habit.color}40`}
            >
              <span class="text-lg">{habit.emoji}</span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <p class="truncate text-sm font-medium text-gray-900 dark:text-white">{habit.name}</p>
                {#if habit.archived}
                  <span
                    class="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-slate-700 dark:text-slate-400"
                  >
                    Archived
                  </span>
                {/if}
              </div>
              <div class="mt-0.5 flex items-center gap-2">
                <span class="text-xs text-gray-500 dark:text-slate-400">
                  {formatFrequency(habit)}
                </span>
                <span class="text-xs text-gray-300 dark:text-slate-600">|</span>
                <span class="text-xs text-gray-400 dark:text-slate-500">{habit.category}</span>
              </div>
            </div>

            {#if confirmDeleteId === habit.id}
              <div class="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onclick={() => {
                    deleteHabit(habit.id)
                    confirmDeleteId = null
                  }}
                  class="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onclick={() => (confirmDeleteId = null)}
                  class="cursor-pointer rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            {:else}
              <div class="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onclick={() => onEditHabit(habit)}
                  class="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  title="Edit"
                  aria-label={`Edit ${habit.name}`}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onclick={() => (habit.archived ? unarchiveHabit(habit.id) : archiveHabit(habit.id))}
                  class="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  title={habit.archived ? 'Unarchive' : 'Archive'}
                  aria-label={habit.archived ? `Unarchive ${habit.name}` : `Archive ${habit.name}`}
                >
                  {#if habit.archived}
                    <ArchiveRestore size={16} />
                  {:else}
                    <Archive size={16} />
                  {/if}
                </button>
                <button
                  type="button"
                  onclick={() => (confirmDeleteId = habit.id)}
                  class="cursor-pointer rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  title="Delete"
                  aria-label={`Delete ${habit.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}
