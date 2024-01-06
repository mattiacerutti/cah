export enum GameEventTypes {
    initGame = 'init-game',
    newRound = 'new-round',
    startVotingPhase = 'start-voting-phase',
    cardSubmitted = 'card-submitted',
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

export interface VotingPhaseData {
    blackCard?: string;
    chosenWhiteCards?: string[];
}

export interface CardSumbittedData{
    playerRemaining: number;
}