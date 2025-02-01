import React, { useState, useEffect } from 'react';
import { Brain, AlertCircle, Check, Activity } from 'lucide-react';
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

const MentalStateAnalyzer = ({ watchData, analysisData }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-500';
    if (confidence >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMentalStateColor = (state) => {
    const colors = {
      stressed: 'text-red-500',
      neutral: 'text-blue-500',
      relaxed: 'text-green-500'
    };
    return colors[state] || 'text-gray-500';
  };

  useEffect(() => {
    if (analysisData?.analysis?.suggestedActions?.length > 0) {
      setAlertMessage(analysisData.analysis.suggestedActions[0]);
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [analysisData]);

  if (!watchData || !analysisData) return null;

  return (
    <div className="space-y-4 text-black">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Mental State Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
            {/* Current State */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current State:</span>
                <span className={`font-bold capitalize ${getMentalStateColor(analysisData.mentalState)}`}>
                  {analysisData.mentalState}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-black">
                <span className="text-sm font-medium">Confidence:</span>
                <span className={`font-bold ${getConfidenceColor(analysisData.confidence)}`}>
                  {Math.round(analysisData.confidence * 100)}%
                </span>
              </div>

              <div className="flex items-center justify-between text-black">
                <span className="text-sm font-medium">Heart Rate:</span>
                <span className="font-bold">{watchData.heartRate} BPM</span>
              </div>
            </div>

            {/* Analysis */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Analysis:</h4>
              <p className="text-sm text-gray-600">
                {analysisData.analysis.reasoning}
              </p>
            </div>
          </div>

          {/* Suggested Actions */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Suggested Actions:</h4>
            <ul className="space-y-2">
              {analysisData.analysis.suggestedActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {showAlert && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MentalStateAnalyzer;