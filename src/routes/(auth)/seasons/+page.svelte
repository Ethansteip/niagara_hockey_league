<script lang="ts">
	import { getSeasons, type Season, deleteSeason } from './seasons.remote';
	import * as Table from '$lib/components/ui/table/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { List, Plus, SearchAlert, SquarePen, Trash } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { onMount } from 'svelte';

	const seasons: Season[] = $derived(await getSeasons());

	let seasonToDelete = $state<Season | null>(null);

	const removeSeason = async () => {
		if (!seasonToDelete) return;
		const { id } = seasonToDelete;

		try {
			await deleteSeason({ seasonId: id });
			await getSeasons().refresh();
			toast.success('Season deleted successfully');
		} catch (e) {
			toast.error('Unable to delete season');
		} finally {
			seasonToDelete = null;
		}
	};

	onMount(() => {
		if (page.url.searchParams.get('created')) {
			toast.success('New Season Created');
			const url = new URL(page.url);
			url.searchParams.delete('created');
			replaceState(url, {});
		}
	});
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
			<Table.Header>
				<Table.Row>
					<Table.Head class="w-25">Id</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Active</Table.Head>
					<Table.Head>Start Date</Table.Head>
					<Table.Head>End Date</Table.Head>
					<Table.Head>Delete</Table.Head>
					<Table.Head class="text-end">Edit</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each seasons as season (season.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{season.id}</Table.Cell>
						<Table.Cell>{season.name}</Table.Cell>
						<Table.Cell>
							<Badge variant={season.active ? 'default' : 'outline'}>
								{season.active ? 'active' : 'inactive'}
							</Badge>
						</Table.Cell>
						<Table.Cell>{season.startDate}</Table.Cell>
						<Table.Cell>{season.endDate}</Table.Cell>
						<Table.Cell>
							<Button size="icon" variant="outline" onclick={() => (seasonToDelete = season)}>
								<Trash />
							</Button>
						</Table.Cell>
						<Table.Cell class="flex justify-end">
							<Button size="icon" variant="outline" href="/seasons/{season.id}/edit">
								<SquarePen />
							</Button>
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

<AlertDialog.Root
	open={seasonToDelete !== null}
	onOpenChange={(open) => {
		if (!open) seasonToDelete = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete season: <span class="font-bold"
					>{seasonToDelete?.name}</span
				>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action disabled={deleteSeason.pending > 0} onclick={removeSeason}>
				Continue
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
