import { Game } from "../models/Game";
import Crypto from "crypto";
import { PlayerEventErrors } from "cah-shared/events/frontend/PlayerEvents";
import EventEmitter from "events";
import { InternalGameEvent, InternalGameEventData, InternalGameEventTypes } from "../events/InternalGameEvents";

const MIN_PLAYERS = 2;

export class GameManager extends EventEmitter {
  private currentGames = new Map<string, Game>();
  private currentPlayers = new Map<string, string>();
  private gameListeners = new Map<string, (...args: any[]) => void>();

  public createGame(host: string): string {
    let id = Crypto.randomUUID();
    let game: Game = new Game(host);

    this.currentGames.set(id, game);

    //Add player to players map
    this.currentPlayers.set(host, id);

    // Forward game events to the socket service
    const listener = (gameEvent : {data: InternalGameEventData, event: InternalGameEventTypes}) => {

        let internalGameEvent: InternalGameEvent = {
            gameId: id,
            eventType: gameEvent.event,
            data: gameEvent.data
        }

      this.emit("game-event", internalGameEvent);
    };

    // Subscribe to the game event
    game.on("game-event", listener);

    // Store the reference to the listener
    this.gameListeners.set(id, listener);

    console.log("Successfully created game with id: " + id);

    return id;
  }

  public deleteGame(id: string) {

    // Check if game exists
    if(!this.currentGames.has(id)) throw new Error(PlayerEventErrors.gameNotFound);

    // Retrieve the game
    let game = this.currentGames.get(id);

    // Notify the game that it is being deleted
    this.emit("game-event", {
        gameId: id,
        eventType: InternalGameEventTypes.gameDeleted,
        data: {}
    });

    // Retrieve the listener and unsubscribe
    const listener = this.gameListeners.get(id);
    if (listener) {
      game.off("game-event", listener);
    }

    // Final clean up
    this.gameListeners.delete(id);
    this.currentGames.delete(id);
    console.log("Successfully deleted game with id: " + id);
  }

  public addPlayerToGame(id: string, playerId: string) {

    //Check if game exists
    if(!this.currentGames.has(id)) throw new Error(PlayerEventErrors.gameNotFound);

    //Check if player is already in game
    if(this.currentGames.get(id)?.getPlayers().has(playerId)) throw new Error(PlayerEventErrors.playerAlreadyInGame);

    // Add player to game
    this.currentGames.get(id)?.addPlayer(playerId);

    // Add player to players map
    this.currentPlayers.set(playerId, id);
  }

  public removePlayerFromGame(id: string, playerId: string): boolean {

    //Check if game exists
    if(!this.currentGames.has(id)) throw new Error(PlayerEventErrors.gameNotFound);

    //Check if player is in game
    if(!this.currentGames.get(id)?.getPlayers().has(playerId)) throw new Error(PlayerEventErrors.playerNotInGame);


    //If the game is started and it doesn't have enough players, delete it
    if (this.currentGames.get(id)?.getPlayers().size <= MIN_PLAYERS && this.currentGames.get(id)?.isStarted()) {
      console.log("Game " + id + " has not enough players, deleting it");
      this.deleteGame(id);
      return true;
    }

    //Remove player from game
    this.currentGames.get(id)?.removePlayer(playerId);
    
    //Remove player from players map
    this.currentPlayers.delete(playerId);

    //If the player is the host, than switch
    if (this.currentGames.get(id)?.getHost() == playerId) {
      this.currentGames.get(id)?.switchHost();
    }
    
    return false;
  }

  public startGame(id: string, playerId: string) {
    // Check if game exists
    let game = this.currentGames.get(id);

    if (!game) throw new Error(PlayerEventErrors.gameNotFound);
    // Check if game has a host
    if (game.getHost() != playerId) throw new Error(PlayerEventErrors.notHost);

    if (game.getPlayers().size < MIN_PLAYERS)
      throw new Error(PlayerEventErrors.notEnoughPlayers);

    this.currentGames.get(id)?.initializeGameStart();
  }

  public purgePlayer(playerId: string): string|null {
    // Remove player from all games
    let gameId: string = this.currentPlayers.get(playerId);
    if (gameId) {
      console.log("Purging player " + playerId + " from game " + gameId);
      this.removePlayerFromGame(gameId, playerId);
      return gameId;
    }
  }

  public getGame(id: string): Game {
    if (!this.currentGames.has(id)) throw new Error(PlayerEventErrors.gameNotFound);

    return this.currentGames.get(id);
  }
}
