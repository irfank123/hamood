import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const YouTubePlayer = ({ track, volume = 50 }) => {
  const [isMuted, setIsMuted] = useState(false);
  
  if (!track?.videoId) return null;

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 rounded-lg overflow-hidden bg-black">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${track.videoId}?autoplay=1&mute=${isMuted ? 1 : 0}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute bottom-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
      >
        {isMuted ? (
          <VolumeX size={16} className="text-white" />
        ) : (
          <Volume2 size={16} className="text-white" />
        )}
      </button>
    </div>
  );
};

export default YouTubePlayer;