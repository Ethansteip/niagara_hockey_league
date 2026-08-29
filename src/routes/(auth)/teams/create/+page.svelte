<script lang="ts">
	import * as Field from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { createTeam } from '../teams.remote';
	import { onNavigate } from '$app/navigation';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';

	let teamNameIssues = $derived(createTeam.fields.teamName.issues());
	let teamCodeIssues = $derived(createTeam.fields.teamCode.issues());
	let logoUrlIssues = $derived(createTeam.fields.logoUrl.issues());

	let form: HTMLFormElement;
	let submitting = $derived<boolean>(!!createTeam.pending);

	onNavigate(() => {
		form.reset();
	});
</script>

<main class="flex flex-col items-center justify-center gap-3">
	<form {...createTeam} bind:this={form} class="w-full">
		<Field.Group>
			<Field.Set>
				<Field.Legend>Create A New Hockey Season</Field.Legend>
				<Field.Description>Assign games to a season once it has been created.</Field.Description>
				<Field.Group>
					<Field.Field data-invalid={teamNameIssues ? true : undefined}>
						<Field.Label for="season-name">Team Name</Field.Label>
						<Input id="team-name" {...createTeam.fields.teamName.as('text')} placeholder="Leafs" />
						<Field.Error errors={teamNameIssues} />
					</Field.Field>
					<Field.Field data-invalid={teamCodeIssues ? true : undefined}>
						<Field.Label for="team-code">Team Code</Field.Label>
						<Input
							id="team-code"
							{...createTeam.fields.teamCode.as('text')}
							placeholder="L$@fs_1102"
						/>
						<Field.Error errors={teamCodeIssues} />
					</Field.Field>
					<Field.Field data-invalid={logoUrlIssues ? true : undefined}>
						<Field.Label for="logo-url">Logo URL</Field.Label>
						<Input
							id="logo-url"
							{...createTeam.fields.logoUrl.as('text')}
							placeholder="https://railway.storage/leafs-icon"
						/>
						<Field.Error errors={logoUrlIssues} />
					</Field.Field>
				</Field.Group>
			</Field.Set>
			<Field.Separator />
			<Field.Field orientation="horizontal">
				<Button type="submit" class="min-w-20" disabled={!!createTeam.pending}>
					{#if submitting}
						<Spinner />
					{:else}
						Submit
					{/if}
				</Button>
				<Button variant="outline" type="button" href="/teams">Cancel</Button>
			</Field.Field>
		</Field.Group>
	</form>
</main>
