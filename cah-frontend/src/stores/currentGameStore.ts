import { get, writable } from 'svelte/store';
import { playerStore } from './playerStore';

export const enum GameState{
    LOBBY,
    PLAYING,
    VOTING_PHASE,
    DISPLAYING_RESULTS,
    FINISHED,
}

export const currentGameStore = writable({
    host: null,
    players: new Map<string, number>(),  
    gameId: null,
    gameState: null,
    gameRound: 0,
    isZar: false,
});

export function updateCurrentGame() {
    currentGameStore.update(store => {
        return store;
    });
}

export function isHost() {
    return get(currentGameStore).host === get(playerStore).playerId;
}