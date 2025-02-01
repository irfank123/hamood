// src/routes/environmentApi.js
import express from 'express';
import { hueService } from '../services/hueService.js';
import { musicService } from '../services/musicService.js';
import { broadcastEnvironmentSettings } from '../environmentBroadcaster.js';

const router = express.Router();

// ✅ Keep the existing environment route (DO NOT REMOVE)
router.post('/environment', async (req, res) => {
    try {
        console.log("📥 Received environment update request:", req.body);

        const { mentalState } = req.body;
        if (!mentalState) {
            return res.status(400).json({ error: 'Mental state is required' });
        }

        // Update lights based on mental state
        const lightSettings = await hueService.updateLights(mentalState);
        console.log("💡 Light settings updated:", JSON.stringify(lightSettings, null, 2));

        // Fetch music recommendations
        const musicSettings = await musicService.getRecommendations(mentalState);
        console.log("🎵 Music recommendations fetched:", JSON.stringify(musicSettings, null, 2));

        // Determine optimal temperature
        const temperature = mentalState === 'stressed' ? 72 :
                            mentalState === 'relaxed' ? 74 :
                            73;

        const settings = {
            lights: lightSettings,
            music: musicSettings,
            temperature
        };

        console.log("✅ Final environment settings:", JSON.stringify(settings, null, 2));

        // Broadcast environment settings to connected WebSocket clients
        broadcastEnvironmentSettings({ status: 'success', settings });

        res.json({
            status: 'success',
            settings
        });
    } catch (error) {
        console.error("❌ Environment update error:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// ✅ Add the missing Spotify Profile route (NEW)
// 🔗 Redirect to Last.fm Authentication URL
router.get('/music/login', (req, res) => {
  const authUrl = musicService.getAuthUrl();
  console.log("🔗 Redirecting to Last.fm login:", authUrl);
  res.redirect(authUrl);
});

// 🔄 Handle Last.fm Authentication Callback
router.get('/music/callback', async (req, res) => {
  const token = req.query.token;
  
  if (!token) {
      console.error("❌ Last.fm login failed: No token received.");
      return res.status(400).send("Authorization failed. No token received.");
  }

  console.log("🔑 Received Last.fm auth token:", token);

  const sessionKey = await musicService.getSession(token);
  if (!sessionKey) {
      return res.status(500).send("Failed to authenticate Last.fm session.");
  }

  res.send("✅ Last.fm login successful! You can now use the API.");
});

// 🎵 Get Music Recommendations
router.post('/music/recommendations', async (req, res) => {
  try {
      const { mentalState } = req.body;
      if (!mentalState) {
          return res.status(400).json({ error: 'Mental state is required' });
      }

      console.log(`🎶 Fetching Last.fm music recommendations for: ${mentalState}`);
      const recommendations = await musicService.getRecommendations(mentalState);

      res.json(recommendations);
  } catch (error) {
      console.error("❌ Error in Last.fm music recommendations API:", error);
      res.status(500).json({ error: error.message });
  }
});

export default router;
