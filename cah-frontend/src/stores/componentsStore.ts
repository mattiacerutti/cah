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

export const alertMessage = writable('');
export const alertVisible = writable(false);
export const alertType = writable(AlertType.info);
export const enum AlertType {
	success = "success",
	info = "info",
	warning = "warning",
	error = "error",
}
export function showAlert(message: string,  type: AlertType = AlertType.info, duration: number = 3000) {
    alertMessage.set(message);
    alertVisible.set(true);
	alertType.set(type);

    setTimeout(() => {
        alertVisible.set(false);
    }, duration); // default duration of 3 seconds
}
