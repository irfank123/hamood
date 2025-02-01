// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Heart, Droplets, Brain, Footprints, Lamp, Music, Sun } from 'lucide-react';

const MetricCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 p-4 bg-white rounded-lg shadow">
    {icon}
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  </div>
);

const LivingRoomSimulation = ({ lightColor, lightIntensity }) => (
  <div className="relative w-full h-[300px] bg-gray-100 rounded-lg overflow-hidden">
    {/* Room Background */}
    <div 
      className="absolute inset-0 transition-colors duration-500"
      style={{
        backgroundColor: `rgba(${lightColor.r}, ${lightColor.g}, ${lightColor.b}, ${lightIntensity / 100})`,
      }}
    >
      {/* Furniture */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-40 h-20 bg-gray-700 rounded-lg">
        {/* Couch */}
      </div>
      <div className="absolute top-10 left-10 w-8 h-24 bg-gray-800">
        {/* Floor Lamp */}
        <div className="w-12 h-12 rounded-full bg-yellow-200 -right-2 relative"
             style={{
               backgroundColor: `rgb(${lightColor.r}, ${lightColor.g}, ${lightColor.b})`,
               opacity: lightIntensity / 100,
               boxShadow: `0 0 ${lightIntensity}px ${lightIntensity/2}px rgb(${lightColor.r}, ${lightColor.g}, ${lightColor.b})`,
             }}>
        </div>
      </div>
    </div>
  </div>
);

const MusicPlayer = ({ currentTrack, isPlaying, onPlayPause, onNextTrack }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-bold">{currentTrack?.title || 'No track selected'}</h3>
        <p className="text-sm text-gray-600">{currentTrack?.artist || ''}</p>
      </div>
      <div className="flex gap-2">
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={onPlayPause}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={onNextTrack}
        >
          ⏭️
        </button>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [watchData, setWatchData] = useState(null);
  const [dataHistory, setDataHistory] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lightColor, setLightColor] = useState({ r: 255, g: 255, b: 255 });
  const [lightIntensity, setLightIntensity] = useState(50);
  const [currentTrack, setCurrentTrack] = useState({
    title: 'Calm Meditation',
    artist: 'Wellness Sounds'
  });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket('ws://localhost:8080');
    
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setWatchData(newData);
      setDataHistory(prev => [...prev.slice(-20), newData]); // Keep last 20 points
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => ws.close();
  }, []);

  const analyzeData = async () => {
    if (!watchData) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ watchData, userInput })
      });
      
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
    }
    setLoading(false);
  };

  if (!watchData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Connecting to watch data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Smart Home Wellness Center</h1>
        
        {/* Living Room Simulation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-6">
            <LivingRoomSimulation 
              lightColor={lightColor}
              lightIntensity={lightIntensity}
            />
            
            {/* Light Controls */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Lamp size={20} />
                Light Controls
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Color</label>
                  <input
                    type="color"
                    className="w-full h-10 rounded"
                    value={`#${lightColor.r.toString(16).padStart(2, '0')}${lightColor.g.toString(16).padStart(2, '0')}${lightColor.b.toString(16).padStart(2, '0')}`}
                    onChange={(e) => {
                      const hex = e.target.value.substring(1);
                      setLightColor({
                        r: parseInt(hex.substring(0, 2), 16),
                        g: parseInt(hex.substring(2, 4), 16),
                        b: parseInt(hex.substring(4, 6), 16),
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Intensity</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lightIntensity}
                    onChange={(e) => setLightIntensity(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Music Player */}
            <MusicPlayer
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onNextTrack={() => {
                // Implement track switching logic
              }}
            />
          </div>

          {/* Metrics and Analysis */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={<Heart className="text-red-500" size={24} />}
                label="Heart Rate"
                value={`${watchData?.heartRate || '--'} BPM`}
              />
              <MetricCard
                icon={<Brain className="text-purple-500" size={24} />}
                label="Stress Level"
                value={`${watchData?.stressLevel || '--'}/100`}
              />
            </div>

            {/* Analysis Panel */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Mood Analysis</h2>
              <div className="mb-4">
                <textarea
                  className="w-full p-2 border rounded"
                  placeholder="How are you feeling?"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  rows="3"
                />
                <button
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  onClick={analyzeData}
                  disabled={loading}
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
              
              {analysis && (
                <div className="mt-4">
                  <div className="text-lg font-bold">
                    Mental State: {analysis.mentalState.toUpperCase()}
                  </div>
                  <p className="text-sm mt-2">{analysis.analysis.reasoning}</p>
                  <div className="mt-2">
                    <div className="font-bold text-sm">Suggested Actions:</div>
                    <ul className="list-disc ml-4 text-sm">
                      {analysis.analysis.suggestedActions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">History</h2>
          <div className="h-64">
            <LineChart width={800} height={200} data={dataHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tick={false} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="heartRate" stroke="#ef4444" name="Heart Rate" />
              <Line type="monotone" dataKey="stressLevel" stroke="#8b5cf6" name="Stress" />
              <Line type="monotone" dataKey="bloodOxygen" stroke="#3b82f6" name="Blood Oxygen" />
            </LineChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;