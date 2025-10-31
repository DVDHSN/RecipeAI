import React from 'react';
import { ChefHatIcon } from './Icons';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-gray-700">
          <button onClick={onLogoClick} className="flex items-center gap-2 text-2xl font-bold text-white">
            <ChefHatIcon className="h-8 w-8 text-orange-500" />
            <span>RecipeAI</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;