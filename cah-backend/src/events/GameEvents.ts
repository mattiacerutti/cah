export enum GameEventTypes {
    newRound = 'new-round',
}
export interface GameData{
    event: GameEventTypes,
}

export interface NewRoundData extends GameData{
    round: number,
    blackCard: string,
    whiteCards: Map<string, string[]>,
    zar: string,
    players: string[],
}

export interface GameEvent{
    gameId: string,
    event: GameEventTypes,
    data: GameData,
}
