<script lang="ts">
	import { Zap, User, Menu, ChevronRight, Calendar, NotebookPen, House } from '@lucide/svelte';
	import * as Sheet from '$lib/components/ui/sheet/index';
	import { Button } from '$lib/components/ui/button/index.js';
	import NavUser from '$lib/components/layout/web/NavUser.svelte';
	import { PUBLIC_APP_NAME } from '$env/static/public';

	let { session, profile } = $props();
	let open = $state(false);

	const closeMobileMenu = () => {
		open = false;
	}

	let logoutForm: HTMLFormElement = $state()!;

	const handleLogout = () => {
		logoutForm.requestSubmit();
		closeMobileMenu();
	}
</script>

<div class="w-full border-b border-border" id="top">
	<div id="top" class=" max-w-screen-xl mx-auto bg-background">
		<div class="flex h-[3.8rem] items-center justify-between px-4">
			<!-- Logo and Project Name -->
			<a class="flex w-1/3 items-center gap-2" href="/">
				<div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
					<Zap class="size-4" />
				</div>
				<h2 class="hidden text-center text-sm font-semibold lg:flex">{PUBLIC_APP_NAME}</h2>
			</a>

			<a href="/">
				<h2 class="text-center text-sm font-semibold lg:hidden">{PUBLIC_APP_NAME}</h2>
			</a>

			<!-- Desktop Navigation -->
			<div class="hidden w-1/3 flex-1 items-center justify-center lg:flex">
				<nav class="flex gap-6">
					<Button variant="ghost" size="sm" href="/">
						<House />
						Home
					</Button>
					<Button variant="ghost" size="sm" href="/games">
						<Calendar />
						All Games
					</Button>
					<Button variant="ghost" size="sm" href="/games/history">
						<NotebookPen />
						Game History
					</Button>
				</nav>
			</div>

			<div class="flex w-1/3 items-center justify-end gap-4">
				{#if !session}
					<Button variant="outline" href="/auth/signup" size="sm" class="hidden lg:flex group/signup">
						Sign Up 
						<ChevronRight class="h-4 w-4 transform-translate duration-200 group-hover/signup:translate-x-0.5" />
					</Button>
					<Button href="/auth" variant="outline" size="sm" class="hidden lg:flex group/signin">
						Sign In
						<ChevronRight class="h-4 w-4 transform-translate duration-200 group-hover/signin:translate-x-0.5" />
					</Button>
				{:else}
				<div class="hidden lg:flex">
					<NavUser {profile} />
				</div>
				{/if}

				<!-- Mobile Menu Button -->
				<Button variant="ghost" size="icon" class="flex lg:hidden" onclick={() => (open = true)}>
					<Menu class="h-5 w-5" />
				</Button>
			</div>
		</div>
	</div>

	<!-- Mobile Sheet/Drawer -->
	<Sheet.Root bind:open>
		<Sheet.Content side="left" class="w-80 bg-background border-r">
			<div class="flex flex-col h-full">
				<!-- Header -->
				<div class="flex items-center gap-2 p-6">
					<div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
						<Zap class="size-4" />
					</div>
					{PUBLIC_APP_NAME}
				</div>

				<!-- Navigation -->
				<div class="flex-1 p-4">
					<nav class="space-y-2">
						{#if !session}
							<div class="space-y-1">
								<Button variant="ghost" class="w-full justify-start h-11" href="/auth" onclick={closeMobileMenu}>
									<User class="size-4" />
									Sign In
								</Button>
								<Button variant="ghost" class="w-full justify-start h-11" href="/auth/signup" onclick={closeMobileMenu}>
									<User class="size-4" />
									Sign Up
								</Button>
							</div>
							
							<div class="border-t pt-4 mt-4">
								<Button variant="ghost" class="w-full justify-start h-11" href="/" onclick={closeMobileMenu}>
									<Calendar class="size-4" />
									Upcoming Games
								</Button>
								<Button variant="ghost" class="w-full justify-start h-11" href="/games" onclick={closeMobileMenu}>
									<Calendar class="size-4" />
									All Games
								</Button>
								<Button variant="ghost" class="w-full justify-start h-11" href="/games/played" onclick={closeMobileMenu}>
									<NotebookPen class="size-4" />
									Game History
								</Button>
							</div>
						{:else}
							<div class="space-y-1">
								<Button variant="ghost" class="w-full justify-start h-11" href="/app" onclick={closeMobileMenu}>
									Dashboard
								</Button>
								<Button variant="ghost" class="w-full justify-start h-11" href="/app/account" onclick={closeMobileMenu}>
									Account
								</Button>
							</div>
							
							<div class="border-t pt-4 mt-4">
								<Button variant="ghost" class="w-full justify-start h-11" href="##" onclick={closeMobileMenu}>
									About
								</Button>
								<Button variant="ghost" class="w-full justify-start h-11" href="##" onclick={closeMobileMenu}>
									Documentation
								</Button>
								<Button variant="ghost" class="w-full justify-start h-11" href="##" onclick={closeMobileMenu}>
									Pricing
								</Button>
							</div>
							
							<div class="border-t pt-4 mt-4">
								<Button 
									variant="ghost" 
									class="w-full justify-start h-11 text-destructive hover:text-destructive" 
									onclick={handleLogout}
								>
									Log Out
									<form bind:this={logoutForm} method="POST" action="/auth?/signout" class="hidden">
									</form>
								</Button>
							</div>
						{/if}
					</nav>
				</div>
			</div>
		</Sheet.Content>
	</Sheet.Root>
</div>