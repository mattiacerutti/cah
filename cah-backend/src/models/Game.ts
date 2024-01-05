import { readFileSync } from "fs";
import EventEmitter from "events";
import {
  InternalGameEventData,
  InternalGameEventTypes,
  NewRoundEventData,
} from "../events/InternalGameEvents";

const DATA_PATH = "../../data/gameData.json";
const MAX_PLAYERS = 8;
const WHITE_CARDS_PER_PLAYER = 6;

export enum GameState {
  LOBBY,
  STARTING,
  CHOOSING_ZAR,
  PLAYER_TURN,
  ZAR_TURN,
  COUNTING_POINTS,
  FINISHED,
}
export class Game extends EventEmitter {
  private players: Map<string, number> = new Map<string, number>(); //Maps player to points
  private host: string | null = null;
  private maxPlayers = MAX_PLAYERS;

  private currentZar: string | null = null;
  private currentRound: number = 0;
  private gameState: GameState = GameState.LOBBY;

  constructor(host: string) {
    super();
    this.host = host;
    this.players.set(host, 0);
  }

  public addPlayer(playerId: string) {
    this.players.set(playerId, 0);
  }

  public removePlayer(playerId: string) {
    this.players.delete(playerId);
  }

  public switchHost() {
    this.host = this.players.keys().next().value;
  }

  public nextTurn() {
    this.currentRound++;
  }

  public addPointsToPlayer(playerId: string) {
    this.players[playerId] = this.players[playerId] + 1;
  }

  public initializeGameStart() {
    this.gameState = GameState.STARTING;

    //Shuffle player map
    this.players = new Map<string, number>(
      Array.from(this.players).sort(() => Math.random() - 0.5)
    );

    let dataToSend: NewRoundEventData = this.inizializeNewRound();

    this.emitEvent(dataToSend, InternalGameEventTypes.initGame);

    this.gameState = GameState.PLAYER_TURN;
  }

  private inizializeNewRound(): NewRoundEventData {
    this.gameState = GameState.CHOOSING_ZAR;

    //Select ZAR
    this.currentZar = this.players.keys().next().value;

    let blackCard: string = this.getNewBlackCard();

    let whiteCards: Map<string, string[]> = this.getNewWhiteCards();

    let dataToSend: NewRoundEventData = {
      round: this.currentRound,
      blackCard: blackCard,
      whiteCards: whiteCards,
      zar: this.currentZar,
    };

    return dataToSend;
  }

  private getNewBlackCard(): string {
    // Read the file synchronously
    const rawData = readFileSync(require.resolve(DATA_PATH), {
      encoding: "utf8",
    });

    // Parse the JSON content
    const jsonData = JSON.parse(rawData);

    // Get the black cards
    const blackCards: string[] = jsonData.blackCards;

    // Get a random black card
    const randomBlackCard: string =
      blackCards[Math.floor(Math.random() * blackCards.length)];

    return randomBlackCard;
  }

  private getNewWhiteCards(): Map<string, string[]> {
    // Read the file synchronously
    const rawData = readFileSync(require.resolve(DATA_PATH), {
      encoding: "utf8",
    });

    // Parse the JSON content
    const jsonData = JSON.parse(rawData);

    // Get the white cards
    const whiteCards: string[] = jsonData.whiteCards;

    let whiteCardsMap: Map<string, string[]> = new Map<string, string[]>();

    for (let player of this.players.keys()) {
      let randomWhiteCards: string[] = [];
      for (let i = 0; i < WHITE_CARDS_PER_PLAYER; i++) {
        randomWhiteCards.push(
          whiteCards[Math.floor(Math.random() * whiteCards.length)]
        );
      }
      whiteCardsMap.set(player, randomWhiteCards);
    }

    return whiteCardsMap;
  }

  private emitEvent(
    data: InternalGameEventData,
    event: InternalGameEventTypes
  ) {
    this.emit("game-event", { data: data, event: event });
  }

  //Getters
  public getPlayers(): Map<string, number> {
    return this.players;
  }

  public isStarted(): boolean {
    return this.gameState != GameState.LOBBY && this.gameState != GameState.FINISHED;
  }

  public getHost(): string | null {
    return this.host;
  }

  public isPlayerInGame(playerId: string): boolean {
    return this.players.has(playerId);
  }

  public getPlayerPoints(playerId: string): number {
    return this.players[playerId];
  }

  public getCurrentTurn(): number {
    return this.currentRound;
  }

  public isGameStarted(): boolean {
    return this.gameState != GameState.LOBBY;
  }

}
