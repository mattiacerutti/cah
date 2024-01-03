import { Game, GameState } from "../models/Game";
import Crypto from "crypto";
import { PlayerEventErrors } from "cah-shared/events/PlayerEventTypes";
import EventEmitter from 'events';
export class GameManager extends EventEmitter{

    private currentGames = new Map<string, Game>();

    public createGame(host: string): string{
        let id = Crypto.randomUUID();
        let game: Game = new Game(host);
        this.currentGames.set(id, game);

        console.log("Successfully created game with id: " + id);

        return id;
    }

    public deleteGame(id: string){
        //TODO: Implement error
        this.currentGames.delete(id);
    }

    public addPlayerToGame(id: string, playerId: string){
                //TODO: Implement error
        this.currentGames.get(id)?.addPlayer(playerId);
    }

    public removePlayerFromGame(id: string, playerId: string){

        //TODO: Implement error

        this.currentGames.get(id)?.removePlayer(playerId);

        if(this.currentGames.get(id)?.getHost() == playerId){
            this.currentGames.get(id)?.switchHost();
        }

        if(this.currentGames.get(id)?.getPlayers().size == 0){
            this.deleteGame(id);
            console.log("Deleted game with id: " + id);
        }


    }

    public startGame(id: string){
        let game = this.currentGames.get(id);

        if(!game) throw new Error(PlayerEventErrors.gameNotFound);

        if(game.getHost() == null) throw new Error(PlayerEventErrors.genericError);;

        if(game.getPlayers().size < 3) throw new Error(PlayerEventErrors.notEnoughPlayers);;

        this.currentGames.get(id)?.initializeGameStart();
    }

    public getGame(id: string): Game | undefined{
        return this.currentGames.get(id);
    }

}