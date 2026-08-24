<script lang="ts">
	import * as Field from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { getLocalTimeZone, today, type CalendarDate } from '@internationalized/date';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { createSeason } from '../seasons.remote';

	let startDateOpen = $state(false);
	let startDateValue = $state<CalendarDate | undefined>();
	let endDateOpen = $state(false);
	let endDateValue = $state<CalendarDate | undefined>();
	let isActiveChecked = $state(false);

	const maxDate = today(getLocalTimeZone()).add({ years: 1 });

	let seasonNameIssues = $derived(createSeason.fields.seasonName.issues());
	let startDateIssues = $derived(createSeason.fields.startDate.issues());
	let endDateIssues = $derived(createSeason.fields.endDate.issues());
</script>

<main class="flex flex-col items-center justify-center gap-3">
	<form {...createSeason} class="w-full">
		<!-- Custom components (Calendar, Checkbox) don't render named form controls,
		     so hidden inputs carry their values into the submitted form data -->
		<input {...createSeason.fields.startDate.as('hidden', startDateValue?.toString() ?? '')} />
		<input {...createSeason.fields.endDate.as('hidden', endDateValue?.toString() ?? '')} />
		<input {...createSeason.fields.isActive.as('hidden', isActiveChecked)} />

		<Field.Group>
			<Field.Set>
				<Field.Legend>Create A New Hockey Season</Field.Legend>
				<Field.Description>Assign games to a season once it has been created.</Field.Description>
				<Field.Group>
					<Field.Field data-invalid={seasonNameIssues ? true : undefined}>
						<Field.Label for="season-name">Season Name</Field.Label>
						<Input
							id="season-name"
							{...createSeason.fields.seasonName.as('text')}
							placeholder="2026-2027 season"
						/>
						<Field.Error errors={seasonNameIssues} />
					</Field.Field>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Field.Field class="col-span-1" data-invalid={startDateIssues ? true : undefined}>
							<Field.Label for="season-start-date-popover">Start Date</Field.Label>
							<Popover.Root bind:open={startDateOpen}>
								<Popover.Trigger id="season-start-date-popover">
									{#snippet child({ props })}
										<Button
											{...props}
											variant="outline"
											aria-invalid={startDateIssues ? 'true' : undefined}
											class="w-48 justify-between font-normal"
										>
											{startDateValue
												? startDateValue.toDate(getLocalTimeZone()).toLocaleDateString()
												: 'Select start date'}
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
						<Field.Field class="col-span-1" data-invalid={endDateIssues ? true : undefined}>
							<Field.Label for="season-end-date-popover">End Date</Field.Label>
							<Popover.Root bind:open={endDateOpen}>
								<Popover.Trigger id="season-end-date-popover">
									{#snippet child({ props })}
										<Button
											{...props}
											variant="outline"
											aria-invalid={endDateIssues ? 'true' : undefined}
											class="w-48 justify-between font-normal"
										>
											{endDateValue
												? endDateValue.toDate(getLocalTimeZone()).toLocaleDateString()
												: 'Select end date'}
											<ChevronDownIcon />
										</Button>
									{/snippet}
								</Popover.Trigger>
								<Popover.Content class="w-auto overflow-hidden p-0" align="start">
									<Calendar
										type="single"
										bind:value={endDateValue}
										captionLayout="dropdown"
										onValueChange={() => {
											endDateOpen = false;
										}}
										maxValue={maxDate}
									/>
								</Popover.Content>
							</Popover.Root>
							<Field.Error errors={endDateIssues} />
						</Field.Field>
					</div>
				</Field.Group>
			</Field.Set>
			<Field.Separator />
			<Field.Set>
				<Field.Legend>Current Active Season</Field.Legend>
				<Field.Description>Assign this season as the currently active season.</Field.Description>
				<Field.Group>
					<Field.Field orientation="horizontal">
						<Checkbox bind:checked={isActiveChecked} id="season-active" />
						<Field.Label for="season-active" class="font-normal">
							Assign as current active season
						</Field.Label>
					</Field.Field>
				</Field.Group>
			</Field.Set>
			<Field.Separator />
			<Field.Field orientation="horizontal">
				<Button type="submit" disabled={!!createSeason.pending}>Submit</Button>
				<Button variant="outline" type="button" href="/seasons">Cancel</Button>
			</Field.Field>
		</Field.Group>
	</form>
</main>
