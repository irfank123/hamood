// src/server.js
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import cors from 'cors';
import createWatchSimulator from './services/watchSimulator.js';
import environmentRoutes from './routes/environmentApi.js';
import analysisRoutes from './routes/analysisApi.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173'
  })
);
app.use(express.json());

// Service port
const PORT = process.env.PORT || 3004;

// Create a single WebSocket server attached to the HTTP server
const wss = new WebSocketServer({ server: httpServer });

// Store WebSocket clients by their path
const clients = {
  watch: new Set(),
  environment: new Set()
};

// Initialize services
const simulator = createWatchSimulator(wss);
app.locals.simulator = simulator;

// Broadcast function for environment updates
app.locals.broadcastEnvironment = (data) => {
  const message = JSON.stringify({
    type: 'environmentUpdate',
    data: data
  });

  if (clients.environment.size === 0) {
    console.warn('No environment clients connected – broadcast skipped');
  } else {
    console.log(
      `Broadcasting environment update to ${clients.environment.size} client(s):`,
      message
    );
  }

  clients.environment.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
};

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  // Parse URL to reliably extract pathname
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  console.log(`WebSocket client connected to ${pathname}`);

  if (pathname === '/watch') {
    clients.watch.add(ws);
    // Send enriched initial watch data
    const currentData = simulator.getCurrentData();
    ws.send(
      JSON.stringify({
        type: 'watchUpdate',
        data: currentData
      })
    );
  } else if (pathname === '/environment') {
    clients.environment.add(ws);
    // Send initial environment state
    const initialState = {
      type: 'environmentUpdate',
      data: {
        temperature: 72,
        humidity: 45,
        lightLevel: 50,
        musicPlaying: false,
        mentalState: 'neutral',
        confidence: 0.8
      }
    };
    ws.send(JSON.stringify(initialState));
  } else {
    console.warn(`Received connection for unhandled path: ${pathname}`);
  }

  // Common error and close handlers
  ws.on('error', (error) => {
    console.error(`WebSocket error on ${pathname}:`, error);
  });

  ws.on('close', () => {
    console.log(`WebSocket client disconnected from ${pathname}`);
    if (pathname === '/watch') {
      clients.watch.delete(ws);
      console.log(`Remaining watch clients: ${clients.watch.size}`);
    } else if (pathname === '/environment') {
      clients.environment.delete(ws);
      console.log(`Remaining environment clients: ${clients.environment.size}`);
    }
  });
});

// Updated Environment API route to include confidence and temperature updates
app.post('/api/environment', async (req, res) => {
  try {
    const { mentalState, lightLevel, temperature, confidence } = req.body;

    // Process the environment update with all provided metrics
    const settings = {
      mentalState: mentalState || 'neutral',
      lightLevel: lightLevel || 50,
      temperature: temperature || 22,
      confidence: confidence || 0.8,
      timestamp: Date.now()
    };

    // Broadcast to all environment clients
    app.locals.broadcastEnvironment(settings);

    res.json({ status: 'success', settings });
  } catch (error) {
    console.error('Environment update error:', error);
    res.status(500).json({ error: 'Failed to update environment' });
  }
});

// Use additional routes (analysis and environment-specific routes)
app.use('/api', analysisRoutes);
app.use('/api', environmentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const watchData = simulator.getCurrentData();
  res.json({
    status: 'healthy',
    services: {
      watch: {
        status: 'healthy',
        lastData: watchData,
        connections: clients.watch.size
      },
      environment: {
        status: 'healthy',
        connections: clients.environment.size
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`HTTP and WebSocket server running on port ${PORT}`);
  console.log('Available WebSocket paths:');
  console.log('- /watch         (Watch data updates)');
  console.log('- /environment   (Environment control)');
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down server...');

  simulator.stopSimulator();

  wss.close(() => {
    console.log('WebSocket server closed');
  });

  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
