<script lang="ts">
let { data } = $props()
let profile = $derived(data.profile);
</script>

<h1>Welcome to the profile page!</h1>
{JSON.stringify(profile)}