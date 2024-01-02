// All the events that the player emits to the server
export enum PlayerEventTypes{
    CreateGame = 'create-game',
    JoinGame = 'join-game',
    LeaveGame = 'leave-game',
}

export interface CreateGameData{
    playerId: string,
}

export interface JoinGameData{
    gameId: string,
}

export interface LeaveGameData{
    gameId: string,
}
