<script lang="ts">
  import type { Snippet } from 'svelte'

  interface Props {
    progress: number
    size?: number
    strokeWidth?: number
    color?: string
    children?: Snippet
  }

  let { progress, size = 120, strokeWidth = 8, color = '#6366f1', children }: Props = $props()

  let radius = $derived((size - strokeWidth) / 2)
  let circumference = $derived(2 * Math.PI * radius)
  let offset = $derived(circumference * (1 - Math.min(1, Math.max(0, progress))))
</script>

<div class="relative inline-flex items-center justify-center">
  <svg width={size} height={size} class="-rotate-90" aria-hidden="true">
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke="currentColor"
      stroke-width={strokeWidth}
      class="text-gray-200 dark:text-slate-700"
    />
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={offset}
      class="transition-[stroke-dashoffset] duration-500 ease-out"
    />
  </svg>
  {#if children}
    <div class="absolute inset-0 flex items-center justify-center">
      {@render children()}
    </div>
  {/if}
</div>
