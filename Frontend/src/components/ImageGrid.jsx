import React from 'react';
import ImageCard from './ImageCard';

export default function ImageGrid({ images, onCardClick }) {
  if (images.length === 0) return null;

  return (
    <div className="image-grid">
      {images.map(img => (
        <ImageCard key={img.id} image={img} onCardClick={onCardClick} />
      ))}
    </div>
  );
}