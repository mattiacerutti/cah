<script lang="ts">
	import { playerStore } from '@/stores/playerStore';
	import { currentGameStore, isHost, updateCurrentGame } from '@/stores/currentGameStore';
	import { get } from 'svelte/store';
	import { socketService } from '@/services/socketService';
	import {
		type StartGameData,
		PlayerEventTypes,
		PlayerEventErrors
	} from 'cah-shared/events/frontend/PlayerEvents';
	import { LobbyEventTypes } from 'cah-shared/events/backend/LobbyEvents';

	let mapToArray: Array<any> = [];

	export let deleteGameModal;

	$: mapToArray = Array.from($currentGameStore.players as Map<string, number>, ([key, value]) => ({
		key,
		value
	}));

	const startGame = () => {
		let data: StartGameData = {
			gameId: $currentGameStore.gameId
		};

		socketService.emit(PlayerEventTypes.StartGame, data, (error) => {
			alert(error.message);
		});
	};

	socketService.subscribe(LobbyEventTypes.gameStarted, (response: any) => {
		if (!response.success) {
			alert(response.error.code);
			return;
		}
	});
</script>

<div class=" h-screen flex justify-center items-center flex-col">
	<h1 class="text-4xl font-bold my-0.5">Game Code:</h1>
	<h2 class="text-2xl font-semibold underline">
		{$currentGameStore.gameId}
	</h2>
	<br />
	<br />
	<h2 class="text-4xl font-bold my-1.5">Players:</h2>

	{#each mapToArray as item (item.key)}
		<div class="">
			{item.key}
		</div>
	{/each}

	{#if isHost()}
		<div class="flex flex-row gap-6">
			<button
				class="bg-primary-blue p-2 rounded-md hover:scale-110 transition-all my-8 text-black"
				on:click={startGame}
			>
				Start Game
			</button>
			<button
				class="bg-primary-blue p-2 rounded-md hover:scale-110 transition-all my-8 text-black"
				on:click={() => deleteGameModal.show()}>Delete Game</button
			>
		</div>
	{/if}
</div>
