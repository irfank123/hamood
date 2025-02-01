// src/routes/analysisApi.js
import express from 'express';
import { analyzeWatchData } from '../services/openaiService.js';
import axios from 'axios';

const router = express.Router();

// Get current watch data
router.get('/watch-data', (req, res) => {
  try {
    const currentData = req.app.locals.simulator.getCurrentData();
    res.json(currentData);
  } catch (error) {
    console.error('Error getting watch data:', error);
    res.status(500).json({ error: 'Failed to get watch data' });
  }
});

// Analyze watch data and update environment settings
router.post('/analyze', async (req, res) => {
  try {
    const { userInput } = req.body;
    const currentData = req.app.locals.simulator.getCurrentData();

    if (!currentData) {
      return res.status(400).json({ error: 'No watch data available' });
    }

    // Get analysis from OpenAI using all metrics
    const analysis = await analyzeWatchData(currentData, userInput);

    // Compute a temperature value based on mental state if analysis doesn't include one.
    const computedTemperature =
      analysis.mentalState === 'stressed'
        ? 72
        : analysis.mentalState === 'relaxed'
        ? 74
        : 73;

    // Attempt to send analysis results to the environment service.
    try {
      const envResponse = await axios.post('http://localhost:3004/api/environment', {
        mentalState: analysis.mentalState,
        confidence: analysis.confidence,
        temperature: analysis.temperature || computedTemperature,
        // You can pass along other fields if needed (e.g., lightLevel) or let the environment route compute defaults.
        analysis: analysis.analysis
      });

      // Return both analysis and environment settings
      res.json({
        analysis,
        environmentSettings: envResponse.data.settings
      });
    } catch (envError) {
      console.warn('Environment service error:', envError.message);
      res.json({
        analysis,
        environmentSettings: null,
        warning: 'Environment service not available'
      });
    }
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze data' });
  }
});

export default router;
