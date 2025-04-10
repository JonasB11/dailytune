'use client';

interface SpotifyPlayerProps {
  trackId: string;
}

export default function SpotifyPlayer({ trackId }: SpotifyPlayerProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <iframe
        style={{ borderRadius: '12px' }}
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
        width="100%"
        height="352"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="w-full"
      />
    </div>
  );
} 