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
	let selectedPlayers = new SvelteMap<number, Player>();
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
			selectedPlayers.set(player.id, player);
		}
	};

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
		<!-- The player picker isn't a form control, so each selected player
		     submits through a hidden input -->
		{#each rosterPlayers as player (player.id)}
			<input type="hidden" name="players[]" value={player.id} />
		{/each}

		<Field.Group>
			<Field.Set>
				<Field.Legend>Create A New Roster</Field.Legend>
				<Field.Group>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Field.Field data-invalid={teamIdIssues ? true : undefined}>
							<Field.Label for="teamId">Team</Field.Label>
							<Select.Root type="single" name="teamId" bind:value={selectedTeam}>
								<Select.Trigger
									id="teamId"
									class="flex w-full items-center"
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
									id="seasonId"
									class="flex w-full items-center"
									aria-invalid={seasonIdIssues ? 'true' : undefined}
								>
									{seasonTriggerContent}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										<Select.Label>Seasons</Select.Label>
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
			<!-- Add Players -->
			<Field.Set>
				<Field.Legend>
					Add Players
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
				<section class="flex flex-col items-center justify-center gap-3">
					{#if rosterPlayers.length > 0}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Name</Table.Head>
									<Table.Head>Role</Table.Head>
									<Table.Head class="text-end">
										<span class="sr-only">Remove</span>
									</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each rosterPlayers as player (player.id)}
									<Table.Row>
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
						Submit
					{/if}
				</Button>
				<Button variant="outline" type="button" href="/rosters">Cancel</Button>
			</Field.Field>
		</Field.Group>
	</form>
</main>
