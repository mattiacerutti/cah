<script lang="ts">
	export let playerMap: Map<string, number>;
	export let blackCard: string;
	export let winnerWhiteCards: string[];
	export let winnerId: string;
	export let timeRemaining: number;

	let blackCardParts = blackCard.split('______');


</script>

<div class=" h-screen flex justify-center items-center flex-col mx-12">
	<h1 class="text-6xl font-bold my-16">Round Ended!</h1>

	<h1 class="text-4xl font-bold my-0.5">
		<span class="text-primary-violet-500">{winnerId.slice(0, 10)}</span> got the point!
	</h1>
	<p class="font-bold my-2">with</p>
	<h1 class="text-2xl font-bold my-0.5 text-center">
		<!-- {@html replacedBlackCard} -->
		{#each blackCardParts as part, index}
			{@html part.replace(/\n/g, '<br>')}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			{#if index < winnerWhiteCards.length}
				<span class="text-primary-orange"> {winnerWhiteCards[index]}</span>
			{/if}
		{/each}
	</h1>
	<h1 class="text-2xl font-bold mt-6">Scoreboard:</h1>
	{#each [...playerMap] as [player, points] (player)}
		<div class="">
			{player.slice(0, 10)}: {points}
		</div>
	{/each}
	<p>Time remaining: {timeRemaining}</p>
</div>
