<script lang="ts">
	import { socketService } from '@/services/socketService';
	import { type SocketResponse } from 'cah-shared/enums/SocketResponse';
	import { GameEventTypes, type NewRoundData } from 'cah-shared/events/backend/GameEvents';
	import GameLobby from './GameLobby.svelte';
	import { currentGameStore } from '@/stores/currentGameStore';
	import { playerStore } from '@/stores/playerStore';

	let blackCard: string;
	let whiteCards: string[];

	socketService.subscribe(GameEventTypes.initGame, (response: SocketResponse<NewRoundData>) => {
		if (!response.success) {
			alert(response.error.code);
			return;
		}

		if (!$currentGameStore.gameStarted) {
			$currentGameStore.gameStarted = true;
		}

		let data = response.data;

		$currentGameStore.isZar = data.zar === $playerStore.playerId;
		$currentGameStore.gameRound = data.round;

		if (data.blackCard && data.whiteCards) {
			blackCard = data.blackCard;
			whiteCards = data.whiteCards.get($playerStore.playerId);
		}
	});
</script>

{#if !$currentGameStore.gameStarted}
	<GameLobby />
{:else if !$currentGameStore.isZar}
	<div class="w-screen h-screen flex justify-center items-center flex-col">
		<h1 class="text-2xl font-bold my-0.5">
			{blackCard}
		</h1>
		<div class="flex gap-2 flex-wrap justify-center">
			{#each whiteCards as card}
				<div
					class="bg-white bg-opacity-70 p-2 m-0 rounded-md hover:scale-110 transition-all my-8 text-black"
				>
					- {card}
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="w-screen h-screen flex justify-center items-center flex-col">
		<h1 class="text-4xl font-bold my-0.5">
			Sei lo ZAR! Attendi che tutti i giocatori abbiano finito di votare.
		</h1>
	</div>
{/if}
