

export class Game{

    private players: Map<string, number> = new Map<string, number>(); //Maps player to points
    private host: string|null = null;
    private maxPlayers = 8;

    private currentTurn: number = 0;
    private gameStarted: boolean = false;
    
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


    public startGame(){
        if(this.players.size < 3) return;
        this.gameStarted = true;
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
        return this.gameStarted;
    }



}