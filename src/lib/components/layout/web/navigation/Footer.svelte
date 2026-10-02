<script lang="ts">
	import TuesdayNight from '$lib/components/layout/assets/tuesday-night.png';
	import { Beer } from '@lucide/svelte';

	const currentYear = new Date().getFullYear();

	const links = [
		{ href: '/games/upcoming', label: 'Upcoming Games' },
		{ href: '/games/history', label: 'Game History' },
		{ href: '/stats', label: 'Stats' }
	];
</script>

<footer class="mt-16 w-full border-t border-secondary py-8 text-sm text-muted-foreground">
	<div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
		<a href="/" class="flex items-center gap-3 self-start md:self-auto">
			<img src={TuesdayNight} alt="" class="h-9 w-auto" />
			<span class="font-bold text-primary-foreground">Tuesday Night Hockey</span>
		</a>

		<nav aria-label="Footer">
			<ul class="flex flex-wrap gap-x-6 gap-y-2">
				{#each links as link (link.label)}
					<li>
						<a
							href={link.href}
							class="rounded-sm transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>

	<div
		class="mt-6 flex flex-col gap-1 border-t border-secondary/50 pt-6 text-xs md:flex-row md:justify-between"
	>
		<p>{currentYear} Tuesday Night Hockey</p>
		<p class="itemsn-center flex gap-1">
			<Beer class="size-4 rotate-12" /> Built between shifts by E. Steip
		</p>
	</div>
</footer>
