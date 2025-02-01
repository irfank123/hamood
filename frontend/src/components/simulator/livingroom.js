import React, { useState, useEffect } from 'react';
import { 
  Lightbulb, 
  Music, 
  Watch, 
  Heart, 
  Wind, 
  Activity, 
  Volume2, 
  Sun, 
  Moon, 
  Thermometer, 
  Cloud, 
  BarChart2, 
  Settings 
} from 'lucide-react';
import { Alert, AlertDescription } from "../ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LivingRoomSimulator = () => {
  // State management
  const [watchData, setWatchData] = useState({
    heartRate: 75,
    respirationRate: 16,
    activity: 'resting',
    steps: 2000,
    calories: 850,
    sleepQuality: 'good',
    stressLevel: 3,
    bloodOxygen: 98
  });

  const [environment, setEnvironment] = useState({
    lightColor: '#FFE5B4',
    lightBrightness: 100,
    musicType: 'None',
    musicVolume: 50,
    mentalState: 'neutral',
    confidence: 0.8,
    temperature: 72,
    humidity: 45,
    connected: false
  });

  const [historicalData, setHistoricalData] = useState([]);
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState('room');
  const [showSettings, setShowSettings] = useState(false);

  // Initialize historical data
  useEffect(() => {
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (19 - i) * 5000).toLocaleTimeString(),
      heartRate: 70 + Math.random() * 10,
      stressLevel: 3 + Math.random() * 2
    }));
    setHistoricalData(initialData);
  }, []);

  // WebSocket connection
  useEffect(() => {
    let ws;
    const connectWebSocket = () => {
      ws = new WebSocket('ws://localhost:8084/watch-updates');
      
      ws.onopen = () => {
        setEnvironment(prev => ({ ...prev, connected: true }));
        showNotification('Connected to watch data stream');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        updateWatchData(data);
      };

      ws.onclose = () => {
        setEnvironment(prev => ({ ...prev, connected: false }));
        showNotification('Connection lost - reconnecting...', 'error');
        setTimeout(connectWebSocket, 3000);
      };
    };

    connectWebSocket();
    return () => ws?.close();
  }, []);

  const updateWatchData = (data) => {
    setWatchData(prev => ({
      ...prev,
      ...data,
      heartRate: Math.max(60, Math.min(100, data.heartRate)),
      respirationRate: Math.max(12, Math.min(20, data.respirationRate))
    }));

    setHistoricalData(prev => [...prev.slice(1), {
      time: new Date().toLocaleTimeString(),
      heartRate: data.heartRate,
      stressLevel: data.stressLevel || prev[prev.length - 1].stressLevel
    }]);

    analyzeData(data);
  };

  const analyzeData = async (data) => {
    try {
      const response = await fetch('http://localhost:3004/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const analysis = await response.json();
      updateEnvironment(analysis.mentalState);
    } catch (error) {
      showNotification('Error analyzing watch data', 'error');
    }
  };

  const updateEnvironment = (mentalState) => {
    const settings = {
      stressed: {
        lightColor: '#E6B0AA',
        lightBrightness: 70,
        musicType: 'Calming Classical',
        musicVolume: 40,
        temperature: 71,
        humidity: 50
      },
      neutral: {
        lightColor: '#FFE5B4',
        lightBrightness: 100,
        musicType: 'Ambient',
        musicVolume: 50,
        temperature: 72,
        humidity: 45
      },
      relaxed: {
        lightColor: '#A2D9CE',
        lightBrightness: 85,
        musicType: 'Gentle Nature Sounds',
        musicVolume: 60,
        temperature: 73,
        humidity: 40
      }
    };

    setEnvironment(prev => ({
      ...prev,
      ...settings[mentalState],
      mentalState
    }));
  };

  const showNotification = (message, type = 'info') => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const getRoomBackground = () => {
    const baseColor = timeOfDay === 'day' ? 'rgb(255, 255, 255)' : 'rgb(30, 30, 50)';
    const opacity = Math.floor((environment.lightBrightness / 100) * 255)
      .toString(16)
      .padStart(2, '0');
    
    return {
      backgroundColor: baseColor,
      backgroundImage: `radial-gradient(
        circle at 50% 0%,
        ${environment.lightColor}${opacity} 0%,
        transparent 60%
      )`
    };
  };

  const renderRoom = () => (
    <div className="relative w-full h-96 rounded-xl shadow-2xl overflow-hidden">
      {/* Room Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={getRoomBackground()}
      >
        {/* Furniture Silhouettes */}
        <div className="absolute bottom-8 left-1/4 w-48 h-24 bg-gray-800/20 rounded-lg" />
        <div className="absolute bottom-16 right-1/4 w-24 h-16 bg-gray-800/20 rounded" />
      </div>

      {/* Light Fixture */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <div className="w-1 h-8 bg-gray-400" />
        <Lightbulb 
          size={48}
          color={environment.lightColor}
          style={{ filter: `brightness(${environment.lightBrightness}%)` }}
          className="transition-colors duration-500"
        />
      </div>

      {/* Watch Data Panel */}
      <div className="absolute top-4 left-4 bg-white/90 p-4 rounded-lg shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Heart className="text-red-500" size={16} />
            <span className="text-sm">{watchData.heartRate} bpm</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wind className="text-blue-500" size={16} />
            <span className="text-sm">{watchData.respirationRate} br/min</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="text-green-500" size={16} />
            <span className="text-sm">{watchData.steps} steps</span>
          </div>
        </div>
      </div>

      {/* Environment Controls */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Music size={20} />
            <div className="text-sm">
              <div className="font-medium">{environment.musicType}</div>
              <div className="flex items-center space-x-1">
                <Volume2 size={16} />
                <div className="w-20 h-1 bg-gray-200 rounded">
                  <div 
                    className="h-full bg-blue-500 rounded transition-all duration-500"
                    style={{ width: `${environment.musicVolume}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-medium">{environment.temperature}°F</div>
            <div className="text-xs text-gray-500">Temperature</div>
          </div>

          <div className="text-right">
            <div className="font-medium capitalize">{environment.mentalState}</div>
            <div className="text-xs text-gray-500">
              {(environment.confidence * 100).toFixed(0)}% confidence
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <h3 className="text-lg font-medium mb-4">Health Metrics Timeline</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="heartRate" 
              stroke="#ef4444" 
              name="Heart Rate" 
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="stressLevel" 
              stroke="#3b82f6" 
              name="Stress Level" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-100 p-6">
      {/* Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedTab('room')}
            className={`px-4 py-2 rounded-lg ${
              selectedTab === 'room' ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            Room View
          </button>
          <button
            onClick={() => setSelectedTab('analytics')}
            className={`px-4 py-2 rounded-lg ${
              selectedTab === 'analytics' ? 'bg-blue-500 text-white' : 'bg-white'
            }`}
          >
            Analytics
          </button>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg hover:bg-gray-200"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Main Content */}
      {selectedTab === 'room' ? renderRoom() : renderAnalytics()}

      {/* Control Panel */}
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => updateEnvironment('stressed')}
            className="p-3 bg-red-100 rounded-lg font-medium hover:bg-red-200 transition-colors"
          >
            Simulate Stressed State
          </button>
          <button
            onClick={() => updateEnvironment('neutral')}
            className="p-3 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Simulate Neutral State
          </button>
          <button
            onClick={() => updateEnvironment('relaxed')}
            className="p-3 bg-green-100 rounded-lg font-medium hover:bg-green-200 transition-colors"
          >
            Simulate Relaxed State
          </button>
        </div>

        {/* Connection Status */}
        <div 
          className={`p-2 rounded-lg text-center text-sm ${
            environment.connected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
        >
          {environment.connected 
            ? 'Connected to Watch Data Stream' 
            : 'Disconnected - Attempting to reconnect...'}
        </div>
      </div>

      {/* Alert Messages */}
      {showAlert && (
        <Alert className="fixed bottom-4 right-4 max-w-md">
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default LivingRoomSimulator;