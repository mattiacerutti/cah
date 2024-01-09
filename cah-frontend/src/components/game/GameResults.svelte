<script lang="ts">
	import { type GameFinishedData } from 'cah-shared/events/backend/LobbyEvents';

	export let finishedGameData: GameFinishedData;
	export let remainingTime: number;
</script>

<div class=" h-screen flex justify-center items-center flex-col">
	<h1 class="text-8xl font-bold my-16">Game ended!</h1>

	{#if finishedGameData.winners.length > 1}
		<h1 class="text-4xl font-bold my-0.5">The winners of the game are:</h1>
		{#each finishedGameData.winners as winner (winner)}
			<h1 class="text-2xl font-bold my-0.5">
				<span class="text-primary-violet-500">{winner.slice(0, 10)}</span>
			</h1>
		{/each}
	{:else}
		<h1 class="text-4xl font-bold my-0.5">
			<span class="text-primary-violet-500">{finishedGameData.winners[0].slice(0, 10)}</span> won the game!
		</h1>
	{/if}

	<h1 class="text-3xl font-bold mt-6">Scoreboard:</h1>
	{#each [...finishedGameData.playerMap] as [player, points] (player)}
		<div class="">
			{player.slice(0, 10)}: {points}
		</div>
	{/each}
	<p>Time remaining: {remainingTime}</p>
</div>
