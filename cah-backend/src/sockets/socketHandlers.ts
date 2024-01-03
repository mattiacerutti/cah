import { Server, Socket } from "socket.io";
import {
  PlayerEventTypes,
  PlayerEventErrors,
  JoinGameData,
} from "cah-shared/events/PlayerEventTypes";
import {
  LobbyEventTypes,
  PlayerJoinedData,
  PlayerLeftData,
  GameCreatedData,
  GameStartedData,
} from "cah-shared/events/LobbyEventTypes";
import { GameManager } from "../managers/GameManager";
import { socketService } from "./SocketService";
import { SocketResponse } from "cah-shared/enums/SocketResponse";

let activeConnections = new Map<
  string,
  { playerId: string; gameId: string | undefined }
>();

export function startListening() {

  socketService.subscribe(null, "connection", (socket: any) => {

    let io = socketService.getIO();
    let gameManager = socketService.getGameManager();

    let userId: string = socket.handshake.query.playerId as string;

    activeConnections.set(socket.id, {
      playerId: userId,
      gameId: undefined,
    });

    socketService.subscribe(socket, PlayerEventTypes.JoinGame, (data: any) => {
      console.log("Player " + data.playerId + " wants to join " + data.gameId);

      let game = gameManager.getGame(data.gameId);

      // Check existance of game.
      if (!game) {
        let dataToSend: SocketResponse<any> = {
          success: false,
          error: {
            code: PlayerEventErrors.gameNotFound,
            message: "Game not found",
          },
        };
        socketService.emit(socket, LobbyEventTypes.gameStarted, dataToSend);
        return;
      }

      if (game.isPlayerInGame(data.playerId)) {
        let dataToSend: SocketResponse<any> = {
          success: false,
          error: {
            code: PlayerEventErrors.playerAlreadyInGame,
            message: "Player already in the game",
          },
        };
        socketService.emit(socket, LobbyEventTypes.gameStarted, dataToSend);
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

      let dataToSend: SocketResponse<PlayerJoinedData> = {
        success: true,
        data: {
          playerId: data.playerId,
          gameId: data.gameId,
          players: game.getPlayers(),
          host: game.getHost(),
        },
      };

      console.log("amogus " + dataToSend.data.players.size);

      // Emit the event to the players
      socketService.emit(
        io.to(data.gameId),
        LobbyEventTypes.playerJoined,
        dataToSend
      );
    });

    socketService.subscribe(socket, PlayerEventTypes.LeaveGame, (data: any) => {
      // Check existance of game.
      if (!gameManager.getGame(data.gameId)) {
        let dataToSend: SocketResponse<any> = {
          success: false,
          error: {
            code: PlayerEventErrors.gameNotFound,
            message: "Game not found",
          },
        };
        socketService.emit(socket, LobbyEventTypes.gameStarted, dataToSend);
        return;
      }

      let game = gameManager.getGame(data.gameId);

      // Add the player to the game
      gameManager.removePlayerFromGame(data.gameId, data.playerId);

      if (!game.isPlayerInGame(data.playerId)) {
        let dataToSend: SocketResponse<any> = {
          success: false,
          error: {
            code: PlayerEventErrors.playerNotInGame,
            message: "This player is not in the game",
          },
        };
        socketService.emit(socket, LobbyEventTypes.gameStarted, dataToSend);
        return;
      }

      activeConnections.set(socket.id, {
        playerId: data.playerId,
        gameId: undefined,
      });

      // Put the socket in the right group (for emitting purposes)
      socket.leave(data.gameId);

      let dataToSend: SocketResponse<PlayerLeftData> = {
        success: true,
        data: {
          playerId: data.playerId,
          gameId: data.gameId,
          players: gameManager.getGame(data.gameId)?.getPlayers(),
          host: gameManager.getGame(data.gameId)?.getHost(),
        },
      };

      // Emit the event to the players
      socketService.emit(
        io.to(data.gameId),
        LobbyEventTypes.playerLeft,
        dataToSend
      );
    });

    socketService.subscribe(
      socket,
      PlayerEventTypes.CreateGame,
      (data: any) => {
        // Create the game
        let gameId = gameManager.createGame(data.playerId);

        activeConnections.set(socket.id, {
          playerId: data.playerId,
          gameId: gameId,
        });

        // Put the socket in the right group (for emitting purposes)
        socket.join(gameId);

        let dataToSend: SocketResponse<GameCreatedData> = {
          success: true,
          data: {
            gameId: gameId,
          },
        };

        // Emit the event to the player
        socketService.emit(socket, LobbyEventTypes.gameCreated, dataToSend);
      }
    );

    socketService.subscribe(socket, "disconnect", () => {
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

          let dataToSend: SocketResponse<PlayerLeftData> = {
            success: true,
            data: {
              playerId: playerId,
              gameId: gameId,
              players: gameManager.getGame(gameId)?.getPlayers(),
              host: gameManager.getGame(gameId)?.getHost(),
            },
          };

          socketService.emit(
            io.to(gameId),
            LobbyEventTypes.playerLeft,
            dataToSend
          );
        }
      }
    });

    socketService.subscribe(socket, PlayerEventTypes.StartGame, (data: any) => {
      let game = gameManager.getGame(data.gameId);

      if (!game) {
        let dataToSend: SocketResponse<any> = {
          success: false,
          error: {
            code: PlayerEventErrors.gameNotFound,
            message: "Game not found",
          },
        };
        socketService.emit(socket, LobbyEventTypes.gameStarted, dataToSend);
        return;
      }

      if (game.getHost() != data.playerId) {
        let dataToSend: SocketResponse<any> = {
          success: false,
          error: {
            code: PlayerEventErrors.notHost,
            message: "User is not the host of the game. Can't start game",
          },
        };
        socketService.emit(socket, LobbyEventTypes.gameStarted, dataToSend);
        return;
      }

      try {
        gameManager.startGame(data.gameId);
      } catch (e) {
        let dataToSend: SocketResponse<any> = {
          success: false,
          error: {
            code: e.message,
            message: e.message,
          },
        };
        socketService.emit(socket, LobbyEventTypes.gameStarted, dataToSend);
        return;
      }

      let dataToSend: SocketResponse<any> = {
        success: true,
      };

      socketService.emit(
        io.to(data.gameId),
        LobbyEventTypes.gameStarted,
        dataToSend
      );
    });
  });
}
