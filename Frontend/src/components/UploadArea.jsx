import React, { useState } from 'react';

export default function UploadArea({ onImagesSelected, isProcessing }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImagesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onImagesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div 
      className={`upload-area ${isDragging ? 'dragging' : ''} ${isProcessing ? 'disabled' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        onChange={handleChange} 
        disabled={isProcessing}
        id="file-input"
        className="hidden-input"
      />
      <label htmlFor="file-input" className="upload-label">
        <div className="upload-icon">📁</div>
        <h3>Drag & Drop your images here</h3>
        <p>or click to browse (supports 100+ images)</p>
      </label>
    </div>
  );
}