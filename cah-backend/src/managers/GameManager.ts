import { Game } from "../models/Game";
import Crypto from "crypto";

export class GameManager{

    private currentGames = new Map<string, Game>();

    public createGame(host: string): string{
        let id = Crypto.randomUUID();
        let game: Game = new Game(host);
        this.currentGames.set(id, game);

        console.log("Successfully created game with id: " + id);

        return id;
    }

    public deleteGame(id: string){
        this.currentGames.delete(id);
    }

    public addPlayerToGame(id: string, playerId: string){
        this.currentGames.get(id)?.addPlayer(playerId);
    }

    public removePlayerFromGame(id: string, playerId: string){


        this.currentGames.get(id)?.removePlayer(playerId);

        if(this.currentGames.get(id)?.getHost() == playerId){
            this.currentGames.get(id)?.switchHost();
        }

        //If no players left, delete the game TODO: comunicate to socket
        if(this.currentGames.get(id)?.getPlayers().size == 0){
            this.deleteGame(id);
            console.log("Deleted game with id: " + id);
        }


    }

    public startGame(id: string){
        this.currentGames.get(id)?.startGame();
    }

    public getGame(id: string): Game | undefined{
        return this.currentGames.get(id);
    }

}