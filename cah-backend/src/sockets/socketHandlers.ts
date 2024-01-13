import {
  PlayerEventTypes,
  PlayerEventErrors,
} from "cah-shared/events/frontend/PlayerEvents";
import {
  LobbyEventTypes,
  PlayerJoinedData,
  PlayerLeftData,
  GameCreatedData,
  GameDeletedData,
  GameFinishedData,
} from "cah-shared/events/backend/LobbyEvents";
import { socketService } from "./SocketService";
import { SocketResponse, errorOccured } from "cah-shared/enums/SocketResponse";
import {
  GameFinishedEventData,
  InternalGameEvent,
  InternalGameEventTypes,
  NewRoundEventData,
  RoundFinishedEventData,
  VotingPhaseEventData,
} from "@/events/InternalGameEvents";
import {
  CardSumbittedData,
  GameEventErrors,
  GameEventTypes,
  NewRoundData,
  RoundFinishedData,
  VotingPhaseData,
} from "cah-shared/events/backend/GameEvents";
import { Game } from "@/models/Game";

let activeConnectionsBySocket = new Map<string, { playerId: string }>();

let activeConnectionsByPlayer = new Map<string, { socketId: string }>();

function isPlayerActingOnHimself(socketId: string, playerId: string): boolean {
  let player = activeConnectionsBySocket.get(socketId);
  if (!player) throw new Error(PlayerEventErrors.playerNotFound);
  return player.playerId == playerId;
}

function insertPlayerIntoActiveConnections(socketId: string, playerId: string) {
  activeConnectionsByPlayer.delete(playerId);
  activeConnectionsBySocket.delete(socketId);

  activeConnectionsBySocket.set(socketId, {
    playerId: playerId,
  });

  activeConnectionsByPlayer.set(playerId, {
    socketId: socketId,
  });
}

export function startListeningToGameEvents() {
  let io = socketService.getIO();
  let gameManager = socketService.getGameManager();

  gameManager.on("game-event", (internalGameEvent: InternalGameEvent) => {
    let gameId: string = internalGameEvent.gameId;
    let gameEvent: InternalGameEventTypes = internalGameEvent.eventType;

    console.log("Received game event: " + gameEvent + " for game " + gameId);

    switch (gameEvent) {
      case InternalGameEventTypes.initGame: {
        let gameData = internalGameEvent.data as NewRoundEventData;

        let zarSocketId = activeConnectionsByPlayer.get(gameData.zar)?.socketId;
        let zarSocket = io.sockets.sockets.get(zarSocketId);

        if (!zarSocket) {
          let dataToSend: SocketResponse<any> = {
            success: false,
            error: {
              code: GameEventErrors.cantReachZar,
              message:
                "Can't establish a connection to zar. Please restart the game",
            },
          };
          socketService.emit(
            io.to(gameId),
            GameEventTypes.initGame,
            dataToSend
          );
          return;
        }

        // Send data to the zar. He doesn't recive the cards.
        let dataToSend: SocketResponse<NewRoundData> = {
          success: true,
          data: {
            round: gameData.round,
            zar: gameData.zar,
            wasInvalidated: false,
          },
        };

        socketService.emit(zarSocket, GameEventTypes.initGame, dataToSend);

        dataToSend = {
          success: true,
          data: {
            round: gameData.round,
            blackCard: gameData.blackCard,
            whiteCards: gameData.whiteCards,
            zar: gameData.zar,
            wasInvalidated: false,
          },
        };

        socketService.emit(
          zarSocket.to(gameId),
          GameEventTypes.initGame,
          dataToSend
        );

        break;
      }
      case InternalGameEventTypes.newRoundFromInvalidation:
      case InternalGameEventTypes.newRound: {
        let gameData = internalGameEvent.data as NewRoundEventData;

        let zarSocketId = activeConnectionsByPlayer.get(gameData.zar)?.socketId;
        let zarSocket = io.sockets.sockets.get(zarSocketId);

        if (!zarSocket) {
          let dataToSend: SocketResponse<any> = {
            success: false,
            error: {
              code: GameEventErrors.cantReachZar,
              message:
                "Can't establish a connection to zar. Please restart the game",
            },
          };
          socketService.emit(
            io.to(gameId),
            GameEventTypes.newRound,
            dataToSend
          );
          return;
        }

        // Send data to the zar. He doesn't recive the cards.
        let dataToSend: SocketResponse<NewRoundData> = {
          success: true,
          data: {
            round: gameData.round,
            zar: gameData.zar,
            wasInvalidated: gameEvent === InternalGameEventTypes.newRoundFromInvalidation,
          },
        };

        socketService.emit(zarSocket, GameEventTypes.newRound, dataToSend);

        dataToSend = {
          success: true,
          data: {
            round: gameData.round,
            blackCard: gameData.blackCard,
            whiteCards: gameData.whiteCards,
            zar: gameData.zar,
            wasInvalidated: gameEvent === InternalGameEventTypes.newRoundFromInvalidation,
          },
        };

        socketService.emit(
          zarSocket.to(gameId),
          GameEventTypes.newRound,
          dataToSend
        );

        break;
      }
      
      case InternalGameEventTypes.gameDeleted: {
        let gameData = internalGameEvent.data as GameDeletedData;

        let dataToSend: SocketResponse<GameDeletedData> = {
          success: true,
          data: {
            gameId: gameId,
            winners: gameData.winners,
            playerMap: gameData.playerMap,
          },
        };

        socketService.emit(
          io.to(gameId),
          LobbyEventTypes.gameDeleted,
          dataToSend
        );

        socketService.deleteRoom(gameId);

        break;
      }

      case InternalGameEventTypes.startVotingPhase: {
        let gameData = internalGameEvent.data as VotingPhaseEventData;

        let zarSocketId = activeConnectionsByPlayer.get(gameData.zar)?.socketId;
        let zarSocket = io.sockets.sockets.get(zarSocketId);

        if (!zarSocket) {
          let dataToSend: SocketResponse<any> = {
            success: false,
            error: {
              code: GameEventErrors.cantReachZar,
              message:
                "Can't establish a connection to zar. Please restart the game",
            },
          };
          socketService.emit(
            io.to(gameId),
            GameEventTypes.startVotingPhase,
            dataToSend
          );
          return;
        }

        let whiteCards: string[] = [...gameData.chosenWhiteCards.values()];

        let dataToSend: SocketResponse<VotingPhaseData> = {
          success: true,
          data: {
            blackCard: gameData.blackCard,
            chosenWhiteCards: whiteCards,
          },
        };

        socketService.emit(
          zarSocket,
          GameEventTypes.startVotingPhase,
          dataToSend
        );

        dataToSend = {
          success: true,
          data: null,
        };

        socketService.emit(
          zarSocket.to(gameId),
          GameEventTypes.startVotingPhase,
          dataToSend
        );

        break;
      }

      case InternalGameEventTypes.roundFinished: {
        let gameData = internalGameEvent.data as RoundFinishedEventData;

        let dataToSend: SocketResponse<RoundFinishedData> = {
          success: true,
          data: {
            playerMap: gameData.playerMap,
            roundWinner: gameData.roundWinner,
            blackCard: gameData.blackCard,
            whiteCard: gameData.whiteCard,
          },
        };

        socketService.emit(
          io.to(gameId),
          GameEventTypes.roundFinished,
          dataToSend
        );
        break;
      }

      case InternalGameEventTypes.gameFinished: {
        let gameData = internalGameEvent.data as GameFinishedEventData;

        let dataToSend: SocketResponse<GameFinishedData> = {
          success: true,
          data: {
            playerMap: gameData.playerMap,
            winners: gameData.winners,
          },
        };

        socketService.emit(
          io.to(gameId),
          LobbyEventTypes.gameFinished,
          dataToSend
        );
        break;
      }
    }
  });
}

