<script lang="ts">
	import { socketService } from '@/services/socketService';
	import { currentGameStore } from '@/stores/currentGameStore';
	import { type SocketResponse } from 'cah-shared/enums/SocketResponse';
	import { type CardSumbittedData, GameEventTypes } from 'cah-shared/events/backend/GameEvents';
	import { PlayerEventTypes } from 'cah-shared/events/frontend/PlayerEvents';

	export let isVotingPhase: boolean = false;

	export let blackCard: string = '';
	export let whiteCards: string[] = [];

	let selectedCard: string = '';

	let isCardSubmitted: boolean = false;
	let playerRemaining: number;

	$: replacedBlackCard = blackCard.includes('___')
		? blackCard.replace(/_{2,}/g, `<span class="text-primary-orange">${selectedCard}</span>`)
		: `${blackCard} <span class="text-primary-orange">${selectedCard}</span>`;

	const submitCard = () => {
		if (selectedCard === '') {
			alert('Seleziona una carta!');
			return;
		}

		socketService.emit(
			PlayerEventTypes.SubmitCard,
			{
				gameId: $currentGameStore.gameId,
				card: selectedCard
			},
			(error) => {
				if (error) {
					alert('Error submitting you card: ' + error.message);
				}
			}
		);
	};

	socketService.subscribe(
		GameEventTypes.cardSubmitted,
		(response: SocketResponse<CardSumbittedData>) => {
			if (!response.success) {
				alert(response.error.code);
				return;
			}

			let data = response.data;

			isCardSubmitted = true;

			playerRemaining = data.playerRemaining;
		}
	);
</script>

{#if !isVotingPhase}
	<div class="w-screen h-screen flex justify-center items-center flex-col mx-12">
		<h1 class="text-2xl font-bold my-0.5">
			{#if selectedCard === ''}
				{blackCard}
			{:else}
				{@html replacedBlackCard}
			{/if}
		</h1>
		{#if isCardSubmitted}
			<h1 class="text-xl font-bold my-0.5 text-primary-violet text-center mt-8">
				Card submitted! Wait until everyone chooses his card. <br> Remaining Players: {playerRemaining}
			</h1>
		{:else}
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
						{card}
						</div>
					{/if}
				{/each}
			</div>
			<button
				class="bg-transparent p-2 rounded-full hover:scale-110 transition-all my-8 text-primary-blue submit-button"
				on:click={() => {
					submitCard();
				}}
			>
				→
			</button>
		{/if}
	</div>
{:else}
	<div class="w-screen h-screen flex justify-center items-center flex-col">
		<h1 class="text-4xl font-bold my-0.5">Attendi che lo ZAR voti la carta..</h1>
	</div>
{/if}

<style>
	.submit-button {
		scale: 2;
	}
	.submit-button:hover {
		scale: 2.3;
	}
</style>
