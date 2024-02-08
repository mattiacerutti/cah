<script lang="ts">
	import { socketService } from '@/services/socketService';
	import { showAlert } from '@/stores/componentsStore';
	import { currentGameStore } from '@/stores/currentGameStore';
	import { type SocketResponse } from 'cah-shared/enums/SocketResponse';
	import { type CardSumbittedData, GameEventTypes } from 'cah-shared/events/backend/GameEvents';
	import { PlayerEventTypes } from 'cah-shared/events/frontend/PlayerEvents';

	export let isVotingPhase: boolean = false;

	export let blackCard: string = '';
	export let whiteCards: string[] = [];

	export let blackCardPickNumber: number;

	let selectedCards: string[] = [];
	for (let i = 0; i < blackCardPickNumber; i++) {
		selectedCards.push('');
	}

	let isCardSubmitted: boolean = false;
	let playerRemaining: number;

	let blackCardParts = blackCard.split('______');

	const countSubmittedCards = () => {
		let count = 0;
		selectedCards.forEach((card) => {
			if (card !== '') {
				count++;
			}
		});
		return count;
	};

	const submitCard = () => {
		if (countSubmittedCards() < blackCardPickNumber) {
			showAlert('You must complete the phrase!');
			return;
		}

		socketService.emit(
			PlayerEventTypes.SubmitCard,
			{
				gameId: $currentGameStore.gameId,
				cards: selectedCards
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

	let next: [number, HTMLElement | null] = [0, null];
</script>

{#if !isVotingPhase}
	<div class=" h-screen flex justify-center items-center flex-col mx-12">
		<h1 class="text-2xl font-bold my-0.5">
			<!-- {@html replacedBlackCard} -->
			{#each blackCardParts as part, index}
				{@html part}
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				{#if index < selectedCards.length}
					{#if selectedCards[index] !== ''}
						<span
							class="text-primary-orange cursor-pointer"
							on:click={() => {
								selectedCards[index] = '';
							}}
						>
							{selectedCards[index]}</span
						>
					{:else}
						______
					{/if}
				{/if}
			{/each}
		</h1>
		{#if isCardSubmitted}
			<h1 class="text-xl font-bold my-0.5 text-primary-violet-500 text-center mt-8">
				Card submitted! Wait until everyone chooses his card. <br /> Remaining Players: {playerRemaining}
			</h1>
		{:else}
			<div class="flex flex-wrap justify-center mx-80" id="test">
				{#each whiteCards as card}
					{#if !selectedCards.includes(card)}
						<div
							role="button"
							tabindex="0"
							on:click={() => {
								//Put in first available void string in selectedCards
								let index = selectedCards.indexOf('');
								if (index !== -1) {
									selectedCards[index] = card;
									return;
								}
								//Replace last one
								selectedCards[selectedCards.length - 1] = card;
							}}
							on:keydown={() => {
								//Put in first available void string in selectedCards
								let index = selectedCards.indexOf('');
								if (index !== -1) {
									selectedCards[index] = card;
									return;
								}
								//Replace last one
								selectedCards[selectedCards.length - 1] = card;
							}}
							aria-label="Select this card"
							class="bg-primary-violet-500 bg-opacity-100 p-2 m-2 rounded-md transition-all hover:bg-primary-violet-600 hover:cursor-pointer mt-8 text-black card"
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
	<div class=" h-screen flex justify-center items-center flex-col">
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
