// src/services/watchSimulator.js
class WatchSimulator {
  constructor(wss) {
    this.wss = wss;
    this.interval = null;
    // Initialize currentData with all desired metrics.
    this.currentData = {
      heartRate: 70,
      activity: 0,
      bloodOxygen: 98,
      stressLevel: 50, // default value
      steps: 0,
      caloriesBurned: 0,
      timestamp: Date.now()
    };
    this.history = [];
    this.isRunning = false;
  }

  // Helper function to generate a random integer between min and max (inclusive)
  generateRandomValue(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  startSimulator() {
    if (this.isRunning) return;

    this.isRunning = true;
    // Update the simulator every second
    this.interval = setInterval(() => {
      // Generate new data:
      // For accumulative fields (steps and caloriesBurned), add a random increment.
      const newData = {
        heartRate: this.generateRandomValue(60, 100),
        activity: this.generateRandomValue(0, 100),
        bloodOxygen: this.generateRandomValue(95, 100),
        stressLevel: this.generateRandomValue(1, 100),
        steps: (this.currentData.steps || 0) + this.generateRandomValue(0, 100),
        caloriesBurned: (this.currentData.caloriesBurned || 0) + this.generateRandomValue(0, 10),
        timestamp: Date.now()
      };

      // Update current data and history
      this.currentData = newData;
      this.history.push(newData);
      if (this.history.length > 100) {
        this.history.shift();
      }

      // Broadcast the new data to all connected clients with type 'watchUpdate'
      this.broadcast({
        type: 'watchUpdate',
        data: newData
      });
    }, 1000);
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

// Factory function to create and start a new simulator instance.
const createWatchSimulator = (wss) => {
  const simulator = new WatchSimulator(wss);
  simulator.startSimulator();
  return simulator;
};

export default createWatchSimulator;
