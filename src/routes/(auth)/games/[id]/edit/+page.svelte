<script lang="ts">
	import * as Field from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { teamColours } from '$lib/components/layout/assets/team-colours';
	import {
		CalendarDateTime,
		fromDate,
		getLocalTimeZone,
		parseTime,
		toCalendarDate,
		toTime,
		today,
		type CalendarDate
	} from '@internationalized/date';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { getGame, updateGame } from '$lib/remote/games/games.remote';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import Logo, { type TeamName } from '$lib/components/layout/assets/Logo.svelte';
	import { getSeasons } from '$lib/remote/seasons/seasons.remote';
	import { getTeams } from '$lib/remote/teams/teams.remote';
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	let { params } = $props();
	const id = $derived(parseInt(params.id, 10));

	// SvelteKit injects the `.for(key)` key into the submitted data as `id`
	// (overriding any form control named `id`), so the key must be a number
	// to satisfy the schema
	let editGame = $derived(updateGame.for(id));
	let game = $derived(await getGame({ id }));
	let seasons = $derived(await getSeasons());
	let teams = $derived(await getTeams());

	/* Seasons */
	let seasonsSelectValues = $derived(
		seasons.map((season) => {
			return { value: season.id.toString(), label: season.name };
		})
	);

	let currentGameSeason = $derived(seasons.find((s) => s.id === game.seasonId));
	let seasonId = $derived<string | undefined>(currentGameSeason?.id.toString() ?? undefined);
	let seasonTriggerContent = $derived(
		seasonsSelectValues.find((s) => s.value === seasonId)?.label ?? 'Select a season'
	);

	/* Week number */
	let weekNumber = $derived(game.weekNumber);

	/* Game Status */
	let gameStatus = $derived(game.status);

	/* Scores */
	let homeScore = $derived(game.homeScore);
	let awayScore = $derived(game.awayScore);
	let isTie = $derived(homeScore === awayScore);

	/* Teams */
	let teamSelectValues = $derived(
		teams.map((team) => {
			return { value: team.id.toString(), label: team.name };
		})
	);

	let homeTeamId = $derived<string>(game.homeTeamId.toString());
	let awayTeamId = $derived<string>(game.awayTeamId.toString());

	let homeTeamIdTriggerContent = $derived(
		teamSelectValues.find((t) => t.value === homeTeamId)?.label ?? 'Select a home team'
	);

	let awayTeamIdTriggerContent = $derived(
		teamSelectValues.find((t) => t.value === awayTeamId)?.label ?? 'Select an away team'
	);

	let currentHomeTeam = $derived(teamSelectValues.find((t) => t.value === homeTeamId));
	let currentAwayTeam = $derived(teamSelectValues.find((t) => t.value === awayTeamId));

	/* Game Date & Time */
	let startDateOpen = $state(false);
	// The DB timestamptz arrives as a JS Date; convert it into the user's local
	// zone and split it into the CalendarDate the Calendar binds to and the
	// HH:mm:ss string the time input binds to
	let storedStart = $derived(fromDate(game.startDate, getLocalTimeZone()));
	let startDateValue = $derived<CalendarDate | undefined>(toCalendarDate(storedStart));
	let startTime = $derived(toTime(storedStart).toString());
	const maxDate = today(getLocalTimeZone()).add({ years: 1 });

	// Resolve the picked local date + time into an absolute instant so the
	// server can store it as a timestamptz without knowing the user's timezone
	let startDateTime = $derived.by(() => {
		if (!startDateValue) return '';
		const t = parseTime(startTime);
		return new CalendarDateTime(
			startDateValue.year,
			startDateValue.month,
			startDateValue.day,
			t.hour,
			t.minute,
			t.second
		)
			.toDate(getLocalTimeZone())
			.toISOString();
	});

	/* Game Type */
	let gameType = $derived<string>(game.gameType);

	let gameTypeSelectValues = [
		{ label: 'Regular Season', value: 'regular season' },
		{ label: 'Playoff', value: 'playoff' }
	];

	let gameTypeTriggerContent = $derived(
		gameTypeSelectValues.find((t) => t.value === gameType)?.label ?? 'Select a game type'
	);

	/* Game Notes */
	let notes = $state<string>();

	/* Form Issues */
	let weekNumberIssues = $derived(editGame.fields.weekNumber.issues());
	let seasonIdIssues = $derived(editGame.fields.seasonId.issues());
	let homeTeamIdIssues = $derived(editGame.fields.homeTeamId.issues());
	let awayTeamIdIssues = $derived(editGame.fields.awayTeamId.issues());
	let startDateIssues = $derived(editGame.fields.startDate.issues());
	let gameTypeIssues = $derived(editGame.fields.gameType.issues());
	let notesIssues = $derived(editGame.fields.notes.issues());
	let homeTeamScoreIssues = $derived(editGame.fields.homeScore.issues());
	let awayTeamScoreIssues = $derived(editGame.fields.awayScore.issues());

	$inspect(seasonIdIssues);

	let form: HTMLFormElement;
	let submitting = $derived<boolean>(!!updateGame.pending);

	const rows = $derived([
		{
			side: 'away',
			team: currentAwayTeam?.label,
			score: awayScore,
			won: game.awayScore > game.homeScore
		},
		{
			side: 'home',
			team: currentHomeTeam?.label,
			score: homeScore,
			won: game.homeScore > game.awayScore
		}
	]);
