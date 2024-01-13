export enum InternalGameEventTypes {
  initGame = "init-game",
  newRound = "new-round",
  gameDeleted = "game-deleted",
  startVotingPhase = "start-voting-phase",
  gameFinished = "game-finished",
  roundFinished = "round-finished",
  newRoundFromInvalidation = "new-round-from-invalidation",
}

// Interface for events from the GameManager
export interface InternalGameEvent {
  gameId: string;
  eventType: InternalGameEventTypes;
  data: InternalGameEventData;
}

export interface InternalGameEventData {}

export interface NewRoundEventData extends InternalGameEventData {
  round: number;
  blackCard: string;
  whiteCards: Map<string, string[]>;
  zar: string;
}

export interface VotingPhaseEventData extends InternalGameEventData {
    blackCard: string;
    chosenWhiteCards: Map<string, string>;
    zar: string;
}

export interface GameFinishedEventData extends InternalGameEventData {
  winners: string[];
  playerMap: Map<string, number>;
}

export interface RoundFinishedEventData extends InternalGameEventData {
  playerMap: Map<string, number>;
  roundWinner: string;
  blackCard: string;
  whiteCard: string;
}