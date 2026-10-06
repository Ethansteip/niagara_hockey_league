<script lang="ts">
	import * as Field from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import PlusIcon from '@lucide/svelte/icons/plus';
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
	import { getGame, getGameStats, updateGame } from '$lib/remote/games/games.remote';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import Logo, { type TeamName } from '$lib/components/layout/assets/Logo.svelte';
	import { getSeasons } from '$lib/remote/seasons/seasons.remote';
	import { getTeams } from '$lib/remote/teams/teams.remote';
	import { getTeamSeasonRoster, type RosterPlayer } from '$lib/remote/rosters/rosters.remote';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { enterToNext } from '$lib/attachments/enter-to-next';

	let { params } = $props();
	// The redirect after saving updates `params` to the /games route before this page
	// unmounts, so params.id is briefly undefined. Holding on to the last valid id stops
	// the queries below from re-running with NaN
	let lastId: number;
	const id = $derived.by(() => {
		const parsed = parseInt(params.id ?? '', 10);
		if (!Number.isNaN(parsed)) lastId = parsed;
		return lastId;
	});

	// SvelteKit injects the `.for(key)` key into the submitted data as `id`
	// (overriding any form control named `id`), so the key must be a number
	// to satisfy the schema
	let editGame = $derived(updateGame.for(id));
	let game = $derived(await getGame({ id }));
	let gameStats = $derived(await getGameStats({ gameId: id }));
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
	let gameStatuses = [
		{ label: 'Scheduled', value: 'scheduled' },
		{ label: 'Final', value: 'final' },
		{ label: 'In Progress', value: 'in_progress' },
		{ label: 'Cancelled', value: 'cancelled' },
		{ label: 'Forfeit', value: 'forfeit' },
		{ label: 'Postponed', value: 'postponed' }
	];
	let gameStatusLabel = $derived(gameStatuses.find((t) => t.value === gameStatus)?.label);
	let gameStatusTriggerContent = $derived(gameStatusLabel ?? 'Select a game status');

	// Mirrors COUNTED_STATUSES in games.remote.ts - the score is official and earns points
	let isCounted = $derived(gameStatus === 'final' || gameStatus === 'forfeit');
	// Show who's ahead while the game is live, and the result once it's over
	let showResult = $derived(isCounted || gameStatus === 'in_progress');

	/* Scores */
	let homeScore = $derived(game.homeScore);
	let awayScore = $derived(game.awayScore);
	let isTie = $derived(homeScore === awayScore);

	let decidedIn = $derived<string>(game.decidedIn ?? 'regulation');
	let decidedInSelectValues = [
		{ label: 'Regulation', value: 'regulation', short: '' },
		{ label: 'Overtime', value: 'overtime', short: 'OT' },
		{ label: 'Shootout', value: 'shootout', short: 'SO' }
	];
	let decidedInOption = $derived(decidedInSelectValues.find((d) => d.value === decidedIn));

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

	/* Rosters - follow the selected teams and season, so swapping a team swaps its players */
	let rosterSeasonId = $derived(seasonId ? parseInt(seasonId, 10) : game.seasonId);
	let homeRoster = $derived(
		await getTeamSeasonRoster({ teamId: parseInt(homeTeamId, 10), seasonId: rosterSeasonId })
	);
	let awayRoster = $derived(
		await getTeamSeasonRoster({ teamId: parseInt(awayTeamId, 10), seasonId: rosterSeasonId })
	);

	/* Player Stats */
	type StatKey = 'goals' | 'assists' | 'penaltyMinutes';
	type StatLine = Record<StatKey, number>;

	const EMPTY_LINE: StatLine = { goals: 0, assists: 0, penaltyMinutes: 0 };

	const statColumns: { key: StatKey; label: string; step: number }[] = [
		{ key: 'goals', label: 'G', step: 1 },
		{ key: 'assists', label: 'A', step: 1 },
		// Most penalties are 2 minute minors
		{ key: 'penaltyMinutes', label: 'PIM', step: 2 }
	];

	// Keyed by player id, seeded with whatever has already been recorded for the game
	let statLines = $derived<Record<number, StatLine>>(
		Object.fromEntries(
			gameStats.playerStats.map(({ playerId, goals, assists, penaltyMinutes }) => [
				playerId,
				{ goals, assists, penaltyMinutes }
			])
		)
	);

	const adjustStat = (playerId: number, key: StatKey, delta: number) => {
		const line = statLines[playerId] ?? EMPTY_LINE;
		statLines = { ...statLines, [playerId]: { ...line, [key]: Math.max(0, line[key] + delta) } };
	};

	// Everyone on either roster gets submitted (once); the server drops all-zero lines
	let statPlayers = $derived([
		...new Map([...homeRoster, ...awayRoster].map((player) => [player.id, player])).values()
	]);

	const teamGoals = (roster: RosterPlayer[]) =>
		roster.reduce((total, player) => total + (statLines[player.id]?.goals ?? 0), 0);

	const playerName = (player: RosterPlayer) =>
		`${player.firstName.charAt(0).toUpperCase()}. ${player.lastName}`;

	/* Goalies */
	const SUB_GOALIE = 'sub';

	let homeGoalies = $derived(homeRoster.filter((player) => player.role === 'goalie'));
	let awayGoalies = $derived(awayRoster.filter((player) => player.role === 'goalie'));

	// The goalie already recorded for this team (a null player is a sub),
	// otherwise the team's first rostered goalie
	const defaultGoalie = (teamId: string, goalies: RosterPlayer[]) => {
		const recorded = gameStats.goalies.find((g) => g.teamId === parseInt(teamId, 10));
		if (recorded) {
			if (recorded.playerId === null) return SUB_GOALIE;
			if (goalies.some((g) => g.id === recorded.playerId)) return recorded.playerId.toString();
		}
		return goalies[0]?.id.toString() ?? SUB_GOALIE;
	};

	let homeGoalieId = $derived(defaultGoalie(homeTeamId, homeGoalies));
	let awayGoalieId = $derived(defaultGoalie(awayTeamId, awayGoalies));

	const goalieLabel = (goalieId: string, goalies: RosterPlayer[]) => {
		if (goalieId === SUB_GOALIE) return 'Sub goalie';
		const goalie = goalies.find((g) => g.id.toString() === goalieId);
		return goalie ? `${goalie.firstName} ${goalie.lastName}` : 'Select a goalie';
	};

	/* Game Date & Time */
	let startDateOpen = $state(false);
	// The DB timestamptz arrives as a JS Date; convert it into the user's local
	// zone and split it into the CalendarDate the Calendar binds to and the
	// HH:mm:ss string the time input binds to
	let storedStart = $derived(fromDate(game.startDate, getLocalTimeZone()));
	let startDateValue = $derived<CalendarDate | undefined>(toCalendarDate(storedStart));
	// HH:mm - game times are never down to the second, and iOS shows seconds if they're there
	let startTime = $derived(toTime(storedStart).toString().slice(0, 5));
	const maxDate = today(getLocalTimeZone()).add({ years: 1 });

	// Resolve the picked local date + time into an absolute instant so the
	// server can store it as a timestamptz without knowing the user's timezone
	let startDateTime = $derived.by(() => {
		if (!startDateValue || !startTime) return '';
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

	let startDateTimeLabel = $derived(
		startDateTime
			? new Date(startDateTime).toLocaleString(undefined, {
					weekday: 'short',
					month: 'short',
					day: 'numeric',
					hour: 'numeric',
					minute: '2-digit'
				})
			: 'No date'
	);

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
	let notes = $derived(game.notes ?? '');

	/* Form Issues */
	let weekNumberIssues = $derived(editGame.fields.weekNumber.issues());
	let seasonIdIssues = $derived(editGame.fields.seasonId.issues());
	let homeTeamIdIssues = $derived(editGame.fields.homeTeamId.issues());
	let awayTeamIdIssues = $derived(editGame.fields.awayTeamId.issues());
	let startDateIssues = $derived(editGame.fields.startDate.issues());
	let gameStatusIssues = $derived(editGame.fields.gameStatus.issues());
	let gameTypeIssues = $derived(editGame.fields.gameType.issues());
	let notesIssues = $derived(editGame.fields.notes.issues());
	let homeTeamScoreIssues = $derived(editGame.fields.homeScore.issues());
	let awayTeamScoreIssues = $derived(editGame.fields.awayScore.issues());
	let decidedInIssues = $derived(editGame.fields.decidedIn.issues());
	let playerStatsIssues = $derived(editGame.fields.playerStats.allIssues());
	let goalieIssues = $derived([
		...(editGame.fields.homeGoalieId.issues() ?? []),
		...(editGame.fields.awayGoalieId.issues() ?? [])
	]);

	// Flag tabs holding an error, since inactive tabs are hidden on submit
	let tabIssues = $derived({
		overview: !!(
			weekNumberIssues ||
			seasonIdIssues ||
			homeTeamIdIssues ||
			awayTeamIdIssues ||
			startDateIssues ||
			gameStatusIssues ||
			gameTypeIssues ||
			notesIssues
		),
		score: !!(homeTeamScoreIssues || awayTeamScoreIssues || decidedInIssues),
		'player-stats': !!playerStatsIssues?.length,
		goalies: goalieIssues.length > 0
	});

	let submitting = $derived<boolean>(!!editGame.pending);

	const rows = $derived([
		{
			side: 'home',
			team: currentHomeTeam?.label,
			score: homeScore,
			won: showResult && homeScore > awayScore
		},
		{
			side: 'away',
			team: currentAwayTeam?.label,
			score: awayScore,
			won: showResult && awayScore > homeScore
		}
	]);

	const tabs = [
		{ value: 'overview', label: 'Overview' },
		{ value: 'score', label: 'Score' },
		{ value: 'player-stats', label: 'Stats' },
		{ value: 'goalies', label: 'Goalies' }
	] as const;
</script>

<!-- +/- control shared by the score and player stat tabs -->
{#snippet stepper(
	value: number,
	adjust: (delta: number) => void,
	label: string,
	step: number = 1,
	size: 'lg' | 'sm' = 'sm'
)}
	<div class="flex items-center justify-between gap-1" role="group" aria-label={label}>
		<Button
			type="button"
			variant="outline"
			size="icon"
			class="{size === 'lg' ? 'size-12' : 'size-9'} touch-manipulation rounded-full"
			disabled={value <= 0}
			aria-label="Decrease {label}"
			onclick={() => adjust(-step)}
		>
			<MinusIcon class={size === 'lg' ? 'size-5' : 'size-4'} />
		</Button>
		<output
			class={size === 'lg'
				? 'w-14 text-center text-4xl leading-none font-black tabular-nums'
				: 'w-8 text-center text-lg leading-none font-bold tabular-nums'}
			aria-live="polite"
		>
			{value}
		</output>
		<Button
			type="button"
			variant="outline"
			size="icon"
			class="{size === 'lg' ? 'size-12' : 'size-9'} touch-manipulation rounded-full"
			aria-label="Increase {label}"
			onclick={() => adjust(step)}
		>
			<PlusIcon class={size === 'lg' ? 'size-5' : 'size-4'} />
		</Button>
	</div>
{/snippet}

{#snippet teamHeading(name: string | undefined, side: string)}
	<div class="flex min-w-0 flex-1 items-center gap-3">
		{#if name}
			<Logo name={name as TeamName} className="size-10 shrink-0" />
		{:else}
			<div class="size-10 shrink-0 rounded-full bg-muted"></div>
		{/if}
		<div class="min-w-0">
			<p class="truncate text-base leading-tight font-bold">{name ?? 'TBD'}</p>
			<p class="text-xs tracking-widest text-muted-foreground uppercase">{side}</p>
		</div>
	</div>
{/snippet}

<!-- Pinned to the viewport height (minus site header, inset margin and layout
     padding) so the overview card stays put and only the tab content scrolls -->
<main
	class="flex h-[calc(100svh-var(--header-height)-2rem)] flex-col items-start justify-start gap-3 md:h-[calc(100svh-var(--header-height)-6rem)]"
>
	<!-- Game overview card, a live preview of the form -->
	<article
		class="w-full shrink-0 overflow-hidden rounded-xl border border-white/5 bg-card text-card-foreground md:max-w-100"
	>
		<header
			class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-white/5 px-4 py-2.5 text-xs"
		>
			<div class="flex items-center gap-2">
				<span class="font-bold tracking-widest text-foreground uppercase">
					{gameStatusLabel ?? gameStatus}
				</span>
				{#if isCounted && decidedInOption?.short}
					<span
						class="rounded-sm bg-secondary px-1.5 py-0.5 text-[0.625rem] font-bold tracking-widest text-secondary-foreground uppercase"
					>
						{decidedInOption.short}
					</span>
				{/if}
				{#if isCounted && isTie}
					<span
						class="rounded-sm bg-secondary px-1.5 py-0.5 text-[0.625rem] font-bold tracking-widest text-secondary-foreground uppercase"
					>
						Tie
					</span>
				{/if}
			</div>
			<div class="flex items-center gap-2 text-muted-foreground">
				{#if gameType === 'playoff'}
					<Badge class="h-5 px-1.5 text-[0.625rem] tracking-wider uppercase">Playoffs</Badge>
				{/if}
				<time datetime={startDateTime}>{startDateTimeLabel}</time>
				<span aria-hidden="true">·</span>
				<span class="text-secondary-foreground">
					Week {weekNumber ?? '-'}
				</span>
			</div>
		</header>

		<ul class="flex flex-col py-1.5">
			{#each rows as row (row.side)}
				{@const name = row?.team as TeamName | undefined}
				<li
					class="team-row relative flex items-center gap-3 px-4 py-2"
					class:winner={row.won}
					class:loser={showResult && !row.won && !isTie}
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
						<span
							class="caret size-0 border-y-[5px] border-r-[6px] border-y-transparent border-r-current"
							aria-hidden="true"
						></span>
					</div>

					{#if row.won}
						<span class="sr-only">{isCounted ? 'Winner' : 'Leading'}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</article>

	<Tabs.Root value="overview" class="min-h-0 w-full flex-1">
		<Tabs.List variant="line" class="mb-2 w-full shrink-0 justify-start overflow-x-auto">
			{#each tabs as tab (tab.value)}
				<Tabs.Trigger value={tab.value} class="relative flex-1 sm:flex-none">
					{tab.label}
					{#if tabIssues[tab.value]}
						<span class="size-1.5 rounded-full bg-destructive" aria-label="Has errors"></span>
					{/if}
				</Tabs.Trigger>
			{/each}
		</Tabs.List>
		<!-- One form across every tab - inactive tabs are only hidden, so all of
		     their inputs still submit together -->
		<form
			{...editGame}
			{@attach enterToNext}
			class="flex min-h-0 w-full flex-1 flex-col overflow-y-auto"
		>
			<!-- Custom components (Calendar, steppers) don't render named form controls,
			     so hidden inputs carry their values into the submitted form data -->
			<input {...editGame.fields.startDate.as('hidden', startDateTime)} />
			<input type="hidden" name="n:homeScore" value={homeScore} />
			<input type="hidden" name="n:awayScore" value={awayScore} />
			{#each statPlayers as player, i (player.id)}
				{@const line = statLines[player.id] ?? EMPTY_LINE}
				<input type="hidden" name="n:playerStats[{i}].playerId" value={player.id} />
				<input type="hidden" name="n:playerStats[{i}].goals" value={line.goals} />
				<input type="hidden" name="n:playerStats[{i}].assists" value={line.assists} />
				<input type="hidden" name="n:playerStats[{i}].penaltyMinutes" value={line.penaltyMinutes} />
			{/each}

			<div class="flex-1 pb-4">
				<!-- Overview -->
				<Tabs.Content value="overview">
					<Field.Set>
						<Field.Group>
							<!-- Game Status & Game Type -->
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Field.Field data-invalid={gameStatusIssues ? true : undefined}>
									<Field.Label for="gameStatus">Game Status</Field.Label>
									<Select.Root type="single" name="gameStatus" bind:value={gameStatus}>
										<Select.Trigger
											id="gameStatus"
											class="w-full"
											aria-invalid={gameStatusIssues ? 'true' : undefined}
										>
											{gameStatusTriggerContent}
										</Select.Trigger>
										<Select.Content>
											<Select.Group>
												<Select.Label>Statuses</Select.Label>
												{#each gameStatuses as status (status.value)}
													<Select.Item value={status.value} label={status.label}>
														{status.label}
													</Select.Item>
												{/each}
											</Select.Group>
										</Select.Content>
									</Select.Root>
									<Field.Error errors={gameStatusIssues} />
								</Field.Field>
								<Field.Field data-invalid={gameTypeIssues ? true : undefined}>
									<Field.Label for="gameType">Game Type</Field.Label>
									<Select.Root type="single" name="gameType" bind:value={gameType}>
										<Select.Trigger
											id="gameType"
											class="w-full"
											aria-invalid={gameTypeIssues ? 'true' : undefined}
										>
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
							<!-- Season & Week Number -->
							<div class="grid grid-cols-2 gap-4">
								<Field.Field data-invalid={seasonIdIssues ? true : undefined}>
									<Field.Label for="seasonId">Season</Field.Label>
									<Select.Root type="single" name="seasonId" bind:value={seasonId}>
										<Select.Trigger
											id="seasonId"
											class="w-full"
											aria-invalid={seasonIdIssues ? 'true' : undefined}
										>
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
								<Field.Field data-invalid={weekNumberIssues ? true : undefined}>
									<Field.Label for="weekNumber">Week</Field.Label>
									<Input
										id="weekNumber"
										type="number"
										name="n:weekNumber"
										inputmode="numeric"
										pattern="[0-9]*"
										enterkeyhint="next"
										autocomplete="off"
										min="0"
										bind:value={weekNumber}
										placeholder="1"
										aria-invalid={weekNumberIssues ? 'true' : undefined}
									/>
									<Field.Error errors={weekNumberIssues} />
								</Field.Field>
							</div>
							<!-- Home and Away team -->
							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Field.Field data-invalid={homeTeamIdIssues ? true : undefined}>
									<Field.Label for="homeTeamId">Home Team</Field.Label>
									<Select.Root type="single" name="homeTeamId" bind:value={homeTeamId}>
										<Select.Trigger
											id="homeTeamId"
											class="w-full"
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
										<Select.Trigger
											id="awayTeamId"
											class="w-full"
											aria-invalid={awayTeamIdIssues ? 'true' : undefined}
										>
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

							<!-- Game Date and Time -->
							<div class="grid grid-cols-2 gap-4">
								<Field.Field data-invalid={startDateIssues ? true : undefined}>
									<Field.Label for="gameStartDate">Game Date</Field.Label>
									<Popover.Root bind:open={startDateOpen}>
										<Popover.Trigger id="gameStartDate">
											{#snippet child({ props })}
												<Button
													{...props}
													variant="outline"
													aria-invalid={startDateIssues ? 'true' : undefined}
													class="w-full justify-between font-normal"
												>
													{startDateValue
														? startDateValue.toDate(getLocalTimeZone()).toLocaleDateString()
														: 'Select date'}
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
								<Field.Field>
									<Field.Label for="gameTime">Game Time</Field.Label>
									<Input
										type="time"
										id="gameTime"
										step="60"
										bind:value={startTime}
										class="appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
									/>
								</Field.Field>
							</div>

							<!-- Game Notes -->
							<Field.Field data-invalid={notesIssues ? true : undefined}>
								<Field.Label for="notes">Game Notes</Field.Label>
								<Textarea id="notes" placeholder="Games notes..." bind:value={notes} name="notes" />
								<Field.Error errors={notesIssues} />
							</Field.Field>
						</Field.Group>
					</Field.Set>
				</Tabs.Content>

				<!-- Score -->
				<Tabs.Content value="score">
					<div class="flex flex-col gap-3">
						{#each [{ side: 'Home', name: currentHomeTeam?.label, score: homeScore, issues: homeTeamScoreIssues, adjust: (delta: number) => (homeScore = Math.max(0, homeScore + delta)) }, { side: 'Away', name: currentAwayTeam?.label, score: awayScore, issues: awayTeamScoreIssues, adjust: (delta: number) => (awayScore = Math.max(0, awayScore + delta)) }] as team (team.side)}
							<div class="rounded-xl border bg-card p-3">
								<div class="flex items-center gap-3">
									{@render teamHeading(team.name, team.side)}
									{@render stepper(team.score, team.adjust, `${team.side} score`, 1, 'lg')}
								</div>
								<Field.Error errors={team.issues} />
							</div>
						{/each}

						<Field.Field data-invalid={decidedInIssues ? true : undefined}>
							<Field.Label for="decidedIn">Decided In</Field.Label>
							<Select.Root type="single" name="decidedIn" bind:value={decidedIn}>
								<Select.Trigger
									id="decidedIn"
									class="w-full"
									aria-invalid={decidedInIssues ? 'true' : undefined}
								>
									{decidedInOption?.label ?? 'Select how the game was decided'}
								</Select.Trigger>
								<Select.Content>
									{#each decidedInSelectValues as option (option.value)}
										<Select.Item value={option.value} label={option.label}>
											{option.label}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<Field.Description>
								{#if isCounted}
									Points and standings update when you save.
								{:else}
									Points and standings only count once the game is Final or Forfeit.
								{/if}
							</Field.Description>
							<Field.Error errors={decidedInIssues} />
						</Field.Field>
					</div>
				</Tabs.Content>

				<!-- Player Stats -->
				<Tabs.Content value="player-stats">
					<div class="flex flex-col gap-4">
						<Field.Error errors={playerStatsIssues} />
						{#each [{ side: 'Home', name: currentHomeTeam?.label, roster: homeRoster, score: homeScore }, { side: 'Away', name: currentAwayTeam?.label, roster: awayRoster, score: awayScore }] as team (team.side)}
							{@const goals = teamGoals(team.roster)}
							<section class="overflow-hidden rounded-xl border bg-card">
								<header class="flex items-center gap-3 border-b px-3 py-2.5">
									{@render teamHeading(team.name, team.side)}
									<p
										class="text-right text-xs tabular-nums {goals === team.score
											? 'text-muted-foreground'
											: 'text-amber-500'}"
									>
										{goals}/{team.score} goals
										<span class="block">
											{goals === team.score ? 'match score' : 'vs. score'}
										</span>
									</p>
								</header>

								{#if team.roster.length}
									<ul class="divide-y">
										{#each team.roster as player (player.id)}
											{@const line = statLines[player.id] ?? EMPTY_LINE}
											<li
												class="flex flex-col gap-2 px-3 py-2.5 md:flex-row md:items-center md:gap-4"
											>
												<p class="min-w-0 flex-1 truncate text-sm font-semibold">
													{#if player.jerseyNumber !== null}
														<span class="mr-1 text-muted-foreground tabular-nums"
															>#{player.jerseyNumber}</span
														>
													{/if}
													{playerName(player)}
													{#if player.role === 'goalie'}
														<Badge variant="outline" class="ml-1 h-4 px-1 text-[0.625rem]">G</Badge>
													{/if}
												</p>
												<div class="grid grid-cols-3 gap-2 md:gap-4">
													{#each statColumns as stat (stat.key)}
														<div class="flex flex-col items-center gap-0.5">
															<span
																class="text-[0.625rem] font-bold tracking-widest text-muted-foreground"
															>
																{stat.label}
															</span>
															{@render stepper(
																line[stat.key],
																(delta) => adjustStat(player.id, stat.key, delta),
																`${playerName(player)} ${stat.label}`,
																stat.step
															)}
														</div>
													{/each}
												</div>
											</li>
										{/each}
									</ul>
								{:else}
									<p class="px-3 py-4 text-sm text-muted-foreground">
										No roster found for this team and season.
									</p>
								{/if}
							</section>
						{/each}
					</div>
				</Tabs.Content>

				<!-- Goalies -->
				<Tabs.Content value="goalies">
					<div class="flex flex-col gap-3">
						{#each [{ side: 'Home', name: currentHomeTeam?.label, field: 'homeGoalieId', goalies: homeGoalies }, { side: 'Away', name: currentAwayTeam?.label, field: 'awayGoalieId', goalies: awayGoalies }] as team (team.side)}
							<div class="flex flex-col gap-3 rounded-xl border bg-card p-3">
								{@render teamHeading(team.name, team.side)}
								<Field.Field>
									<Field.Label for={team.field}>{team.side} Goalie</Field.Label>
									{#if team.side === 'Home'}
										<Select.Root type="single" name="homeGoalieId" bind:value={homeGoalieId}>
											<Select.Trigger id="homeGoalieId" class="w-full">
												{goalieLabel(homeGoalieId, homeGoalies)}
											</Select.Trigger>
											{@render goalieOptions(homeGoalies)}
										</Select.Root>
									{:else}
										<Select.Root type="single" name="awayGoalieId" bind:value={awayGoalieId}>
											<Select.Trigger id="awayGoalieId" class="w-full">
												{goalieLabel(awayGoalieId, awayGoalies)}
											</Select.Trigger>
											{@render goalieOptions(awayGoalies)}
										</Select.Root>
									{/if}
								</Field.Field>
							</div>
						{/each}
						<Field.Error errors={goalieIssues.length ? goalieIssues : undefined} />
						<p class="text-xs text-muted-foreground">
							A sub goalie's goals against don't count toward any league goalie's GAA.
						</p>
					</div>
				</Tabs.Content>
			</div>

			<!-- Save bar sticks to the bottom of the scrolling form on every tab -->
			<div class="sticky bottom-0 z-10 flex gap-2 border-t bg-background py-3">
				<Button type="submit" class="flex-1 md:min-w-24 md:flex-none" disabled={submitting}>
					{#if submitting}
						<Spinner />
					{:else}
						Save
					{/if}
				</Button>
				<Button variant="secondary" class="flex-1 md:min-w-24 md:flex-none" href="/games">
					Cancel
				</Button>
			</div>
		</form>
	</Tabs.Root>
</main>

{#snippet goalieOptions(goalies: RosterPlayer[])}
	<Select.Content>
		{#if goalies.length}
			<Select.Group>
				<Select.Label>Rostered goalies</Select.Label>
				{#each goalies as goalie (goalie.id)}
					<Select.Item value={goalie.id.toString()} label="{goalie.firstName} {goalie.lastName}">
						{goalie.firstName}
						{goalie.lastName}
						{#if goalie.jerseyNumber !== null}
							<span class="text-muted-foreground">#{goalie.jerseyNumber}</span>
						{/if}
					</Select.Item>
				{/each}
			</Select.Group>
			<Select.Separator />
		{/if}
		<Select.Item value={SUB_GOALIE} label="Sub goalie">Sub goalie</Select.Item>
	</Select.Content>
{/snippet}

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
