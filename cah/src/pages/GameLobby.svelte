<script lang="ts">
	import { playerStore } from "@/stores/playerStore";
    import { currentGameStore } from "@/stores/currentGameStore";
	import { get } from "svelte/store";

    let currentGame: any;
    let mapToArray: Array<any> = [];

    $: {
        currentGame = $currentGameStore;
        mapToArray = Array.from(currentGame.players as Map<string, number>, ([key, value]) => ({ key, value }));
    }


</script>


<div class="w-screen h-screen flex justify-center items-center flex-col">
    <h1 class="text-4xl font-bold my-0.5">
        Game Code:
    </h1>
    <h2 class="text-2xl font-semibold underline">
        {currentGame.gameId}
    </h2>
    <br>
    <br>
    <h2 class="text-4xl font-bold my-1.5">
        Players:
    </h2>

    {#each mapToArray as item (item.key)}
            <div class="">
            {item.key}
        </div>
    {/each}
    
    {#if currentGame.host === get(playerStore).playerId}
        <button class="bg-primary-blue p-2 rounded-md hover:scale-110 transition-all my-8">
            Start Game
        </button>
    {/if}
</div>



