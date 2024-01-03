import { Server, Socket } from "socket.io";
import { toMap, toObject } from "cah-shared/utils";
import { GameManager } from "@/managers/GameManager";
import { startListeningToNetworkEvents, startListeningToGameEvents } from "./socketHandlers";

type EventCallback = (...args: unknown[]) => void;

class SocketService {
  private io = null;
  private gameManager: GameManager | null = null;

  public bind(io: Server, gameManager: GameManager) {
    this.io = io;
    this.gameManager = gameManager;
    startListeningToNetworkEvents();
    startListeningToGameEvents();
  }

  public emit(emitter, ...args) {
    // if the first argument is a function (like socket.to)
    if (typeof emitter === "function") {
      // Additional processing for methods like .to()
      emitter = emitter(...args.slice(0, 1));
      args = args.slice(1);
    }

    // Convert the data
    const dataIdx = args.length > 1 ? 1 : 0; // Assumes data is always the second argument
    if (typeof args[dataIdx] === "object") {
      args[dataIdx] = toObject(args[dataIdx]);
    }

    // Emit the event with the converted data
    emitter.emit(...args);
  }

  public subscribe(socket: Socket, event: string, handler: EventCallback) {
    if (!socket) {
      this.io.on(event, (data) => {
        handler(data);
      });
      return;
    }
    socket.on(event, (data) => {
      const convertedData = toMap(data);
      handler(convertedData);
    });
  }

  public getGameManager(): GameManager {
    if (!this.gameManager) {
      throw new Error("Game manager not initialized");
    }
    return this.gameManager;
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error("IO not initialized");
    }
    return this.io;
  }

}

export const socketService = new SocketService();
