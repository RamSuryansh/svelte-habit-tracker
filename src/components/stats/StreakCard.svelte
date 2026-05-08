<script lang="ts">
  import { Flame, Trophy } from 'lucide-svelte'

  interface Props {
    label: string
    value: number
    type: 'current' | 'best'
  }

  let { label, value, type }: Props = $props()
</script>

<div class="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
  <div
    class={[
      'flex h-11 w-11 items-center justify-center rounded-xl',
      type === 'current' ? 'bg-orange-50 dark:bg-orange-500/10' : 'bg-yellow-50 dark:bg-yellow-500/10',
    ]}
  >
    {#if type === 'current'}
      <Flame size={22} class="text-orange-500" />
    {:else}
      <Trophy size={22} class="text-yellow-500" />
    {/if}
  </div>
  <div class="min-w-0">
    <p class="text-2xl font-bold text-gray-900 dark:text-white">
      {value}<span class="ml-1 text-sm font-normal text-gray-400 dark:text-slate-500">days</span>
    </p>
    <p class="text-xs text-gray-500 dark:text-slate-400">{label}</p>
  </div>
</div>
