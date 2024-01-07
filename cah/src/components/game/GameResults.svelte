<script lang="ts">
	import { type GameFinishedData } from "cah-shared/events/backend/LobbyEvents";


    export let finishedGameData: GameFinishedData;
    export let remainingTime: number;
    
</script>

<div class="w-screen h-screen flex justify-center items-center flex-col">
	{#if finishedGameData.winners.length > 1}
		<h1 class="text-4xl font-bold my-0.5">The winners of the game are:</h1>
		{#each finishedGameData.winners as winner (winner)}
			<h1 class="text-2xl font-bold my-0.5">{winner}</h1>
		{/each}
	{:else}
		<h1 class="text-4xl font-bold my-0.5">The winner of the game is:</h1>
		<h1 class="text-2xl font-bold my-0.5">{finishedGameData.winners[0]}</h1>
	{/if}

	<h1 class="text-4xl font-bold my-0.5">Scoreboard:</h1>
	{#each [...finishedGameData.playerMap] as [player, points] (player)}
		<div class="">
			{player} -> {points}
		</div>
	{/each}
	<p>Time remaining: {remainingTime}</p>
</div>
