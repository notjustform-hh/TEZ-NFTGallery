import React from 'react';
import { X } from 'lucide-react';
import type { NFT } from '../types';

interface NFTModalProps {
  nft: NFT;
  onClose: () => void;
  isDark: boolean;
}

export function NFTModal({ nft, onClose, isDark }: NFTModalProps) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDark ? 'bg-black/90' : 'bg-white/90'}`}>
      <div className={`w-full max-w-4xl border border-current ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="relative p-4 border-b border-current">
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-current hover:text-background transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
          <h2 className="text-lg uppercase tracking-widest pr-12">{nft.name}</h2>
        </div>
        
        <div className="grid md:grid-cols-2">
          <div className="h-[300px] md:h-[500px] border-b md:border-b-0 md:border-r border-current">
            <img
              src={nft.displayUri || nft.artifactUri}
              alt={nft.name}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="p-6 text-sm">
            {nft.description && (
              <div className="mb-6">
                <h3 className="uppercase tracking-wider opacity-60 mb-2">Description</h3>
                <p className="whitespace-pre-wrap">{nft.description}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <h3 className="uppercase tracking-wider opacity-60 mb-1">Token ID</h3>
                <p className="font-mono text-xs">{nft.id}</p>
              </div>
              
              {nft.artifactUri && (
                <div>
                  <h3 className="uppercase tracking-wider opacity-60 mb-1">Artifact URI</h3>
                  <a
                    href={nft.artifactUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs break-all hover:opacity-60 transition-opacity"
                  >
                    {nft.artifactUri}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}