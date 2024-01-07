import { Game, GameState } from "../models/Game";
import Crypto from "crypto";
import { PlayerEventErrors } from "cah-shared/events/frontend/PlayerEvents";
import EventEmitter from "events";
import {
  GameFinishedEventData,
  InternalGameEvent,
  InternalGameEventData,
  InternalGameEventTypes,
  RoundFinishedEventData,
} from "@/events/InternalGameEvents";

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
    const listener = (gameEvent: {
      data: InternalGameEventData;
      event: InternalGameEventTypes;
    }) => {
      let internalGameEvent: InternalGameEvent = {
        gameId: id,
        eventType: gameEvent.event,
        data: gameEvent.data,
      };

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
    if (!this.currentGames.has(id))
      throw new Error(PlayerEventErrors.gameNotFound);

    // Retrieve the game
    let game = this.currentGames.get(id);

    // Notify the game that it is being deleted
    this.emit("game-event", {
      gameId: id,
      eventType: InternalGameEventTypes.gameDeleted,
      data: {},
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
    if (!this.currentGames.has(id))
      throw new Error(PlayerEventErrors.gameNotFound);

    //Check if player is already in game
    if (this.currentGames.get(id)?.getPlayers().has(playerId))
      throw new Error(PlayerEventErrors.playerAlreadyInGame);

    // Add player to game
    this.currentGames.get(id)?.addPlayer(playerId);

    // Add player to players map
    this.currentPlayers.set(playerId, id);
  }

  public removePlayerFromGame(id: string, playerId: string): boolean {
    //Check if game exists
    if (!this.currentGames.has(id))
      throw new Error(PlayerEventErrors.gameNotFound);

    //Check if player is in game
    if (!this.currentGames.get(id)?.getPlayers().has(playerId))
      throw new Error(PlayerEventErrors.playerNotInGame);

    //If the game is started and it doesn't have enough players, delete it
    if (
      (this.currentGames.get(id)?.getPlayers().size <= MIN_PLAYERS &&
      this.currentGames.get(id)?.isStarted()) || this.currentGames.get(id)?.getPlayers().size <= 1
    ) {
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
    if (game.getHost() && game.getHost() != playerId)
      throw new Error(PlayerEventErrors.notHost);

    if (game.getPlayers().size < MIN_PLAYERS)
      throw new Error(PlayerEventErrors.notEnoughPlayers);

    this.currentGames.get(id)?.initializeGameStart();
  }

  public submitCard(gameId: string, playerId: string, card: string): number {
    // Check if game exists
    let game = this.currentGames.get(gameId);
    if (!game) throw new Error(PlayerEventErrors.gameNotFound);

    // Check if player is in game
    if (!game.getPlayers().has(playerId))
      throw new Error(PlayerEventErrors.playerNotInGame);

    // Check if player isn't zar
    if (game.getZar() == playerId)
      throw new Error(PlayerEventErrors.playerIsZar);

    // Check if game is started
    if (!game.isStarted()) throw new Error(PlayerEventErrors.gameNotStarted);

    // Check if it's the player's turn
    if (game.getGameStatus() != GameState.PLAYER_TURN)
      throw new Error(PlayerEventErrors.forbiddenAction);

    // Check if player already submitted a card
    if (game.getSumbittedCards().has(playerId))
      throw new Error(PlayerEventErrors.alreadySubmittedACard);

    // Check if player has the card
    if (!game.getPlayerWhiteCards(playerId).includes(card))
      throw new Error(PlayerEventErrors.cardNotInPlayersHand);

    // Submit the card
    let remainingPlayers = game.registerSubmittedCard(playerId, card);

    console.log(
      "Player " +
        playerId +
        " submitted card " +
        card +
        ". Remaining players: " +
        remainingPlayers
    );

    // Check if all players submitted a card
    if (game.getSumbittedCards().size == game.getPlayers().size - 1) {
      // All players submitted a card, start the voting phase
      game.startVotingPhase();
    }

    return remainingPlayers;
  }

  public submitVote(gameId: string, playerId: string, card: string) {
    // Check if game exists
    let game = this.currentGames.get(gameId);
    if (!game) throw new Error(PlayerEventErrors.gameNotFound);

    // Check if player is in game
    if (!game.getPlayers().has(playerId))
      throw new Error(PlayerEventErrors.playerNotInGame);

    // Check if player is the zar
    if (game.getZar() && game.getZar() != playerId)
      throw new Error(PlayerEventErrors.playerIsNotZar);

    // Check if game is started
    if (!game.isStarted()) throw new Error(PlayerEventErrors.gameNotStarted);

    // Check if it's the player's turn
    if (game.getGameStatus() != GameState.VOTING_PHASE)
      throw new Error(PlayerEventErrors.forbiddenAction);

    // Check if the card belongs to any player, if so get that player id
    let winnerPlayerId = game.getSubmittedCardOwner(card);
    if (!winnerPlayerId) throw new Error(PlayerEventErrors.cardNotFound);

    // Submit the vote
    let isGameFinished: boolean = game.endRound(winnerPlayerId);

    // Display the round results
    this.displayRoundResults(gameId, winnerPlayerId, card);

    if (isGameFinished) {
      this.endGame(gameId);
      return;
    }

    // Start new round
    game.startNewRound();
  }

  private endGame(gameId: string) {
    // Retrieve the game
    let game = this.currentGames.get(gameId);

    // Get the player map
    let playerMap = game.getPlayers();

    // Get the winner(s)
    let winners: string[] = game.getWinners();

    let data: GameFinishedEventData = {
      winners: winners,
      playerMap: playerMap,
    };

    // Notify that the game is finished
    this.emit("game-event", {
      gameId: gameId,
      eventType: InternalGameEventTypes.gameFinished,
      data: data,
    });

    // Reset the game
    game.resetGame();
  }

  private displayRoundResults(
    gameId: string,
    winner: string,
    whiteCard: string
  ) {
    // Retrieve the game
    let game = this.currentGames.get(gameId);

    // Get the player map
    let playerMap = game.getPlayers();

    let data: RoundFinishedEventData = {
      playerMap: playerMap,
      roundWinner: winner,
      blackCard: game.getCurrentBlackCard(),
      whiteCard: whiteCard,
    };

    // Notify that the round is finished
    this.emit("game-event", {
      gameId: gameId,
      eventType: InternalGameEventTypes.roundFinished,
      data: data,
    });
  }

  public purgePlayer(playerId: string): string | null {
    // Remove player from all games
    let gameId: string = this.currentPlayers.get(playerId);
    if (gameId) {
      console.log("Purging player " + playerId + " from game " + gameId);
      this.removePlayerFromGame(gameId, playerId);
      return gameId;
    }
  }

  public getGame(id: string): Game {
    if (!this.currentGames.has(id))
      throw new Error(PlayerEventErrors.gameNotFound);

    return this.currentGames.get(id);
  }
}
