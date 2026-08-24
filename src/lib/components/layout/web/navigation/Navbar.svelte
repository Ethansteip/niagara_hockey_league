<script lang="ts">
	import { Zap } from '@lucide/svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Menu from '$lib/components/layout/web/navigation/Menu.svelte';
</script>

<nav
	class="sticky mx-auto my-4 flex h-18 w-full items-center justify-between rounded-xl border-2 border-secondary bg-background px-3 shadow md:w-full md:px-6"
>
	<!-- Section 1 -->
	<div class="flex w-1/4 justify-start gap-2 md:w-1/3">
		<a href="/">
			<Zap />
		</a>
		<div class="hidden w-full gap-2 md:flex">
			<Separator orientation="vertical" />
			<h1 class="text-md md:text-large text-center font-bold">Tuesday Night Hockey</h1>
		</div>
	</div>
	<!-- Section 2 -->
	<div class="flex w-1/2 justify-center md:hidden">
		<h1 class="text-md md:text-large text-center font-bold">Tuesday Night Hockey</h1>
	</div>
	<!-- Section 3 -->
	<div class="flex w-1/4 md:w-1/2">
		<div class="hidden w-full items-center justify-end gap-2 md:flex">
			<Button variant="ghost" href="/">Upcoming Games</Button>
			<Button variant="ghost" href="/">All Games</Button>
			<Button variant="ghost" href="/">Stats</Button>
		</div>
		<div class="flex w-full items-center justify-end md:hidden">
			<Menu />
		</div>
	</div>
</nav>
