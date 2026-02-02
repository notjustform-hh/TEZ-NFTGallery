import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { NFTGallery } from './components/NFTGallery';
import { ThemeToggle } from './components/ThemeToggle';
import type { NFT } from './types';

function App() {
  const [address, setAddress] = useState('');
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const fetchNFTsPage = async (address: string, offset: number): Promise<any[]> => {
    const response = await fetch(
      `https://api.tzkt.io/v1/tokens/balances?account=${address}&token.standard=fa2&balance.gt=0&offset=${offset}&limit=100`
    );
    return response.json();
  };

  const extractColor = async (imageUrl: string): Promise<{ r: number; g: number; b: number } | undefined> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(undefined);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          let r = 0, g = 0, b = 0;
          let count = 0;

          // Sample pixels at regular intervals
          const step = Math.max(1, Math.floor(data.length / 4000)); // Sample about 1000 pixels
          for (let i = 0; i < data.length; i += step * 4) {
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }

          resolve({
            r: Math.round(r / count),
            g: Math.round(g / count),
            b: Math.round(b / count)
          });
        } catch (error) {
          console.error('Error extracting color:', error);
          resolve(undefined);
        }
      };

      img.onerror = () => {
        console.error('Error loading image:', imageUrl);
        resolve(undefined);
      };

      img.src = imageUrl;
    });
  };

  const processNFTData = async (data: any[]): Promise<NFT[]> => {
    const processedNFTs = data.map((item: any) => ({
      id: item.token.id,
      name: item.token.metadata?.name || 'Unnamed NFT',
      description: item.token.metadata?.description,
      artifactUri: item.token.metadata?.artifactUri?.replace('ipfs://', 'https://ipfs.io/ipfs/'),
      displayUri: item.token.metadata?.displayUri?.replace('ipfs://', 'https://ipfs.io/ipfs/'),
      thumbnailUri: item.token.metadata?.thumbnailUri?.replace('ipfs://', 'https://ipfs.io/ipfs/'),
    }));

    // Extract colors for all NFTs
    const nftsWithColor = await Promise.all(
      processedNFTs.map(async (nft) => {
        const imageUrl = nft.displayUri || nft.artifactUri;
        const color = await extractColor(imageUrl);
        return { ...nft, color };
      })
    );

    // Sort by grayscale first, then by color
    return nftsWithColor.sort((a, b) => {
      const aColor = a.color || { r: 0, g: 0, b: 0 };
      const bColor = b.color || { r: 0, g: 0, b: 0 };

      // Calculate grayscale values
      const aGray = (aColor.r + aColor.g + aColor.b) / 3;
      const bGray = (bColor.r + bColor.g + bColor.b) / 3;

      // Check if both are close to grayscale
      const aIsGray = Math.abs(aColor.r - aColor.g) < 30 && Math.abs(aColor.g - aColor.b) < 30;
      const bIsGray = Math.abs(bColor.r - bColor.g) < 30 && Math.abs(bColor.g - bColor.b) < 30;

      if (aIsGray && bIsGray) {
        // Sort by brightness for grayscale images
        return bGray - aGray;
      } else if (aIsGray) {
        return -1; // a comes first
      } else if (bIsGray) {
        return 1; // b comes first
      }

      // For colored images, sort by hue
      const aHue = getHue(aColor.r, aColor.g, aColor.b);
      const bHue = getHue(bColor.r, bColor.g, bColor.b);
      return aHue - bHue;
    });
  };

  const getHue = (r: number, g: number, b: number): number => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;

    if (max === min) {
      return 0;
    }

    const d = max - min;
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    return h * 60;
  };

  const fetchAllNFTs = async (address: string) => {
    setIsLoading(true);
    setError('');
    setProgress(null);
    setNfts([]);
    
    try {
      // First request to get total count
      const firstPage = await fetchNFTsPage(address, 0);
      if (!firstPage.length) {
        setNfts([]);
        return;
      }

      // Get total count from response headers
      const totalResponse = await fetch(
        `https://api.tzkt.io/v1/tokens/balances/count?account=${address}&token.standard=fa2&balance.gt=0`
      );
      const total = parseInt(await totalResponse.text(), 10);
      
      // Process first page
      let allNFTs = await processNFTData(firstPage);
      setProgress({ current: Math.min(100, total), total });
      setNfts(allNFTs);
      
      // Fetch remaining pages
      const remainingPages = Math.ceil((total - 100) / 100);
      for (let i = 1; i <= remainingPages; i++) {
        const pageData = await fetchNFTsPage(address, i * 100);
        const processedData = await processNFTData(pageData);
        allNFTs = [...allNFTs, ...processedData];
        setProgress({ current: Math.min((i + 1) * 100, total), total });
        
        // Sort and update the complete list
        const sortedNFTs = [...allNFTs].sort((a, b) => {
          const aColor = a.color || { r: 0, g: 0, b: 0 };
          const bColor = b.color || { r: 0, g: 0, b: 0 };
          
          // Calculate grayscale values
          const aGray = (aColor.r + aColor.g + aColor.b) / 3;
          const bGray = (bColor.r + bColor.g + bColor.b) / 3;
          
          const aIsGray = Math.abs(aColor.r - aColor.g) < 30 && Math.abs(aColor.g - aColor.b) < 30;
          const bIsGray = Math.abs(bColor.r - bColor.g) < 30 && Math.abs(bColor.g - bColor.b) < 30;
          
          if (aIsGray && bIsGray) {
            return bGray - aGray;
          } else if (aIsGray) {
            return -1;
          } else if (bIsGray) {
            return 1;
          }
          
          const aHue = getHue(aColor.r, aColor.g, aColor.b);
          const bHue = getHue(bColor.r, bColor.g, bColor.b);
          return aHue - bHue;
        });
        
        setNfts(sortedNFTs);
      }
    } catch (err) {
      setError('Failed to fetch NFTs. Please check the address and try again.');
      setNfts([]);
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      fetchAllNFTs(address.trim());
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl mb-4 uppercase tracking-widest">
            Tezos NFT Gallery
          </h1>
          <p className="text-sm mb-6 opacity-60">
            Enter a Tezos wallet address to view its NFT collection
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter Tezos address"
                  className="w-full px-4 py-2 border border-current bg-transparent focus:outline-none focus:border-2"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 border border-current hover:bg-current hover:text-background transition-colors disabled:opacity-50"
                disabled={!address.trim() || isLoading}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-4 text-red-500">
              {error}
            </div>
          )}
        </div>

        <NFTGallery 
          nfts={nfts} 
          isLoading={isLoading} 
          progress={progress}
          isDark={isDark}
        />
      </div>
    </div>
  );
}

export default App;