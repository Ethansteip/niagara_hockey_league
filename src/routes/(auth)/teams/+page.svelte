<script lang="ts">
	import { getTeams, deleteTeam } from './teams.remote';
	import type { Team } from '$lib/drizzle/schema';
	import * as Table from '$lib/components/ui/table/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { List, Plus, SearchAlert, SquarePen, Trash, Zap } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { onMount } from 'svelte';

	const teams: Team[] = $derived(await getTeams());

	let teamToDelete = $state<Team | null>(null);

	const removeTeam = async () => {
		if (!teamToDelete) return;
		const { id } = teamToDelete;

		try {
			await deleteTeam({ teamId: id });
			await getTeams().refresh();
			toast.success('Team deleted successfully');
		} catch (e) {
			toast.error('Unable to delete team');
		} finally {
			teamToDelete = null;
		}
	};

	onMount(() => {
		if (page.url.searchParams.get('created')) {
			toast.success('New Team Created');
			const url = new URL(page.url);
			url.searchParams.delete('created');
			replaceState(url, {});
		}
		if (page.url.searchParams.get('updated')) {
			toast.success('Team Edited Successfully');
			const url = new URL(page.url);
			url.searchParams.delete('updated');
			replaceState(url, {});
		}
	});
</script>

<main class="flex flex-col items-center justify-center gap-3">
	<div class="flex w-full items-center justify-between">
		<h2 class="text-left text-lg font-bold md:text-2xl xl:text-3xl">Teams</h2>
		<Button href="/teams/create">
			New
			<Plus />
		</Button>
	</div>
	<div class="flex w-full items-center justify-start gap-2">
		<List class="size-5" />
		<p>{teams.length} team(s)</p>
	</div>
	{#if teams.length}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head class="">Id</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Logo</Table.Head>
					<Table.Head>Team Code</Table.Head>
					<Table.Head>Delete</Table.Head>
					<Table.Head class="text-end">Edit</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each teams as team (team.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{team.id}</Table.Cell>
						<Table.Cell>{team.name}</Table.Cell>
						<Table.Cell>
							<Zap />
						</Table.Cell>
						<Table.Cell>{team.code}</Table.Cell>
						<Table.Cell>
							<Button size="icon" variant="outline" onclick={() => (teamToDelete = team)}>
								<Trash />
							</Button>
						</Table.Cell>
						<Table.Cell class="flex justify-end">
							<Button size="icon" variant="outline" href="/teams/{team.id}/edit">
								<SquarePen />
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
				No teams found.
			</p>
			<Button href="/teams/create">
				Create New Team <Plus />
			</Button>
		</div>
	{/if}
</main>

<AlertDialog.Root
	open={teamToDelete !== null}
	onOpenChange={(open) => {
		if (!open) teamToDelete = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete team: <span class="font-bold"
					>{teamToDelete?.name}</span
				>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action disabled={deleteTeam.pending > 0} onclick={removeTeam}>
				Continue
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
