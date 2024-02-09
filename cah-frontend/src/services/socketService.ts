// src/services/socketService.ts
import io, { Socket } from 'socket.io-client';
import { playerStore } from '../stores/playerStore';
import { get } from 'svelte/store';
import { toMap, toObject } from 'cah-shared/utils';
import { SocketResponse, errorOccured } from 'cah-shared/enums/SocketResponse';
import { writable } from 'svelte/store';

type EventCallback = (...args: unknown[]) => void;

export enum ConnectionState {
	InitialState = 'initialState',
	Connected = 'connected',
	Disconnected = 'disconnected'
}

export interface ConnectionStatus {
	state: ConnectionState;
	attempts: number;
}
class SocketService {
	private socket: Socket | null = null;
	private eventHandlers = new Map<string, EventCallback[]>();
	private errorHandlers = new Map<string, (error: Error) => void>();

	public connectionStatus = writable<ConnectionStatus>({
		state: ConnectionState.InitialState,
		attempts: 0
	});

	public connect() {
		if (this.socket && this.socket.connected) {
			return; // Already connected
		}

		this.socket = io('http://localhost:3000', {
			query: {
				playerId: get(playerStore).playerId
			}
		});

		this.socket.io.on('reconnect_attempt', (attempt) => {
			this.connectionStatus.update((connectioStatus: ConnectionStatus) => {
				return { state: connectioStatus.state, attempts: attempt };
			});
		});

		this.socket.on('connect', () => {
			this.connectionStatus.set({
				state: ConnectionState.Connected,
				attempts: 0
			});
		});

		this.socket.on('connect_error', () => {
			if (get(this.connectionStatus).state === ConnectionState.Connected) {
				this.connectionStatus.set({
					state: ConnectionState.Disconnected,
					attempts: 0
				});
			}
		});

		this.socket.onAny((event, ...args) => {
			this.handleEvent(event, ...args);
		});
	}

	private handleEvent(event: string, ...args: unknown[]) {
		if (event === errorOccured) {
			const response = args[0] as SocketResponse<unknown>;
			const { requestId, error } = response;
			const errorHandler = this.errorHandlers.get(requestId);
			if (errorHandler) {
				errorHandler(new Error(error.message)); // Or pass the whole error object
				this.errorHandlers.delete(requestId);
			}
			return;
		}

		const handlers = this.eventHandlers.get(event) || [];
		handlers.forEach((handler) => handler(...args));
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
		};

		this.eventHandlers.get(event)?.push(wrappedCallback);
	}

	public unsubscribe(event: string) {
		this.eventHandlers.delete(event);
	}

	public emit(event: string, data: unknown, errorHandler?: (error: Error) => void) {
		const requestId = crypto.randomUUID();

		if (errorHandler) {
			this.errorHandlers.set(requestId, errorHandler);
		}

		const player = get(playerStore); // Get current value of the player store
		this.socket?.emit(
			event,
			Object.assign({}, toObject(data), { playerId: player.playerId, requestId: requestId })
		);
	}
}

export const socketService = new SocketService();