export function startListeningToNetworkEvents() {
  socketService.subscribe(null, "connection", (socket: any) => {
    let io = socketService.getIO();
    let gameManager = socketService.getGameManager();

    let playerId = socket.handshake.query.playerId;

    insertPlayerIntoActiveConnections(socket.id, playerId);

    socketService.subscribe(socket, PlayerEventTypes.JoinGame, (data: any) => {
      console.log("Player " + data.playerId + " wants to join " + data.gameId);

      let game: Game;
      try {
        if (!isPlayerActingOnHimself(socket.id, data.playerId))
          throw new Error(PlayerEventErrors.forbiddenAction);

        // Check if the game exists
        game = gameManager.getGame(data.gameId);

        // Add the player to the game
        gameManager.addPlayerToGame(data.gameId, data.playerId);
      } catch (e) {
        let dataToSend: SocketResponse<any> = {
          requestId: data.requestId,
          success: false,
          error: {
            code: e.message,
            message: e.message,
          },
        };
        socketService.emit(socket, errorOccured, dataToSend);
        return;
      }

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

      // Emit the event to the players
      socketService.emit(
        io.to(data.gameId),
        LobbyEventTypes.playerJoined,
        dataToSend
      );
    });

    socketService.subscribe(
      socket,
      PlayerEventTypes.DeleteGame,
      (data: any) => {
        let game: Game;

        try {
          if (!isPlayerActingOnHimself(socket.id, data.playerId))
            throw new Error(PlayerEventErrors.forbiddenAction);

          // Retrive the game
          game = gameManager.getGame(data.gameId);

          // Remove the player from the game
          gameManager.deleteGame(data.gameId);
        } catch (e) {
          let dataToSend: SocketResponse<any> = {
            requestId: data.requestId,
            success: false,
            error: {
              code: e.message,
              message: e.message,
            },
          };
          socketService.emit(socket, errorOccured, dataToSend);
          return;
        }
      }
    );

    socketService.subscribe(socket, PlayerEventTypes.LeaveGame, (data: any) => {
      let game: Game;

      try {
        if (!isPlayerActingOnHimself(socket.id, data.playerId))
          throw new Error(PlayerEventErrors.forbiddenAction);

        // Retrive the game
        game = gameManager.getGame(data.gameId);

        // Remove the player from the game
        gameManager.removePlayerFromGame(data.gameId, data.playerId);
      } catch (e) {
        let dataToSend: SocketResponse<any> = {
          requestId: data.requestId,
          success: false,
          error: {
            code: e.message,
            message: e.message,
          },
        };
        socketService.emit(socket, errorOccured, dataToSend);
        return;
      }

      activeConnectionsByPlayer.delete(data.playerId);
      activeConnectionsBySocket.delete(socket.id);

      // Leave the socket room
      socket.leave(data.gameId);

      let dataToSend: SocketResponse<PlayerLeftData> = {
        success: true,
        data: {
          playerId: data.playerId,
          gameId: data.gameId,
          players: game.getPlayers(),
          host: game.getHost(),
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
        let gameId: string;
        try {
          if (!isPlayerActingOnHimself(socket.id, data.playerId))
            throw new Error(PlayerEventErrors.forbiddenAction);
          // Create the game
          gameId = gameManager.createGame(data.playerId);
        } catch (e) {
          let dataToSend: SocketResponse<any> = {
            requestId: data.requestId,
            success: false,
            error: {
              code: e.message,
              message: e.message,
            },
          };
          socketService.emit(socket, errorOccured, dataToSend);
          return;
        }

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

    socketService.subscribe(socket, PlayerEventTypes.StartGame, (data: any) => {
      try {
        if (!isPlayerActingOnHimself(socket.id, data.playerId))
          throw new Error(PlayerEventErrors.forbiddenAction);
        // Start the game
        gameManager.startGame(data.gameId, data.playerId);
      } catch (e) {
        let dataToSend: SocketResponse<any> = {
          requestId: data.requestId,
          success: false,
          error: {
            code: e.message,
            message: e.message,
          },
        };
        socketService.emit(socket, errorOccured, dataToSend);
        return;
      }

      // let dataToSend: SocketResponse<any> = {
      //   success: true,
      // };

      // socketService.emit(
      //   io.to(data.gameId),
      //   LobbyEventTypes.gameStarted,
      //   dataToSend
      // );
    });

    socketService.subscribe(
      socket,
      PlayerEventTypes.SubmitCard,
      (data: any) => {
        let remainingPlayers: number;

        try {
          if (!isPlayerActingOnHimself(socket.id, data.playerId))
            throw new Error(PlayerEventErrors.forbiddenAction);

          remainingPlayers = gameManager.submitCard(
            data.gameId,
            data.playerId,
            data.card
          );
        } catch (e) {
          console.log(e);
          let dataToSend: SocketResponse<any> = {
            requestId: data.requestId,
            success: false,
            error: {
              code: e.message,
              message: e.message,
            },
          };
          socketService.emit(socket, errorOccured, dataToSend);
        }

        let dataToSend: SocketResponse<CardSumbittedData> = {
          success: true,
          data: {
            playerRemaining: remainingPlayers,
          },
        };

        socketService.emit(socket, GameEventTypes.cardSubmitted, dataToSend);
      }
    );

    socketService.subscribe(
      socket,
      PlayerEventTypes.SubmitVote,
      (data: any) => {
        try {
          if (!isPlayerActingOnHimself(socket.id, data.playerId))
            throw new Error(PlayerEventErrors.forbiddenAction);

          gameManager.submitVote(data.gameId, data.playerId, data.card);
        } catch (e) {
          let dataToSend: SocketResponse<any> = {
            requestId: data.requestId,
            success: false,
            error: {
              code: e.message,
              message: e.message,
            },
          };
          socketService.emit(socket, errorOccured, dataToSend);
        }
      }
    );

    socketService.subscribe(socket, "disconnect", () => {
      let playerId: string = activeConnectionsBySocket.get(socket.id)
        ?.playerId as string;

      activeConnectionsBySocket.delete(socket.id);
      activeConnectionsByPlayer.delete(playerId);

      let game: Game;
      let gameId: string;

      try {
        // Purge player from the data
        gameId = gameManager.purgePlayer(playerId);

        game = gameManager.getGame(gameId);
      } catch (e) {
        return;
      }

      let dataToSend: SocketResponse<PlayerLeftData> = {
        success: true,
        data: {
          playerId: playerId,
          gameId: gameId,
          players: game.getPlayers(),
          host: game.getHost(),
        },
      };

      socketService.emit(io.to(gameId), LobbyEventTypes.playerLeft, dataToSend);
    });
  });
}
