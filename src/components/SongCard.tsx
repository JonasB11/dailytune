'use client';

import { useState } from 'react';
import { Song } from '@/types';
import SpotifyPlayer from './SpotifyPlayer';

interface SongCardProps {
  song: Song;
  onVote: () => void;
  isSelected: boolean;
}

export default function SongCard({ song, onVote, isSelected }: SongCardProps) {
  return (
    <div
      className={`flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 ${
        isSelected
          ? 'border-purple-500 bg-purple-900/30 shadow-lg shadow-purple-500/20'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70'
      }`}
    >
      <div className="w-48 h-48 relative mb-4 group">
        <img
          src={song.imageUrl}
          alt={`${song.title} album cover`}
          className="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h3 className="text-xl font-bold text-white text-center mb-1">{song.title}</h3>
      <p className="text-gray-400 text-center mb-4">{song.artist}</p>
      
      {song.spotifyId && (
        <div className="w-full mb-4">
          <SpotifyPlayer trackId={song.spotifyId} />
        </div>
      )}
      
      <button
        onClick={onVote}
        disabled={isSelected}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
          isSelected
            ? 'bg-purple-600/50 text-white cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
        }`}
      >
        {isSelected ? (
          <div className="flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Voted
          </div>
        ) : (
          'Vote for this song'
        )}
      </button>
    </div>
  );
} 