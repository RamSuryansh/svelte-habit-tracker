<script lang="ts">
  import type { Snippet } from 'svelte'
  import { X } from 'lucide-svelte'

  interface Props {
    open: boolean
    onClose: () => void
    title: string
    children?: Snippet
  }

  let { open, onClose, title, children }: Props = $props()

  function handleKeydown(event: KeyboardEvent): void {
    if (open && event.key === 'Escape') onClose()
  }

  function handleOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) onClose()
  }
</script>

<svelte:document onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex animate-[fadeIn_150ms_ease-out] items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
    onclick={handleOverlayClick}
    role="presentation"
  >
    <div
      class="w-full max-w-lg animate-[slideUp_200ms_ease-out] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800"
      >
        <h2 id="modal-title" class="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <button
          type="button"
          onclick={onClose}
          class="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-700 dark:hover:text-gray-200"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      <div class="max-h-[calc(85vh-65px)] overflow-y-auto p-6">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}
