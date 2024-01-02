<script lang="ts">
	import {PlayerEventTypes} from "cah-shared/enums/PlayerEventTypes";
	import type  {JoinGameData, CreateGameData} from 'cah-shared/enums/PlayerEventTypes';
	import {type PlayerJoinedData, type GameCreatedData, LobbyEventTypes, type PlayerLeftData} from "cah-shared/enums/LobbyEventTypes";
	import {onMount} from "svelte";
	import { socketService } from "@/services/socketService";
	import { get } from "svelte/store";
	import { playerStore } from "@/stores/playerStore";
	import { currentGameStore, updateCurrentGame, updatePlayers } from "@/stores/currentGameStore";

	import JoinGame from "@/pages/JoinGamePage.svelte";
	import GameLobby from "@/pages/GameLobby.svelte";

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

	socketService.subscribe(LobbyEventTypes.gameCreated, (data: GameCreatedData) => {
		// Copy the code to the clipboard
		navigator.clipboard.writeText(data.gameId);

		alert(`Game created!`);


		const currentGame = get(currentGameStore);

		currentGame.gameId = data.gameId;
		currentGame.host = playerId;
		currentGame.players.set(playerId, 0);
		updateCurrentGame();


		isInGame = true;
	});

	socketService.subscribe(LobbyEventTypes.playerJoined, (data: PlayerJoinedData) => {
		const currentGame = get(currentGameStore);

		if(data.playerId === playerId) {
			alert("You joined the game!");

			currentGame.gameId = data.gameId;
			currentGame.host = data.host;
			currentGame.players = data.players;
			updateCurrentGame();

			isInGame = true;
			return
		} 
		console.log(`Player ${data.playerId} joined the game!`);

		currentGame.players = data.players;
		updateCurrentGame();

	});

	socketService.subscribe(LobbyEventTypes.playerLeft, (data: PlayerLeftData) => {
		const currentGame = get(currentGameStore);

		if(data.playerId === playerId) {
			return
		} 
		
		console.log(`Player ${data.playerId} left the game!`);

		currentGame.host = data.host;
		currentGame.players = data.players;
		updateCurrentGame();

	});

</script>

{#if !isInGame}
	<JoinGame  bind:gameCode={gameCode} joinGame={joinGame} createGame={createGame}/>
{:else}
	<GameLobby/>
{/if}




