<script lang="ts">
  import Button from '../ui/Button.svelte'
  import Modal from '../ui/Modal.svelte'
  import { addHabit, editHabit } from '../../stores/habitStore.svelte'
  import type { Frequency, Habit, HabitDraft } from '../../types'
  import { CATEGORIES, COLORS, DAY_LABELS, EMOJIS } from '../../utils/constants'
  import { requestPermission } from '../../utils/notifications'

  interface Props {
    open: boolean
    onClose: () => void
    editingHabit?: Habit | null
  }

  const defaultForm: HabitDraft = {
    name: '',
    description: '',
    emoji: '💪',
    color: COLORS[0],
    category: CATEGORIES[0],
    frequency: 'daily',
    targetDays: [0, 1, 2, 3, 4, 5, 6],
    reminderEnabled: false,
    reminderTime: '09:00',
  }

  let { open, onClose, editingHabit = null }: Props = $props()
  let form = $state<HabitDraft>({ ...defaultForm, targetDays: [...defaultForm.targetDays] })

  $effect(() => {
    if (!open) return

    if (editingHabit) {
      form = {
        name: editingHabit.name,
        description: editingHabit.description,
        emoji: editingHabit.emoji,
        color: editingHabit.color,
        category: editingHabit.category,
        frequency: editingHabit.frequency,
        targetDays: [...editingHabit.targetDays],
        reminderEnabled: editingHabit.reminderEnabled,
        reminderTime: editingHabit.reminderTime,
      }
    } else {
      form = { ...defaultForm, targetDays: [...defaultForm.targetDays] }
    }
  })

  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault()
    if (!form.name.trim()) return

    if (editingHabit) editHabit(editingHabit.id, form)
    else addHabit(form)
    onClose()
  }

  function setFrequency(frequency: Frequency): void {
    form.frequency = frequency
    if (frequency === 'daily') form.targetDays = [0, 1, 2, 3, 4, 5, 6]
  }

  function toggleDay(day: number): void {
    form.targetDays = form.targetDays.includes(day)
      ? form.targetDays.filter((targetDay) => targetDay !== day)
      : [...form.targetDays, day].sort()
  }

  async function handleReminderToggle(): Promise<void> {
    form.reminderEnabled = !form.reminderEnabled
    if (form.reminderEnabled) await requestPermission()
  }
</script>

<Modal {open} {onClose} title={editingHabit ? 'Edit Habit' : 'New Habit'}>
  <form onsubmit={handleSubmit} class="space-y-5">
    <div>
      <label for="habit-name" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Name
      </label>
      <input
        id="habit-name"
        type="text"
        bind:value={form.name}
        placeholder="e.g. Drink 8 glasses of water"
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
      />
    </div>

    <div>
      <label
        for="habit-description"
        class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Description (optional)
      </label>
      <input
        id="habit-description"
        type="text"
        bind:value={form.description}
        placeholder="Short description..."
        class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
      />
    </div>

    <div>
      <p class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Emoji</p>
      <div class="flex flex-wrap gap-2">
        {#each EMOJIS as emoji (emoji)}
          <button
            type="button"
            onclick={() => (form.emoji = emoji)}
            class={[
              'flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-lg transition-all',
              form.emoji === emoji
                ? 'scale-110 bg-indigo-100 ring-2 ring-indigo-500 dark:bg-indigo-500/20'
                : 'bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600',
            ]}
            aria-label={`Use ${emoji} emoji`}
          >
            {emoji}
          </button>
        {/each}
      </div>
    </div>

    <div>
      <p class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Color</p>
      <div class="flex flex-wrap gap-2">
        {#each COLORS as color (color)}
          <button
            type="button"
            onclick={() => (form.color = color)}
            class={[
              'h-9 w-9 cursor-pointer rounded-full transition-all hover:scale-110',
              form.color === color
                ? 'scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800'
                : '',
            ]}
            style={`background-color: ${color}`}
            aria-label={`Use color ${color}`}
          ></button>
        {/each}
      </div>
    </div>

    <div>
      <p class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
      <div class="flex flex-wrap gap-2">
        {#each CATEGORIES as category (category)}
          <button
            type="button"
            onclick={() => (form.category = category)}
            class={[
              'cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
              form.category === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600',
            ]}
          >
            {category}
          </button>
        {/each}
      </div>
    </div>

    <div>
      <p class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Schedule</p>
      <div class="mb-3 flex gap-2">
        <button
          type="button"
          onclick={() => setFrequency('daily')}
          class={[
            'cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-all',
            form.frequency === 'daily'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300',
          ]}
        >
          Every day
        </button>
        <button
          type="button"
          onclick={() => setFrequency('custom')}
          class={[
            'cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-all',
            form.frequency === 'custom'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300',
          ]}
        >
          Custom days
        </button>
      </div>

      {#if form.frequency === 'custom'}
        <div class="flex flex-wrap gap-2">
          {#each DAY_LABELS as label, day (label)}
            <button
              type="button"
              onclick={() => toggleDay(day)}
              class={[
                'h-10 w-10 cursor-pointer rounded-xl text-xs font-medium transition-all',
                form.targetDays.includes(day)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400',
              ]}
            >
              {label}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div>
      <div class="flex items-center justify-between">
        <p class="block text-sm font-medium text-gray-700 dark:text-gray-300">Daily Reminder</p>
        <button
          type="button"
          role="switch"
          aria-checked={form.reminderEnabled}
          aria-label="Toggle daily reminder"
          onclick={handleReminderToggle}
          class={[
            'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors',
            form.reminderEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600',
          ]}
        >
          <span
            class={[
              'inline-block h-4 w-4 rounded-full bg-white transition-transform',
              form.reminderEnabled ? 'translate-x-6' : 'translate-x-1',
            ]}
          ></span>
        </button>
      </div>

      {#if form.reminderEnabled}
        <div class="mt-3">
          <label
            for="reminder-time"
            class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Reminder Time
          </label>
          <input
            id="reminder-time"
            type="time"
            bind:value={form.reminderTime}
            class="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>
      {/if}
    </div>

    <div class="flex gap-3 pt-2">
      <Button type="button" variant="secondary" onclick={onClose} class="flex-1">Cancel</Button>
      <Button type="submit" disabled={!form.name.trim() || form.targetDays.length === 0} class="flex-1">
        {editingHabit ? 'Save Changes' : 'Create Habit'}
      </Button>
    </div>
  </form>
</Modal>
