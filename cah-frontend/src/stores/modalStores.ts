import { writable } from 'svelte/store';

// Export a function to create a new modal instance
export function createModal() {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		show: () => set(true),
		close: () => set(false),
		toggle: () => update((n) => !n)
	};
}
