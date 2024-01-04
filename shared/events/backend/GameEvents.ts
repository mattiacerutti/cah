export enum GameEventTypes {
    initGame = 'init-game',
    newRound = 'new-round',
}

export enum GameEventErrors {
    cantReachZar = 'cant-reach-zar',
}

export interface NewRoundData {
    round: number,
    blackCard?: string,
    whiteCards?: Map<string, string[]>,
    zar: string,
}