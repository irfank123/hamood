import React, { useState } from 'react';
import { 
  Lightbulb, 
  Music, 
  Watch, 
  Heart, 
  Wind, 
  Activity, 
  Volume2, 
  Settings,
  Play,
  Pause,
  SkipForward
} from 'lucide-react';
import { Alert, AlertDescription } from "../ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LivingRoomSimulator = () => {
  // Static watch data for simulation
  const [watchData] = useState({
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
    humidity: 45
  });

  const [musicState, setMusicState] = useState({
    isPlaying: false,
    currentTrack: null,
    playlist: [],
    lastMentalState: null
  });

  const [historicalData, setHistoricalData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedTab, setSelectedTab] = useState('room');
  const [isSimulating, setIsSimulating] = useState(false);

  const showNotification = (message, type = 'info') => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const simulateEnvironment = async (mentalState) => {
    if (isSimulating) {
      showNotification('Simulation already in progress');
      return;
    }

    setIsSimulating(true);
    
    try {
      // First, analyze the current watch data
      const analysisResponse = await fetch('http://localhost:3004/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...watchData, requestedState: mentalState })
      });
      
      const analysis = await analysisResponse.json();
      
      // Then update the environment based on the analysis
      const envResponse = await fetch('http://localhost:3005/api/environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentalState: analysis.mentalState,
          confidence: analysis.confidence,
          analysis: analysis
        })
      });
      
      const envData = await envResponse.json();
      
      if (envData.settings?.music?.suggestedTracks) {
        setMusicState(prev => ({
          ...prev,
          playlist: envData.settings.music.suggestedTracks,
          currentTrack: envData.settings.music.suggestedTracks[0],
          lastMentalState: mentalState,
          isPlaying: false
        }));
      }

      // Update environment settings
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

      // Update historical data
      setHistoricalData(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        heartRate: watchData.heartRate,
        stressLevel: watchData.stressLevel
      }].slice(-20));

      showNotification(`Successfully simulated ${mentalState} environment`);
    } catch (error) {
      console.error('Simulation error:', error);
      showNotification('Failed to simulate environment', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePlayPause = () => {
    if (musicState.currentTrack) {
      window.open(musicState.currentTrack.url, '_blank');
      setMusicState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    }
  };

  const handleNextTrack = () => {
    if (!musicState.playlist.length) return;
    
    const currentIndex = musicState.playlist.findIndex(
      track => track.url === musicState.currentTrack?.url
    );
    const nextIndex = (currentIndex + 1) % musicState.playlist.length;
    const nextTrack = musicState.playlist[nextIndex];
    
    setMusicState(prev => ({
      ...prev,
      currentTrack: nextTrack,
      isPlaying: false
    }));
  };

  const renderMusicPlayer = () => (
    <div className="flex items-center space-x-2">
      <Music size={20} />
      <div className="text-sm flex-1">
        {musicState.currentTrack ? (
          <div>
            <div className="font-medium truncate">{musicState.currentTrack.name}</div>
            <div className="text-xs text-gray-500 truncate">{musicState.currentTrack.artist}</div>
          </div>
        ) : (
          <div className="font-medium">No track selected</div>
        )}
        <div className="flex items-center space-x-2 mt-1">
          <button 
            onClick={handlePlayPause}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={!musicState.currentTrack}
          >
            {musicState.isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button 
            onClick={handleNextTrack}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={!musicState.playlist.length}
          >
            <SkipForward size={16} />
          </button>
          <div className="flex items-center space-x-1 flex-1">
            <Volume2 size={16} />
            <div className="w-16 h-1 bg-gray-200 rounded">
              <div 
                className="h-full bg-blue-500 rounded transition-all duration-500"
                style={{ width: `${environment.musicVolume}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRoom = () => (
    <div className="relative w-full h-96 rounded-xl shadow-2xl overflow-hidden">
      {/* Room Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          backgroundColor: 'rgb(255, 255, 255)',
          backgroundImage: `radial-gradient(
            circle at 50% 0%,
            ${environment.lightColor}${Math.floor((environment.lightBrightness / 100) * 255).toString(16).padStart(2, '0')} 0%,
            transparent 60%
          )`
        }}
      >
        {/* Furniture Silhouettes */}
        <div className="absolute bottom-8 left-1/4 w-48 h-24 bg-gray-800/20 rounded-lg" />
        <div className="absolute bottom-16 right-1/4 w-24 h-16 bg-gray-800/20 rounded" />
      </div>

      {/* Light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        <div className="w-1 h-8 bg-gray-400" />
        <Lightbulb 
          size={48}
          color={environment.lightColor}
          style={{ filter: `brightness(${environment.lightBrightness}%)` }}
          className="transition-colors duration-500"
        />
      </div>

      {/* Watch Data */}
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
          {renderMusicPlayer()}
          
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
        <Settings size={20} className="text-gray-500" />
      </div>

      {/* Main Content */}
      {selectedTab === 'room' ? renderRoom() : renderAnalytics()}

      {/* Simulation Controls */}
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => simulateEnvironment('stressed')}
            disabled={isSimulating}
            className="p-3 bg-red-100 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            Simulate Stressed State
          </button>
          <button
            onClick={() => simulateEnvironment('neutral')}
            disabled={isSimulating}
            className="p-3 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Simulate Neutral State
          </button>
          <button
            onClick={() => simulateEnvironment('relaxed')}
            disabled={isSimulating}
            className="p-3 bg-green-100 rounded-lg font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            Simulate Relaxed State
          </button>
        </div>
      </div>

      {/* Alerts */}
      {showAlert && (
        <Alert className="fixed bottom-4 right-4 max-w-md">
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default LivingRoomSimulator;