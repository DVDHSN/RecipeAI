import React, { useState } from 'react';
import { Recipe, CookedRecipe } from '../types';
import { ClockIcon, FlameIcon, BarChartIcon, ShoppingCartIcon, CheckCircleIcon, TrashIcon, ProteinIcon, CarbsIcon, FatIcon, ChevronDownIcon, ChevronUpIcon, StarIcon, BookmarkIcon } from './Icons';

interface ResultsViewProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  shoppingList: string[];
  removeFromShoppingList: (item: string) => void;
  clearShoppingList: () => void;
  cookedHistory: CookedRecipe[];
  onRateRecipe: (recipeName: string, rating: number) => void;
  onMarkAsCooked: (recipe: Recipe) => void;
}

const StarRating: React.FC<{ rating: number; onRate: (rating: number) => void }> = ({ rating, onRate }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center justify-center">
            {[...Array(5)].map((_, i) => {
                const starValue = i + 1;
                return (
                    <button
                        key={starValue}
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => onRate(starValue)}
                        className="p-1"
                        aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
                    >
                        <StarIcon
                            className={`h-6 w-6 transition-colors ${
                                starValue <= (hoverRating || rating)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-600'
                            }`}
                        />
                    </button>
                );
            })}
        </div>
    );
};


const RecipeCard: React.FC<{ recipe: Recipe; onSelect: () => void; cookedHistory: CookedRecipe[]; onRateRecipe: (recipeName: string, rating: number) => void; onMarkAsCooked: (recipe: Recipe) => void; }> = ({ recipe, onSelect, cookedHistory, onRateRecipe, onMarkAsCooked }) => {
  const [isMissingExpanded, setIsMissingExpanded] = useState(false);
  const difficultyColor = {
    Easy: 'text-green-400',
    Medium: 'text-yellow-400',
    Hard: 'text-red-400',
  };

  const hasNutrition = recipe.nutrition && recipe.nutrition.protein !== 'N/A';
  const cookedEntry = cookedHistory.find(item => item.recipe.recipeName === recipe.recipeName);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold text-white truncate">{recipe.recipeName}</h3>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-400 border-b border-gray-700 pb-4">
          <span className="flex items-center gap-1.5"><ClockIcon className="h-4 w-4" /> {recipe.prepTime}</span>
          <span className="flex items-center gap-1.5"><FlameIcon className="h-4 w-4" /> {recipe.nutrition.calories}</span>
          <span className={`flex items-center gap-1.5 font-semibold ${difficultyColor[recipe.difficulty]}`}><BarChartIcon className="h-4 w-4" /> {recipe.difficulty}</span>
        </div>
        
        {hasNutrition && (
            <div className="mt-4 flex items-center justify-around text-xs text-gray-300">
                <span className="flex flex-col items-center gap-1"><ProteinIcon className="h-5 w-5" /> {recipe.nutrition.protein} Protein</span>
                <span className="flex flex-col items-center gap-1"><CarbsIcon className="h-5 w-5" /> {recipe.nutrition.carbs} Carbs</span>
                <span className="flex flex-col items-center gap-1"><FatIcon className="h-5 w-5" /> {recipe.nutrition.fat} Fat</span>
            </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700 min-h-[80px]">
          {recipe.missingIngredients.length > 0 ? (
            <div>
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-1.5">
                  <ShoppingCartIcon className="h-4 w-4" />
                  Missing {recipe.missingIngredients.length} ingredient{recipe.missingIngredients.length > 1 ? 's' : ''}
                </h4>
                {recipe.missingIngredients.length > 2 && (
                    <button onClick={() => setIsMissingExpanded(!isMissingExpanded)} className="text-xs text-gray-400 hover:text-white flex items-center">
                        {isMissingExpanded ? 'Show less' : 'Show all'}
                        {isMissingExpanded ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />}
                    </button>
                )}
              </div>
              <ul className="mt-2 text-xs text-gray-400 list-disc list-inside space-y-1">
                {(isMissingExpanded ? recipe.missingIngredients : recipe.missingIngredients.slice(0, 2)).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="h-full flex items-center">
              <p className="flex items-center gap-2 text-sm font-semibold text-green-400">
                <CheckCircleIcon className="h-5 w-5" />
                You have all ingredients!
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6 pt-0">
        {cookedEntry ? (
          <div className="mb-4 text-center">
              <p className="text-xs text-gray-400 mb-1">Your Rating</p>
              <StarRating rating={cookedEntry.rating} onRate={(rating) => onRateRecipe(recipe.recipeName, rating)} />
          </div>
        ) : (
          <div className="mb-4 text-center h-[48px] flex items-center justify-center">
             <button onClick={() => onMarkAsCooked(recipe)} className="flex items-center gap-2 text-gray-400 hover:text-white font-semibold py-2 px-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors text-sm">
                <BookmarkIcon className="h-5 w-5" /> Add to Cookbook
              </button>
          </div>
        )}
        <button onClick={onSelect} className="w-full bg-orange-600 text-white font-semibold py-2 rounded-md hover:bg-orange-700 transition-colors">
          Cook Now
        </button>
      </div>
    </div>
  );
};

const ShoppingListView: React.FC<{ list: string[]; onRemove: (item: string) => void; onClear: () => void; }> = ({ list, onRemove, onClear }) => (
    <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Shopping List</h2>
            {list.length > 0 && <button onClick={onClear} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"><TrashIcon className="h-4 w-4" /> Clear All</button>}
        </div>
        {list.length === 0 ? (
            <div className="text-center py-10">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                <p className="mt-2 text-gray-400">Your shopping list is empty. You have all the ingredients!</p>
            </div>
        ) : (
            <ul className="space-y-3">
                {list.map((item) => (
                    <li key={item} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                        <span className="text-gray-200">{item}</span>
                        <button onClick={() => onRemove(item)} className="text-gray-500 hover:text-red-400">
                            <TrashIcon className="h-5 w-5" />
                        </button>
                    </li>
                ))}
            </ul>
        )}
    </div>
);


const ResultsView: React.FC<ResultsViewProps> = ({ recipes, onSelectRecipe, shoppingList, removeFromShoppingList, clearShoppingList, cookedHistory, onRateRecipe, onMarkAsCooked }) => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'shopping'>('recipes');

  return (
    <div className="flex-grow">
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('recipes')}
          className={`py-2 px-4 font-semibold ${activeTab === 'recipes' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400'}`}
        >
          Recipes ({recipes.length})
        </button>
        <button
          onClick={() => setActiveTab('shopping')}
          className={`py-2 px-4 font-semibold flex items-center gap-2 ${activeTab === 'shopping' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400'}`}
        >
          <ShoppingCartIcon className="h-5 w-5" /> Shopping List ({shoppingList.length})
        </button>
      </div>

      {activeTab === 'recipes' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <RecipeCard key={recipe.recipeName} recipe={recipe} onSelect={() => onSelectRecipe(recipe)} cookedHistory={cookedHistory} onRateRecipe={onRateRecipe} onMarkAsCooked={onMarkAsCooked} />
          ))}
        </div>
      ) : (
        <ShoppingListView list={shoppingList} onRemove={removeFromShoppingList} onClear={clearShoppingList} />
      )}
    </div>
  );
};

export default ResultsView;