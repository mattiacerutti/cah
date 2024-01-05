export enum InternalGameEventTypes {
  initGame = "init-game",
  newRound = "new-round",
  gameDeleted = "game-deleted",
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
