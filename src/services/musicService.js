import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';
import open from 'open';

dotenv.config();

class MusicService {
    constructor() {
        this.apiKey = process.env.LASTFM_API_KEY;
        this.apiSecret = process.env.LASTFM_API_SECRET;
        this.callbackUrl = process.env.LASTFM_CALLBACK_URL;
        this.baseUrl = "http://ws.audioscrobbler.com/2.0/";
        this.token = null;
        this.sessionKey = null;
    }

    // Generate Last.fm authentication URL
    getAuthUrl() {
        return `https://www.last.fm/api/auth/?api_key=${this.apiKey}&cb=${encodeURIComponent(this.callbackUrl)}`;
    }

    // Get authentication token from Last.fm
    async getToken() {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    method: "auth.getToken",
                    api_key: this.apiKey,
                    format: "json"
                }
            });
            this.token = response.data.token;
            console.log("🔑 Received Last.fm token:", this.token);
            return this.token;
        } catch (error) {
            console.error("❌ Failed to get Last.fm token:", error);
            return null;
        }
    }

    // Get session key after authentication
    async getSession(token) {
        try {
            const apiSig = this.generateApiSig({ method: "auth.getSession", token });

            const response = await axios.get(this.baseUrl, {
                params: {
                    method: "auth.getSession",
                    api_key: this.apiKey,
                    token,
                    api_sig: apiSig,
                    format: "json"
                }
            });

            this.sessionKey = response.data.session.key;
            console.log("✅ Last.fm session authenticated. Session Key:", this.sessionKey);
            return this.sessionKey;
        } catch (error) {
            console.error("❌ Failed to get Last.fm session:", error);
            return null;
        }
    }

    // Generate API signature required for authentication
    generateApiSig(params) {
        let sortedKeys = Object.keys(params).sort();
        let signatureString = sortedKeys.map(key => key + params[key]).join('');
        signatureString += this.apiSecret;
        return crypto.createHash('md5').update(signatureString).digest('hex');
    }

    // Fetch music recommendations from Last.fm
    async getRecommendations(mentalState) {
        try {
            const moodConfig = {
                stressed: "classical",
                relaxed: "chillout",
                neutral: "pop"
            };

            const genre = moodConfig[mentalState.toLowerCase()] || "pop";
            console.log(`🎧 Fetching Last.fm recommendations for: ${mentalState} (Genre: ${genre})`);

            const response = await axios.get(this.baseUrl, {
                params: {
                    method: "tag.gettoptracks",
                    tag: genre,
                    api_key: this.apiKey,
                    format: "json"
                }
            });

            if (!response.data.tracks || !response.data.tracks.track) {
                console.warn("⚠️ No tracks found.");
                return { type: mentalState, suggestedTracks: [] };
            }

            const tracks = response.data.tracks.track.slice(0, 5).map(track => ({
                name: track.name,
                artist: track.artist.name,
                url: track.url
            }));

            console.log("✅ Suggested Tracks:", JSON.stringify(tracks, null, 2));
            
            return { type: mentalState, suggestedTracks: tracks };

        } catch (error) {
            console.error("❌ Failed to get Last.fm recommendations:", error);
            return { type: mentalState, suggestedTracks: [] };
        }
    }
}

const musicService = new MusicService();
export { musicService };
