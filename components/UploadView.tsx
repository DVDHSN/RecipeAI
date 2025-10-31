import React, { useState, useCallback, useRef } from 'react';
import { CameraIcon, XCircleIcon, StarIcon } from './Icons';
import { CookedRecipe } from '../types';

interface UploadViewProps {
  onAnalyze: (images: string[], mealType: string, cuisineType: string) => void;
  error: string | null;
  activeFilters: string[];
  setActiveFilters: (filters: string[]) => void;
  cookedHistory: CookedRecipe[];
  onSelectRecipe: (recipe: any) => void;
}

const MEAL_TYPES = ['Any', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];
const CUISINE_TYPES = ['Any', 'Italian', 'Mexican', 'Indian', 'Chinese', 'Mediterranean', 'Japanese'];
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Dairy-Free'];

const CookbookCard: React.FC<{ item: CookedRecipe, onCookAgain: () => void }> = ({ item, onCookAgain }) => (
    <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
        <div>
            <h4 className="font-bold text-white">{item.recipe.recipeName}</h4>
            <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                    <StarIcon
                        key={i}
                        className={`h-5 w-5 ${i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                    />
                ))}
            </div>
        </div>
        <button
            onClick={onCookAgain}
            className="bg-orange-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-orange-700 transition-colors text-sm"
        >
            Cook Again
        </button>
    </div>
);

const UploadView: React.FC<UploadViewProps> = ({ onAnalyze, error, activeFilters, setActiveFilters, cookedHistory, onSelectRecipe }) => {
  const [images, setImages] = useState<{ id: string, base64: string }[]>([]);
  const [mealType, setMealType] = useState<string>('Any');
  const [cuisineType, setCuisineType] = useState<string>('Any');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newImages = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    newImages.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const id = `${file.name}-${file.lastModified}`;
        setImages(prev => [...prev, { id, base64 }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const toggleFilter = (filter: string) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter(f => f !== filter)
      : [...activeFilters, filter];
    setActiveFilters(newFilters);
  };
  
  const handleSubmit = () => {
    if (images.length === 0) return;
    onAnalyze(images.map(img => img.base64), mealType, cuisineType);
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {cookedHistory.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Your Cookbook</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cookedHistory.map(item => (
                <CookbookCard key={item.recipe.recipeName} item={item} onCookAgain={() => onSelectRecipe(item.recipe)} />
              ))}
            </div>
             <hr className="my-10 border-gray-700" />
          </div>
        )}

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            What's for dinner tonight?
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Let AI be your sous-chef. Just show it your ingredients.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {/* Step 1: Upload Photos */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Upload photos of your ingredients</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map(image => (
                <div key={image.id} className="relative group aspect-square">
                  <img src={`data:image/jpeg;base64,${image.base64}`} alt="ingredient" className="w-full h-full object-cover rounded-lg"/>
                  <button onClick={() => removeImage(image.id)} className="absolute top-1 right-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <XCircleIcon className="h-6 w-6"/>
                  </button>
                </div>
              ))}
              <label
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={handleClick}
                className={`flex flex-col justify-center items-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDragging ? 'border-orange-500 bg-gray-800' : 'border-gray-600 hover:border-orange-500 hover:bg-gray-800'
                }`}
              >
                <CameraIcon className="h-8 w-8 text-gray-500" />
                <span className="mt-2 text-sm text-gray-400 text-center">Add Photo</span>
              </label>
            </div>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </div>

          {/* Step 2: Meal Type */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Choose your meal type</h2>
            <div className="flex flex-wrap gap-3">
              {MEAL_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`px-4 py-2 rounded-full font-semibold transition-colors text-sm ${
                    mealType === type ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Step 3: Cuisine */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Choose your cuisine (optional)</h2>
            <div className="flex flex-wrap gap-3">
              {CUISINE_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setCuisineType(type)}
                  className={`px-4 py-2 rounded-full font-semibold transition-colors text-sm ${
                    cuisineType === type ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Dietary Needs */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Select dietary needs (optional)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DIETARY_OPTIONS.map(opt => (
                <label key={opt} className="flex items-center cursor-pointer bg-gray-800 p-3 rounded-md hover:bg-gray-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={activeFilters.includes(opt)}
                    onChange={() => toggleFilter(opt)}
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-3 text-gray-300">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
             <button
                onClick={handleSubmit}
                disabled={images.length === 0}
                className="w-full text-lg font-bold bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Generate Recipes
              </button>
              {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadView;