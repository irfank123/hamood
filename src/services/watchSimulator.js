// src/services/watchSimulator.js
class WatchSimulator {
  constructor(wss) {
    this.wss = wss;
    this.interval = null;
    this.currentData = {
      heartRate: 70,
      activity: 0,
      timestamp: Date.now()
    };
    this.history = [];
    this.isRunning = false;
  }

  startSimulator() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.interval = setInterval(() => {
      // Update current data
      this.currentData = {
        heartRate: Math.floor(60 + Math.random() * 40), // Random heart rate between 60-100
        activity: Math.floor(Math.random() * 100),      // Random activity level 0-100
        timestamp: Date.now()
      };

      // Add to history, keeping last 100 readings
      this.history.push(this.currentData);
      if (this.history.length > 100) {
        this.history.shift();
      }

      // Broadcast to all connected clients
      this.broadcast({
        type: 'watchUpdate',
        data: this.currentData
      });
    }, 1000); // Update every second
  }

  stopSimulator() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
  }

  getCurrentData() {
    return this.currentData;
  }

  getHistory() {
    return this.history;
  }

  broadcast(message) {
    this.wss.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(message));
      }
    });
  }
}

// Factory function to create and start a new simulator instance
const createWatchSimulator = (wss) => {
  const simulator = new WatchSimulator(wss);
  simulator.startSimulator();
  return simulator;
};

export default createWatchSimulator;