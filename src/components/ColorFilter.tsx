import React from 'react';
import type { NFT } from '../types';

export type ColorCategory = 'all' | 'grayscale' | 'red' | 'green' | 'blue' | 'yellow' | 'purple';

interface ColorFilterProps {
  onFilterChange: (category: ColorCategory) => void;
  currentFilter: ColorCategory;
}

export function ColorFilter({ onFilterChange, currentFilter }: ColorFilterProps) {
  return (
    <select
      value={currentFilter}
      onChange={(e) => onFilterChange(e.target.value as ColorCategory)}
      className="px-3 py-1 text-sm bg-transparent border border-current hover:bg-current hover:text-background transition-colors uppercase tracking-wider cursor-pointer"
    >
      <option value="all">All Colors</option>
      <option value="grayscale">Grayscale</option>
      <option value="red">Red</option>
      <option value="green">Green</option>
      <option value="blue">Blue</option>
      <option value="yellow">Yellow</option>
      <option value="purple">Purple</option>
    </select>
  );
}