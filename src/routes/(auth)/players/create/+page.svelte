<script lang="ts">
	import * as Field from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { createPlayer } from '../players.remote';
	import { onNavigate } from '$app/navigation';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';

	let firstNameIssues = $derived(createPlayer.fields.firstName.issues());
	let lastNameIssues = $derived(createPlayer.fields.lastName.issues());

	let roleIssues = $derived(createPlayer.fields.role.issues());
	let role = $state<string>();

	let roles = [
		{ value: 'player', label: 'Player' },
		{ value: 'goalie', label: 'Goalie' }
	];

	let roleTriggerContent = $derived(
		roles.find((r) => r.value === role)?.label ?? 'Select a player role'
	);

	let form: HTMLFormElement;
	let submitting = $derived<boolean>(!!createPlayer.pending);

	onNavigate(() => {
		form.reset();
	});
</script>

<main class="flex flex-col items-center justify-center gap-3">
	<form {...createPlayer} bind:this={form} class="w-full">
		<Field.Group>
			<Field.Set>
				<Field.Legend>Create A New Player</Field.Legend>
				<Field.Group>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Field.Field data-invalid={firstNameIssues ? true : undefined}>
							<Field.Label for="firstName">First Name</Field.Label>
							<Input
								id="firstName"
								{...createPlayer.fields.firstName.as('text')}
								placeholder="John"
							/>
							<Field.Error errors={firstNameIssues} />
						</Field.Field>
						<Field.Field data-invalid={lastNameIssues ? true : undefined}>
							<Field.Label for="lastName">Last Name</Field.Label>
							<Input id="lastName" {...createPlayer.fields.lastName.as('text')} placeholder="Doe" />
							<Field.Error errors={lastNameIssues} />
						</Field.Field>
					</div>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Field.Field data-invalid={roleIssues ? true : undefined}>
							<Field.Label for="role">Role</Field.Label>
							<Select.Root type="single" name="role" bind:value={role}>
								<Select.Trigger
									class="flex items-center"
									aria-invalid={roleIssues ? 'true' : undefined}
								>
									{roleTriggerContent}
								</Select.Trigger>
								<Select.Content>
									<Select.Group>
										<Select.Label>Teams</Select.Label>
										{#each roles as role (role.value)}
											<Select.Item value={role.value} label={role.label}>{role.label}</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
							<Field.Error errors={roleIssues} />
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
						Submit
					{/if}
				</Button>
				<Button variant="outline" type="button" href="/players">Cancel</Button>
			</Field.Field>
		</Field.Group>
	</form>
</main>
