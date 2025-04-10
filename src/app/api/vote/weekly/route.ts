import { NextResponse } from 'next/server';
import { WeeklyVote } from '@/types';

// In a real application, this would be stored in a database
let weeklyVotes: { [weekNumber: string]: { [songId: string]: number } } = {};

function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}

export async function POST(request: Request) {
  try {
    const { songId } = await request.json();
    const currentWeek = getCurrentWeekNumber();

    if (!songId) {
      return NextResponse.json(
        { error: 'Song ID is required' },
        { status: 400 }
      );
    }

    // Initialize weekly votes for current week if not exists
    if (!weeklyVotes[currentWeek]) {
      weeklyVotes[currentWeek] = {};
    }

    // Increment the vote count for the song
    weeklyVotes[currentWeek][songId] = (weeklyVotes[currentWeek][songId] || 0) + 1;

    return NextResponse.json({ success: true, votes: weeklyVotes[currentWeek] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process weekly vote' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const currentWeek = getCurrentWeekNumber();
  return NextResponse.json({ weeklyVotes: weeklyVotes[currentWeek] || {} });
} 