<script lang="ts">
	import * as Field from '$lib/components/ui/field/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { getPlayer, updatePlayer } from '../../players.remote';
	import Spinner from '$lib/components/ui/spinner/spinner.svelte';
	import { Switch } from '$lib/components/ui/switch/index.js';

	let { params } = $props();
	const id = $derived(parseInt(params.id, 10));
	let editPlayer = $derived(updatePlayer.for(id));

	let player = $derived(await getPlayer({ id: id }));

	let firstNameIssues = $derived(editPlayer.fields.firstName.issues());
	let lastNameIssues = $derived(editPlayer.fields.lastName.issues());

	let isActiveChecked = $derived(player.active ?? true);
	let roleIssues = $derived(editPlayer.fields.role.issues());
	let roles = [
		{ value: 'player', label: 'Player' },
		{ value: 'goalie', label: 'Goalie' }
	];
	let role = $derived<string>(roles.find((r) => r.value === player.role)?.value ?? 'player');

	let roleTriggerContent = $derived(
		roles.find((r) => r.value === role)?.label ?? 'Select a player role'
	);

	let form: HTMLFormElement;
	let submitting = $derived<boolean>(!!editPlayer.pending);
</script>

<main class="flex flex-col items-center justify-center gap-3">
	<form {...editPlayer} bind:this={form} class="w-full">
		<input {...editPlayer.fields.active.as('hidden', isActiveChecked)} />
		<Field.Group>
			<Field.Set>
				<Field.Legend>Create A New Player</Field.Legend>
				<Field.Group>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Field.Field data-invalid={firstNameIssues ? true : undefined}>
							<Field.Label for="firstName">First Name</Field.Label>
							<Input
								id="firstName"
								{...editPlayer.fields.firstName.as('text', player.firstName)}
								placeholder="John"
							/>
							<Field.Error errors={firstNameIssues} />
						</Field.Field>
						<Field.Field data-invalid={lastNameIssues ? true : undefined}>
							<Field.Label for="lastName">Last Name</Field.Label>
							<Input
								id="lastName"
								{...editPlayer.fields.lastName.as('text', player.lastName)}
								placeholder="Doe"
							/>
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
			<Field.Set>
				<Field.Legend>Active Player</Field.Legend>
				<Field.Group>
					<Field.Field orientation="horizontal">
						<Switch bind:checked={isActiveChecked} id="active" />
						<Field.Label for="active" class="font-normal">Player is active</Field.Label>
					</Field.Field>
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
