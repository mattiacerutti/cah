import { Game, GameState } from "../models/Game";
import Crypto from "crypto";
import { PlayerEventErrors } from "cah-shared/events/PlayerEventTypes";
import EventEmitter from "events";
import { GameData, GameEvent } from "@/events/GameEvents";
export class GameManager extends EventEmitter {
  private currentGames = new Map<string, Game>();
  private gameListeners = new Map<string, (...args: any[]) => void>();

  public createGame(host: string): string {
    let id = Crypto.randomUUID();
    let game: Game = new Game(host);
    this.currentGames.set(id, game);

    // Forward game events to the socket service
    const listener = (event: GameData) => {

        let gameEvent: GameEvent = {
            gameId: id,
            event: event.event,
            data: event
        }

      this.emit("game-event", gameEvent);
    };

    // Subscribe to the game event
    game.on("game-event", listener);

    // Store the reference to the listener
    this.gameListeners.set(id, listener);

    console.log("Successfully created game with id: " + id);

    return id;
  }

  public deleteGame(id: string) {
    //TODO: Implement error

    let game = this.currentGames.get(id);

    // Retrieve the listener and unsubscribe
    const listener = this.gameListeners.get(id);
    if (listener) {
      game.off("game-event", listener);
    }

    // Final clean up
    this.gameListeners.delete(id);
    this.currentGames.delete(id);
  }

  public addPlayerToGame(id: string, playerId: string) {
    //TODO: Implement error
    this.currentGames.get(id)?.addPlayer(playerId);
  }

  public removePlayerFromGame(id: string, playerId: string) {
    //TODO: Implement error

    this.currentGames.get(id)?.removePlayer(playerId);

    if (this.currentGames.get(id)?.getHost() == playerId) {
      this.currentGames.get(id)?.switchHost();
    }

    if (this.currentGames.get(id)?.getPlayers().size == 0) {
      this.deleteGame(id);
      console.log("Deleted game with id: " + id);
    }
  }

  public startGame(id: string) {
    let game = this.currentGames.get(id);

    if (!game) throw new Error(PlayerEventErrors.gameNotFound);

    if (game.getHost() == null) throw new Error(PlayerEventErrors.genericError);

    if (game.getPlayers().size < 3)
      throw new Error(PlayerEventErrors.notEnoughPlayers);

    this.currentGames.get(id)?.initializeGameStart();
  }

  public getGame(id: string): Game | undefined {
    return this.currentGames.get(id);
  }
}
