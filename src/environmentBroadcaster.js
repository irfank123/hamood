// src/environmentBroadcaster.js
import { WebSocketServer } from 'ws';

let wss = null;

export function initWebSocketServer(wsPort) {
  wss = new WebSocketServer({ port: wsPort, path: '/environment-updates' }, () => {
    console.log(`Environment WebSocket server is running on port ${wsPort} at path /environment-updates`);
  });

  // Log new connections
  wss.on('connection', (client) => {
    console.log('Environment WebSocket client connected');
    client.on('close', () => console.log('Environment WebSocket client disconnected'));
  });
}

export function broadcastEnvironmentSettings(data) {
  if (!wss) {
    console.error('Environment WebSocket server not initialized');
    return;
  }
  const jsonData = JSON.stringify(data);
  console.log('Broadcasting environment data:', jsonData);
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(jsonData);
    }
  });
}
