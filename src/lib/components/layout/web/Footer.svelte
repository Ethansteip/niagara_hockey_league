<script>
	import { PUBLIC_APP_NAME } from '$env/static/public';
	import { Separator } from '$lib/components/ui/separator';
	import RedditIcon from '$lib/assets/icons/reddit.svg';
	import DiscordIcon from '$lib/assets/icons/discord.svg';
	import Twitter from '$lib/assets/icons/twitter.svelte';
	import { Bird } from '@lucide/svelte';
</script>

<div class="w-full border-t bg-background">
	<div class="container mx-auto px-10 py-12">
		<!-- Main Footer Content -->
		<div class="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
			<!-- Company Info Section -->
			<div class="space-y-4 lg:col-span-2">
				<div class="flex items-center gap-3">
					<Bird class="h-6 w-6 stroke-primary" />
					<h2 class="text-xl font-bold">{PUBLIC_APP_NAME}</h2>
				</div>
				<p class="max-w-md text-sm text-muted-foreground">
					Building your next Sveltekit application has never been easier. Get started today for
					free.
				</p>
				<div class="flex items-center gap-4">
					<a href="##"
						><img
							src={RedditIcon}
							alt="Reddit"
							class="size-5 text-muted-foreground transition-colors hover:text-primary"
						/></a
					>
					<a href="##"
						><img
							src={DiscordIcon}
							alt="Discord"
							class="size-5 text-muted-foreground transition-colors hover:text-primary"
						/></a
					>
					<a href="##"><Twitter className="size-5 fill-muted-foreground" /> </a>
				</div>
			</div>

			<!-- Product Links -->
			<div class="space-y-4">
				<h3 class="font-semibold text-foreground">Product</h3>
				<ul class="space-y-3">
					<li>
						<a href="##" class="text-sm text-muted-foreground transition-colors hover:text-primary"
							>Overview</a
						>
					</li>
					<li>
						<a href="##" class="text-sm text-muted-foreground transition-colors hover:text-primary"
							>Features</a
						>
					</li>
					<li>
						<a href="##" class="text-sm text-muted-foreground transition-colors hover:text-primary"
							>Pricing</a
						>
					</li>
					<li>
						<a href="##" class="text-sm text-muted-foreground transition-colors hover:text-primary"
							>Templates</a
						>
					</li>
					<li>
						<a href="##" class="text-sm text-muted-foreground transition-colors hover:text-primary"
							>API</a
						>
					</li>
				</ul>
			</div>

			<!-- Company Links -->
			<div class="space-y-4">
				<h3 class="font-semibold text-foreground">Company</h3>
				<ul class="space-y-3">
					<li>
						<a href="##" class="text-sm text-muted-foreground transition-colors hover:text-primary"
							>About</a
						>
					</li>
					<li>
						<a href="##" class="text-sm text-muted-foreground transition-colors hover:text-primary"
							>Blog</a
						>
					</li>
					<li>
						<a href="##" class="text-sm text-muted-foreground transition-colors hover:text-primary"
							>Careers</a
						>
					</li>
					<li>
						<a href="##" class="text-sm text-muted-foreground transition-colors hover:text-primary"
							>Press</a
						>
					</li>
					<li>
						<a href="##" class="text-sm text-muted-foreground transition-colors hover:text-primary"
							>Partners</a
						>
					</li>
				</ul>
			</div>
		</div>

		<Separator class="my-8" />

		<!-- Bottom Footer -->
		<div
			class="flex flex-col items-start justify-between gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center"
		>
			<div
				class="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between"
			>
				<p>© {new Date().getFullYear()} {PUBLIC_APP_NAME}.com. All rights reserved.</p>
				<div class="flex items-center gap-4">
					<a href="##" class="transition-colors hover:text-primary">Terms of Service</a>
					<a href="##" class="transition-colors hover:text-primary">Privacy Policy</a>
				</div>
			</div>
		</div>
	</div>
</div>
