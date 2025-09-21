<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Switch } from '$lib/components/ui/switch';
	import * as Tabs from '$lib/components/ui/tabs/index';
	import { Badge } from '$lib/components/ui/badge';
	import { Upload, Pencil } from '@lucide/svelte';

	const userProfile = $state({
		name: 'John Doe',
		email: 'john@example.com',
		username: 'johndoe',
		avatar: 'https://github.com/shadcn.png',
		bio: 'Software developer and design enthusiast',
		notifications: {
			email: true,
			push: false,
			marketing: true,
			security: true
		}
	});
</script>

<div class="container mx-auto max-w-3xl p-4 py-8">
	<div class="space-y-6">
		<!-- Header with Avatar - Make it more compact on mobile -->
		<div class="flex items-start gap-4 sm:flex-col sm:items-center">
			<Avatar class="h-16 w-16 border-2 border-border sm:h-24 sm:w-24">
				<AvatarImage src={userProfile.avatar} alt={userProfile.name} />
				<AvatarFallback>JD</AvatarFallback>
			</Avatar>
			<div class="sm:text-center">
				<h2 class="text-xl font-semibold">{userProfile.name}</h2>
				<p class="text-sm text-muted-foreground">@{userProfile.username}</p>
			</div>
		</div>

		<!-- Make tabs more compact on mobile -->
		<Tabs.Root value="general" class="w-full">
			<Tabs.List class="flex w-full flex-row items-center justify-around gap-2">
				<Tabs.Trigger value="general" class="w-1/3 text-xs sm:text-base">General</Tabs.Trigger>
				<Tabs.Trigger value="notifications" class="w-1/3 text-xs sm:text-base"
					>Notifications</Tabs.Trigger
				>
				<Tabs.Trigger value="security" class="w-1/3 text-xs sm:text-base">Security</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="general" class="mt-4 sm:mt-6">
				<div class="space-y-6 sm:space-y-8">
					<div>
						<h3 class="text-xl font-semibold tracking-tight sm:text-2xl">General Settings</h3>
						<p class="text-sm text-muted-foreground">
							Manage your profile information and preferences.
						</p>
					</div>

					<Separator />

					<!-- Improved Avatar Upload Section - Simplified on mobile -->
					<div class="rounded-lg border bg-card p-4 sm:p-6">
						<div class="flex flex-col gap-4">
							<div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
								<div class="group relative shrink-0">
									<Avatar class="h-20 w-20 border-2 border-border sm:h-32 sm:w-32">
										<AvatarImage src={userProfile.avatar} alt={userProfile.name} />
										<AvatarFallback>JD</AvatarFallback>
									</Avatar>
									<div
										class="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100"
									>
										<Button
											variant="ghost"
											class="text-white hover:bg-transparent hover:text-white"
										>
											<Pencil />
										</Button>
									</div>
								</div>
								<div class="flex-1 space-y-2 text-center sm:text-left">
									<div class="space-y-1">
										<h4 class="font-medium">Profile Picture</h4>
										<p class="text-sm text-muted-foreground">
											Your profile picture will be shown across the platform
										</p>
									</div>
									<div class="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
										<Button variant="outline" class="gap-2">
											<Upload class="h-4 w-4" />
											Upload new photo
										</Button>
										<Button
											variant="ghost"
											class="text-destructive hover:bg-destructive/10 hover:text-destructive"
										>
											Remove photo
										</Button>
									</div>
									<p class="text-xs text-muted-foreground">
										Supported formats: JPG, GIF or PNG. Maximum file size: 3MB.
									</p>
								</div>
							</div>
						</div>
					</div>

					<div class="grid gap-6 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="name">Full Name</Label>
							<Input id="name" bind:value={userProfile.name} />
						</div>
						<div class="space-y-2">
							<Label for="username">Username</Label>
							<Input id="username" bind:value={userProfile.username} />
						</div>
						<div class="space-y-2 sm:col-span-2">
							<Label for="email">Email</Label>
							<Input id="email" type="email" bind:value={userProfile.email} />
						</div>
						<div class="space-y-2 sm:col-span-2">
							<Label for="bio">Bio</Label>
							<Input id="bio" bind:value={userProfile.bio} />
						</div>
					</div>

					<div class="flex justify-end gap-3">
						<Button variant="outline">Cancel</Button>
						<Button>Save Changes</Button>
					</div>
				</div>
			</Tabs.Content>

			<Tabs.Content value="notifications" class="mt-6">
				<div class="space-y-8">
					<div>
						<h3 class="mb-1 text-2xl font-semibold tracking-tight">Notification Preferences</h3>
						<p class="text-muted-foreground">Choose how you want to receive updates and alerts.</p>
					</div>

					<Separator />

					<div class="space-y-8">
						<div class="flex items-center justify-between">
							<div class="space-y-0.5">
								<Label class="text-base">Email Notifications</Label>
								<p class="text-sm text-muted-foreground">Receive activity updates via email</p>
							</div>
							<Switch
								checked={userProfile.notifications.email}
								onchange={() =>
									(userProfile.notifications.email = !userProfile.notifications.email)}
							/>
						</div>

						<div class="flex items-center justify-between">
							<div class="space-y-0.5">
								<div class="flex items-center gap-2">
									<Label class="text-base">Push Notifications</Label>
									<Badge variant="outline">Beta</Badge>
								</div>
								<p class="text-sm text-muted-foreground">Get notified on your device</p>
							</div>
							<Switch checked={userProfile.notifications.push} />
						</div>

						<div class="flex items-center justify-between">
							<div class="space-y-0.5">
								<Label class="text-base">Marketing Updates</Label>
								<p class="text-sm text-muted-foreground">Receive news and product updates</p>
							</div>
							<Switch checked={userProfile.notifications.marketing} />
						</div>
					</div>
				</div>
			</Tabs.Content>

			<Tabs.Content value="security" class="mt-6">
				<div class="space-y-8">
					<div>
						<h3 class="mb-1 text-2xl font-semibold tracking-tight">Security Settings</h3>
						<p class="text-muted-foreground">
							Manage your account security and authentication methods.
						</p>
					</div>

					<Separator />

					<div class="space-y-4">
						<div class="grid gap-6">
							<!-- Security Options Card -->
							<div class="space-y-6 rounded-lg border bg-card p-6">
								<!-- Password Section -->
								<div class="flex items-center justify-between">
									<div class="space-y-1">
										<h4 class="font-medium">Password</h4>
										<p class="text-sm text-muted-foreground">Change your account password</p>
									</div>
									<Button variant="outline" size="sm">Change</Button>
								</div>

								<Separator />

								<!-- 2FA Section -->
								<div class="flex items-center justify-between">
									<div class="space-y-1">
										<h4 class="font-medium">Two-Factor Authentication</h4>
										<p class="text-sm text-muted-foreground">
											Add an extra layer of security to your account
										</p>
									</div>
									<Button variant="outline" size="sm">Enable</Button>
								</div>

								<Separator />

								<!-- Account Deletion -->
								<div class="flex items-center justify-between">
									<div class="space-y-1">
										<h4 class="font-medium text-destructive">Delete Account</h4>
										<p class="text-sm text-muted-foreground">
											Permanently delete your account and all data
										</p>
									</div>
									<Button variant="destructive" size="sm">Delete</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Tabs.Content>
		</Tabs.Root>
	</div>
</div>
