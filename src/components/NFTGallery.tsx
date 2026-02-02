import React, { useState, useMemo } from 'react';
import Masonry from 'react-masonry-css';
import type { NFT } from '../types';
import { NFTModal } from './NFTModal';
import { ArtDisplay } from './ArtDisplay';
import { Play } from 'lucide-react';
import { ColorFilter, type ColorCategory } from './ColorFilter';

interface NFTGalleryProps {
  nfts: NFT[];
  isLoading: boolean;
  progress: { current: number; total: number } | null;
  isDark: boolean;
}

const breakpointColumns = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

function getColorCategory(color?: { r: number; g: number; b: number }): ColorCategory {
  if (!color) return 'all';
  
  const { r, g, b } = color;
  
  // Check for grayscale
  const isGray = Math.abs(r - g) < 30 && Math.abs(g - b) < 30;
  if (isGray) return 'grayscale';
  
  // Find dominant color
  const max = Math.max(r, g, b);
  const threshold = 0.4 * 255; // 40% intensity threshold
  
  if (max === r && r > threshold) return 'red';
  if (max === g && g > threshold) return 'green';
  if (max === b && b > threshold) return 'blue';
  
  // Check for yellow (high red and green)
  if (r > threshold && g > threshold && b < threshold) return 'yellow';
  
  // Check for purple (high red and blue)
  if (r > threshold && b > threshold && g < threshold) return 'purple';
  
  return 'all';
}

export function NFTGallery({ nfts, isLoading, progress, isDark }: NFTGalleryProps) {
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isArtDisplay, setIsArtDisplay] = useState(false);
  const [colorFilter, setColorFilter] = useState<ColorCategory>('all');

  const filteredNFTs = useMemo(() => {
    if (colorFilter === 'all') return nfts;
    return nfts.filter(nft => getColorCategory(nft.color) === colorFilter);
  }, [nfts, colorFilter]);

  if (isLoading && !nfts.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-current"></div>
        {progress && (
          <div className="text-center">
            <div className="w-64 h-2 bg-transparent border border-current overflow-hidden">
              <div 
                className="h-full bg-current transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm mt-2 opacity-60">
              Loading NFTs: {progress.current} of {progress.total}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="opacity-60">No NFTs found for this address</p>
      </div>
    );
  }

  if (isArtDisplay) {
    return <ArtDisplay nfts={filteredNFTs} onExit={() => setIsArtDisplay(false)} />;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-center gap-4">
        <p className="text-sm text-center opacity-60">
          Found <span className="opacity-100">{nfts.length}</span> NFT{nfts.length !== 1 ? 's' : ''}
        </p>
        <ColorFilter onFilterChange={setColorFilter} currentFilter={colorFilter} />
        <button
          onClick={() => setIsArtDisplay(true)}
          className="flex items-center gap-2 text-sm border border-current px-3 py-1 hover:bg-current hover:text-background transition-colors"
        >
          <Play className="w-4 h-4" />
          <span className="uppercase tracking-wider">Art Display</span>
        </button>
      </div>

      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {filteredNFTs.map((nft) => (
          <div
            key={nft.id}
            className="mb-4 break-inside-avoid"
          >
            <div 
              className={`border border-current overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${isDark ? 'hover:border-white' : 'hover:border-black'}`}
              onClick={() => setSelectedNFT(nft)}
            >
              <img
                src={nft.displayUri || nft.artifactUri}
                alt={nft.name}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <h3 className="text-sm uppercase tracking-wider mb-1">{nft.name}</h3>
                {nft.description && (
                  <p className="text-xs opacity-60 line-clamp-2">{nft.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </Masonry>

      {selectedNFT && (
        <NFTModal
          nft={selectedNFT}
          onClose={() => setSelectedNFT(null)}
          isDark={isDark}
        />
      )}
    </>
  );
}