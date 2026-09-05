<script lang="ts">
	import * as Field from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { onNavigate } from '$app/navigation';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { updateTeam } from '../../teams.remote';

	let { data } = $props();
	let team = $derived(data?.team);
	let { name, code, logoUrl, id } = $derived(team ?? {});

	const editTeam = $derived(updateTeam.for(id));

	let teamNameIssues = $derived(editTeam.fields.teamName.issues());
	let teamCodeIssues = $derived(editTeam.fields.teamCode.issues());
	let logoUrlIssues = $derived(editTeam.fields.logoUrl.issues());

	let form: HTMLFormElement;
	let submitting = $derived<boolean>(!!editTeam.pending);

	onNavigate(() => {
		form.reset();
	});
</script>

<main class="flex flex-col items-center justify-center gap-3">
	<form {...editTeam} bind:this={form} class="w-full">
		<input {...editTeam.fields.id.as('hidden', id)} />
		<Field.Group>
			<Field.Set>
				<Field.Legend>Edit Team</Field.Legend>
				<Field.Group>
					<Field.Field data-invalid={teamNameIssues ? true : undefined}>
						<Field.Label for="team-name">Team Name</Field.Label>
						<Input
							id="team-name"
							{...editTeam.fields.teamName.as('text', name)}
							placeholder="Leafs"
						/>
						<Field.Error errors={teamNameIssues} />
					</Field.Field>
					<Field.Field data-invalid={teamCodeIssues ? true : undefined}>
						<Field.Label for="team-code">Team Code</Field.Label>
						<Input
							id="team-code"
							{...editTeam.fields.teamCode.as('text', code ?? '')}
							placeholder="L$@fs_1102"
						/>
						<Field.Error errors={teamCodeIssues} />
					</Field.Field>
					<Field.Field data-invalid={logoUrlIssues ? true : undefined}>
						<Field.Label for="logo-url">Logo URL</Field.Label>
						<Input
							id="logo-url"
							{...editTeam.fields.logoUrl.as('text', logoUrl ?? '')}
							placeholder="https://railway.storage/leafs-icon"
						/>
						<Field.Error errors={logoUrlIssues} />
					</Field.Field>
				</Field.Group>
			</Field.Set>
			<Field.Field orientation="horizontal">
				<Button type="submit" class="min-w-20" disabled={submitting}>
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
