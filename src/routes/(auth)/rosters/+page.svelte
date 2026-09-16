<script lang="ts">
	import { getRosters, deleteRoster, type RosterData } from '$lib/remote/rosters/rosters.remote';
	import type { Roster } from '$lib/drizzle/schema';
	import * as Table from '$lib/components/ui/table/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { List, Plus, SearchAlert, SquarePen, Trash, Zap } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
	import Logo, { type TeamName } from '$lib/components/layout/assets/Logo.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';

	const rosterData: RosterData[] = $derived(await getRosters());

	let rosterToDelete = $state<RosterData | null>(null);

	const removeRoster = async () => {
		if (!rosterToDelete) return;
		const { id } = rosterToDelete;

		try {
			await deleteRoster({ rosterId: id });
			await getRosters().refresh();
			toast.success('Roster deleted successfully');
		} catch (e) {
			toast.error('Unable to delete roster');
		} finally {
			rosterToDelete = null;
		}
	};

	onMount(() => {
		if (page.url.searchParams.get('created')) {
			toast.success('New Roster Created');
			const url = new URL(page.url);
			url.searchParams.delete('created');
			replaceState(url, {});
		}

		if (page.url.searchParams.get('updated')) {
			toast.success('Roster Edited Successfully');
			const url = new URL(page.url);
			url.searchParams.delete('updated');
			replaceState(url, {});
		}
	});
</script>

<main class="flex flex-col items-center justify-center gap-3">
	<div class="flex w-full items-center justify-between">
		<div class="flex flex-col">
			<h1 class="text-left text-lg font-bold md:text-2xl xl:text-3xl">Rosters</h1>
			<h2 class="text-left text-muted-foreground">
				Teams and their associated players for a given season.
			</h2>
		</div>
		{#if rosterData.length}
			<Button href="/rosters/create">
				New
				<Plus />
			</Button>
		{/if}
	</div>
	<div class="flex w-full items-center justify-start gap-2">
		<List class="size-5" />
		<p>{rosterData.length} rosters(s)</p>
	</div>
	{#if rosterData.length}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="">Id</Table.Head>
					<Table.Head>Team</Table.Head>
					<Table.Head>Logo</Table.Head>
					<Table.Head>Season</Table.Head>
					<Table.Head>Edit</Table.Head>
					<Table.Head class="text-end">Delete</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each rosterData as roster (roster.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{roster.id}</Table.Cell>
						<Table.Cell>{roster.team.name}</Table.Cell>
						<Table.Cell>
							<Logo name={roster.team.name as TeamName} />
						</Table.Cell>
						<Table.Cell>{roster.season.name}</Table.Cell>
						<Table.Cell>
							<Button size="icon" variant="outline" href="/rosters/{roster.id}/edit">
								<SquarePen />
							</Button>
						</Table.Cell>
						<Table.Cell class="flex justify-end">
							<Button size="icon" variant="destructive" onclick={() => (rosterToDelete = roster)}>
								<Trash />
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	{:else}
		<div
			class="border-2-dashed flex h-50 w-full flex-col items-center justify-center gap-2 rounded-lg border-ring bg-secondary md:h-100"
		>
			<p class="semi-bold flex items-center gap-1 text-secondary-foreground italic">
				<SearchAlert class="size-4" />
				No rosters found.
			</p>
			<Button href="/rosters/create">
				Create New Roster <Plus />
			</Button>
		</div>
	{/if}
</main>

<AlertDialog.Root
	open={rosterToDelete !== null}
	onOpenChange={(open) => {
		if (!open) rosterToDelete = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				<p>This action cannot be undone. This will permanently delete:</p>
				<ul class="mt-2 flex flex-col gap-1">
					<li class="underline">Roster Id: <span class="font-bold">{rosterToDelete?.id}</span></li>
					<li>Team: {rosterToDelete?.team.name}</li>
					<li>Season: {rosterToDelete?.season.name}</li>
				</ul>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action disabled={deleteRoster.pending > 0} onclick={removeRoster}>
				Continue
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
