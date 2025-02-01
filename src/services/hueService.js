class HueService {
  constructor() {
      this.isConnected = false;
      console.log("🔌 HueService Initialized. Connection Status:", this.isConnected);
  }

  async connect() {
      try {
          console.log("🔌 Attempting to connect to Hue Bridge...");
          this.isConnected = true;
          console.log("✅ Connected to Hue Bridge!");
          return true;
      } catch (error) {
          console.error("❌ HueService connection failed:", error);
          return false;
      }
  }

  getPresetByMentalState(mentalState) {
      const presets = {
          stressed: { bri: 127, hue: 46920, sat: 254 },
          neutral: { bri: 178, hue: 8418, sat: 140 },
          relaxed: { bri: 178, hue: 8418, sat: 100 }
      };

      return presets[mentalState] || presets.neutral;
  }

  async updateLights(mentalState) {
      if (!this.isConnected) {
          console.log("🚨 HueService is NOT connected. Attempting to connect...");
          await this.connect();
      }

      if (!this.isConnected) {
          console.log("❌ HueService failed to connect. Returning empty lights.");
          return {};
      }

      const preset = this.getPresetByMentalState(mentalState);
      console.log(`🎨 Applying preset for '${mentalState}':`, JSON.stringify(preset, null, 2));

      const updatedLights = {
          "1": { id: "1", name: "Living Room", ...preset, lastUpdated: new Date().toISOString() },
          "2": { id: "2", name: "Bedroom", ...preset, lastUpdated: new Date().toISOString() },
          "3": { id: "3", name: "Study", ...preset, lastUpdated: new Date().toISOString() }
      };

      console.log("💡 Updated Lights:", JSON.stringify(updatedLights, null, 2));
      return updatedLights;
  }

  async getStatus() {
      console.log("📡 Checking HueService status. Connected:", this.isConnected);
      return {
          connected: this.isConnected,
          lights: 3,
          status: this.isConnected ? 'ready' : 'disconnected'
      };
  }
}

const hueService = new HueService();
export { hueService };
