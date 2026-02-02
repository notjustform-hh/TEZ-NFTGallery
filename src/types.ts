export interface NFT {
  id: string;
  name: string;
  description?: string;
  artifactUri: string;
  displayUri?: string;
  thumbnailUri?: string;
  color?: {
    r: number;
    g: number;
    b: number;
  };
}