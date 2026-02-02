import React, { useEffect, useState, useCallback } from 'react';
import type { NFT } from '../types';

interface ArtDisplayProps {
  nfts: NFT[];
  onExit: () => void;
}

export function ArtDisplay({ nfts, onExit }: ArtDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const showNextImage = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((current) => (current + 1) % nfts.length);
      setIsTransitioning(false);
    }, 1000); // 1s for fade out
  }, [nfts.length]);

  useEffect(() => {
    const timer = setInterval(showNextImage, 10000); // 10s per image
    return () => clearInterval(timer);
  }, [showNextImage]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onExit]);

  const currentNFT = nfts[currentIndex];

  return (
    <div className="fixed inset-0 bg-black">
      <img
        src={currentNFT.displayUri || currentNFT.artifactUri}
        alt={currentNFT.name}
        className={`w-full h-full object-contain transition-opacity duration-1000 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <button
        onClick={onExit}
        className="fixed top-4 right-4 text-white opacity-50 hover:opacity-100 transition-opacity text-sm uppercase tracking-widest"
      >
        Press ESC to exit
      </button>
    </div>
  );
}