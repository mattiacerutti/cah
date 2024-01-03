// index.ts

import http from 'http';
import { Server } from 'socket.io';
import { GameManager } from "./managers/GameManager";
import { socketService } from './sockets/SocketService';

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust this according to your CORS policy
  },
});

let gameManager = new GameManager();

socketService.bind(io, gameManager);

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
