// All events that the lobby emits to the player(s) 

export enum LobbyEventTypes{
    playerJoined = 'player-joined',
    playerLeft = 'player-left',
    gameCreated = 'game-created',
    gameStarted = 'game-started',
}

export interface PlayerJoinedData{
    playerId: string,
    gameId: string,
    players: Map<string, number>; 
    host: string;
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