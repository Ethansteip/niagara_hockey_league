<script lang="ts">
	import Leafs from './Leafs.svelte';
	import Bruins from './Bruins.svelte';
	import Habs from './Habs.svelte';
	import Wings from './Wings.svelte';
	import { type Component } from 'svelte';
	import { Zap } from '@lucide/svelte';

	export type TeamName = 'Leafs' | 'Habs' | 'Bruins' | 'Wings';

	type Props = {
		name: TeamName;
		className?: string;
	};

	let { name, className = '' }: Props = $props();

	const logos = new Map<string, Component<any>>([
		['Leafs', Leafs],
		['Bruins', Bruins],
		['Habs', Habs],
		['Wings', Wings]
	]);

	const Logo = $derived(logos.get(name));
</script>

{#if Logo}
	<Logo {className} />
{:else}
	<Zap />
{/if}
