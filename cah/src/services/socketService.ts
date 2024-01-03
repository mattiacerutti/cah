// src/services/socketService.ts
import io, { Socket } from 'socket.io-client';
import { playerStore } from '../stores/playerStore';
import { get } from 'svelte/store';
import { toMap, toObject } from "cah-shared/utils";

type EventCallback = (...args: unknown[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private eventHandlers = new Map<string, EventCallback[]>();


  public connect() {
    if (this.socket && this.socket.connected) {
      return; // Already connected
    }

    this.socket = io('http://localhost:3000', {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.onAny((event, ...args) => {
      this.handleEvent(event, ...args);
    });
  }

  private handleEvent(event: string, ...args: unknown[]) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(...args));
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }


  public subscribe(event: string, callback: EventCallback) {
    if (!this.eventHandlers.has(event)) {
        this.eventHandlers.set(event, []);
    }

    const wrappedCallback = (data) => {
        // Convert the data back to Maps (if it was originally a Map)
        const convertedData = toMap(data);
        callback(convertedData);
    }

    this.eventHandlers.get(event)?.push(wrappedCallback);
}

public unsubscribe(event: string) {
    this.eventHandlers.delete(event);
}



  public emit(event: string, data: unknown) {
    const player = get(playerStore); // Get current value of the player store
    this.socket?.emit(event, Object.assign({}, toObject(data), { playerId: player.playerId }));
  }

}

export const socketService = new SocketService();
