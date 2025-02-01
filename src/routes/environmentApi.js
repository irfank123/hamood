// src/routes/environmentApi.js
import express from 'express';
import { hueService } from '../services/hueService.js';
import { musicService } from '../services/musicService.js';

const router = express.Router();

// Update environment based on mental state
router.post('/environment', async (req, res) => {
  try {
    const { mentalState, confidence, analysis } = req.body;

    if (!mentalState) {
      return res.status(400).json({ error: 'Mental state is required' });
    }

    // Update lights
    const lightSettings = await hueService.updateLights(mentalState);
    
    // Get music recommendations
    const musicSettings = musicService.getRecommendations(mentalState);
    
    // Calculate optimal temperature
    const temperature = mentalState === 'stressed' ? 72 : // Cooler for stress
                       mentalState === 'relaxed' ? 74 : // Warmer for relaxation
                       73; // Neutral

    const settings = {
      lights: lightSettings,
      music: musicSettings,
      temperature
    };

    res.json({
      status: 'success',
      settings
    });
  } catch (error) {
    console.error('Environment update error:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message
    });
  }
});

// Get Hue connection status
router.get('/hue/status', async (req, res) => {
  const status = await hueService.getStatus();
  res.json(status);
});

export default router;