<script lang="ts">
	import * as Field from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
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
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { getGame, updateGame } from '../../games.remote';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import Logo, { type TeamName } from '$lib/components/layout/assets/Logo.svelte';
	import { getSeasons } from '../../../seasons/seasons.remote';
	import { getTeams } from '../../../teams/teams.remote';

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

	/* Scores */
	let homeScore = $derived(game.homeScore);
	let awayScore = $derived(game.awayScore);

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
</script>

<main class="flex flex-col items-center justify-center gap-3">
	<form {...editGame} bind:this={form} class="w-full">
		<!-- Custom components (Calendar, Checkbox) don't render named form controls,
		     so hidden inputs carry their values into the submitted form data -->
		<input {...editGame.fields.startDate.as('hidden', startDateTime)} />
		<input {...editGame.fields.gameStatus.as('hidden', 'scheduled')} />

		<Field.Group>
			<Field.Set>
				<Field.Legend>Edit Game: {id}</Field.Legend>
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
	</form>
</main>
