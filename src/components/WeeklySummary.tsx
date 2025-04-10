'use client';

import { WeeklySummary as WeeklySummaryType } from '@/types';

interface WeeklySummaryProps {
  summary: WeeklySummaryType;
  onVoteForWeeklyWinner: (songId: string) => void;
  hasVotedForWeeklyWinner: boolean;
}

export default function WeeklySummary({
  summary,
  onVoteForWeeklyWinner,
  hasVotedForWeeklyWinner,
}: WeeklySummaryProps) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dailyWinners = days.map(day => summary.dailyWinners[day]);

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Weekly Summary - Week {summary.weekNumber}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {dailyWinners.map((winner, index) => (
          winner ? (
            <div
              key={days[index]}
              className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
            >
              <h3 className="text-lg font-semibold text-purple-400 mb-2">
                {days[index]}
              </h3>
              <p className="text-white font-medium">{winner.song.title}</p>
              <p className="text-gray-400 text-sm">{winner.song.artist}</p>
              <p className="text-gray-300 text-sm mt-2">
                {winner.votes} votes
              </p>
            </div>
          ) : (
            <div
              key={days[index]}
              className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50"
            >
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                {days[index]}
              </h3>
              <p className="text-gray-500">No votes yet</p>
            </div>
          )
        ))}
      </div>

      <div className="text-center">
        <p className="text-gray-300 mb-4">
          Total votes this week: {summary.totalVotes}
        </p>
        
        {!hasVotedForWeeklyWinner && (
          <button
            onClick={() => {
              // Find the song with most daily wins
              const winnerCounts = dailyWinners.reduce((acc, winner) => {
                if (winner) {
                  acc[winner.song.id] = (acc[winner.song.id] || 0) + 1;
                }
                return acc;
              }, {} as { [key: string]: number });
              
              const weeklyWinner = Object.entries(winnerCounts)
                .reduce((a, b) => a[1] > b[1] ? a : b)[0];
              
              onVoteForWeeklyWinner(weeklyWinner);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Vote for Weekly Winner
          </button>
        )}
        
        {hasVotedForWeeklyWinner && (
          <p className="text-green-400 font-medium">
            Thanks for voting for the weekly winner!
          </p>
        )}
      </div>
    </div>
  );
} 