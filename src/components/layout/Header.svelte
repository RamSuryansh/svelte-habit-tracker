<script lang="ts">
  import Button from '../ui/Button.svelte'
  import { habitStore, setTimeFormat, toggleTheme } from '../../stores/habitStore.svelte'
  import type { TimeFormat } from '../../types'
  import { fade } from 'svelte/transition'
  import { Clock, Moon, Plus, Settings, Sun } from 'lucide-svelte'

  interface Props {
    onAddHabit: () => void
  }

  let { onAddHabit }: Props = $props()
  let showSettings = $state(false)
  const formats: TimeFormat[] = ['12h', '24h']

  let todayLabel = $derived(
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }),
  )
</script>

<header
  class="sticky top-0 z-30 -mx-4 flex items-center justify-between gap-4 bg-gray-50/90 px-4 py-4 backdrop-blur-xl dark:bg-slate-950/90"
>
  <div class="min-w-0">
    <h1 class="text-2xl font-bold tracking-tight text-gray-950 dark:text-white">Habit Tracker</h1>
    <p class="mt-0.5 text-sm text-gray-500 dark:text-slate-400">{todayLabel}</p>
  </div>

  <div class="flex shrink-0 items-center gap-2">
    <button
      type="button"
      onclick={toggleTheme}
      class="cursor-pointer rounded-xl p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {#if habitStore.theme === 'dark'}
        <Sun size={20} />
      {:else}
        <Moon size={20} />
      {/if}
    </button>

    <div class="relative">
      <button
        type="button"
        onclick={() => (showSettings = !showSettings)}
        class="cursor-pointer rounded-xl p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        aria-label="Settings"
        title="Settings"
      >
        <Settings size={20} />
      </button>

      {#if showSettings}
        <button
          type="button"
          class="fixed inset-0 z-40 cursor-default"
          aria-label="Close settings"
          onclick={() => (showSettings = false)}
        ></button>
        <div
          class="menu-panel absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-gray-200 bg-white py-2 shadow-xl dark:border-slate-600 dark:bg-slate-700"
          out:fade={{ duration: 80 }}
        >
          <div class="px-3 py-2">
            <p
              class="mb-2 flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400"
            >
              <Clock size={14} /> Time Format
            </p>
            <div class="grid grid-cols-2 gap-1">
              {#each formats as format (format)}
                <button
                  type="button"
                  onclick={() => setTimeFormat(format)}
                  class={[
                    'cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                    habitStore.timeFormat === format
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-600 dark:text-gray-300 dark:hover:bg-slate-500',
                  ]}
                >
                  {format === '12h' ? '12 Hour' : '24 Hour'}
                </button>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>

    <Button onclick={onAddHabit} size="sm">
      <Plus size={18} />
      <span class="hidden sm:inline">Add Habit</span>
    </Button>
  </div>
</header>
