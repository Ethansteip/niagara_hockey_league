# Profile Data Usage Guide

Your profile data is now globally available across all pages and components via `$page.data.profile`!

## How It Works

1. **hooks.server.ts** - Fetches the profile from the database for authenticated users
2. **+layout.server.ts** - Loads the profile data into the page store
3. **app.d.ts** - Provides TypeScript types for `profile` throughout your app

## Example Usage

### In Any Svelte Component

```svelte
<script lang="ts">
  import { page } from '$app/stores';

  // Access profile data
  $: profile = $page.data.profile;
  $: session = $page.data.session;
</script>

{#if profile}
  <div>
    <h1>Welcome, {profile.firstName} {profile.lastName}!</h1>
    {#if profile.avatarUrl}
      <img src={profile.avatarUrl} alt="Avatar" />
    {/if}
    {#if profile.position}
      <p>Position: {profile.position}</p>
    {/if}
  </div>
{/if}
```

### Update Your NavUser Component Usage

In `Navbar.svelte`, you should update line 64 to pass profile data:

**Before:**

```svelte
<NavUser user={session.user} />
```

**After:**

```svelte
<script lang="ts">
  import { page } from '$app/stores';

  let { session } = $props();
  $: profile = $page.data.profile;
</script>

<!-- Then in the template -->
{#if profile}
  <NavUser user={{
    id: profile.userId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: session?.user?.email || '',
    avatar: profile.avatarUrl || ''
  }} />
{/if}
```

### In Page Load Functions

You can also access profile in server-side load functions:

```typescript
// +page.server.ts
export const load = async ({ locals: { getProfile } }) => {
  const profile = await getProfile();

  // Do something with profile
  if (!profile) {
    redirect(303, "/complete-profile");
  }

  return { profile };
};
```

### Updating Profile Data

When you update a user's profile, use `invalidateAll()` to refresh the data:

```svelte
<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { enhance } from '$app/forms';
</script>

<form method="POST" use:enhance={() => {
  return async ({ result }) => {
    if (result.type === 'success') {
      await invalidateAll(); // This will refetch the profile
    }
  };
}}>
  <input name="firstName" />
  <input name="lastName" />
  <button type="submit">Update Profile</button>
</form>
```

## TypeScript Support

Thanks to the types in `app.d.ts`, you get full autocomplete:

```typescript
import type { Profile } from "$lib/drizzle/schema";

// Your profile will have these properties:
// - id: number
// - userId: string
// - firstName: string
// - lastName: string
// - position: "Goalie" | "Defence" | "Left-wing" | "Center" | "Right-wing" | null
// - avatarUrl: string | null
```

## Benefits

✅ **Server-side rendering** - Profile loads on first render  
✅ **Automatic reactivity** - Updates when you call `invalidateAll()`  
✅ **Type-safe** - Full TypeScript support everywhere  
✅ **No hydration issues** - Works perfectly with SSR  
✅ **Globally accessible** - Available in all components via `$page.data.profile`

## What NOT to Do

❌ Don't use localStorage for profile data - it breaks SSR  
❌ Don't fetch profile in individual components - it's already loaded  
❌ Don't use client-side Supabase queries for profile - use the server-loaded data
