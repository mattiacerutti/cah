import { writable } from 'svelte/store';

export const currentGameStore = writable({
    host: null,
    players: new Map<string, number>(),  
    gameId: null,
    gameStarted: false,
    gameTurn: 0,
});

export function updateCurrentGame() {
    currentGameStore.update(store => {
        return store;
    });
}

export function updatePlayers(playerId, score) {
    currentGameStore.update(currentGame => {
        // Check if currentGame.players is a Map and create a new one if it is
        const updatedPlayers = currentGame.players instanceof Map
            ? new Map(currentGame.players)
            : new Map();

        // Update the map with the new player score
        updatedPlayers.set(playerId, score);

        // Return a new object for the store
        return { ...currentGame, players: updatedPlayers };
    });
}