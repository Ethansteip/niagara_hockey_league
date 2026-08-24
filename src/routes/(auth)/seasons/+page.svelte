<script lang="ts">
	import { getSeasons, type Season } from './seasons.remote';
	import * as Table from '$lib/components/ui/table/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { List, Plus, SearchAlert, SquarePen } from '@lucide/svelte';

	const seasons: Season[] = $derived(await getSeasons());
	$inspect(seasons);
</script>

<main class="flex flex-col items-center justify-center gap-3">
	<div class="flex w-full items-center justify-between">
		<h2 class="text-left text-lg font-bold md:text-2xl xl:text-3xl">Seasons</h2>
		<Button href="/seasons/create">
			New
			<Plus />
		</Button>
	</div>
	<div class="flex w-full items-center justify-start gap-2">
		<List class="size-5" />
		<p>{seasons.length} season(s)</p>
	</div>
	{#if seasons.length}
		<Table.Root>
			<Table.Caption>A list of all Niagara Hockey League seasons</Table.Caption>
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-25">Id</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Active</Table.Head>
					<Table.Head>Start Date</Table.Head>
					<Table.Head>End Date</Table.Head>
					<Table.Head class="text-end">Edit</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each seasons as season (season.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{season.id}</Table.Cell>
						<Table.Cell>{season.name}</Table.Cell>
						<Table.Cell>{season.active}</Table.Cell>
						<Table.Cell>{season.startDate}</Table.Cell>
						<Table.Cell>{season.endDate}</Table.Cell>
						<Table.Cell class="flex justify-end">
							<SquarePen
								class="trasnition-transform size-5 cursor-pointer text-muted-foreground duration-200 hover:text-secondary-foreground"
							/>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
			<!-- <Table.Footer>
				<Table.Row>
					<Table.Cell colspan={5}>Total</Table.Cell>
					<Table.Cell class="text-end">$2,500.00</Table.Cell>
				</Table.Row>
			</Table.Footer> -->
		</Table.Root>
	{:else}
		<div
			class="border-2-dashed flex h-50 w-full flex-col items-center justify-center gap-2 rounded-lg border-ring bg-secondary md:h-100"
		>
			<p class="semi-bold flex items-center gap-1 text-secondary-foreground italic">
				<SearchAlert class="size-4" />
				No Seasons found.
			</p>
			<Button href="/seasons/create">
				Create New Season <Plus />
			</Button>
		</div>
	{/if}
</main>
