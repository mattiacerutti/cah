import { Server } from "socket.io";
import { PlayerEventTypes } from "cah-shared/enums/PlayerEventTypes";
import {
  LobbyEventTypes,
  PlayerJoinedData,
  PlayerLeftData,
  GameCreatedData,
} from "cah-shared/enums/LobbyEventTypes";
import { GameManager } from "../managers/GameManager";
import { toObject, toMap } from "cah-shared/utils";
import { Socket } from "socket.io";


function emit(emitter, ...args) {
  // Check if the first argument is a function (like socket.to)
  if (typeof emitter === 'function') {
      // Additional processing for methods like .to()
      emitter = emitter(...args.slice(0, 1));
      args = args.slice(1);
  }

  // Convert the data
  const dataIdx = args.length > 1 ? 1 : 0; // Assumes data is always the second argument
  if (typeof args[dataIdx] === 'object') {
      args[dataIdx] = toObject(args[dataIdx]);
  }

  // Emit the event with the converted data
  emitter.emit(...args);
}

type EventCallback = (data: any) => void;

function subscribe(socket: Socket, event: string, handler: EventCallback) {
  socket.on(event, (data) => {
      const convertedData = toMap(data);
      handler(convertedData);
  });
}

export function setupSocketHandlers(io: Server, gameManager: GameManager) {
  let activeConnections = new Map<
    string,
    { playerId: string; gameId: string | undefined }
  >();

  

  io.on("connection", (socket) => {
    let userId: string = socket.handshake.query.playerId as string;
    activeConnections.set(socket.id, {
      playerId: userId,
      gameId: undefined,
    });

    subscribe(socket, PlayerEventTypes.JoinGame, (data) => {

      console.log("Player " + data.playerId + " wants to join " + data.gameId);

      let game = gameManager.getGame(data.gameId);

      // Check existance of game.
      if (!game) {
        // Return some kind of error
        return;
      }

      if (game.isPlayerInGame(data.playerId)) {
        // Return some kind of error
        return;
      }

      // Add the player to the game
      gameManager.addPlayerToGame(data.gameId, data.playerId);

      activeConnections.set(socket.id, {
        playerId: data.playerId,
        gameId: data.gameId,
      });

      // Put the socket in the right group (for emitting purposes)
      socket.join(data.gameId);

      let dataToSend: PlayerJoinedData = {
        playerId: data.playerId,
        gameId: data.gameId,
        players: game.getPlayers(),
        host: game.getHost(),
      };

      // Emit the event to the players
      emit(io.to(data.gameId), LobbyEventTypes.playerJoined, dataToSend)
    });

    subscribe(socket, PlayerEventTypes.LeaveGame, (data) => {
      // Check existance of game.
      if (!gameManager.getGame(data.gameId)) {
        // Return some kind of error
        return;
      }

      // Add the player to the game
      gameManager.removePlayerFromGame(data.gameId, data.playerId);

      activeConnections.set(socket.id, {
        playerId: data.playerId,
        gameId: undefined,
      });

      // Put the socket in the right group (for emitting purposes)
      socket.leave(data.gameId);

      let dataToSend: PlayerLeftData = {
        playerId: data.playerId,
        gameId: data.gameId,
        players: gameManager.getGame(data.gameId)?.getPlayers(),
        host: gameManager.getGame(data.gameId)?.getHost()
      };

      // Emit the event to the players
      emit(io.to(data.gameId), LobbyEventTypes.playerLeft, dataToSend)
    });

    subscribe(socket, PlayerEventTypes.CreateGame, (data) => {
      // Create the game
      let gameId = gameManager.createGame(data.playerId);

      activeConnections.set(socket.id, {
        playerId: data.playerId,
        gameId: gameId,
      });

      // Put the socket in the right group (for emitting purposes)
      socket.join(gameId);

      let dataToSend: GameCreatedData = {
        gameId: gameId,
      };

      // Emit the event to the player
      emit(socket, LobbyEventTypes.gameCreated, dataToSend)
    });

    subscribe(socket, "disconnect", () => {
      let playerId: string = activeConnections.get(socket.id)
        ?.playerId as string;
      let gameId: string | undefined = activeConnections.get(socket.id)
        ?.gameId as string | undefined;

      console.log("Player " + playerId + " wants to disconnect from " + gameId);

      activeConnections.delete(socket.id);

      if (gameId) {
        let game = gameManager.getGame(gameId);
        if (game) {
          gameManager.removePlayerFromGame(gameId, playerId);

          let dataToSend: PlayerLeftData = {
            playerId: playerId,
            gameId: gameId,
            players: gameManager.getGame(gameId)?.getPlayers(),
            host: gameManager.getGame(gameId)?.getHost()
          };

          emit(io.to(gameId), LobbyEventTypes.playerLeft, dataToSend);
        }
      }
    });
  });
}
