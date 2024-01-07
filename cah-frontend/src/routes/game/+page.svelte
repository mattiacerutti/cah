<script lang="ts">
	import {
		type PlayerJoinedData,
		LobbyEventTypes,
	} from 'cah-shared/events/backend/LobbyEvents';
	import { onMount } from 'svelte';
	import { socketService } from '@/services/socketService';
	import { get } from 'svelte/store';
	import { playerStore } from '@/stores/playerStore';
	import { GameState, currentGameStore } from '@/stores/currentGameStore';

	import JoinGame from '@/pages/JoinGamePage.svelte';
	import { type SocketResponse } from 'cah-shared/enums/SocketResponse';
	import Game from '@/pages/Game.svelte';

	const playerId: string = get(playerStore).playerId; // Get current value of the player store

	console.log('Your player id is: ', playerId);

	onMount(() => {
		//Connect to socket
		socketService.connect();
	});


	// TODO: Divide in two events for player joined and you joined
	socketService.subscribe(
		LobbyEventTypes.playerJoined,
		(response: SocketResponse<PlayerJoinedData>) => {
			let data = response.data;

			if (data.playerId === playerId) {
				alert('You joined the game!');

				$currentGameStore.gameId = data.gameId;
				$currentGameStore.host = data.host;
				$currentGameStore.players = data.players;

				$currentGameStore.gameState = GameState.LOBBY;
				return;
			}
			console.log(`Player ${data.playerId} joined the game!`);

			$currentGameStore.players = data.players;
		}
	);

	socketService.subscribe(LobbyEventTypes.gameDeleted, (response: SocketResponse<any>) => {
		
		alert("This game was deleted.");

		$currentGameStore.gameId = null;
		$currentGameStore.host = null;
		$currentGameStore.players = new Map<string, number>();
		$currentGameStore.isZar = false;
		$currentGameStore.gameRound = 0;

		$currentGameStore.gameState = null;

	});

</script>

{#if $currentGameStore.gameId === null}
	<JoinGame />
{:else}
	<Game />
{/if}
