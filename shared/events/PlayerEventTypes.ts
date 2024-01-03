// All the events that the player emits to the server
export enum PlayerEventTypes{
    CreateGame = 'create-game',
    JoinGame = 'join-game',
    LeaveGame = 'leave-game',
    StartGame = 'start-game',
}

export enum PlayerEventErrors{
    genericError = 'generic-error',
    gameNotFound = 'game-not-found',
    gameNotStarted = 'game-not-started',
    notEnoughPlayers = 'not-enough-players',
    playerAlreadyInGame = 'player-already-in-game',
    playerNotInGame = 'player-not-in-game',
    notHost = 'not-host',
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

export interface StartGameData{
    gameId: string,
}
