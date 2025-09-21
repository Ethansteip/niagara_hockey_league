<script lang="ts">
	import { ChevronRight, Zap, Eye, EyeOff } from '@lucide/svelte';
	import Loading from '$lib/components/layout/Loading.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { enhance } from '$app/forms';
	import { PUBLIC_APP_NAME } from "$env/static/public";

  let password = $state('');
  let confirmPassword = $state('');

	let showPassword = $state(false);
  let showConfirmPassword = $state(false);

  let passwordsMatch = $derived(password === confirmPassword);

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
					<Card.Title class="text-2xl">Reset your password</Card.Title>
					<Card.Description>
						Enter your new password and confirm it.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<form method="POST" class="space-y-4" use:enhance={() => {
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
              <Label for="email">Password</Label>
              <div class="relative space-y-2">
                <Input bind:value={password} type={showPassword ? 'text' : 'password'} placeholder="Password" class="pr-10" name="password" required />
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
            </div>
            <div class="grid gap-3">
              <Label for="email">Confirm Password</Label>
              <div class="relative space-y-2">
                <Input bind:value={confirmPassword} type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm Password" class="pr-10" name="confirmPassword" required />
                <Button
                  variant="ghost"
                  tabindex={-1}
                  size="icon"
                  type="button"
                  class="absolute right-0 top-0"
                  onclick={() => (showConfirmPassword = !showConfirmPassword)}
                >
                  {#if showConfirmPassword}
                    <Eye class="h-4 w-4" />
                  {:else}
                    <EyeOff class="h-4 w-4" />
                  {/if}
                </Button>
              </div>
            </div>

						<Button type="submit" class="w-full" disabled={loading || !passwordsMatch}>
							{#if loading}
								<Loading />
							{:else}
								Submit
								<ChevronRight class="h-4 w-4" />
							{/if}
						</Button>
					</form>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
