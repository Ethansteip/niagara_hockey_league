<script lang="ts">
  import '../app.css';
	import Navbar from '$lib/components/layout/web/Navbar.svelte';
  import { Toaster } from '$lib/components/ui/sonner';

  let { children } = $props();
</script>

<!-- <Toaster />
<Navbar {session} {profile}/> -->
<main class="w-full h-[calc(100vh-3.8rem)]">
  {@render children?.()}
</main>
