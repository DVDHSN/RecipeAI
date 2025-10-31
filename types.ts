export interface Recipe {
  recipeName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: string;
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  ingredients: string[];
  missingIngredients: string[];
  steps: string[];
  usesConfirmedIngredients: string[];
}

export interface GeminiResponse {
  identifiedIngredients: string[];
  recipes: Recipe[];
  ingredientsToConfirm?: string[];
}

export interface CookedRecipe {
  recipe: Recipe;
  rating: number; // 0 for unrated, 1-5 stars
}
