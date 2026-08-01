<script lang="ts">
  import '../app.css';
	import Navbar from '$lib/components/layout/web/navigation/Navbar.svelte';
  import { Toaster } from '$lib/components/ui/sonner';

  let { children } = $props();
</script>

<!-- <Toaster /> -->
<main class="w-full h-full flex flex-col bg-background">
  <div class="w-[95%] max-w-5xl h-full mx-auto">
    <Navbar />
    {@render children?.()}
  </div>
</main>
