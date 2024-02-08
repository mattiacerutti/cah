<script lang="ts">
	import { socketService } from '@/services/socketService';
	import { currentGameStore } from '@/stores/currentGameStore';
	import { PlayerEventTypes } from 'cah-shared/events/frontend/PlayerEvents';
	import { onMount } from 'svelte';

	export let isVotingPhase: boolean = false;

	export let blackCard: string = "";
	export let whiteCards: string[][] = [];

	let whiteCardPointer: number = -1;

	let blackCardParts: string[]
	$: blackCardParts = blackCard.split('______');

	console.log("Black card parts: ", blackCardParts);

	// $: if (whiteCardPointer >= 0) {
	// 	replacedBlackCard = blackCard.includes('___')
	// 		? blackCard.replace(
	// 				/_{2,}/g,
	// 				`<span class="text-primary-orange">${whiteCards[whiteCardPointer]}</span>`
	// 			)
	// 		: `${blackCard} <span class="text-primary-orange">${whiteCards[whiteCardPointer]}</span>`;
	// } else {
	// 	replacedBlackCard = blackCard;
	// }

	const goLeft = () => {
		if (whiteCardPointer > 0) {
			whiteCardPointer--;
		}
	};

	const goRight = () => {
		if (whiteCardPointer < whiteCards.length - 1) {
			whiteCardPointer++;
		}
	};

	const submitCard = (cards: string[]) => {
		socketService.emit(
			PlayerEventTypes.SubmitVote,
			{
				cards: cards,
				gameId: $currentGameStore.gameId
			},
			(error) => {
				if (error) {
					alert('Error submitting you card: ' + error.message);
				}
			}
		);
	};
</script>

{#if !isVotingPhase}
	<div class=" h-screen flex justify-center items-center flex-col">
		<h1 class="text-4xl font-bold my-0.5">
			Sei lo ZAR! Attendi che tutti i giocatori abbiano finito di votare.
		</h1>
	</div>
{:else}
	<div class=" h-screen flex justify-center items-center flex-col mx-12">
		<h1 class="text-2xl font-bold my-0.5">
			{#if whiteCardPointer >= 0}
				{#each blackCardParts as part, index}
					{@html part}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					{#if index < whiteCards[whiteCardPointer].length}
						<span class="text-primary-orange cursor-pointer">
							{whiteCards[whiteCardPointer][index]}</span
						>
					{/if}
				{/each}
			{:else}
				{blackCard}
			{/if}
		</h1>
		<div class="flex flex-row flex-nowrap gap-3">
			<button
				class="bg-transparent p-2 rounded-full hover:scale-110 transition-all my-8 text-primary-blue submit-button"
				on:click={() => goLeft()}
			>
				←
			</button>
			{#if whiteCardPointer >= 0}
				<button
					class="bg-transparent p-2 rounded-full hover:scale-110 transition-all my-8 text-primary-blue submit-button"
					on:click={() => submitCard(whiteCards[whiteCardPointer])}
				>
					✓
				</button>
			{/if}
			<button
				class="bg-transparent p-2 rounded-full hover:scale-110 transition-all my-8 text-primary-blue submit-button"
				on:click={() => goRight()}
			>
				→
			</button>
		</div>
	</div>
{/if}
