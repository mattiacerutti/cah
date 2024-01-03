<script lang="ts">
	import { playerStore } from "@/stores/playerStore";
    import { currentGameStore, updateCurrentGame } from "@/stores/currentGameStore";
	import { get } from "svelte/store";
	import { socketService } from "@/services/socketService";
    import { type StartGameData,  PlayerEventTypes, PlayerEventErrors} from "cah-shared/events/PlayerEventTypes";
    import { LobbyEventTypes } from "cah-shared/events/LobbyEventTypes";
	import { onDestroy } from "svelte";
    import {type SocketResponse} from "cah-shared/enums/SocketResponse";

    let currentGame: any;
    let mapToArray: Array<any> = [];

    $: {
        currentGame = $currentGameStore;
        mapToArray = Array.from(currentGame.players as Map<string, number>, ([key, value]) => ({ key, value }));
    }


    const startGame = () => {

        let data: StartGameData = {
            gameId: currentGame.gameId,
        };

        socketService.emit(PlayerEventTypes.StartGame, data);
    };

    socketService.subscribe(LobbyEventTypes.gameStarted, (response: SocketResponse<any>) => {
        if(!response.success) {
			alert(response.error.code)
			return;
		}
		let data = response.data;
        $currentGameStore.gameStarted = true;
        alert("Game started!");
    });

    onDestroy(() => {
        socketService.unsubscribe(LobbyEventTypes.gameStarted);
    });



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
        <button class="bg-primary-blue p-2 rounded-md hover:scale-110 transition-all my-8" on:click={startGame}>
            Start Game
        </button>
    {/if}
</div>



