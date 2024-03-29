export enum GameEventTypes {
    initGame = 'init-game',
    newRound = 'new-round',
    startVotingPhase = 'start-voting-phase',
    cardSubmitted = 'card-submitted',
    roundFinished = 'round-finished',
}

export enum GameEventErrors {
    cantReachZar = 'cant-reach-zar',
}

export interface NewRoundData {
    round: number,
    blackCard?: string,
    blackCardPickNumber?: number,
    whiteCards?: Map<string, string[]>,
    zar: string,
    wasInvalidated: boolean,
}

export interface VotingPhaseData {
    blackCard?: string;
    blackCardPickNumber?: number;
    chosenWhiteCards?: string[][];
}

export interface CardSumbittedData{
    playerRemaining: number;
}

export interface RoundFinishedData{
    roundWinner: string,
    blackCard: string,
    blackCardPickNumber: number,
    whiteCards: string[],
    playerMap: Map<string, number>,
}