<script lang="ts">
	import { ChevronRight, Zap } from '@lucide/svelte';
	import Loading from '$lib/components/layout/Loading.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import { PUBLIC_APP_NAME } from "$env/static/public";

	let loading = $state(false);
</script>

<div class="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
	<div class="flex w-full max-w-md flex-col gap-6">
		<a href="##" class="items-center gap-2 self-center font-medium hidden md:flex">
			<div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
				<Zap class="size-4" />
			</div>
			{PUBLIC_APP_NAME}
		</a>
		<div class="flex flex-col gap-6">
			<Card.Root>
				<Card.Header class="text-center">
					<Card.Title class="text-2xl">Forgot your password?</Card.Title>
					<Card.Description>
						Enter your email address and we'll send you a link to reset your password.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<form method="POST" class="space-y-6" use:enhance={() => {
						loading = true;
						return async ({ update, result }) => {
							loading = false;
							update();
							if (result.type === 'failure' && 'data' in result) {
								const message = result.data?.message as string;
								toast.error(message);
							}
							if (result.type === 'success' && 'data' in result) {
								const message = result.data?.message as string;
								toast.success(message);
							}
						};
					}}>
						<div class="grid gap-3">
							<Label for="email">Email</Label>
							<Input 
								id="email" 
								type="email" 
								name="email" 
								placeholder="me@example.com" 
								required 
								autofocus 
							/>
						</div>

						<Button type="submit" class="w-full" disabled={loading}>
							{#if loading}
								<Loading />
							{:else}
								Send Reset Link
								<ChevronRight class="h-4 w-4" />
							{/if}
						</Button>

						<div class="text-center text-muted-foreground text-sm">
							Remember your password? 
							<a href="/auth" class="underline text-primary hover:underline">Sign in</a>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
