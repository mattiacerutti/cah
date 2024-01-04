<script lang="ts">
	import {
		type PlayerJoinedData,
		type GameCreatedData,
		LobbyEventTypes,
		type PlayerLeftData
	} from 'cah-shared/events/backend/LobbyEvents';
	import { onMount } from 'svelte';
	import { socketService } from '@/services/socketService';
	import { get } from 'svelte/store';
	import { playerStore } from '@/stores/playerStore';
	import { currentGameStore } from '@/stores/currentGameStore';

	import JoinGame from '@/pages/JoinGamePage.svelte';
	import { type SocketResponse } from 'cah-shared/enums/SocketResponse';
	import Game from '@/pages/Game.svelte';

	const playerId: string = get(playerStore).playerId; // Get current value of the player store
	let isInGame: boolean = false;

	console.log('Your player id is: ', playerId);

	onMount(() => {
		//Connect to socket
		socketService.connect();
	});

	socketService.subscribe(
		LobbyEventTypes.gameCreated,
		(response: SocketResponse<GameCreatedData>) => {
			let data = response.data;
			// Copy the code to the clipboard
			navigator.clipboard.writeText(data.gameId);

			alert(`Game created!`);

			$currentGameStore.gameId = data.gameId;
			$currentGameStore.host = playerId;
			$currentGameStore.players.set(playerId, 0);

			isInGame = true;
		}
	);

	socketService.subscribe(
		LobbyEventTypes.playerJoined,
		(response: SocketResponse<PlayerJoinedData>) => {
			let data = response.data;

			if (data.playerId === playerId) {
				alert('You joined the game!');

				$currentGameStore.gameId = data.gameId;
				$currentGameStore.host = data.host;
				$currentGameStore.players = data.players;

				isInGame = true;
				return;
			}
			console.log(`Player ${data.playerId} joined the game!`);

			$currentGameStore.players = data.players;
		}
	);

	socketService.subscribe(
		LobbyEventTypes.playerLeft,
		(response: SocketResponse<PlayerLeftData>) => {
			let data = response.data;

			if (data.playerId === playerId) {
				return;
			}

			console.log(`Player ${data.playerId} left the game!`);

			$currentGameStore.host = data.host;
			$currentGameStore.players = data.players;
		}
	);



</script>

{#if !isInGame}
	<JoinGame />
{:else}
	<Game />
{/if}
