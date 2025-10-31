import React, { useState } from 'react';

interface ConfirmationViewProps {
  ingredientsToConfirm: string[];
  onConfirm: (confirmedItems: string[]) => void;
}

const ConfirmationView: React.FC<ConfirmationViewProps> = ({ ingredientsToConfirm, onConfirm }) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set(ingredientsToConfirm));

  const toggleItem = (item: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    onConfirm(Array.from(checkedItems));
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            One last check...
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            To give you the best recipes, please confirm if you have these common ingredients.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {ingredientsToConfirm.map(item => (
            <label key={item} className="flex items-center cursor-pointer bg-gray-700/50 p-4 rounded-md hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={checkedItems.has(item)}
                onChange={() => toggleItem(item)}
                className="h-5 w-5 rounded bg-gray-800 border-gray-600 text-orange-600 focus:ring-orange-500"
              />
              <span className="ml-4 text-lg text-gray-200 capitalize">{item}</span>
            </label>
          ))}
        </div>

        <div className="pt-8">
           <button
              onClick={handleSubmit}
              className="w-full text-lg font-bold bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Find Recipes
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationView;
