<script lang="ts">
</script>

{#snippet loading(num: number)}
	{#each Array(num)}
		<div
			class="jutsify-start flex h-auto w-full animate-pulse items-center rounded-lg bg-secondary"
		>
			<div class="flex w-full flex-col gap-5 p-3 md:p-5">
				<div class="h-6 w-1/3 rounded-full bg-secondary-foreground/10"></div>
				<div class="flex w-full items-center justify-center gap-15">
					<div class="size-25 rounded-lg bg-secondary-foreground/10"></div>
					<div class="size-25 rounded-lg bg-secondary-foreground/10"></div>
				</div>
				<div class="flex w-full justify-end">
					<div class="h-6 w-1/5 rounded-full bg-secondary-foreground/10"></div>
				</div>
			</div>
		</div>
	{/each}
{/snippet}

<div class="mt-5 flex w-full flex-col gap-5 md:mt-10">
	<div>
		<h1 class="text-xl font-bold text-foreground md:text-4xl">Upcoming Games</h1>
	</div>
	<div class="flex w-full flex-col gap-5 md:flex-row md:gap-10">
		{@render loading(2)}
	</div>
</div>
