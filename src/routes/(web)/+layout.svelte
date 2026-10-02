<script lang="ts">
	import '../../app.css';
	import Navbar from '$lib/components/layout/web/navigation/Navbar.svelte';
	import Footer from '$lib/components/layout/web/navigation/Footer.svelte';

	let { children } = $props();
</script>

<main class="w-full bg-background">
	<!-- min-h-dvh + flex-1 on the content pins the footer to the bottom on short pages -->
	<div class="mx-auto flex min-h-dvh w-[95%] max-w-5xl flex-col">
		<Navbar />
		<div class="flex-1">
			{@render children?.()}
		</div>
		<Footer />
	</div>
</main>
