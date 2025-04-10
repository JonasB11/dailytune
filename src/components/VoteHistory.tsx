'use client';

import { useState, useRef } from 'react';
import { Song } from '@/types';

interface VoteHistoryProps {
  votes: {
    date: string;
    song: Song;
  }[];
}

export default function VoteHistory({ votes }: VoteHistoryProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioErrors, setAudioErrors] = useState<{ [key: string]: boolean }>({});
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});

  const togglePlay = (voteId: string, previewUrl: string) => {
    const audio = audioRefs.current[voteId];
    
    if (audio) {
      if (playingId === voteId) {
        audio.pause();
        setPlayingId(null);
      } else {
        // Stop any currently playing audio
        if (playingId && audioRefs.current[playingId]) {
          audioRefs.current[playingId]?.pause();
        }
        
        audio.play().catch((error) => {
          console.error('Error playing audio:', error);
          setAudioErrors(prev => ({ ...prev, [voteId]: true }));
          setPlayingId(null);
        });
        setPlayingId(voteId);
      }
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Your Vote History
      </h2>
      
      {votes.length === 0 ? (
        <p className="text-gray-400 text-center">No votes yet</p>
      ) : (
        <div className="space-y-4">
          {votes.map((vote, index) => (
            <div
              key={index}
              className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 flex items-center gap-4"
            >
              <div className="w-16 h-16 relative flex-shrink-0">
                {vote.song?.imageUrl ? (
                  <img
                    src={vote.song.imageUrl}
                    alt={`${vote.song.title || 'Unknown'} album cover`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <p className="text-white font-medium">{vote.song?.title || 'Unknown Song'}</p>
                <p className="text-gray-400 text-sm">{vote.song?.artist || 'Unknown Artist'}</p>
                <p className="text-gray-500 text-sm mt-1">
                  Voted on {new Date(vote.date).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {vote.song?.previewUrl && !audioErrors[vote.date] && (
                <button
                  onClick={() => togglePlay(vote.date, vote.song.previewUrl)}
                  className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  {playingId === vote.date ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
              )}
              {vote.song?.previewUrl && !audioErrors[vote.date] && (
                <audio
                  ref={(el) => {
                    if (el) {
                      audioRefs.current[vote.date] = el;
                    }
                  }}
                  src={vote.song.previewUrl}
                  onEnded={() => setPlayingId(null)}
                  onError={() => setAudioErrors(prev => ({ ...prev, [vote.date]: true }))}
                  preload="none"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 