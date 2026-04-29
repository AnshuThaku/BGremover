import React from 'react';

export default function ImageCard({ image }) {
  // Agar done hai toh transparent image dikhao, warna original
  const displayUrl = image.status === 'done' ? image.processedUrl : image.originalUrl;

  return (
    <div className="image-card">
      <div className="img-wrapper">
        <img 
          src={displayUrl} 
          alt={image.file.name} 
          className={image.status === 'done' ? 'transparent-bg' : ''}
        />
        
        {/* Loading Spinner */}
        {image.status === 'processing' && (
          <div className="overlay processing-overlay">
            <div className="spinner"></div>
            <span>Processing...</span>
          </div>
        )}
        
        {/* Success Tick */}
        {image.status === 'done' && (
          <div className="badge success-badge">✓ Done</div>
        )}
      </div>
      
      <div className="card-footer">
        <span className="file-name" title={image.file.name}>{image.file.name}</span>
        
        {/* Direct Download Button (bina slider ke) */}
        {image.status === 'done' && (
          <a 
            href={image.processedUrl} 
            download={`nobg_${image.file.name.split('.')[0]}.png`}
            className="btn success download-single-btn"
          >
            Download
          </a>
        )}
      </div>
    </div>
  );
}