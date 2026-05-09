<script lang="ts">
  import type { ChartDataPoint, TimeRange } from '../../types'

  interface Props {
    data: ChartDataPoint[]
    range: TimeRange
    onRangeChange: (range: TimeRange) => void
  }

  const rangeOptions: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '1M' },
    { value: '90d', label: '3M' },
    { value: '180d', label: '6M' },
    { value: '365d', label: '1Y' },
  ]

  let { data, range, onRangeChange }: Props = $props()
  let barCount = $derived(data.length)
  let compact = $derived(barCount > 13)
  let showLabelsAbove = $derived(barCount <= 13)
  let labelInterval = $derived(barCount <= 13 ? 1 : barCount <= 30 ? 5 : 2)
  let chartMinWidth = $derived(
    barCount <= 7 ? '100%' : `${barCount * (compact ? 1.75 : 3)}rem`,
  )
</script>

<div class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
  <div class="mb-7 flex items-center justify-between gap-3 border-b border-gray-200 pb-2 dark:border-slate-700">
    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">Completion Rate</h3>
    <div class="flex gap-1">
      {#each rangeOptions as option (option.value)}
        <button
          type="button"
          onclick={() => onRangeChange(option.value)}
          class={[
            'cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
            range === option.value
              ? 'bg-indigo-600 text-white'
              : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700',
          ]}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="-mx-1 overflow-x-auto overflow-y-hidden px-1 pb-1">
    <div
      class={['chart-track flex h-32 min-w-full items-end', compact ? 'gap-0.5' : 'gap-2']}
      style:--chart-min-width={chartMinWidth}
    >
      {#each data as point, index (`${point.label}-${index}`)}
        {@const height = point.total > 0 ? (point.completed / point.total) * 100 : 0}
        {@const isLast = index === barCount - 1}
        {@const showLabel = index % labelInterval === 0 || isLast}
        <div class="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          {#if showLabelsAbove}
            <span class="whitespace-nowrap text-[10px] font-medium text-gray-500 dark:text-slate-400">
              {point.total > 0 ? `${point.completed}/${point.total}` : '-'}
            </span>
          {/if}
          <div class={['flex w-full items-end', showLabelsAbove ? 'h-24' : 'h-28']}>
            <div
              class={[
                'chart-bar w-full transition-all duration-500',
                compact ? 'rounded-sm' : 'rounded-lg',
                height === 100
                  ? 'bg-green-500'
                  : height > 0
                    ? 'bg-indigo-500'
                    : 'bg-gray-200 dark:bg-slate-700',
              ]}
              style={`height: ${Math.max(height, 4)}%; --bar-delay: ${Math.min(index * 12, 180)}ms`}
              title={`${point.completed}/${point.total}`}
            ></div>
          </div>
          <span
            class={[
              'text-[11px]',
              isLast
                ? 'font-semibold text-indigo-600 dark:text-indigo-400'
                : 'text-gray-400 dark:text-slate-500',
              showLabel ? '' : 'invisible',
            ]}
          >
            {point.label}
          </span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .chart-track {
    min-width: max(100%, var(--chart-min-width));
  }
</style>
