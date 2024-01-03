<script lang="ts">
	import {PlayerEventTypes} from "cah-shared/enums/PlayerEventTypes";
	import type  {JoinGameData, CreateGameData} from 'cah-shared/enums/PlayerEventTypes';
	import {type PlayerJoinedData, type GameCreatedData, LobbyEventTypes, type PlayerLeftData} from "cah-shared/enums/LobbyEventTypes";
	import {onMount} from "svelte";
	import { socketService } from "@/services/socketService";
	import { get } from "svelte/store";
	import { playerStore } from "@/stores/playerStore";
	import { currentGameStore } from "@/stores/currentGameStore";

	import JoinGame from "@/pages/JoinGamePage.svelte";
	import GameLobby from "@/pages/GameLobby.svelte";
	import { type SocketResponse } from "cah-shared/enums/SocketResponse";

	let gameCode: string = '';
    const playerId: string = get(playerStore).playerId; // Get current value of the player store

	let isInGame: boolean = false;

	console.log("Your player id is: ", playerId);

	onMount(() => {
		//Connect to socket
		socketService.connect();
	});

	const createGame = () => {
		socketService.emit(PlayerEventTypes.CreateGame, {});
	};

	const joinGame = () => {

		let data: JoinGameData = {
			gameId: gameCode,
		};

		socketService.emit(PlayerEventTypes.JoinGame, data);
	};

	socketService.subscribe(LobbyEventTypes.gameCreated, (response: SocketResponse<GameCreatedData>) => {
		if(!response.success) {
			alert(response.error.code)
			return;
		}
		let data = response.data;
		// Copy the code to the clipboard
		navigator.clipboard.writeText(data.gameId);

		alert(`Game created!`);

		$currentGameStore.gameId = data.gameId;
		$currentGameStore.host = playerId;
		$currentGameStore.players.set(playerId, 0);


		isInGame = true;
	});

	socketService.subscribe(LobbyEventTypes.playerJoined, (response: SocketResponse<PlayerJoinedData>) => {

		if(!response.success) {
			alert(response.error.code)
			return;
		}
		let data = response.data;

		if(data.playerId === playerId) {
			alert("You joined the game!");

			$currentGameStore.gameId = data.gameId;
			$currentGameStore.host = data.host;
			$currentGameStore.players = data.players;

			isInGame = true;
			return
		} 
		console.log(`Player ${data.playerId} joined the game!`);

		$currentGameStore.players = data.players;

	});

	socketService.subscribe(LobbyEventTypes.playerLeft, (response: SocketResponse<PlayerLeftData>) => {

		if(!response.success) {
			alert(response.error.code)
			return;
		}

		let data = response.data;

		if(data.playerId === playerId) {
			return
		} 
		
		console.log(`Player ${data.playerId} left the game!`);

		$currentGameStore.host = data.host;
		$currentGameStore.players = data.players;

	});

</script>

{#if !isInGame}
	<JoinGame  bind:gameCode={gameCode} joinGame={joinGame} createGame={createGame}/>
{:else}
{#if !$currentGameStore.gameStarted}
	<GameLobby/>
	{:else}
		started
	{/if}
{/if}



