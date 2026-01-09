<script lang="ts">
  import '../../app.css';
  import Navbar from '$lib/components/layout/web/Navbar.svelte';

  let { children, data } = $props();
</script>

<Navbar session={data?.session} profile={data?.profile}/>
<main class="w-full h-[calc(100vh-3.8rem)] max-w-4xl mx-auto">
  {@render children?.()}
</main>