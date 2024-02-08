// All the events that the player emits to the server
export enum PlayerEventTypes{
    CreateGame = 'create-game',
    DeleteGame = 'delete-game',
    JoinGame = 'join-game',
    LeaveGame = 'leave-game',
    StartGame = 'start-game',
    SubmitCard = 'submit-card',
    SubmitVote = 'submit-vote',
}

export enum PlayerEventErrors{
    genericError = 'generic-error',
    gameNotFound = 'game-not-found',
    gameNotStarted = 'game-not-started',
    notEnoughPlayers = 'not-enough-players',
    playerAlreadyInGame = 'player-already-in-game',
    playerNotInGame = 'player-not-in-game',
    notHost = 'not-host',
    playerNotFound = 'player-not-found',
    forbiddenAction = 'forbidden-action',
    alreadySubmittedACard = 'already-submitted-a-card',
    cardNotInPlayersHand = 'card-not-in-players-hand',
    playerIsZar = 'player-is-zar',
    playerIsNotZar = 'player-is-not-zar',
    cardNotFound = 'card-not-found',
}
export interface CreateGameData{
    playerId: string,
}

export interface SubmitCardData{
    gameId: string,
    cards: string[]
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

export interface DeleteGameData{
    gameId: string,
}

export interface SubmitVoteData{
    gameId: string,
    cards: string[]
}
