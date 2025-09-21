<script lang="ts">
	import { Eye, EyeOff, ChevronRight } from '@lucide/svelte';
	import Loading from '$lib/components/layout/Loading.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
  import { toast } from 'svelte-sonner';
  import { enhance } from '$app/forms';

	let showPassword = $state(false);
	let loading = $state(false);
</script>

<div class="flex h-screen items-center justify-center p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Content class="pt-6">
			<h2 class="mb-2 text-3xl font-bold">Log in to your account</h2>
			<p class="mb-6 text-muted-foreground">
				Don't have an account? <a href="/auth/signup" class="text-primary hover:underline">Create account</a
				>
			</p>

			<form method="POST" action="?/signin_email" class="space-y-4" use:enhance={() => {
        loading = true;
        return async ({ update, result }) => {
            loading = false;
            update();
            if (result.type === 'failure' && 'data' in result) {
              const message = result.data?.message as string;
              toast.error(message);
            }
          };
      }}>
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

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<Separator class="my-4" />
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span class="bg-background px-2 text-muted-foreground">Or continue with</span>
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<Button variant="outline" class="w-full">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path
								d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
								fill="currentColor"
							/>
						</svg>
						Sign In with Google
					</Button>
					<Button variant="outline" class="w-full">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path
								d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
								fill="currentColor"
							/>
						</svg>
						Sign In with Apple
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
