export enum InternalGameEventTypes {
  initGame = "init-game",
  newRound = "new-round",
  gameDeleted = "game-deleted",
  startVotingPhase = "start-voting-phase",
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
