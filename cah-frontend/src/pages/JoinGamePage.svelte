<script lang="ts">
	import TextField from '@/components/TextField.svelte';
	import { socketService } from '@/services/socketService';
	import { GameState, currentGameStore } from '@/stores/currentGameStore';
	import { playerStore } from '@/stores/playerStore';
	import { type SocketResponse } from 'cah-shared/enums/SocketResponse';
	import { type GameCreatedData, LobbyEventTypes } from 'cah-shared/events/backend/LobbyEvents';
	import { type JoinGameData, PlayerEventTypes } from 'cah-shared/events/frontend/PlayerEvents';
	import { onDestroy } from 'svelte';

	let gameCode: string = '';

	const createGame = () => {
		socketService.emit(PlayerEventTypes.CreateGame, null, (error) => {
			alert(error.message);
		});
	};

	const joinGame = () => {
		let data: JoinGameData = {
			gameId: gameCode
		};

		socketService.emit(PlayerEventTypes.JoinGame, data, (error) => {
			alert(error.message);
		});
	};

    socketService.subscribe(
		LobbyEventTypes.gameCreated,
		(response: SocketResponse<GameCreatedData>) => {
			let data = response.data;
			// Copy the code to the clipboard
			navigator.clipboard.writeText(data.gameId);

			alert(`Game created!`);

			$currentGameStore.gameId = data.gameId;
			$currentGameStore.host = $playerStore.playerId;
			$currentGameStore.players.set($playerStore.playerId, 0);

			$currentGameStore.gameState = GameState.LOBBY;
		}
	);

    onDestroy(() => {
        socketService.unsubscribe(LobbyEventTypes.gameCreated);
    
    });
</script>

<div class=" h-screen flex justify-center items-center flex-col gap-8">
	<div class="w-max h-auto flex-row flex gap-10">
		<TextField bind:value={gameCode} placeHolder={'Type game code'} />
		<button
			class="bg-primary-blue p-2 rounded-md hover:scale-110 transition-all text-black"
			on:click={joinGame}
		>
			Join Game
		</button>
	</div>
	Or
	<button
		class="bg-primary-blue p-2 rounded-md hover:scale-110 transition-all text-black"
		on:click={createGame}
	>
		Create Game
	</button>
</div>
