<script lang="ts">
	import { Pagination as PaginationPrimitive } from "bits-ui";
	import { buttonVariants, type ButtonSize } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	let {
		ref = $bindable(null),
		class: className,
		size = "icon",
		isActive,
		page,
		children,
		...restProps
	}: PaginationPrimitive.PageProps & {
		size?: ButtonSize;
		isActive: boolean;
	} = $props();
</script>

{#snippet Fallback()}
	{page.value}
{/snippet}

<PaginationPrimitive.Page
	bind:ref
	{page}
	aria-current={isActive ? "page" : undefined}
	data-slot="pagination-link"
	data-active={isActive}
	data-size={size}
	class={cn(
		// Solid primary fill so the current page stands out in dark mode too
		buttonVariants({ size, variant: isActive ? "default" : "ghost" }),
		"cn-pagination-link",
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		{@render Fallback()}
	{/if}
</PaginationPrimitive.Page>
