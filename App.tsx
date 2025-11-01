import React, { useState, useCallback, useEffect } from 'react';
import { identifyIngredients, generateRecipes } from './services/geminiService';
import { Recipe, GeminiResponse, CookedRecipe } from './types';
import Header from './components/Header';
import UploadView from './components/UploadView';
import IngredientCorrectionView from './components/IngredientCorrectionView';
import ConfirmationView from './components/ConfirmationView';
import ResultsView from './components/ResultsView';
import CookingModeView from './components/CookingModeView';
import { Spinner } from './components/Icons';

type ViewState = 'UPLOAD' | 'LOADING' | 'INGREDIENT_CORRECTION' | 'CONFIRMATION' | 'RESULTS' | 'COOKING';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('UPLOAD');
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [stagedAnalysisResult, setStagedAnalysisResult] = useState<GeminiResponse | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [shoppingList, setShoppingList] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [cookedHistory, setCookedHistory] = useState<CookedRecipe[]>([]);
  const [identifiedIngredients, setIdentifiedIngredients] = useState<string[]>([]);
  const [mealType, setMealType] = useState<string>('Any');
  const [cuisineType, setCuisineType] = useState<string>('Any');

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('recipeAI-cookedHistory');
      if (savedHistory) {
        setCookedHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load cooked history from localStorage", e);
      setCookedHistory([]);
    }
  }, []);

  const updateCookedHistory = (newHistory: CookedRecipe[]) => {
    setCookedHistory(newHistory);
    try {
        localStorage.setItem('recipeAI-cookedHistory', JSON.stringify(newHistory));
    } catch(e) {
        console.error("Failed to save cooked history to localStorage", e);
    }
  };

  const processAnalysisResults = (finalRecipes: Recipe[]) => {
    setRecipes(finalRecipes);
    const initialShoppingList = new Set<string>();
    finalRecipes.forEach(recipe => {
      recipe.missingIngredients.forEach(item => initialShoppingList.add(item));
    });
    setShoppingList(initialShoppingList);
    setViewState('RESULTS');
  };

  const handleAnalysis = useCallback(async (imagesBase64: string[], meal: string, cuisine: string) => {
    setViewState('LOADING');
    setError(null);
    setStagedAnalysisResult(null);
    setIdentifiedIngredients([]);
    setMealType(meal);
    setCuisineType(cuisine);

    try {
      const result = await identifyIngredients(imagesBase64);
      if (result && result.identifiedIngredients.length > 0) {
        setIdentifiedIngredients(result.identifiedIngredients);
        setViewState('INGREDIENT_CORRECTION');
      } else {
        setError("Couldn't identify ingredients from the photo. You can add them manually.");
        setIdentifiedIngredients([]);
        setViewState('INGREDIENT_CORRECTION');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while analyzing the image. Please try again.');
      setViewState('UPLOAD');
    }
  }, []);

  const handleGenerateRecipes = useCallback(async (correctedIngredients: string[]) => {
    setViewState('LOADING');
    setError(null);
    setStagedAnalysisResult(null);

    if (correctedIngredients.length === 0) {
        setError("Please add some ingredients to find recipes.");
        setIdentifiedIngredients([]);
        setViewState('INGREDIENT_CORRECTION');
        return;
    }

    try {
      const result = await generateRecipes(correctedIngredients, mealType, activeFilters, cuisineType);
      
      if (result && result.recipes && result.recipes.length > 0) {
        if (result.ingredientsToConfirm && result.ingredientsToConfirm.length > 0) {
          setStagedAnalysisResult(result);
          setViewState('CONFIRMATION');
        } else {
          processAnalysisResults(result.recipes);
        }
      } else {
        setError("Couldn't find any recipes for the ingredients provided. Please try with different ingredients.");
        setIdentifiedIngredients(correctedIngredients);
        setViewState('INGREDIENT_CORRECTION');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating recipes. Please try again.');
      setIdentifiedIngredients(correctedIngredients);
      setViewState('INGREDIENT_CORRECTION');
    }
}, [mealType, cuisineType, activeFilters]);

  const handleConfirmation = useCallback((confirmedStaples: string[]) => {
    if (!stagedAnalysisResult) return;

    const confirmedSet = new Set(confirmedStaples);
    
    const primaryRecipes = stagedAnalysisResult.recipes.filter(recipe => {
      if (!recipe.usesConfirmedIngredients || recipe.usesConfirmedIngredients.length === 0) {
        return true;
      }
      return recipe.usesConfirmedIngredients.every(staple => confirmedSet.has(staple));
    });

    if (primaryRecipes.length > 0) {
      processAnalysisResults(primaryRecipes);
      setStagedAnalysisResult(null);
      return;
    }

    const fallbackRecipes = stagedAnalysisResult.recipes.filter(
      recipe => !recipe.usesConfirmedIngredients || recipe.usesConfirmedIngredients.length === 0
    );

    if (fallbackRecipes.length > 0) {
      processAnalysisResults(fallbackRecipes);
      setStagedAnalysisResult(null);
      return;
    }

    setError("We couldn't find a recipe with your selected pantry items. Please try another photo or adjust your selection.");
    setViewState('UPLOAD');
    setStagedAnalysisResult(null);
  }, [stagedAnalysisResult]);

  const handleSelectRecipe = useCallback((recipe: Recipe) => {
    setActiveRecipe(recipe);
    setViewState('COOKING');
  }, []);

  const handleExitCooking = useCallback(() => {
    setActiveRecipe(null);
    setViewState('RESULTS');
  }, []);

  const addToShoppingList = useCallback((item: string) => {
    setShoppingList(prevList => {
      const newList = new Set(prevList);
      newList.add(item);
      return newList;
    });
  }, []);
  
  const removeFromShoppingList = useCallback((item: string) => {
    setShoppingList(prevList => {
      const newList = new Set(prevList);
      newList.delete(item);
      return newList;
    });
  }, []);

  const clearShoppingList = useCallback(() => {
    setShoppingList(new Set());
  }, []);
  
  const handleMarkAsCooked = useCallback((recipe: Recipe) => {
    if (cookedHistory.some(item => item.recipe.recipeName === recipe.recipeName)) {
      return; 
    }
    const newHistory = [...cookedHistory, { recipe, rating: 0 }];
    updateCookedHistory(newHistory);
  }, [cookedHistory]);
  
  const handleRateRecipe = useCallback((recipeName: string, rating: number) => {
    const newHistory = cookedHistory.map(item => 
      item.recipe.recipeName === recipeName ? { ...item, rating } : item
    );
    updateCookedHistory(newHistory);
  }, [cookedHistory]);

  const resetApp = useCallback(() => {
    setViewState('UPLOAD');
    setRecipes([]);
    setActiveRecipe(null);
    setError(null);
    setShoppingList(new Set());
    setActiveFilters([]);
    setStagedAnalysisResult(null);
    setIdentifiedIngredients([]);
    setMealType('Any');
    setCuisineType('Any');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header onLogoClick={resetApp} />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
        {viewState === 'UPLOAD' && <UploadView onAnalyze={handleAnalysis} error={error} activeFilters={activeFilters} setActiveFilters={setActiveFilters} cookedHistory={cookedHistory} onSelectRecipe={handleSelectRecipe} />}
        {viewState === 'LOADING' && (
          <div className="flex-grow flex flex-col items-center justify-center text-center">
            <Spinner />
            <h2 className="text-2xl font-semibold mt-4 text-orange-400">Chef is thinking...</h2>
            <p className="text-gray-400 mt-2">Analyzing your ingredients and finding delicious recipes!</p>
          </div>
        )}
        {viewState === 'INGREDIENT_CORRECTION' && (
          <IngredientCorrectionView
            initialIngredients={identifiedIngredients}
            onConfirm={handleGenerateRecipes}
            onBack={resetApp}
            error={error}
          />
        )}
        {viewState === 'CONFIRMATION' && stagedAnalysisResult && stagedAnalysisResult.ingredientsToConfirm && (
          <ConfirmationView
            ingredientsToConfirm={stagedAnalysisResult.ingredientsToConfirm}
            onConfirm={handleConfirmation}
          />
        )}
        {viewState === 'RESULTS' && (
          <ResultsView
            recipes={recipes}
            onSelectRecipe={handleSelectRecipe}
            shoppingList={Array.from(shoppingList)}
            removeFromShoppingList={removeFromShoppingList}
            clearShoppingList={clearShoppingList}
            cookedHistory={cookedHistory}
            onRateRecipe={handleRateRecipe}
            onMarkAsCooked={handleMarkAsCooked}
          />
        )}
        {viewState === 'COOKING' && activeRecipe && (
          <CookingModeView
            recipe={activeRecipe}
            onExit={handleExitCooking}
          />
        )}
      </main>
    </div>
  );
};

export default App;