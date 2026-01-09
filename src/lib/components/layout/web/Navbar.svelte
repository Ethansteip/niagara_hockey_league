<script lang="ts">
	import { Zap, User, Menu, ChevronRight, Calendar, NotebookPen, House, Wallpaper, UserPen } from '@lucide/svelte';
	import * as Sheet from '$lib/components/ui/sheet/index';
	import { Button } from '$lib/components/ui/button/index.js';
	import NavUser from '$lib/components/layout/web/NavUser.svelte';
	import { Separator } from "$lib/components/ui/separator/index.js";
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
	<div id="top" class="max-w-4xl mx-auto bg-background">
		<div class="flex h-[3.8rem] items-center justify-between px-4">
			<!-- Logo and Project Name -->
			<a class="flex items-center gap-2" href="/">
				<div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
					<Zap class="size-4" />
				</div>
				<h2 class="hidden text-center text-sm font-semibold lg:flex">{PUBLIC_APP_NAME}</h2>
			</a>

			<a href="/">
				<h2 class="text-center text-sm font-semibold lg:hidden">{PUBLIC_APP_NAME}</h2>
			</a>

			<!-- Desktop Navigation -->
			<div class="hidden flex-1 items-center justify-end lg:flex">
				<nav class="flex gap-6">
					<Button variant="ghost" size="sm" href="/">
						<House />
						Home
					</Button>
					<Button variant="ghost" size="sm" href="/games">
						<Calendar />
						Upcoming Games
					</Button>
					<Button variant="ghost" size="sm" href="/games/history">
						<NotebookPen />
						Game History
					</Button>
				</nav>
			</div>

			<div class="flex items-center justify-end gap-4">
				

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
						<div class="border-t pt-4 flex flex-col space-y-3">
								<Button variant="ghost" class="w-full justify-start h-11" href="/" onclick={closeMobileMenu}>
									<House class="size-4" />
									Home
								</Button>
								<Button variant="ghost" class="w-full justify-start h-11" href="/games" onclick={closeMobileMenu}>
									<Calendar class="size-4" />
									Upcoming Games
								</Button>
								<Button variant="ghost" class="w-full justify-start h-11" href="/games/history" onclick={closeMobileMenu}>
									<NotebookPen class="size-4" />
									Game History
								</Button>
							</div>
					</nav>
				</div>
			</div>
		</Sheet.Content>
	</Sheet.Root>
</div>