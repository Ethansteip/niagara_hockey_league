<script lang="ts">
	import { getPlayers, deletePlayer } from './players.remote';
	import type { Player } from '$lib/drizzle/schema';
	import * as Table from '$lib/components/ui/table/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import {
		List,
		Plus,
		SearchAlert,
		SquarePen,
		Trash,
		UserRoundCheck,
		UserRoundX
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
	import { capitalizeWords } from '$lib/utils';

	const players: Player[] = $derived(await getPlayers());

	let playerToDelete = $state<Player | null>(null);

	const removePlayer = async () => {
		if (!playerToDelete) return;
		const { id } = playerToDelete;
		const role = capitalizeWords(playerToDelete.role);
		const fullName = `${playerToDelete.firstName} ${playerToDelete.lastName}`;

		try {
			await deletePlayer({ id: id });
			await getPlayers().refresh();
			toast.success(`${fullName} deleted successfully`);
		} catch (e) {
			toast.error(`Unable to delete ${role}`);
		} finally {
			playerToDelete = null;
		}
	};

	/* Pagination */
	const perPage = 10;
	let currentPage = $state(1);
	const paginatedPlayers = $derived(
		players.slice((currentPage - 1) * perPage, currentPage * perPage)
	);

	onMount(() => {
		if (page.url.searchParams.get('created')) {
			toast.success('New Player Created');
			const url = new URL(page.url);
			url.searchParams.delete('created');
			replaceState(url, {});
		}

		if (page.url.searchParams.get('updated')) {
			toast.success('PLayer Edited Successfully');
			const url = new URL(page.url);
			url.searchParams.delete('updated');
			replaceState(url, {});
		}
	});
</script>

<main class="flex flex-col items-center justify-center gap-3">
	<div class="flex w-full items-center justify-between">
		<h2 class="text-left text-lg font-bold md:text-2xl xl:text-3xl">Players</h2>
		{#if players.length}
			<Button href="/players/create">
				New
				<Plus />
			</Button>
		{/if}
	</div>
	<div class="flex w-full items-center justify-start gap-2">
		<List class="size-5" />
		<p>{players.length} player(s)</p>
	</div>
	{#if players.length}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Id</Table.Head>
					<Table.Head>Last Name</Table.Head>
					<Table.Head>First Name</Table.Head>
					<Table.Head>Role</Table.Head>
					<Table.Head>Active</Table.Head>
					<Table.Head>Delete</Table.Head>
					<Table.Head class="text-end">Edit</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each paginatedPlayers as player (player.id)}
					<Table.Row>
						<Table.Cell class="font-medium">{player.id}</Table.Cell>
						<Table.Cell>
							{player.lastName}
						</Table.Cell>
						<Table.Cell>
							{player.firstName}
						</Table.Cell>
						<Table.Cell>
							<Badge variant={player.role === 'player' ? 'default' : 'outline'}
								>{capitalizeWords(player.role)}</Badge
							>
						</Table.Cell>
						<Table.Cell class="ml-3">
							{#if player.active}
								<UserRoundCheck />
							{:else}
								<UserRoundX class="stroke-muted-foreground" />
							{/if}
						</Table.Cell>
						<Table.Cell>
							<Button size="icon" variant="outline" onclick={() => (playerToDelete = player)}>
								<Trash />
							</Button>
						</Table.Cell>
						<Table.Cell class="text-end">
							<Button size="icon" variant="outline" href="/players/{player.id}/edit">
								<SquarePen />
							</Button>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
			{#if players.length > perPage}
				<Table.Footer>
					<Table.Row>
						<Table.Cell colspan={6}>
							<Pagination.Root count={players.length} {perPage} bind:page={currentPage}>
								{#snippet children({ pages, currentPage })}
									<Pagination.Content>
										<Pagination.Item>
											<Pagination.Previous />
										</Pagination.Item>
										{#each pages as page (page.key)}
											{#if page.type === 'ellipsis'}
												<Pagination.Item>
													<Pagination.Ellipsis />
												</Pagination.Item>
											{:else}
												<Pagination.Item>
													<Pagination.Link {page} isActive={currentPage === page.value}>
														{page.value}
													</Pagination.Link>
												</Pagination.Item>
											{/if}
										{/each}
										<Pagination.Item>
											<Pagination.Next />
										</Pagination.Item>
									</Pagination.Content>
								{/snippet}
							</Pagination.Root>
						</Table.Cell>
					</Table.Row>
				</Table.Footer>
			{/if}
		</Table.Root>
	{:else}
		<div
			class="border-2-dashed flex h-50 w-full flex-col items-center justify-center gap-2 rounded-lg border-ring bg-secondary md:h-100"
		>
			<p class="semi-bold flex items-center gap-1 text-secondary-foreground italic">
				<SearchAlert class="size-4" />
				No players found.
			</p>
			<Button href="/players/create">
				Create New Player <Plus />
			</Button>
		</div>
	{/if}
</main>

<AlertDialog.Root
	open={playerToDelete !== null}
	onOpenChange={(open) => {
		if (!open) playerToDelete = null;
	}}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This will permanently delete: <span class="font-bold"
					>{playerToDelete?.firstName} {playerToDelete?.lastName}</span
				>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action disabled={!!deletePlayer.pending} onclick={removePlayer}>
				Continue
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
