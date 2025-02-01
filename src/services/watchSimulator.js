// src/services/watchSimulator.js
export function watchSimulator(wss) {
    let previousData = null;
    
    const ranges = {
      heartRate: { min: 60, max: 100 },
      bloodOxygen: { min: 95, max: 100 },
      stress: { min: 1, max: 100 },
      steps: { min: 0, max: 1000 },
      calories: { min: 0, max: 500 }
    };
  
    function generateRandomValue(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  
    function generateWatchData() {
      const data = {
        timestamp: new Date().toISOString(),
        heartRate: generateRandomValue(ranges.heartRate.min, ranges.heartRate.max),
        bloodOxygen: generateRandomValue(ranges.bloodOxygen.min, ranges.bloodOxygen.max),
        stressLevel: generateRandomValue(ranges.stress.min, ranges.stress.max),
        steps: previousData ? previousData.steps + generateRandomValue(0, 100) : 0,
        caloriesBurned: previousData ? previousData.caloriesBurned + generateRandomValue(0, 10) : 0
      };
      
      previousData = data;
      console.log('Generated watch data:', data);  // Debug log
      return data;
    }
  
    function broadcastData() {
      const data = generateWatchData();
      console.log('Broadcasting to clients:', wss.clients.size);  // Debug log
      
      wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
          client.send(JSON.stringify(data));
        }
      });
    }
  
    // Start broadcasting immediately
    broadcastData();
    
    // Set up interval for regular updates
    const interval = setInterval(broadcastData, 5000);
  
    return {
      getCurrentData: () => previousData || generateWatchData(),
      stopSimulator: () => clearInterval(interval)
    };
  }