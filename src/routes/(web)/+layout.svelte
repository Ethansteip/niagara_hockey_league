<script lang="ts">
	import '../../app.css';
	import Navbar from '$lib/components/layout/web/navigation/Navbar.svelte';

	let { children } = $props();
</script>

<main class="flex h-full w-full flex-col bg-background">
	<div class="mx-auto h-full w-[95%] max-w-5xl">
		<Navbar />
		{@render children?.()}
	</div>
</main>
