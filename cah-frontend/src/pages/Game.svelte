<script lang="ts">
	import { socketService } from '@/services/socketService';
	import { type SocketResponse } from 'cah-shared/enums/SocketResponse';
	import {
		GameEventTypes,
		type VotingPhaseData,
		type NewRoundData,
		type RoundFinishedData
	} from 'cah-shared/events/backend/GameEvents';
	import GameLobby from './GameLobby.svelte';
	import { GameState, currentGameStore, isHost } from '@/stores/currentGameStore';
	import { playerStore } from '@/stores/playerStore';
	import {
		type GameFinishedData,
		LobbyEventTypes,
		type PlayerLeftData
	} from 'cah-shared/events/backend/LobbyEvents';
	import ZarGameView from '@/components/game/ZarGameView.svelte';
	import PlayerGameView from '@/components/game/PlayerGameView.svelte';
	import RoundResults from '@/components/game/RoundResults.svelte';
	import GameResults from '@/components/game/GameResults.svelte';
	import Modal from '@/components/Modal.svelte';
	import { createModal } from '@/stores/modalStores';

	let blackCard: string = '';
	let whiteCards: string[];

	let finishedRoundData: RoundFinishedData;
	let finishedGameData: GameFinishedData;

	let isVotingPhase: boolean;

	$: isVotingPhase = $currentGameStore.gameState == GameState.VOTING_PHASE;

	// Display phase
	let displayTimeRemaining = 7;
	let finishedDisplayingResults: Promise<void>;

	// Game results phase
	let gameResultsTimeRemaining = 10;

	socketService.subscribe(GameEventTypes.initGame, (response: SocketResponse<NewRoundData>) => {
		if (!response.success) {
			alert(response.error.code);
			return;
		}

		let data = response.data;

		$currentGameStore.isZar = data.zar === $playerStore.playerId;
		$currentGameStore.gameRound = data.round;

		if (data.blackCard && data.whiteCards) {
			blackCard = data.blackCard;
			whiteCards = data.whiteCards.get($playerStore.playerId);
		}

		$currentGameStore.gameState = GameState.PLAYING;

		displayTimeRemaining = 5;
		gameResultsTimeRemaining = 10;

		finishedDisplayingResults = null;
	});

	socketService.subscribe(
		GameEventTypes.newRound,
		async (response: SocketResponse<NewRoundData>) => {
			if (!response.success) {
				alert(response.error.code);
				return;
			}

			// Waits for the eventual results to be displayed
			await finishedDisplayingResults;

			let data = response.data;

			$currentGameStore.isZar = data.zar === $playerStore.playerId;
			$currentGameStore.gameRound = data.round;

			if (data.blackCard && data.whiteCards) {
				blackCard = data.blackCard;
				whiteCards = data.whiteCards.get($playerStore.playerId);
			}

			$currentGameStore.gameState = GameState.PLAYING;

			displayTimeRemaining = 5;
			gameResultsTimeRemaining = 10;

			finishedDisplayingResults = null;
		}
	);

	socketService.subscribe(
		LobbyEventTypes.playerLeft,
		(response: SocketResponse<PlayerLeftData>) => {
			let data = response.data;

			if (data.playerId === $playerStore.playerId) {
				return;
			}

			console.log(`Player ${data.playerId} left the game!`);

			$currentGameStore.host = data.host;
			$currentGameStore.players = data.players;
		}
	);

	socketService.subscribe(
		GameEventTypes.startVotingPhase,
		(response: SocketResponse<VotingPhaseData>) => {
			if (!response.success) {
				alert(response.error.code);
				return;
			}

			let data = response.data;

			$currentGameStore.gameState = GameState.VOTING_PHASE;

			if ($currentGameStore.isZar) {
				blackCard = data.blackCard;
				whiteCards = data.chosenWhiteCards;
			}
		}
	);

	socketService.subscribe(
		GameEventTypes.roundFinished,
		(response: SocketResponse<RoundFinishedData>) => {
			if (!response.success) {
				alert(response.error.code);
				return;
			}

			let data = response.data;

			$currentGameStore.gameRound++;

			finishedRoundData = data;

			$currentGameStore.gameState = GameState.DISPLAYING_RESULTS;

			// Create a promise that resolves after 5 seconds
			finishedDisplayingResults = new Promise((resolve) => {
				const interval = setInterval(() => {
					displayTimeRemaining -= 1;

					if (displayTimeRemaining <= 0) {
						clearInterval(interval);
						resolve(void 0);
					}
				}, 1000);
			});
		}
	);

	socketService.subscribe(
		LobbyEventTypes.gameFinished,
		(response: SocketResponse<GameFinishedData>) => {
			if (!response.success) {
				alert(response.error.code);
				return;
			}

			$currentGameStore.gameState = GameState.FINISHED;

			finishedGameData = response.data;

			let intervalId = setInterval(() => {
				gameResultsTimeRemaining -= 1;

				if (gameResultsTimeRemaining <= 0) {
					$currentGameStore.gameState = GameState.LOBBY;
					clearInterval(intervalId); // Clear the interval
				}
			}, 1000);
		}
	);

	let deleteGameModal = createModal();
</script>

{#if $currentGameStore.gameState != GameState.LOBBY}
	{#if $currentGameStore.gameState == GameState.PLAYING || $currentGameStore.gameState == GameState.VOTING_PHASE}
		{#if !$currentGameStore.isZar}
			<PlayerGameView bind:isVotingPhase bind:whiteCards bind:blackCard />
		{:else}
			<ZarGameView bind:isVotingPhase bind:whiteCards bind:blackCard />
		{/if}
	{/if}
	{#if $currentGameStore.gameState == GameState.DISPLAYING_RESULTS}
		<RoundResults
			winnerId={finishedRoundData.roundWinner}
			blackCard={finishedRoundData.blackCard}
			winnerWhiteCard={finishedRoundData.whiteCard}
			playerMap={finishedRoundData.playerMap}
			bind:timeRemaining={displayTimeRemaining}
		/>
	{/if}
	{#if $currentGameStore.gameState == GameState.FINISHED}
		<GameResults bind:remainingTime={gameResultsTimeRemaining} {finishedGameData} />
	{/if}

    {#if isHost()}
		<button
			class="bg-primary-blue p-2 rounded-md hover:scale-110 transition-all my-8 absolute bottom-10 left-[50%]"
			on:click={() => deleteGameModal.show()}
		>
			End the game
		</button>
		<Modal
			modal={deleteGameModal}
			title={'Delete'}
			message={'Are you sure you want to delete this game? This action cannot be undone.'}
		/>
	{/if}
{:else}
	<GameLobby />
{/if}
