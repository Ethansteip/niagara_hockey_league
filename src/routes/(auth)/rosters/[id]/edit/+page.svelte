<script lang="ts">
	import * as Field from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { enterToNext } from '$lib/attachments/enter-to-next';
	import { SvelteMap } from 'svelte/reactivity';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { getPlayers } from '$lib/remote/players/players.remote';
	import type { Player } from '$lib/drizzle/schema';
	import { getRoster, updateRoster, type RosterPlayer } from '$lib/remote/rosters/rosters.remote';
	import Logo, { type TeamName } from '$lib/components/layout/assets/Logo.svelte';
	import { Trash, UserRoundPlus } from '@lucide/svelte';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	let { params } = $props();

	// The redirect after saving updates `params` to the /rosters route before this page
	// unmounts, so params.id is briefly undefined. Holding on to the last valid id stops
	// the queries below from re-running with NaN
	let lastId: number;
	const id = $derived.by(() => {
		const parsed = parseInt(params.id ?? '', 10);
		if (!Number.isNaN(parsed)) lastId = parsed;
		return lastId;
	});

	// SvelteKit injects the `.for(key)` key into the submitted data as `id`
	let editRoster = $derived(updateRoster.for(id));
	let roster = $derived(await getRoster({ id }));
	let players = $derived(await getPlayers());

	/* Players - seeded with whoever is already on the roster */
	let selectedPlayers = $derived(
		new SvelteMap<number, RosterPlayer>(roster.players.map((player) => [player.id, player]))
	);
	let playerSearchOpen = $state(false);

	// Goalies first, then alphabetical, so the roster reads like a lineup card
	let rosterPlayers = $derived(
		[...selectedPlayers.values()].sort(
			(a, b) =>
				Number(b.role === 'goalie') - Number(a.role === 'goalie') ||
				a.lastName.localeCompare(b.lastName) ||
				a.firstName.localeCompare(b.firstName)
		)
	);

	// The search stays open so several players can be added in a row
	const togglePlayer = (player: Player) => {
		if (selectedPlayers.has(player.id)) {
			selectedPlayers.delete(player.id);
		} else {
			selectedPlayers.set(player.id, { ...player, jerseyNumber: null });
		}
	};

	// Includes nested issues, like an invalid jersey number
	let playersIssues = $derived(editRoster.fields.players.allIssues());

	let submitting = $derived<boolean>(!!editRoster.pending);
</script>

<main class="flex flex-col items-center justify-center gap-3">
	<form {...editRoster} {@attach enterToNext} class="w-full">
		<Field.Group>
			<!-- A roster belongs to one team season, so these aren't editable -->
			<Field.Set>
				<Field.Legend>Edit Roster</Field.Legend>
				<div class="flex items-center gap-3 rounded-xl border bg-card p-3">
					<Logo name={roster.team.name as TeamName} className="size-12 shrink-0" />
					<div class="min-w-0">
						<p class="truncate text-lg leading-tight font-bold">{roster.team.name}</p>
						<p class="text-sm text-muted-foreground">{roster.season.name}</p>
					</div>
				</div>
			</Field.Set>
			<Field.Separator />
			<!-- Players -->
			<Field.Set>
				<Field.Legend>
					Players
					{#if selectedPlayers.size}
						<span class="text-muted-foreground">({selectedPlayers.size})</span>
					{/if}
				</Field.Legend>
				<Popover.Root bind:open={playerSearchOpen}>
					<Popover.Trigger>
						{#snippet child({ props })}
							<Button
								{...props}
								variant="outline"
								class="w-full justify-between md:w-80"
								role="combobox"
								aria-expanded={playerSearchOpen}
							>
								Search players...
								<ChevronsUpDownIcon class="opacity-50" />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<!-- Matches the trigger's width, so it fills the screen on mobile -->
					<Popover.Content class="w-(--bits-popover-anchor-width) p-0" align="start">
						<Command.Root>
							<Command.Input placeholder="Search by name..." />
							<Command.List>
								<Command.Empty>No player found.</Command.Empty>
								<Command.Group heading="Players">
									{#each players as player (player.id)}
										<!-- value must be unique, so search on the name through keywords -->
										<Command.Item
											value={player.id.toString()}
											keywords={[player.firstName, player.lastName]}
											onSelect={() => togglePlayer(player)}
										>
											<span class="flex-1 truncate">{player.firstName} {player.lastName}</span>
											{#if player.role === 'goalie'}
												<Badge variant="outline" class="h-4 px-1 text-[0.625rem]">G</Badge>
											{/if}
											<CheckIcon
												class={selectedPlayers.has(player.id) ? 'opacity-100' : 'opacity-0'}
											/>
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
				<Field.Error errors={playersIssues} />
				<section class="flex flex-col items-center justify-center gap-3">
					{#if rosterPlayers.length > 0}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head class="w-20">Number</Table.Head>
									<Table.Head>Name</Table.Head>
									<Table.Head>Role</Table.Head>
									<Table.Head class="text-end">
										<span class="sr-only">Remove</span>
									</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each rosterPlayers as player, i (player.id)}
									<Table.Row>
										<!-- The number input is left uncontrolled, so what's typed stays with
										     the row when adding a player re-sorts the list -->
										<Table.Cell>
											<input type="hidden" name="n:players[{i}].playerId" value={player.id} />
											<Input
												type="text"
												name="n:players[{i}].jerseyNumber"
												value={player.jerseyNumber ?? ''}
												inputmode="numeric"
												pattern="[0-9]*"
												maxlength={2}
												enterkeyhint="next"
												autocomplete="off"
												placeholder="#"
												aria-label="Jersey number for {player.firstName} {player.lastName}"
												class="w-14 text-center tabular-nums"
											/>
										</Table.Cell>
										<Table.Cell class="font-medium">
											{player.firstName}
											{player.lastName}
										</Table.Cell>
										<Table.Cell>
											<Badge variant={player.role === 'player' ? 'default' : 'outline'}>
												{player.role}
											</Badge>
										</Table.Cell>
										<Table.Cell class="flex justify-end">
											<Button
												size="icon"
												variant="destructive"
												aria-label="Remove {player.firstName} {player.lastName}"
												onclick={() => selectedPlayers.delete(player.id)}
											>
												<Trash />
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{:else}
						<div
							class="flex h-50 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ring bg-secondary md:h-100"
						>
							<p
								class="md:text-md flex flex-col items-center gap-1 text-center text-xs font-semibold text-muted-foreground italic xl:text-[0.9rem]"
							>
								Search and select a player to add them to the roster
								<UserRoundPlus class="size-4" />
							</p>
						</div>
					{/if}
				</section>
			</Field.Set>
			<Field.Field orientation="horizontal">
				<Button type="submit" class="min-w-20" disabled={submitting}>
					{#if submitting}
						<Spinner class="size-5 stroke-primary-foreground" />
					{:else}
						Save
					{/if}
				</Button>
				<Button variant="outline" type="button" href="/rosters">Cancel</Button>
			</Field.Field>
		</Field.Group>
	</form>
</main>
