<script lang="ts">
	import { writable } from 'svelte/store';



	// Receive the modal store as a prop
	export let modal: any;

	export let title: string;
	export let message = '';

</script>

{#if $modal}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="fixed inset-0 bg-black bg-opacity-70 overflow-y-auto h-full w-full z-10" on:click={() => modal.close()}>
		<div
			class="relative top-[50%] -translate-y-1/2 mx-auto p-5 border border-primary-violet-600 w-96 shadow-lg rounded-md bg-primary-black"
            on:click|stopPropagation
		>
			<div class="mt-3 text-center">
				<h3 class="text-2xl leading-6 font-medium text-primary-white">{title}</h3>
				<div class="mt-2 px-7 py-3">
					<p class="text-sm text-gray-300">
						{message}
					</p>
				</div>
				<div class="items-center px-4 py-3">
					<button
						id="ok-btn"
						class="px-4 py-2 bg-primary-violet-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-primary-violet-500 focus:outline-none focus:ring-2 focus:ring-red-300"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
