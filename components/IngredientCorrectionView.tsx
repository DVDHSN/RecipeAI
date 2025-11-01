import React, { useState, useRef, useEffect } from 'react';
import { XCircleIcon, PlusIcon } from './Icons';

interface IngredientCorrectionViewProps {
  initialIngredients: string[];
  onConfirm: (correctedIngredients: string[]) => void;
  onBack: () => void;
  error: string | null;
}

const IngredientCorrectionView: React.FC<IngredientCorrectionViewProps> = ({ initialIngredients, onConfirm, onBack, error }) => {
  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
  const [newIngredient, setNewIngredient] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIngredients(initialIngredients);
  }, [initialIngredients]);

  const handleAddIngredient = () => {
    const trimmed = newIngredient.trim();
    if (trimmed && !ingredients.some(ing => ing.toLowerCase() === trimmed.toLowerCase())) {
      setIngredients([...ingredients, trimmed]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleAddIngredient();
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Confirm Your Ingredients
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            We've identified the following ingredients. Add, remove, or correct them to get the best recipe suggestions.
          </p>
        </div>

        <div className="mt-8">
            <div className="flex flex-wrap gap-3 p-4 bg-gray-900/50 rounded-lg min-h-[100px] border border-gray-700">
                {ingredients.map(item => (
                    <span key={item} className="flex items-center gap-2 bg-orange-600/20 text-orange-300 px-3 py-1.5 rounded-full text-sm font-semibold capitalize">
                        {item}
                        <button onClick={() => handleRemoveIngredient(item)} className="text-orange-300 hover:text-white">
                            <XCircleIcon className="h-4 w-4" />
                        </button>
                    </span>
                ))}
                {ingredients.length === 0 && <p className="text-gray-500 self-center mx-auto">Add some ingredients to get started...</p>}
            </div>
        </div>
        
        <div className="mt-6 flex gap-3">
            <input
                ref={inputRef}
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add another ingredient..."
                className="flex-grow bg-gray-700 border border-gray-600 text-white rounded-md px-4 py-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
                onClick={handleAddIngredient}
                className="bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-500 transition-colors flex items-center gap-2"
            >
                <PlusIcon className="h-5 w-5" /> Add
            </button>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row gap-4">
           <button
              onClick={onBack}
              className="w-full sm:w-auto text-lg font-bold bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
           <button
              onClick={() => onConfirm(ingredients)}
              disabled={ingredients.length === 0}
              className="w-full text-lg font-bold bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 flex-grow"
            >
              Generate Recipes
            </button>
        </div>
        {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default IngredientCorrectionView;