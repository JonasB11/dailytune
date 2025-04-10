import { NextResponse } from 'next/server';
import { DailyVote, WeeklyVote, WeeklySummary } from '@/types';

// In a real application, this would be stored in a database
let dailyVotes: { [date: string]: { [songId: string]: number } } = {};
let weeklyVotes: { [weekNumber: string]: { [songId: string]: number } } = {};
let songs: { [id: string]: { id: string; title: string; artist: string; imageUrl: string; previewUrl: string } } = {
  '1': {
    id: '1',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273e8b066f70c206551210d902b',
    previewUrl: 'https://p.scdn.co/mp3-preview/1b0c0a0c0a0c0a0c0a0c0a0c0a0c0a0c0a0c0a0c'
  },
  '2': {
    id: '2',
    title: 'Stairway to Heaven',
    artist: 'Led Zeppelin',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273c8a11e48a8c1a1c0c1a0b0b0',
    previewUrl: 'https://p.scdn.co/mp3-preview/2b0c0a0c0a0c0a0c0a0c0a0c0a0c0a0c0a0c0a0c'
  }
};
let userVotes: { [userId: string]: { date: string; songId: string }[] } = {};

// For demo purposes, we'll use a fixed user ID
const DEMO_USER_ID = 'demo-user';

function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}

function getCurrentDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getDayOfWeek(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

export async function POST(request: Request) {
  try {
    const { songId } = await request.json();
    const currentDate = getCurrentDate();
    const currentWeek = getCurrentWeekNumber();

    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      );
    }

    // Initialize daily votes for current date if not exists
    if (!dailyVotes[currentDate]) {
      dailyVotes[currentDate] = {};
    }

    // Initialize user votes if not exists
    if (!userVotes[DEMO_USER_ID]) {
      userVotes[DEMO_USER_ID] = [];
    }

    // Check if user has already voted today
    const hasVotedToday = userVotes[DEMO_USER_ID].some(
      vote => vote.date === currentDate
    );

    if (hasVotedToday) {
      return NextResponse.json(
        { error: 'You have already voted today' },
        { status: 400 }
      );
    }

    // Increment the vote count for the song
    dailyVotes[currentDate][songId] = (dailyVotes[currentDate][songId] || 0) + 1;

    // Add to user's vote history
    userVotes[DEMO_USER_ID].push({
      date: currentDate,
      songId: songId
    });

    return NextResponse.json({ success: true, votes: dailyVotes[currentDate] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const currentDate = getCurrentDate();
  const currentWeek = getCurrentWeekNumber();
  const dayOfWeek = getDayOfWeek();

  // Get daily votes for current date
  const todayVotes = dailyVotes[currentDate] || {};

  // Get weekly summary
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weeklySummary: WeeklySummary = {
    weekNumber: currentWeek,
    dailyWinners: {},
    totalVotes: 0
  };

  // Calculate daily winners for the current week
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (dailyVotes[dateStr]) {
      const dayVotes = dailyVotes[dateStr];
      const winner = Object.entries(dayVotes).reduce((a, b) => a[1] > b[1] ? a : b);
      
      weeklySummary.dailyWinners[date.toLocaleDateString('en-US', { weekday: 'long' })] = {
        song: songs[winner[0]],
        votes: winner[1]
      };
      weeklySummary.totalVotes += Object.values(dayVotes).reduce((a, b) => a + b, 0);
    }
  }

  // Get user's vote history
  const userVoteHistory = userVotes[DEMO_USER_ID]?.map(vote => ({
    date: vote.date,
    song: songs[vote.songId]
  })) || [];

  return NextResponse.json({
    todayVotes,
    weeklySummary,
    currentDay: dayOfWeek,
    isEndOfWeek: dayOfWeek === 'Saturday',
    userVoteHistory
  });
} 