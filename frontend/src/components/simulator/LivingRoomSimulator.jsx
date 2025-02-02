import React, { useState, useEffect, useRef } from 'react';
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
  Settings,
  ChevronDown
} from 'lucide-react';
import { Alert, AlertDescription } from "../ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MentalStateAnalyzer from '../MentalStateAnalyzer';

const LivingRoomSimulator = () => {
  // State management
  const [watchData, setWatchData] = useState({
    heartRate: 75,
    respirationRate: 16,
    activity: 0,
    steps: 2000,
    calories: 850,
    bloodOxygen: 98,
    timestamp: Date.now()
  });

  const [environment, setEnvironment] = useState({
    lightColor: '#FFE5B4',
    lightBrightness: 100,
    music: { type: 'None', suggestedTracks: [] },
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
  const [analysisData, setAnalysisData] = useState(null);
  const [showAllTracks, setShowAllTracks] = useState(false);

  // WebSocket references
  const watchWsRef = useRef(null);
  const envWsRef = useRef(null);

  // Analysis polling: (optional) poll every 30 seconds if desired
  useEffect(() => {
    const analyzeWatchData = async () => {
      try {
        console.log('Sending analysis request with watchData:', watchData);
        const response = await fetch('http://localhost:3004/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userInput: '', // Extend with user input if needed
            watchData
          }),
        });

        if (!response.ok) {
          throw new Error('Analysis request failed');
        }

        const data = await response.json();
        console.log('Analysis response:', data);
        
        if (data.analysis) {
          setAnalysisData(data.analysis);
          if (data.environmentSettings) {
            updateEnvironmentData(data.environmentSettings);
          }
        }
      } catch (error) {
        console.error('Failed to analyze watch data:', error);
        showNotification('Failed to analyze health data', 'error');
      }
    };

    const intervalId = setInterval(() => {
      if (watchData && environment.connected) {
        analyzeWatchData();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [watchData, environment.connected]);

  // Manual analysis trigger from the frontend
  const analyzeNow = async () => {
    try {
      console.log('Manually triggering analysis with watchData:', watchData);
      const response = await fetch('http://localhost:3004/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: '', watchData })
      });
      
      if (!response.ok) throw new Error('Analysis request failed');
      
      const data = await response.json();
      console.log('Manual analysis response:', data);
      
      if (data.analysis) {
        setAnalysisData(data.analysis);
        if (data.environmentSettings) {
          updateEnvironmentData(data.environmentSettings);
        }
      }
    } catch (error) {
      console.error('Manual analysis error:', error);
      showNotification('Failed to analyze data manually', 'error');
    }
  };

  // Update watch data when a new message is received
  const updateWatchData = (data) => {
    const computedStressLevel = calculateStressLevel(data.heartRate, data.activity);
    console.log('Updating watch data with:', data, 'Computed stress level:', computedStressLevel);
    setWatchData(prev => ({
      ...prev,
      ...data,
      stressLevel: computedStressLevel,
      respirationRate: Math.floor(data.heartRate / 4) + Math.floor(Math.random() * 4),
      steps: prev.steps + Math.floor(Math.random() * 10),
      calories: prev.calories + Math.floor(Math.random() * 2),
    }));

    setHistoricalData(prev => {
      const newData = [...prev, {
        time: new Date(data.timestamp).toLocaleTimeString(),
        heartRate: data.heartRate,
        activity: data.activity,
        stressLevel: computedStressLevel
      }];
      return newData.slice(-20);
    });
  };

  // Simple stress calculation based on heart rate and activity
  const calculateStressLevel = (heartRate, activity) => {
    const baseStress = (heartRate - 60) / 40;
    const activityFactor = activity / 100;
    return Math.min(10, Math.max(1, Math.floor((baseStress - activityFactor * 0.5) * 10)));
  };

  // Update environment state based on new data received
  const updateEnvironmentData = (data) => {
    console.log('Updating environment with:', data);
    setEnvironment(prev => ({
      ...prev,
      ...data,
      lightColor: getColorForMentalState(data.mentalState || prev.mentalState)
    }));
  };

  // Convert mental state into a light color
  const getColorForMentalState = (state) => {
    const colors = {
      stressed: '#ADD8E6',
      neutral: '#90EE90',
      relaxed: '#D8BFD8'
    };
    return colors[state] || colors.neutral;
  };
  const getDarkerColor = (color) => {
    // Remove the # and convert to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Make each component 20% darker
    const darkerR = Math.floor(r * 0.8);
    const darkerG = Math.floor(g * 0.8);
    const darkerB = Math.floor(b * 0.8);
    
    // Convert back to hex
    return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
  };

  // Handle environment updates by sending a POST request
  const handleEnvironmentUpdate = async (updates) => {
    try {
      const response = await fetch('http://localhost:3004/api/environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update environment');
      
      const data = await response.json();
      if (data.settings) {
        updateEnvironmentData(data.settings);
      }
    } catch (error) {
      showNotification('Failed to update environment settings', 'error');
      console.error(error);
    }
  };

  // New effect: Fetch music recommendations whenever mentalState changes
  useEffect(() => {
    const fetchMusicRecommendations = async () => {
      try {
        const response = await fetch('http://localhost:3004/api/music/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mentalState: environment.mentalState })
        });
        if (!response.ok) {
          throw new Error('Failed to fetch music recommendations');
        }
        const musicData = await response.json();
        updateEnvironmentData({ music: musicData });
      } catch (error) {
        console.error('Error fetching music recommendations:', error);
      }
    };

    if (environment.mentalState) {
      fetchMusicRecommendations();
    }
  }, [environment.mentalState]);

  // Display notifications
  const showNotification = (message, type = 'info') => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  // Calculate background style for the room
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
        transparent 75%
      )`
    };
  };

  // WebSocket connection setup for watch and environment data
  useEffect(() => {
    const connectWebSockets = () => {
      // Watch data connection
      watchWsRef.current = new WebSocket(`ws://${window.location.hostname}:3004/watch`);
      
      watchWsRef.current.onopen = () => {
        setEnvironment(prev => ({ ...prev, connected: true }));
        showNotification('Connected to watch data stream');
      };

      watchWsRef.current.onmessage = (event) => {
        console.log('Received raw watch data:', event.data);
        try {
          const data = JSON.parse(event.data);
          console.log('Parsed watch message:', data);
          if (data.type === 'watchUpdate' && data.data) {
            updateWatchData(data.data);
          }
        } catch (err) {
          console.error('Error processing watch data:', err);
        }
      };

      watchWsRef.current.onerror = (err) => {
        console.error('Watch WebSocket error:', err);
      };

      watchWsRef.current.onclose = () => {
        setEnvironment(prev => ({ ...prev, connected: false }));
        showNotification('Watch connection lost - reconnecting...', 'error');
        setTimeout(() => connectWebSockets(), 3000);
      };

      // Environment data connection
      envWsRef.current = new WebSocket(`ws://${window.location.hostname}:3004/environment`);
      
      envWsRef.current.onopen = () => {
        console.log('Connected to environment WebSocket');
      };

      envWsRef.current.onmessage = (event) => {
        console.log('Received raw environment data:', event.data);
        try {
          const data = JSON.parse(event.data);
          console.log('Parsed environment message:', data);
          if (data.type === 'environmentUpdate' && data.data) {
            updateEnvironmentData(data.data);
          }
        } catch (err) {
          console.error('Error processing environment data:', err);
        }
      };

      envWsRef.current.onerror = (err) => {
        console.error('Environment WebSocket error:', err);
      };

      envWsRef.current.onclose = () => {
        setTimeout(() => connectWebSockets(), 3000);
      };
    };

    connectWebSockets();

    return () => {
      watchWsRef.current?.close();
      envWsRef.current?.close();
    };
  }, []);

  // Render the main room view with watch data, environment controls, and mental state analysis
  const renderRoom = () => (
    <div className="space-y-6 w-full">
      <div className="relative w-full h-96 rounded-xl overflow-hidden text-black" style={getRoomBackground()}>
        {/* Light Fixture */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="absolute -inset-4 bg-white/20 rounded-full blur-md"></div>
            <Lightbulb 
              size={64}
              color={getDarkerColor(getColorForMentalState(environment.mentalState))}
              style={{ 
                filter: `brightness(${environment.lightBrightness}%) drop-shadow(0 0 10px ${getColorForMentalState(environment.mentalState)})`,
              }}
              className="transition-all duration-500 relative z-10"
            />
          </div>
        </div>

        {/* Watch Data Panel */}
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-sm text-black">
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
        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-2">
                <Music size={20} />
                <div className="text-sm">
                  {environment.music && environment.music.suggestedTracks && environment.music.suggestedTracks.length > 0 ? (
                    <div className="font-medium text-black">
                      {environment.music.suggestedTracks[0].name} by {environment.music.suggestedTracks[0].artist}
                    </div>
                  ) : (
                    <div className="font-medium text-black">No track playing</div>
                  )}
                </div>
              </div>
              <ChevronDown 
                onClick={() => setShowAllTracks(prev => !prev)}
                className={`mt-1 cursor-pointer transform transition-transform duration-200 ${showAllTracks ? 'rotate-180' : 'rotate-0'} text-blue-500`}
                size={18}
              />
              {showAllTracks && environment.music && environment.music.suggestedTracks && (
                <ul className="mt-2 text-xs text-black">
                  {environment.music.suggestedTracks.map((track, index) => (
                    <li key={index} className="py-0.5">
                      {track.name} by {track.artist}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-lg font-medium text-black">{environment.temperature}°F</div>
              <div className="text-xs text-gray-500">Temperature</div>
            </div>

            <div className="text-right">
              <div className="font-medium capitalize text-black">{environment.mentalState}</div>
              <div className="text-xs text-gray-500">
                {(environment.confidence * 100).toFixed(0)}% confidence
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mental State Analysis Component */}
      {analysisData && (
        <MentalStateAnalyzer
          watchData={watchData}
          analysisData={analysisData}
        />
      )}
    </div>
  );

  // Render analytics view using Recharts
  const renderAnalytics = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 w-full">
      <h3 className="text-lg font-medium mb-4">Health Metrics Timeline</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" domain={[0, 120]} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
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
    <div className="flex flex-col w-screen min-h-screen bg-gray-100 overflow-x-hidden">
      <div className="flex flex-col flex-grow w-full px-6 py-6 mx-auto max-w-7xl">
        {/* Navigation - Updated with full-width constraints */}
        <div className="mb-6 flex items-center justify-between w-full">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedTab('room')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTab === 'room' 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              Room View
            </button>
            <button
              onClick={() => setSelectedTab('analytics')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTab === 'analytics' 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              Analytics
            </button>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
  
        {/* Main Content Container - Fixed width handling */}
        <div className="flex-grow w-full max-w-full overflow-hidden">
          {selectedTab === 'room' ? renderRoom() : renderAnalytics()}
        </div>
  
        {/* Control Panel - Responsive grid fix */}
        <div className="w-full mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleEnvironmentUpdate({ mentalState: 'stressed' })}
              className="p-3 bg-red-100 rounded-lg font-medium hover:bg-red-200 transition-colors whitespace-nowrap"
            >
              Simulate Stressed State
            </button>
            <button
              onClick={() => handleEnvironmentUpdate({ mentalState: 'neutral' })}
              className="p-3 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              Simulate Neutral State
            </button>
            <button
              onClick={() => handleEnvironmentUpdate({ mentalState: 'relaxed' })}
              className="p-3 bg-green-100 rounded-lg font-medium hover:bg-green-200 transition-colors whitespace-nowrap"
            >
              Simulate Relaxed State
            </button>
            <button
              onClick={analyzeNow}
              className="p-3 bg-blue-100 rounded-lg font-medium hover:bg-blue-200 transition-colors whitespace-nowrap"
            >
              Analyze Now
            </button>
          </div>
  
          {/* Connection Status - Full width badge */}
          <div 
            className={`p-2 rounded-lg text-center text-sm w-full ${
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
      </div>
  
      {/* Alert Messages - Fixed positioning */}
      {showAlert && (
        <Alert className="fixed bottom-4 right-4 w-[calc(100%-2rem)] max-w-md">
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
  
};

export default LivingRoomSimulator;