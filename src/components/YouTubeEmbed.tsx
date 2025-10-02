import React from 'react';
import './YouTubeEmbed.css';

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, title }) => {
  return (
    <div className="youtube-embed">
      <div className="youtube-embed__wrapper">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="youtube-embed__iframe"
        />
      </div>
    </div>
  );
};
