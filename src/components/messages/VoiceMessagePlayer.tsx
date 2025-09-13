"use client";

import { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface VoiceMessagePlayerProps {
  audioData: string;
  isOwn: boolean;
}

export const VoiceMessagePlayer = ({
  audioData,
  isOwn,
}: VoiceMessagePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );

  useEffect(() => {
    const audio = new Audio(audioData);
    setAudioElement(audio);

    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.pause();
    };
  }, [audioData]);

  const togglePlay = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={togglePlay}
        className={`p-2 rounded-full ${
          isOwn
            ? "bg-blue-400 hover:bg-blue-300"
            : "bg-gray-300 hover:bg-gray-400"
        } transition-colors`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>
      <div className="flex-1">
        <div className="text-xs opacity-70">
          {isPlaying ? "Playing..." : "Voice message"}
        </div>
      </div>
    </div>
  );
};
