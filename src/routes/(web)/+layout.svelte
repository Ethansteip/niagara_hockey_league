<script lang="ts">
	import '../../app.css';
	import Navbar from '$lib/components/layout/web/navigation/Navbar.svelte';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();
</script>

<!-- <Toaster /> -->
<main class="flex h-full w-full flex-col bg-background">
	<div class="mx-auto h-full w-[95%] max-w-5xl">
		<Navbar />
		{@render children?.()}
	</div>
</main>
