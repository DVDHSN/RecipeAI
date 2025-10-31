import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Recipe } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { XCircleIcon, ChevronLeftIcon, ChevronRightIcon, MicIcon, StopCircleIcon, CheckCircleIcon, FlameIcon } from './Icons';

interface CookingModeViewProps {
  recipe: Recipe;
  onExit: () => void;
}

const generateSearchTerms = (ingredient: string): string[] => {
  let norm = ingredient.toLowerCase()
    .replace(/\s*\(.*\)\s*/g, ' ')
    .split(',')[0]
    .trim();

  norm = norm.replace(/^\d+(\s*(\/|\.)\s*\d+)?\s*(\w+\.?\s+)?/, '').trim();
  
  const terms = new Set<string>();
  
  if (norm.length > 2) {
    terms.add(norm);
  }

  let singular = norm;
  if (singular.endsWith('oes')) {
    singular = singular.slice(0, -2);
  } else if (singular.endsWith('ies')) {
    singular = singular.slice(0, -3) + 'y';
  } else if (singular.endsWith('s')) {
    singular = singular.slice(0, -1);
  }
  
  if (singular !== norm && singular.length > 2) {
      terms.add(singular);
  }
  
  const words = norm.split(' ');
  if (words.length > 1) {
    const lastWord = words[words.length-1];
    if (lastWord.length > 2) {
        terms.add(lastWord);
        
        let singularLastWord = lastWord;
         if (singularLastWord.endsWith('oes')) {
             singularLastWord = singularLastWord.slice(0, -2);
          } else if (singularLastWord.endsWith('ies')) {
              singularLastWord = singularLastWord.slice(0, -3) + 'y';
          } else if (singularLastWord.endsWith('s')) {
              singularLastWord = singularLastWord.slice(0, -1);
          }
        if (singularLastWord !== lastWord && singularLastWord.length > 2) {
            terms.add(singularLastWord);
        }
    }
  }
  
  return Array.from(terms);
}


const CookingModeView: React.FC<CookingModeViewProps> = ({ recipe, onExit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { isSpeaking, speak, cancel, prefetch } = useTextToSpeech();
  
  const handleNext = useCallback(() => {
    if (currentStep < recipe.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      cancel();
    }
  }, [currentStep, recipe.steps.length, cancel]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      cancel();
    }
  }, [currentStep, cancel]);
  
  const handleFinish = useCallback(() => {
      onExit();
  }, [onExit]);
  
  useEffect(() => {
    if (prefetch) {
      // Prefetch current step's audio
      if (recipe.steps[currentStep]) {
          prefetch(recipe.steps[currentStep]);
      }
      // Prefetch next step's audio for seamless transition
      if (currentStep + 1 < recipe.steps.length) {
          prefetch(recipe.steps[currentStep + 1]);
      }
    }
  }, [currentStep, recipe.steps, prefetch]);

  const handleSpeak = () => {
    if (isSpeaking) {
      cancel();
    } else {
      speak(recipe.steps[currentStep]);
    }
  };

  const highlightedIngredients = useMemo(() => {
    const currentStepText = recipe.steps[currentStep].toLowerCase();
    const mentioned = new Set<string>();

    recipe.ingredients.forEach(originalIngredient => {
        const searchTerms = generateSearchTerms(originalIngredient);
        
        for (const term of searchTerms) {
            const regex = new RegExp(`\\b${term}\\b`);
            if (regex.test(currentStepText)) {
                mentioned.add(originalIngredient);
                break;
            }
        }
    });

    return mentioned;
  }, [currentStep, recipe.steps, recipe.ingredients]);


  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col md:flex-row p-4 md:p-8 gap-8">
      {/* Left Panel: Ingredients & Missing Items */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-gray-800 rounded-lg p-6 flex flex-col overflow-y-auto">
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-white mb-4">Ingredients</h3>
          <ul className="space-y-2">
            {recipe.ingredients.map(item => (
              <li key={item} className={`transition-colors duration-300 p-2 rounded-md text-gray-300 border-l-4 ${highlightedIngredients.has(item) ? 'bg-orange-900/50 border-orange-500' : 'border-transparent'}`}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        {recipe.missingIngredients.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="font-semibold text-yellow-400 mb-2">Missing Items</h4>
              <ul className="space-y-1 text-sm list-disc list-inside text-gray-300">
                {recipe.missingIngredients.map(item => (
                    <li key={item}>{item}</li>
                ))}
              </ul>
          </div>
      )}
      </div>

      {/* Right Panel: Cooking Steps & Controls */}
      <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{recipe.recipeName}</h1>
            <p className="text-gray-400">Step {currentStep + 1} of {recipe.steps.length}</p>
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><FlameIcon className="h-4 w-4" /> {recipe.nutrition.calories}</span>
            </div>
          </div>
          <button onClick={onExit} className="text-gray-400 hover:text-white transition-colors">
            <XCircleIcon className="h-10 w-10" />
          </button>
        </div>

        <div className="flex-grow flex items-center justify-center my-6">
          <p className="text-3xl md:text-5xl lg:text-6xl font-light text-center text-gray-100 leading-tight">
            {recipe.steps[currentStep]}
          </p>
        </div>
      
        <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-4 md:gap-8">
                <button onClick={handlePrev} disabled={currentStep === 0} className="disabled:opacity-30 disabled:cursor-not-allowed text-white bg-gray-700/50 p-4 rounded-full hover:bg-gray-600 transition-colors">
                    <ChevronLeftIcon className="h-8 w-8" />
                </button>
                <button onClick={handleSpeak} className="text-white bg-orange-600 p-6 rounded-full hover:bg-orange-700 transition-colors shadow-lg">
                    {isSpeaking ? <StopCircleIcon className="h-10 w-10" /> : <MicIcon className="h-10 w-10" />}
                </button>
                {currentStep < recipe.steps.length - 1 ? (
                   <button onClick={handleNext} className="text-white bg-gray-700/50 p-4 rounded-full hover:bg-gray-600 transition-colors">
                       <ChevronRightIcon className="h-8 w-8" />
                   </button>
                ) : (
                   <button onClick={handleFinish} className="text-white bg-green-600 p-4 rounded-full hover:bg-green-700 transition-colors">
                       <CheckCircleIcon className="h-8 w-8" />
                   </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default CookingModeView;