<script lang="ts">
	import { MessageCircleCodeIcon } from '@lucide/svelte';
	import { PUBLIC_APP_NAME } from '$env/static/public';
	let { className = '' } = $props();
</script>

<div class="relative {className}">
	<svg
		class="max-h-[550px] w-full"
		width="100%"
		height="100%"
		viewBox="0 0 1200 1800"
		version="1.1"
		style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"
		><g
			><g
				><g
					><path
						d="M148.294,508c0,-3.311 -2.688,-6 -6,-6l-12,0c-3.311,0 -6,2.689 -6,6l0,117c0,3.311 2.689,6 6,6l12,0c3.312,0 6,-2.689 6,-6l0,-117Z"
					/><path
						d="M148.294,363c0,-3.311 -2.688,-6 -6,-6l-12,0c-3.311,0 -6,2.689 -6,6l0,117c0,3.311 2.689,6 6,6l12,0c3.312,0 6,-2.689 6,-6l0,-117Z"
					/></g
				><path
					d="M1075.71,363c-0,-3.311 -2.689,-6 -6,-6l-12,0c-3.312,0 -6,2.689 -6,6l-0,151c-0,3.311 2.688,6 6,6l12,0c3.311,0 6,-2.689 6,-6l-0,-151Z"
				/><path
					d="M1057.71,168.625c-0,-70.714 -57.411,-128.125 -128.126,-128.125l-659.16,-0c-70.715,-0 -128.126,57.411 -128.126,128.125l0,1462.75c0,70.714 57.411,128.125 128.126,128.125l659.16,0c70.715,0 128.126,-57.411 128.126,-128.125l-0,-1462.75Z"
					class="stroke-primary"
					style="stroke-width:18.75px;"
				/><path
					d="M1031.33,167.702c-0,-57.275 -46.5,-103.775 -103.775,-103.775l-657.242,-0c-57.274,-0 -103.774,46.5 -103.774,103.775l-0,1460.92c-0,57.274 46.5,103.774 103.774,103.774l657.242,0c57.275,0 103.775,-46.5 103.775,-103.774l-0,-1460.92Z"
					style="fill:#22272d;"
				/><path
					d="M779,55.927l-358,-0l0,28.613c-0,9.385 3.728,18.386 10.364,25.022c6.637,6.637 15.637,10.365 25.022,10.365c68.538,-0 218.665,-0 287.214,-0c19.551,-0 35.4,-15.849 35.4,-35.4l0,-28.6Z"
				/><path
					d="M671,79.427c0,-4.692 -3.809,-8.5 -8.5,-8.5l-125,-0c-4.691,-0 -8.5,3.808 -8.5,8.5c0,4.691 3.809,8.5 8.5,8.5l125,-0c4.691,-0 8.5,-3.809 8.5,-8.5Z"
					style="fill:#131313;"
				/><circle cx="689" cy="79.927" r="9" style="fill:#0a1b2d;" /></g
			></g
		></svg
	>

	<div class="absolute inset-0 flex flex-col items-center justify-center gap-y-3">
		<MessageCircleCodeIcon class="h-14 w-14 text-white" />
		<p class="text-center text-sm font-semibold text-white">{PUBLIC_APP_NAME}</p>
	</div>
</div>
