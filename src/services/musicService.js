import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

class MusicService {
    constructor() {
        this.apiKey = process.env.LASTFM_API_KEY;
        this.apiSecret = process.env.LASTFM_API_SECRET;
        this.callbackUrl = process.env.LASTFM_CALLBACK_URL;
        this.baseUrl = "http://ws.audioscrobbler.com/2.0/";
        this.token = null;
        this.sessionKey = null;
        this.youtubeApiKey = process.env.YOUTUBE_API_KEY;
    }

    // Search YouTube for a video
    async searchYouTube(query) {
        try {
            console.log(`🔍 Searching YouTube for: ${query}`);
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'id',
                    q: query,
                    key: this.youtubeApiKey,
                    type: 'video',
                    maxResults: 1,
                    videoEmbeddable: true
                }
            });

            if (response.data.items && response.data.items.length > 0) {
                const videoId = response.data.items[0].id.videoId;
                console.log(`✅ Found YouTube video ID: ${videoId} for query: ${query}`);
                return videoId;
            }
            console.warn(`⚠️ No YouTube results found for: ${query}`);
            return null;
        } catch (error) {
            console.error("❌ Failed to search YouTube:", error.message);
            return null;
        }
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
                    format: "json",
                    limit: 5
                }
            });

            if (!response.data.tracks || !response.data.tracks.track) {
                console.warn("⚠️ No tracks found in Last.fm response");
                return { type: mentalState, suggestedTracks: [] };
            }

            const tracks = response.data.tracks.track.map((track, index) => ({
                name: track.name,
                artist: track.artist.name,
                url: track.url,
                videoId: null // Initialize all tracks with null videoId
            }));

            // Only fetch YouTube video for the first track
            if (tracks.length > 0) {
                const firstTrack = tracks[0];
                const searchQuery = `${firstTrack.name} ${firstTrack.artist} official`;
                const videoId = await this.searchYouTube(searchQuery);
                tracks[0] = { ...firstTrack, videoId };
            }

            console.log("✅ Processed tracks:", tracks);
            return { type: mentalState, suggestedTracks: tracks };

        } catch (error) {
            console.error("❌ Failed to get Last.fm recommendations:", error.message);
            return { type: mentalState, suggestedTracks: [] };
        }
    }

    // Generate API signature for Last.fm
    generateApiSig(params) {
        let sortedKeys = Object.keys(params).sort();
        let signatureString = sortedKeys.map(key => key + params[key]).join('');
        signatureString += this.apiSecret;
        return crypto.createHash('md5').update(signatureString).digest('hex');
    }
}

const musicService = new MusicService();
export { musicService };