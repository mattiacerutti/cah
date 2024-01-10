<script>
	import { alertMessage, alertVisible, alertType } from '@/stores/componentsStore';
	import { fly } from 'svelte/transition';

    const colors = {
        "success" : 'bg-green-600',
        "error": 'bg-primary-red-500',
        "warning": 'bg-yellow-600',
        "info": 'bg-primary-black-500'
    }
</script>

{#if $alertVisible}
	<div
		class="alert-box {colors[$alertType]} text-white font-semibold p-4 rounded-md border-white border border-opacity-10 absolute top-10 left-[50%] translate-x-[-50%] w-fit h-fit text-center"
		in:fly={{ y: -50, duration: 300 }}
		out:fly={{ y: -50, duration: 300 }}
	>
		{$alertMessage}
	</div>
{/if}

<!-- Tailwind CSS for styling -->
<style>
	.alert-box {
		transition: opacity 0.8s;
        min-width: 10%;
	}
</style>
