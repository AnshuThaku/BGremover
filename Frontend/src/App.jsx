import React, { useState, useEffect } from 'react';
import UploadArea from './components/UploadArea';
import ImageGrid from './components/ImageGrid';
import { removeBackground } from './services/api';
import './App.css';

export default function App() {
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Memory leak bachane ke liye cleanup
  useEffect(() => {
    return () => {
      images.forEach(img => {
        URL.revokeObjectURL(img.originalUrl);
        if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
      });
    };
  }, [images]);

  const handleImagesSelected = (files) => {
    const newImages = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      originalUrl: URL.createObjectURL(file),
      processedUrl: null,
      status: 'idle' 
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const updateImageStatus = (id, updates) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  const processAll = async () => {
    setIsProcessing(true);
    const limit = 4; // Max 4 images at a time
    const pending = images.filter(img => img.status === 'idle' || img.status === 'error');
    
    let currentIndex = 0;

    const worker = async () => {
      while (currentIndex < pending.length) {
        const img = pending[currentIndex++];
        updateImageStatus(img.id, { status: 'processing' });

        try {
          const blob = await removeBackground(img.file);
          const processedUrl = URL.createObjectURL(blob);
          updateImageStatus(img.id, { status: 'done', processedUrl });
        } catch (error) {
          console.error(`Error processing ${img.file.name}:`, error);
          updateImageStatus(img.id, { status: 'error' });
        }
      }
    };

    const workers = Array.from({ length: Math.min(limit, pending.length) }, () => worker());
    await Promise.all(workers);
    setIsProcessing(false);
  };

  const handleDownloadAll = () => {
    const doneImages = images.filter(img => img.status === 'done');
    doneImages.forEach((img, index) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = img.processedUrl;
        a.download = `nobg_${img.file.name.split('.')[0]}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 200); 
    });
  };

  const clearAll = () => {
    if (isProcessing) return;
    setImages([]);
  };

  const doneCount = images.filter(img => img.status === 'done').length;
  
  // DYNAMIC BUTTON TEXT LOGIC
  const processBtnText = images.length === 1 ? "Remove Background" : "Remove All Backgrounds";

  return (
    <div className="app-container">
      <header className="header">
        <h1>AI Background Remover</h1>
        <p>Fast, local, and secure image processing.</p>
      </header>

      <UploadArea onImagesSelected={handleImagesSelected} isProcessing={isProcessing} />

      {images.length > 0 && (
        <div className="controls-bar">
          <div className="progress-info">
            {isProcessing ? `Processing... (${doneCount}/${images.length})` : `Total: ${images.length} Images`}
          </div>
          <div className="actions">
            <button className="btn outline" onClick={clearAll} disabled={isProcessing}>Clear</button>
            <button className="btn primary" onClick={processAll} disabled={isProcessing || doneCount === images.length}>
              {isProcessing ? "Processing..." : processBtnText}
            </button>
            <button className="btn success" onClick={handleDownloadAll} disabled={doneCount === 0 || isProcessing}>
              Download All ({doneCount})
            </button>
          </div>
        </div>
      )}

      {/* Grid ab fully centered hai */}
      <ImageGrid images={images} />
    </div>
  );
}