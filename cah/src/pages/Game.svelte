<script lang="ts">
	import { socketService } from '@/services/socketService';
	import { type SocketResponse } from 'cah-shared/enums/SocketResponse';
	import { GameEventTypes, type NewRoundData } from 'cah-shared/events/backend/GameEvents';
	import GameLobby from './GameLobby.svelte';
	import { currentGameStore } from '@/stores/currentGameStore';
	import { playerStore } from '@/stores/playerStore';
	import { LobbyEventTypes, type PlayerLeftData } from 'cah-shared/events/backend/LobbyEvents';

	let blackCard: string = "";
	let whiteCards: string[];

	let selectedCard: string = "";

	$: replacedBlackCard = blackCard.includes('___')
        ? blackCard.replace(/_{2,}/g, `<span class="text-primary-orange">${selectedCard}</span>`)
        : `${blackCard} <span class="text-primary-orange">${selectedCard}</span>`;

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

	socketService.subscribe(
		LobbyEventTypes.playerLeft,
		(response: SocketResponse<PlayerLeftData>) => {
			let data = response.data;

			if (data.playerId === $playerStore.playerId) {
				return;
			}

			console.log(`Player ${data.playerId} left the game!`);

			$currentGameStore.host = data.host;
			$currentGameStore.players = data.players;
		}
	);

	const submitCard = () => {};
</script>

<style>
	.submit-button {
		scale: 2;
	}
	.submit-button:hover {
		scale: 2.3
	}
</style>



{#if !$currentGameStore.gameStarted}
	<GameLobby />
{:else if !$currentGameStore.isZar}
	<div class="w-screen h-screen flex justify-center items-center flex-col mx-12">
		<h1 class="text-2xl font-bold my-0.5">
			{#if selectedCard === ""}
				{blackCard}
			{:else}
				{@html replacedBlackCard}
			{/if}
		</h1>
		<div class="flex gap-2 flex-wrap justify-center mx-80">
			{#each whiteCards as card}
				{#if card != selectedCard}
					<div
						role="button"
						tabindex="0"
						on:click={() => (selectedCard = card)}
						on:keydown={() => (selectedCard = card)}
						aria-label="Select this card"
						class="bg-primary-violet bg-opacity-100 p-2 m-0 rounded-md hover:scale-110 hover:mx-5 hover:cursor-pointer transition-all mt-8 text-black card"
					>
						- {card}
					</div>
				{/if}
			{/each}
		</div>
		<button
			class="bg-transparent p-2 rounded-full hover:scale-110 transition-all my-8 scale-150text-primary-blue submit-button"
			on:click={() => {
				submitCard();
			}}
		>
			→
		</button>
	</div>
{:else}
	<div class="w-screen h-screen flex justify-center items-center flex-col">
		<h1 class="text-4xl font-bold my-0.5">
			Sei lo ZAR! Attendi che tutti i giocatori abbiano finito di votare.
		</h1>
	</div>
{/if}
