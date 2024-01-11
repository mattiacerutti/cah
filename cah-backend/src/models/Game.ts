import { readFileSync } from "fs";
import EventEmitter from "events";
import {
  InternalGameEventData,
  InternalGameEventTypes,
  NewRoundEventData,
  VotingPhaseEventData,
} from "../events/InternalGameEvents";

const DATA_PATH = "../../data/cards.json";
const MAX_ROUNDS = 2;
const WHITE_CARDS_PER_PLAYER = 6;

export enum GameState {
  LOBBY,
  STARTING,
  CHOOSING_ZAR,
  PLAYER_TURN,
  VOTING_PHASE,
  ENDING_ROUND,
  DISPLAYING_RESULTS,
  FINISHED,
}
export class Game extends EventEmitter {
  private players: Map<string, number> = new Map<string, number>(); //Maps player to points
  private host: string | null = null;

  private currentZar: string | null = null;
  private remainingZar: string[];
  private currentRound: number = 0;
  private gameState: GameState = GameState.LOBBY;

  private submittedCards: Map<string, string> | null = null;
  private currentWhiteCards: Map<string, string[]> | null = null;
  private currentBlackCard: string | null = null;

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

  public addPointsToPlayer(playerId: string) {
    let currentPoints = this.players.get(playerId);

    this.players.set(playerId, currentPoints + 1);
  }

  public initializeGameStart() {
    this.gameState = GameState.STARTING;

    this.remainingZar = Array.from(this.players.keys());

    let dataToSend: NewRoundEventData = this.inizializeNewRound();

    this.emitEvent(dataToSend, InternalGameEventTypes.initGame);

    this.gameState = GameState.PLAYER_TURN;
  }

  public registerSubmittedCard(playerId: string, card: string): number {
    this.submittedCards.set(playerId, card);

    return this.players.size - this.submittedCards.size - 1;
  }

  public startVotingPhase() {
    let dataToSend: VotingPhaseEventData = {
      blackCard: this.currentBlackCard,
      chosenWhiteCards: this.submittedCards,
      zar: this.currentZar,
    };

    this.emitEvent(dataToSend, InternalGameEventTypes.startVotingPhase);

    this.gameState = GameState.VOTING_PHASE;
  }

  public startNewRound() {
    let dataToSend: NewRoundEventData = this.inizializeNewRound();

    this.emitEvent(dataToSend, InternalGameEventTypes.newRound);

    this.gameState = GameState.PLAYER_TURN;
  }

  private inizializeNewRound(): NewRoundEventData {
    this.gameState = GameState.CHOOSING_ZAR;

    // Get ZAR
    this.currentZar = this.switchZar(this.currentZar);

    let blackCard: string = this.getNewBlackCard();

    let whiteCards: Map<string, string[]> = this.getNewWhiteCards();

    this.submittedCards = new Map<string, string>();

    this.currentWhiteCards = whiteCards;
    this.currentBlackCard = blackCard;

    this.currentRound++;

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
    const blackCards: { text: string; pick: number }[] = jsonData.black;

    // Get a random black card that has only one pick
    let randomCard: { text: string; pick: number };
    do{
      randomCard = blackCards[Math.floor(Math.random() * blackCards.length)];
    } while(randomCard.pick != 1)

    let randomBlackCard: string = randomCard.text;
    randomBlackCard = randomBlackCard.replace("_", "______");


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
    const whiteCards: string[] = jsonData.white;

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

  public endRound(winnerId: string): boolean {
    //Add point to winner
    this.addPointsToPlayer(winnerId);

    //Check if game is finished
    if (this.currentRound >= MAX_ROUNDS) {
      this.gameState = GameState.FINISHED;
      return true;
    }

    return false;
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
    return (
      this.gameState != GameState.LOBBY && this.gameState != GameState.FINISHED
    );
  }

  public getSubmittedCardOwner(card: string): string | null {
    for (let [key, value] of this.submittedCards) {
      if (value == card) {
        return key;
      }
    }
    return null;
  }

  private switchZar(previousZar: string | null = null): string {
    // If no remaing zar, re-start the cycle
    if (this.remainingZar.length <= 0) {
      this.remainingZar = Array.from(this.players.keys()).sort(
        () => Math.random() - 0.5
      );
      // If the first zar is same as the previous, remove it and insert it in a random position
      if (previousZar != null && this.remainingZar[0] == previousZar) {
        const firstElement = this.remainingZar.shift();
        const randomIndex = Math.floor(Math.random() * (this.remainingZar.length - 1)) + 1;
        this.remainingZar.splice(randomIndex, 0, firstElement);
      }
    }

    // Pick the first player in the list and remove it
    const newZar = this.remainingZar.shift();

    return newZar;
  }

  public resetGame(){
    this.currentRound = 0;
    this.gameState = GameState.LOBBY;
    this.currentZar = null;
    this.currentBlackCard = null;
    this.currentWhiteCards = null;
    this.submittedCards = null;
    this.remainingZar = [];

    //Reset player points
    for(let [key] of this.players){
      this.players.set(key, 0);
    }
  }

  public getHost(): string | null {
    return this.host;
  }

  public getWinners(): string[] {
    let winners: string[] = [];
    let maxPoints: number = 0;

    for (let [key, value] of this.players) {
      if (value > maxPoints) {
        maxPoints = value;
        winners = [];
        winners.push(key);
      } else if (value == maxPoints) {
        winners.push(key);
      }
    }

    return winners;
  }

  public getZar(): string | null {
    return this.currentZar;
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

  public getSumbittedCards(): Map<string, string> {
    return this.submittedCards;
  }

  public getCurrentWhiteCards(): Map<string, string[]> {
    return this.currentWhiteCards;
  }

  public getPlayerWhiteCards(playerId: string): string[] {
    return this.currentWhiteCards.get(playerId);
  }

  public getCurrentBlackCard(): string {
    return this.currentBlackCard;
  }

  public getGameStatus(): GameState {
    return this.gameState;
  }
}
