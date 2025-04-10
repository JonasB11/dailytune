'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SongCard from '@/components/SongCard';
import WeeklySummary from '@/components/WeeklySummary';
import VoteHistory from '@/components/VoteHistory';
import { Song, WeeklySummary as WeeklySummaryType } from '@/types';
import { songs as defaultSongs } from '@/data/songs';

export default function Home() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [votes, setVotes] = useState<{ date: string; song: Song }[]>([]);
  const [hasVotedToday, setHasVotedToday] = useState(false);
  const [hasVotedForWeeklyWinner, setHasVotedForWeeklyWinner] = useState(false);
  const [isEndOfWeek, setIsEndOfWeek] = useState(false);
  const [currentDay, setCurrentDay] = useState<string>('');
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummaryType | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    // Load votes from localStorage
    const savedVotes = localStorage.getItem('votes');
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes));
    }

    // Check if user has voted today
    const lastVoteDate = localStorage.getItem('lastVoteDate');
    if (lastVoteDate) {
      const today = new Date().toDateString();
      setHasVotedToday(lastVoteDate === today);
    }

    // Load songs from localStorage or use default songs
    const savedSongs = localStorage.getItem('songs');
    if (savedSongs) {
      setSongs(JSON.parse(savedSongs));
    } else {
      setSongs(defaultSongs);
      localStorage.setItem('songs', JSON.stringify(defaultSongs));
    }

    // Select a random song
    selectRandomSong();

    // Fetch initial data
    fetchVotingData();
  }, []);

  useEffect(() => {
    if (songs.length > 0) {
      selectRandomSong();
    }
  }, [songs]);

  const selectRandomSong = () => {
    const randomIndex = Math.floor(Math.random() * songs.length);
    setSelectedSong(songs[randomIndex]);
  };

  const handleVote = () => {
    if (!selectedSong || hasVotedToday) return;

    const newVote = {
      date: new Date().toISOString(),
      song: selectedSong
    };

    const updatedVotes = [...votes, newVote];
    setVotes(updatedVotes);
    setHasVotedToday(true);

    // Save to localStorage
    localStorage.setItem('votes', JSON.stringify(updatedVotes));
    localStorage.setItem('lastVoteDate', new Date().toDateString());

    // Select a new random song
    selectRandomSong();
  };

  const fetchVotingData = async () => {
    try {
      const response = await fetch('/api/vote');
      const data = await response.json();
      
      setWeeklySummary(data.weeklySummary);
      setIsEndOfWeek(data.isEndOfWeek);
      setCurrentDay(data.currentDay);
      setHasVotedForWeeklyWinner(data.hasVotedForWeeklyWinner);
    } catch (err) {
      console.error('Error fetching voting data:', err);
    }
  };

  const handleWeeklyWinnerVote = async (songId: string) => {
    try {
      const response = await fetch('/api/vote/weekly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ songId }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit weekly vote');
      }

      setHasVotedForWeeklyWinner(true);
      fetchVotingData(); // Refresh data after voting
    } catch (err) {
      console.error('Error submitting weekly vote:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Daily Tune Vote
          </h1>
          <p className="text-xl text-gray-300">
            {isEndOfWeek ? 'Weekly Winner Vote' : `Today's Vote (${currentDay})`}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            {showHistory ? 'Hide Vote History' : 'Show Vote History'}
          </button>
        </div>

        {showHistory && (
          <div className="mb-8">
            <VoteHistory votes={votes} />
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Daily Tune</h1>
          <Link
            href="/add-song"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Add New Song
          </Link>
        </div>

        {!isEndOfWeek ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              {selectedSong && (
                <SongCard
                  song={selectedSong}
                  onVote={handleVote}
                  isSelected={hasVotedToday}
                />
              )}
            </div>
            
            <div>
              {weeklySummary && (
                <WeeklySummary
                  summary={weeklySummary}
                  onVoteForWeeklyWinner={handleWeeklyWinnerVote}
                  hasVotedForWeeklyWinner={hasVotedForWeeklyWinner}
                />
              )}
            </div>
          </div>
        ) : (
          weeklySummary && (
            <WeeklySummary
              summary={weeklySummary}
              onVoteForWeeklyWinner={handleWeeklyWinnerVote}
              hasVotedForWeeklyWinner={hasVotedForWeeklyWinner}
            />
          )
        )}

        {hasVotedToday && !isEndOfWeek && (
          <div className="mt-8 text-center">
            <p className="text-green-400 font-medium bg-green-900/30 p-4 rounded-lg border border-green-800">
              Thanks for voting! Come back tomorrow for a new matchup.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
