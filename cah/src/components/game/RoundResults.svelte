<script lang="ts">
	export let playerMap: Map<string, number>;
	export let blackCard: string;
	export let winnerWhiteCard: string;
	export let winnerId: string;
	export let timeRemaining: number;

	$: replacedBlackCard = blackCard.includes('___')
		? blackCard.replace(/_{2,}/g, `<span class="text-primary-orange">${winnerWhiteCard}</span>`)
		: `${blackCard} <span class="text-primary-orange">${winnerWhiteCard}</span>`;
</script>

<div class="w-screen h-screen flex justify-center items-center flex-col mx-12">
	<h1 class="text-4xl font-bold my-0.5">The winner of the round is:</h1>
	<h1 class="text-2xl font-bold my-0.5">{winnerId}</h1>
	<p class="font-bold my-0.5">with</p>
	<h1 class="text-2xl font-bold my-0.5">{@html replacedBlackCard}</h1>
	<h1 class="text-4xl font-bold my-0.5">Scoreboard:</h1>
	{#each [...playerMap] as [player, points] (player)}
		<div class="">
			{player} -> {points}
		</div>
	{/each}
	<p>Time remaining: {timeRemaining}</p>
</div>