</script>

<main class="flex flex-col items-start justify-start gap-3">
	<!-- Game overview card -->
	<article
		class="w-full overflow-hidden rounded-xl border border-white/5 bg-card text-card-foreground"
	>
		<header
			class="flex items-center justify-between gap-2 border-b border-white/5 px-4 py-2.5 text-xs"
		>
			<div class="flex items-center gap-2">
				<span class="font-bold tracking-widest text-foreground uppercase">{gameStatus}</span>
				{#if isTie}
					<span
						class="rounded-sm bg-secondary px-1.5 py-0.5 text-[0.625rem] font-bold tracking-widest text-secondary-foreground uppercase"
					>
						Tie
					</span>
				{/if}
			</div>
			<div class="flex items-center gap-2 text-muted-foreground">
				{#if game.gameType === 'playoff'}
					<Badge class="h-5 px-1.5 text-[0.625rem] tracking-wider uppercase">Playoffs</Badge>
				{/if}
				<time datetime={startDateValue?.toString()}>{startDateValue}</time>
				{#if weekNumber}
					<span aria-hidden="true">·</span>
					<span class="text-secondary-foreground">Week {weekNumber}</span>
				{/if}
			</div>
		</header>

		<ul class="flex flex-col py-1.5">
			{#each rows as row (row.side)}
				{@const name = row?.team as TeamName | undefined}
				<li
					class="team-row relative flex items-center gap-3 px-4 py-2"
					class:winner={row.won}
					class:loser={!row.won && !isTie}
					style:--accent={name ? teamColours[name]?.line : 'transparent'}
				>
					{#if name}
						<Logo {name} className="size-11 shrink-0" />
					{:else}
						<div class="size-11 shrink-0 rounded-full bg-muted"></div>
					{/if}

					<div class="min-w-0 flex-1">
						<p class="team-name truncate text-lg leading-tight font-bold tracking-tight">
							{row.team ?? 'TBD'}
						</p>
					</div>

					<div class="flex items-center gap-2">
						<span class="score text-4xl leading-none font-black tabular-nums">{row.score}</span>
						<!-- Winner caret; always takes up space so both scores stay aligned -->
						{#if row.won && !isTie}
							<span
								class="caret size-0 border-y-[5px] border-r-[6px] border-y-transparent border-r-current"
								aria-hidden="true"
							></span>
						{/if}
					</div>

					{#if row.won}
						<span class="sr-only">Winner</span>
					{/if}
				</li>
			{/each}
		</ul>
	</article>

	<Tabs.Root value="overview" class="w-full">
		<Tabs.List variant="line" class="mb-4">
			<Tabs.Trigger class="m-0 p-0 text-left" value="overview">Overview</Tabs.Trigger>
			<Tabs.Trigger value="score">Score</Tabs.Trigger>
			<Tabs.Trigger value="player-stats">Player Stats</Tabs.Trigger>
			<Tabs.Trigger value="goalies">Goalies</Tabs.Trigger>
		</Tabs.List>
		<form {...editGame} bind:this={form} class="w-full">
			<!-- Custom components (Calendar, Checkbox) don't render named form controls,
		     so hidden inputs carry their values into the submitted form data -->
			<input {...editGame.fields.startDate.as('hidden', startDateTime)} />
			<input {...editGame.fields.gameStatus.as('hidden', 'scheduled')} />
			<Tabs.Content value="overview">
				<Field.Group>
					<Field.Set>
						<Field.Group>
							<!-- Season & Week Number -->
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Field.Field data-invalid={weekNumberIssues ? true : undefined}>
									<Field.Label for="weekNumber">Week Number</Field.Label>
									<Input
										id="weekNumber"
										{...editGame.fields.weekNumber.as('number', weekNumber ?? 0)}
										placeholder="1"
									/>
									<Field.Error errors={weekNumberIssues} />
								</Field.Field>
								<Field.Field data-invalid={seasonIdIssues ? true : undefined}>
									<Field.Label for="seasonId">Season</Field.Label>
									<Select.Root type="single" name="seasonId" bind:value={seasonId}>
										<Select.Trigger aria-invalid={seasonIdIssues ? 'true' : undefined}>
											{seasonTriggerContent}
										</Select.Trigger>
										<Select.Content>
											<Select.Group>
												<Select.Label>Seasons</Select.Label>
												{#each seasonsSelectValues as season (season.value)}
													<Select.Item value={season.value} label={season.label}>
														{season.label}
													</Select.Item>
												{/each}
											</Select.Group>
										</Select.Content>
									</Select.Root>
									<Field.Error errors={seasonIdIssues} />
								</Field.Field>
							</div>
							<!-- Home and Away team -->
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Field.Field data-invalid={homeTeamIdIssues ? true : undefined}>
									<Field.Label for="homeTeamId">Home Team</Field.Label>
									<Select.Root type="single" name="homeTeamId" bind:value={homeTeamId}>
										<Select.Trigger
											class="flex items-center"
											aria-invalid={homeTeamIdIssues ? 'true' : undefined}
										>
											{homeTeamIdTriggerContent}
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
									<Field.Error errors={homeTeamIdIssues} />
								</Field.Field>
								<Field.Field data-invalid={awayTeamIdIssues ? true : undefined}>
									<Field.Label for="awayTeamId">Away Team</Field.Label>
									<Select.Root type="single" name="awayTeamId" bind:value={awayTeamId}>
										<Select.Trigger class="" aria-invalid={awayTeamIdIssues ? 'true' : undefined}>
											{awayTeamIdTriggerContent}
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
									<Field.Error errors={awayTeamIdIssues} />
								</Field.Field>
							</div>

							<!-- Home and Away Score -->
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Field.Field data-invalid={homeTeamScoreIssues ? true : undefined}>
									<Field.Label for="homeTeamScore">Home Team Score</Field.Label>
									<Input
										id="homeTeamScore"
										enterkeyhint="next"
										{...editGame.fields.homeScore.as('number', homeScore)}
										min="0"
										placeholder="1"
									/>
									<Field.Error errors={homeTeamScoreIssues} />
								</Field.Field>
								<Field.Field data-invalid={awayTeamScoreIssues ? true : undefined}>
									<Field.Label for="homeTeamScore">Away Team Score</Field.Label>
									<Input
										id="homeTeamScore"
										enterkeyhint="next"
										{...editGame.fields.awayScore.as('number', awayScore)}
										min="0"
										placeholder="1"
									/>
									<Field.Error errors={awayTeamScoreIssues} />
								</Field.Field>
							</div>

							<!-- Game Date and Game Type -->
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Field.Field class="col-span-1" data-invalid={startDateIssues ? true : undefined}>
									<Field.Label for="gameStartDate" class="px-1">Game Date</Field.Label>
									<Popover.Root bind:open={startDateOpen}>
										<Popover.Trigger id="gameStartDate">
											{#snippet child({ props })}
												<Button
													{...props}
													variant="outline"
													aria-invalid={startDateIssues ? 'true' : undefined}
													class="w-48 justify-between font-normal"
												>
													{startDateValue
														? startDateValue.toDate(getLocalTimeZone()).toLocaleDateString()
														: 'Select game date'}
													<ChevronDownIcon />
												</Button>
											{/snippet}
										</Popover.Trigger>
										<Popover.Content class="w-auto overflow-hidden p-0" align="start">
											<Calendar
												type="single"
												bind:value={startDateValue}
												captionLayout="dropdown"
												onValueChange={() => {
													startDateOpen = false;
												}}
												maxValue={maxDate}
											/>
										</Popover.Content>
									</Popover.Root>
									<Field.Error errors={startDateIssues} />
								</Field.Field>
								<Field.Field class="col-span-1">
									<Field.Label for="gameTime" class="px-1">Game Time</Field.Label>
									<Input
										type="time"
										id="gameTime"
										step="1"
										bind:value={startTime}
										class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
									/>
								</Field.Field>
								<Field.Field data-invalid={gameTypeIssues ? true : undefined}>
									<Field.Label for="gameType">Game Type</Field.Label>
									<Select.Root type="single" name="gameType" bind:value={gameType}>
										<Select.Trigger class="" aria-invalid={gameTypeIssues ? 'true' : undefined}>
											{gameTypeTriggerContent}
										</Select.Trigger>
										<Select.Content>
											<Select.Group>
												<Select.Label>Game Types</Select.Label>
												{#each gameTypeSelectValues as type (type.value)}
													<Select.Item value={type.value} label={type.label}>
														{type.label}
													</Select.Item>
												{/each}
											</Select.Group>
										</Select.Content>
									</Select.Root>
									<Field.Error errors={gameTypeIssues} />
								</Field.Field>
							</div>

							<!-- Game Notes -->
							<div class="grid grid-cols-1 gap-4">
								<Field.Field data-invalid={notesIssues ? true : undefined}>
									<Field.Label for="notes">Game Notes</Field.Label>
									<Textarea placeholder="Games notes..." bind:value={notes} name="notes" />
									<Field.Error errors={notesIssues} />
								</Field.Field>
							</div>
						</Field.Group>
					</Field.Set>
					<Field.Separator />
					<Field.Field orientation="horizontal">
						<Button type="submit" class="min-w-20">
							{#if submitting}
								<Spinner />
							{:else}
								Save
							{/if}
						</Button>
						<Button variant="outline" type="button" href="/games">Cancel</Button>
					</Field.Field>
				</Field.Group>
			</Tabs.Content>
			<Tabs.Content value="score">Game Score goes here</Tabs.Content>
			<Tabs.Content value="player-stats">Player Stats goes here</Tabs.Content>
			<Tabs.Content value="Goalies">Goalie Stats</Tabs.Content>
		</form>
	</Tabs.Root>
</main>

<style>
	/* Winner gets a jersey-colour edge and a faint wash bleeding in from the left */
	.team-row.winner {
		background: linear-gradient(
			90deg,
			color-mix(in oklab, var(--accent) 14%, transparent),
			transparent 65%
		);
	}

	.team-row.winner::before {
		content: '';
		position: absolute;
		inset-block: 0.375rem;
		left: 0;
		width: 3px;
		border-radius: 0 2px 2px 0;
		background: var(--accent);
	}

	.team-row .caret {
		opacity: 0;
	}

	.team-row.winner .caret {
		opacity: 1;
	}

	/* Loser fades back so the result reads at a glance */
	.team-row.loser .team-name,
	.team-row.loser .score {
		color: var(--muted-foreground);
	}

	.team-row.loser :global(svg) {
		opacity: 0.55;
	}
</style>
