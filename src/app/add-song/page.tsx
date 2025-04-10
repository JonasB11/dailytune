'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Song } from '@/types';

export default function AddSong() {
  const router = useRouter();
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate URL
      if (!spotifyUrl.includes('spotify.com/track/')) {
        throw new Error('Please enter a valid Spotify track URL');
      }

      // Extract track ID
      const match = spotifyUrl.match(/track\/([a-zA-Z0-9]+)/);
      if (!match) {
        throw new Error('Invalid Spotify URL format');
      }
      const trackId = match[1];

      // Get the current songs from localStorage
      const currentSongs = JSON.parse(localStorage.getItem('songs') || '[]');
      
      // Check if song already exists
      if (currentSongs.some((song: Song) => song.spotifyId === trackId)) {
        throw new Error('This song is already in the list');
      }

      // Create new song object
      const newSong: Song = {
        id: Date.now().toString(),
        title: 'Loading...', // Will be updated after fetching
        artist: 'Loading...',
        imageUrl: 'https://i.scdn.co/image/ab67616d0000b2731d03b5e88cee6870778a4d27',
        spotifyId: trackId
      };

      // Add new song to the list immediately
      const updatedSongs = [...currentSongs, newSong];
      localStorage.setItem('songs', JSON.stringify(updatedSongs));

      setSuccess('Song added successfully!');
      setSpotifyUrl('');

      // Redirect to home page after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Add New Song</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="spotifyUrl" className="block text-sm font-medium text-gray-300 mb-2">
              Spotify Track URL *
            </label>
            <input
              type="url"
              id="spotifyUrl"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <p className="mt-2 text-sm text-gray-400">
              Just paste the Spotify track URL here. We'll get all the details automatically.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 text-red-300 rounded-lg border border-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-900/50 text-green-300 rounded-lg border border-green-800">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Adding...' : 'Add Song'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 