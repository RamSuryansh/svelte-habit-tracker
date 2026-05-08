<script lang="ts">
  import { getDateKey, isFutureDateKey, isToday } from '../../utils/date'
  import { isSameMonth } from 'date-fns'

  interface Props {
    date: Date
    currentMonth: Date
    onSelect: (date: Date) => void
    selected: boolean
    completedCount: number
    total: number
  }

  let { date, currentMonth, onSelect, selected, completedCount, total }: Props = $props()
  let inMonth = $derived(isSameMonth(date, currentMonth))
  let today = $derived(isToday(date))
  let future = $derived(isFutureDateKey(getDateKey(date)))
  let ratio = $derived(total > 0 ? completedCount / total : -1)
  let bgClass = $derived(
    ratio === 1
      ? 'bg-green-500/20 dark:bg-green-500/15'
      : ratio >= 0.5
        ? 'bg-green-500/10 dark:bg-green-500/10'
        : ratio > 0
          ? 'bg-green-500/5 dark:bg-green-500/5'
          : '',
  )
</script>

<button
  type="button"
  onclick={() => onSelect(date)}
  class={[
    'relative m-0.5 flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-200 text-sm transition-all hover:bg-gray-100 dark:border-slate-700 dark:hover:bg-slate-800',
    !inMonth
      ? 'text-gray-300 dark:text-slate-700'
      : today
        ? 'font-bold text-indigo-600 dark:text-indigo-400'
        : future
          ? 'text-gray-400 dark:text-slate-600'
          : 'text-gray-700 dark:text-gray-300',
    selected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : '',
    inMonth ? bgClass : '',
  ]}
  aria-label={`${date.toDateString()}, ${completedCount} of ${total} habits completed`}
>
  <span>{date.getDate()}</span>
  {#if inMonth && total > 0}
    <div class="mt-0.5 flex gap-0.5">
      {#if ratio === 1}
        <div class="h-1.5 w-1.5 rounded-full bg-green-500"></div>
      {:else if ratio > 0}
        <div class="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
      {:else}
        <div class="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-slate-600"></div>
      {/if}
    </div>
  {/if}
</button>
