<script lang="ts">
	import { Eye, EyeOff, ChevronRight } from '@lucide/svelte';
	import Loading from '$lib/components/layout/Loading.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
  import { enhance } from '$app/forms';
	import { createEnhanceHook } from '$lib/hooks/createEnhanceHook';

	let showPassword = $state(false);
	let loading = $state(false);
	let setLoading = (value:  boolean) => (loading = value);
</script>

<div class="flex h-screen items-center justify-center p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Content class="pt-6">
			<h2 class="mb-2 text-3xl font-bold">Log in to your account</h2>
			<p class="mb-6 text-muted-foreground">
				Don't have an account? <a href="/auth/signup" class="text-primary hover:underline">Create account</a
				>
			</p>

			<form method="POST" action="?/signin_email" class="space-y-4" use:enhance={createEnhanceHook({
						successToast: false, // Display a success toast on successful form submission
						failureToast: true, // Display an error toast on unsuccessful form submission
						successRedirect: "/app", // Specify form redirect here - eg. "/some-page"
						setLoading // Manages loading indicator
					})}>
				<div class="space-y-2">
					<Input type="email" placeholder="Email" name="email" autofocus required/>
				</div>

				<div class="relative space-y-2">
					<Input type={showPassword ? 'text' : 'password'} placeholder="Password" class="pr-10" name="password" required/>
					<Button
						variant="ghost"
						tabindex={-1}
						size="icon"
						type="button"
						class="absolute right-0 top-0"
						onclick={() => (showPassword = !showPassword)}
					>
						{#if showPassword}
							<Eye class="h-4 w-4" />
						{:else}
							<EyeOff class="h-4 w-4" />
						{/if}
					</Button>
				</div>

				<div class="flex items-center justify-end">
					<a href="/auth/forgot-password" class="text-sm text-primary hover:underline">Forgot password?</a>
				</div>

				<Button type="submit" class="w-full" disabled={loading}>
					{#if loading}
						<Loading />
					{:else}
						Sign In
						<ChevronRight class="h-4 w-4" />
					{/if}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
