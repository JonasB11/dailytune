export interface Song {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  previewUrl?: string;
  spotifyId?: string;
}

export interface DailyVote {
  songId: string;
  date: string;
  count: number;
}

export interface WeeklySummary {
  weekNumber: number;
  dailyWinners: {
    [day: string]: {
      song: Song;
      votes: number;
    };
  };
  totalVotes: number;
}

export interface WeeklyVote {
  songId: string;
  weekNumber: number;
  count: number;
} 