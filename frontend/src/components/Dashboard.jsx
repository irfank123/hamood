// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Heart, Droplets, Brain, Footprints } from 'lucide-react';

const MetricCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 p-4 bg-white rounded-lg shadow">
    {icon}
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const [watchData, setWatchData] = useState(null);
  const [dataHistory, setDataHistory] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

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
        <h1 className="text-3xl font-bold mb-6">Wellness Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Current Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              icon={<Heart className="text-red-500" size={24} />}
              label="Heart Rate"
              value={`${watchData.heartRate} BPM`}
            />
            <MetricCard
              icon={<Droplets className="text-blue-500" size={24} />}
              label="Blood Oxygen"
              value={`${watchData.bloodOxygen}%`}
            />
            <MetricCard
              icon={<Brain className="text-purple-500" size={24} />}
              label="Stress Level"
              value={`${watchData.stressLevel}/100`}
            />
            <MetricCard
              icon={<Footprints className="text-green-500" size={24} />}
              label="Steps"
              value={watchData.steps}
            />
          </div>

          {/* Analysis Panel */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Analysis</h2>
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