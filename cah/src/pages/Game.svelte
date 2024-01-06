<script lang="ts">
	import { socketService } from '@/services/socketService';
	import { type SocketResponse } from 'cah-shared/enums/SocketResponse';
	import {
		GameEventTypes,
		type VotingPhaseData,
		type NewRoundData,
		type CardSumbittedData
	} from 'cah-shared/events/backend/GameEvents';
	import GameLobby from './GameLobby.svelte';
	import { currentGameStore } from '@/stores/currentGameStore';
	import { playerStore } from '@/stores/playerStore';
	import { LobbyEventTypes, type PlayerLeftData } from 'cah-shared/events/backend/LobbyEvents';
	import { PlayerEventTypes, type SubmitCardData } from 'cah-shared/events/frontend/PlayerEvents';
	import ZarGameView from '@/components/game/ZarGameView.svelte';
	import PlayerGameView from '@/components/game/PlayerGameView.svelte';

	let blackCard: string = '';
	let whiteCards: string[];

	let selectedCard: string = '';

	let isVotingPhase: boolean = false;
	let isCardSubmitted: boolean = false;

	let playerRemaining: number;

	socketService.subscribe(GameEventTypes.initGame, (response: SocketResponse<NewRoundData>) => {
		if (!response.success) {
			alert(response.error.code);
			return;
		}

		if (!$currentGameStore.gameStarted) {
			$currentGameStore.gameStarted = true;
		}

		let data = response.data;

		$currentGameStore.isZar = data.zar === $playerStore.playerId;
		$currentGameStore.gameRound = data.round;

		if (data.blackCard && data.whiteCards) {
			blackCard = data.blackCard;
			whiteCards = data.whiteCards.get($playerStore.playerId);
		}
	});

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

			isVotingPhase = true;

			if ($currentGameStore.isZar) {
				blackCard = data.blackCard;
				whiteCards = data.chosenWhiteCards;
			}
		}
	);
</script>

{#if $currentGameStore.gameStarted}
	{#if !$currentGameStore.isZar}
		<PlayerGameView bind:isVotingPhase bind:whiteCards bind:blackCard />
	{:else}
		<ZarGameView bind:isVotingPhase bind:whiteCards bind:blackCard />
	{/if}
{:else}
	<GameLobby />
{/if}
