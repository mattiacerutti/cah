<script lang="ts">
	import TextField from '@/components/TextField.svelte';
	import { socketService } from '@/services/socketService';
	import { type JoinGameData, PlayerEventTypes } from 'cah-shared/events/frontend/PlayerEventTypes';

	let gameCode: string = '';

	const createGame = () => {
		socketService.emit(PlayerEventTypes.CreateGame, null, (error) => {
			alert(error.message);
		});
	};

	const joinGame = () => {
		let data: JoinGameData = {
			gameId: gameCode
		};

		socketService.emit(PlayerEventTypes.JoinGame, data, (error) => {
			alert("sus " + error.message);
		});
	};
</script>

<div class="w-screen h-screen flex justify-center items-center flex-col gap-8">
	<div class="w-max h-auto flex-row flex gap-10">
		<TextField bind:value={gameCode} placeHolder={'Type game code'} />
		<button
			class="bg-primary-blue p-2 rounded-md hover:scale-110 transition-all text-black"
			on:click={joinGame}
		>
			Join Game
		</button>
	</div>
	Or
	<button
		class="bg-primary-blue p-2 rounded-md hover:scale-110 transition-all text-black"
		on:click={createGame}
	>
		Create Game
	</button>
</div>
