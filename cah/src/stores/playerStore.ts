import { writable } from 'svelte/store';

export const playerStore = writable({
  playerId: crypto.randomUUID(),
});
