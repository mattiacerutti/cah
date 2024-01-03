
import { readFileSync } from 'fs';

const DATA_PATH = '../../data/gameData.json';
const MAX_PLAYERS = 8;
const WHITE_CARDS_PER_PLAYER = 6;

export enum GameState{
    LOBBY,
    STARTING,
    CHOOSING_ZAR,
    PLAYER_TURN,
    ZAR_TURN,
    COUNTING_POINTS,
    FINISHED
}
export class Game{

    private players: Map<string, number> = new Map<string, number>(); //Maps player to points
    private host: string|null = null;
    private maxPlayers = MAX_PLAYERS;


    private currentZar: string|null = null;
    private currentTurn: number = 0;
    private gameState: GameState = GameState.LOBBY;


    
    constructor(host: string){
        this.host = host;
        this.players.set(host, 0);
    }



    public addPlayer(playerId: string){
        if(this.maxPlayers <= this.players.size) return;

        if(this.players.has(playerId)) return;

        this.players.set(playerId, 0);
    }

    public removePlayer(playerId: string){
        this.players.delete(playerId);
    }

    public switchHost(){
        this.host = this.players.keys().next().value;
    }

    public nextTurn(){
        this.currentTurn++;
    }

    public addPointsToPlayer(playerId: string){
        this.players[playerId] = this.players[playerId] + 1;
    }


    public initializeGameStart(){
        this.gameState = GameState.STARTING;

        //Shuffle player map
        this.players = new Map([...this.players.entries()].sort(() => Math.random() - 0.5));


    }

    private inizializeNewRound(){

        this.gameState = GameState.CHOOSING_ZAR;

        //Select ZAR
        this.currentZar = this.players.keys().next().value;

        let blackCard: string = this.getNewBlackCard();

        let whiteCards: Map<string, string[]> = this.getNewWhiteCards();

        

    }

    private getNewBlackCard(): string{
        
        // Read the file synchronously
        const rawData = readFileSync(DATA_PATH, 'utf8');

        // Parse the JSON content
        const jsonData = JSON.parse(rawData);

        // Get the black cards
        const blackCards: string[] = jsonData.blackCards;

        // Get a random black card
        const randomBlackCard: string = blackCards[Math.floor(Math.random() * blackCards.length)];

        return randomBlackCard;
    }

    private getNewWhiteCards(): Map<string, string[]>{
            
            // Read the file synchronously
            const rawData = readFileSync(DATA_PATH, 'utf8');
    
            // Parse the JSON content
            const jsonData = JSON.parse(rawData);
    
            // Get the white cards
            const whiteCards: string[] = jsonData.whiteCards;

            let whiteCardsMap: Map<string, string[]> = new Map<string, string[]>();
    
            for(let player of this.players.keys()){
                let randomWhiteCards: string[] = [];
                for(let i = 0; i < WHITE_CARDS_PER_PLAYER; i++){
                    randomWhiteCards.push(whiteCards[Math.floor(Math.random() * whiteCards.length)]);
                }
                whiteCardsMap.set(player, randomWhiteCards);
            }

    
            return whiteCardsMap;
    }

    //Getters 
    public getPlayers(): Map<string, number>{
        return this.players;
    }

    public getHost(): string|null{
        return this.host;
    }

    public isPlayerInGame(playerId: string): boolean{
        return this.players.has(playerId);
    }

    public getPlayerPoints(playerId: string): number{
        return this.players[playerId];
    }

    public getCurrentTurn(): number{
        return this.currentTurn;
    }

    public isGameStarted(): boolean{
        return this.gameState != GameState.LOBBY;
    }



}