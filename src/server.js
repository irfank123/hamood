// src/server.js
import express from 'express';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import cors from 'cors';
import { watchSimulator } from './services/watchSimulator.js';
import environmentRoutes from './routes/environmentApi.js';
import analysisRoutes from './routes/analysisApi.js';
import { initWebSocketServer } from './environmentBroadcaster.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

// Watch Analysis Service
const watchPort = process.env.WATCH_PORT || 3004;
const watchWsPort = process.env.WATCH_WS_PORT || 8084;

// Environment Service
const envPort = process.env.ENV_PORT || 3005;
const envWsPort = process.env.ENV_WS_PORT || 8085;

// Start WebSocket servers
const watchWss = new WebSocketServer({ port: watchWsPort });
initWebSocketServer(envWsPort); // Initialize environment WS server on required port

// Initialize watch simulator and make it available to routes
const simulator = watchSimulator(watchWss);
app.locals.simulator = simulator;

// Routes
app.use('/api', analysisRoutes);
app.use('/api', environmentRoutes);

// Basic health check endpoints
app.get('/health/watch', (req, res) => {
  const currentData = simulator.getCurrentData();
  res.json({ 
    service: 'watch-analysis', 
    status: 'healthy',
    lastData: currentData 
  });
});

app.get('/health/environment', (req, res) => {
  res.json({ service: 'environment', status: 'healthy' });
});

// WebSocket connection handling for watch
watchWss.on('connection', (ws) => {
  console.log('Watch WebSocket client connected');
  
  // Send current data immediately on connection
  const currentData = simulator.getCurrentData();
  ws.send(JSON.stringify(currentData));
  
  ws.on('close', () => console.log('Watch client disconnected'));
});

// Start HTTP servers
app.listen(watchPort, () => {
  console.log(`Watch Analysis Service running on port ${watchPort}`);
  console.log(`Watch WebSocket Server running on port ${watchWsPort}`);
});

app.listen(envPort, () => {
  console.log(`Environment Service running on port ${envPort}`);
  console.log(`Environment WebSocket Server running on port ${envWsPort}`);
});

// Clean up on server shutdown
process.on('SIGTERM', () => {
  simulator.stopSimulator();
  watchWss.close();
  // Optionally add cleanup for environment WebSocket server if exposed by the broadcaster module.
});

process.on('SIGINT', () => {
  simulator.stopSimulator();
  watchWss.close();
});
