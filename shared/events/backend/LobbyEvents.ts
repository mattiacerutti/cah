// All events that the lobby emits to the player(s) 

export enum LobbyEventTypes{
    playerJoined = 'player-joined',
    playerLeft = 'player-left',
    gameCreated = 'game-created',
    gameStarted = 'game-started',
    gameDeleted = 'game-deleted',
}

export interface PlayerJoinedData{
    playerId: string,
    gameId: string,
    players: Map<string, number>; 
    host: string;
}

export interface GameDeletedData{
    gameId: string,
}

export interface PlayerLeftData{
    playerId: string,
    gameId: string,
    players: Map<string, number>,
    host: string;
}

export interface GameCreatedData{
    gameId: string,
}

export interface GameStartedData{
    gameId: string,
}