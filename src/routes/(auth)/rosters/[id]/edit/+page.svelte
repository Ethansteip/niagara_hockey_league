<script lang="ts">
	import * as Field from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { SvelteMap } from 'svelte/reactivity';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { onMount } from 'svelte';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { getSeasons } from '$lib/remote/seasons/seasons.remote';
	import { getTeams } from '$lib/remote/teams/teams.remote';
	import { getPlayers } from '$lib/remote/players/players.remote';
	import type { Player } from '$lib/drizzle/schema';
	import { createRoster } from '$lib/remote/rosters/rosters.remote';
	import Logo, { type TeamName } from '$lib/components/layout/assets/Logo.svelte';
	import { Trash, UserRoundPlus } from '@lucide/svelte';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	/* Seasons */
	let seasons = $derived(await getSeasons());
	let seasonsSelectValues = $derived(
		seasons.map((season) => {
			return { value: season.id.toString(), label: season.name };
		})
	);

	let currentActiveSeason = $derived(seasons.find((s) => s.active));

	let seasonId = $derived<string | undefined>(currentActiveSeason?.id.toString() ?? undefined);
	let seasonTriggerContent = $derived(
		seasonsSelectValues.find((s) => s.value === seasonId)?.label ?? 'Select a season'
	);

	/* Teams */
	let teams = $derived(await getTeams());
	let teamSelectValues = $derived(
		teams.map((team) => {
			return { value: team.id.toString(), label: team.name };
		})
	);
	let selectedTeam = $state<string>();
	let teamsTriggerContent = $derived(
		teamSelectValues.find((t) => t.value === selectedTeam)?.label ?? 'Select a team'
	);

	/* Players */
	let players = $derived(await getPlayers());
	let selectedPlayers = $state<Map<number, Player>>(new SvelteMap());
	let playerSelectValues = $derived(
		players.map((player) => {
			return { value: player.id, label: `${player.firstName} ${player.lastName}` };
		})
	);

	let playerSelectOpen = $state(false);
	let selectedPlayer = $state<number>();
	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(playerSelectValues.find((p) => p.value === selectedPlayer)?.label);

	const handlePlayerSelection = (playerId: number) => {
		const player = players.find((player) => player.id === playerId);
		if (!player?.id) return;

		return selectedPlayers.set(player.id, { ...player });
	};

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger() {
		playerSelectOpen = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	let seasonIdIssues = $derived(createRoster.fields.seasonId.issues());
	let teamIdIssues = $derived(createRoster.fields.teamId.issues());

	let form: HTMLFormElement;
	let submitting = $derived<boolean>(!!createRoster.pending);

	onMount(() => {
		form?.reset();
	});
</script>

<main class="flex flex-col items-center justify-center gap-3">
	<form {...createRoster} bind:this={form} class="w-full">
		<Field.Group>
			<Field.Set>
				<Field.Legend>Create A New Roster</Field.Legend>
				<Field.Group>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Field.Field data-invalid={teamIdIssues ? true : undefined}>
							<Field.Label for="teamId">Team</Field.Label>
							<Select.Root type="single" name="teamId" bind:value={selectedTeam}>
								<Select.Trigger
									class="flex items-center"
									aria-invalid={teamIdIssues ? 'true' : undefined}
								>
									{teamsTriggerContent}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										<Select.Label>Teams</Select.Label>
										{#each teamSelectValues as team (team.value)}
											<Select.Item value={team.value} label={team.label}>
												{team.label}
												<Logo name={team.label as TeamName} />
											</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
							<Field.Error errors={teamIdIssues} />
						</Field.Field>
						<Field.Field data-invalid={seasonIdIssues ? true : undefined}>
							<Field.Label for="seasonId">Season</Field.Label>
							<Select.Root type="single" name="seasonId" bind:value={seasonId}>
								<Select.Trigger
									class="flex items-center"
									aria-invalid={seasonIdIssues ? 'true' : undefined}
								>
									{seasonTriggerContent}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										<Select.Label>seasons</Select.Label>
										{#each seasonsSelectValues as season (season.value)}
											<Select.Item value={season.value} label={season.label}
												>{season.label}</Select.Item
											>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
							<Field.Error errors={seasonIdIssues} />
						</Field.Field>
					</div>
				</Field.Group>
			</Field.Set>
			<Field.Separator />
			<!-- Add PLayers -->
			<Field.Set>
				<Field.Legend>Add Players</Field.Legend>
				<Popover.Root bind:open={playerSelectOpen}>
					<Popover.Trigger bind:ref={triggerRef}>
						{#snippet child({ props })}
							<Button
								{...props}
								variant="outline"
								class="w-50 justify-between"
								role="combobox"
								aria-expanded={playerSelectOpen}
							>
								{selectedValue || 'Select a player...'}
								<ChevronsUpDownIcon class="opacity-50" />
							</Button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-50 p-0">
						<Command.Root>
							<Command.Input placeholder="Search players..." />
							<Command.List>
								<Command.Empty>No player found.</Command.Empty>
								<Command.Group value="player">
									{#each playerSelectValues as player (player.value)}
										<Command.Item
											value={player.value.toString()}
											onSelect={() => {
												handlePlayerSelection(player.value);
												closeAndFocusTrigger();
											}}
										>
											{player.label}
											{@const containsPlayer = selectedPlayers.has(player.value)}
											{#if containsPlayer}
												<CheckIcon />
											{/if}
										</Command.Item>
									{/each}
								</Command.Group>
							</Command.List>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
				<section class="flex flex-col items-center justify-center gap-3">
					{#if selectedPlayers.size > 0}
						<Table.Root class="bg-red-200">
							<Table.Header>
								<Table.Row>
									<Table.Head>Id</Table.Head>
									<Table.Head>First Name</Table.Head>
									<Table.Head>Last Name</Table.Head>
									<Table.Head>Role</Table.Head>
									<Table.Head class="text-end">Delete</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body class="min-h-50">
								{#each selectedPlayers as [, player] (player.id)}
									<input type="hidden" name="players[]" value={player.id} />
									<Table.Row>
										<Table.Cell class="font-medium">{player.id}</Table.Cell>
										<Table.Cell>{player.firstName}</Table.Cell>
										<Table.Cell>{player.lastName}</Table.Cell>
										<Table.Cell
											><Badge variant={player.role === 'player' ? 'default' : 'outline'}
												>{player.role}</Badge
											></Table.Cell
										>
										<Table.Cell class="flex justify-end">
											<Button
												size="icon"
												variant="destructive"
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
							class="border-2-dashed flex h-50 w-full flex-col items-center justify-center gap-2 rounded-lg border-ring bg-secondary md:h-100"
						>
							<p
								class="semi-bold md:text-md flex flex-col items-center gap-1 text-center text-xs text-muted-foreground italic xl:text-[0.9rem]"
							>
								Search and select a player to add them to the roster
								<UserRoundPlus class="size-4" />
							</p>
							<!-- <Button href="/rosters/create">
							Create New Roster <Plus />
						</Button> -->
						</div>
					{/if}
				</section>
			</Field.Set>
			<Field.Field orientation="horizontal">
				<Button type="submit" class="min-w-20" disabled={submitting}>
					{#if submitting}
						<Spinner class="size-5 stroke-primary-foreground" />
					{:else}
						Submit
					{/if}
				</Button>
				<Button variant="outline" type="button" href="/rosters">Cancel</Button>
			</Field.Field>
		</Field.Group>
	</form>
</main>
