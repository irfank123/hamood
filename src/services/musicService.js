// src/services/musicService.js
class MusicService {
    constructor() {
      this.playlists = {
        stressed: [
          'Calming Classical',
          'Meditation Sounds',
          'Nature Sounds',
          'Deep Breathing',
          'Peaceful Piano'
        ],
        neutral: [
          'Acoustic Covers',
          'Light Jazz',
          'Soft Pop',
          'Ambient Music',
          'Focus Flow'
        ],
        relaxed: [
          'Upbeat Acoustic',
          'Happy Hits',
          'Feel Good Music',
          'Energy Boost',
          'Motivation Mix'
        ]
      };
    }
  
    getRecommendations(mentalState) {
      const defaultType = 'neutral';
      const playlistType = mentalState.toLowerCase();
      
      return {
        type: playlistType,
        suggestedTracks: this.playlists[playlistType] || this.playlists[defaultType]
      };
    }
  }
  
  const musicService = new MusicService();
  export { musicService };