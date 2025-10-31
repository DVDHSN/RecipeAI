import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GeminiResponse } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const ttsAI = new GoogleGenAI({ apiKey: API_KEY });

const nutritionSchema = {
  type: Type.OBJECT,
  properties: {
    calories: { type: Type.STRING, description: "Estimated calories per serving, e.g., '450 kcal'." },
    protein: { type: Type.STRING, description: "Estimated grams of protein per serving, e.g., '30g'." },
    carbs: { type: Type.STRING, description: "Estimated grams of carbohydrates per serving, e.g., '45g'." },
    fat: { type: Type.STRING, description: "Estimated grams of fat per serving, e.g., '15g'." },
  },
  required: ['calories', 'protein', 'carbs', 'fat']
};


const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    recipeName: { type: Type.STRING, description: 'The descriptive name of the recipe.' },
    difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'], description: 'The difficulty to prepare the recipe.' },
    prepTime: { type: Type.STRING, description: "Estimated preparation and cooking time, e.g., '30 minutes'." },
    nutrition: { ...nutritionSchema, description: "The nutritional information for this recipe." },
    ingredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of all ingredients required, including amounts (e.g., "1 cup milk").'
    },
    missingIngredients: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of ingredients from the main ingredients list that are likely not present in the user\'s photo. Do not include common pantry staples like oil, salt, pepper, or flour, or any items listed in `ingredientsToConfirm`.'
    },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'An array of strings, with each string being a clear, step-by-step cooking instruction.'
    },
    usesConfirmedIngredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of ingredients from the `ingredientsToConfirm` array that are required for THIS specific recipe.'
    }
  },
  required: ['recipeName', 'difficulty', 'prepTime', 'nutrition', 'ingredients', 'missingIngredients', 'steps', 'usesConfirmedIngredients']
};

const schema = {
  type: Type.OBJECT,
  properties: {
    identifiedIngredients: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
       description: 'A list of all visible, edible ingredients identified in all images combined.'
    },
    ingredientsToConfirm: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of up to 5 common pantry staples (e.g. "eggs", "onion", "garlic", "butter", "milk") that are not visible in the images but would significantly enhance the recipe options if available. Ask the user to confirm these.'
    },
    recipes: {
      type: Type.ARRAY,
      items: recipeSchema,
      description: 'An array of 3 to 5 suggested recipe objects. These recipes can assume the user has the items from `ingredientsToConfirm`.'
    }
  },
  required: ['identifiedIngredients', 'ingredientsToConfirm', 'recipes']
};

export const generateSpeech = async (text: string): Promise<string> => {
    const model = "gemini-2.5-flash-preview-tts";
    const prompt = `Say it in a friendly, encouraging tone for someone cooking a recipe: ${text}`;
    
    const response = await ttsAI.models.generateContent({
        model: model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("Text-to-Speech API did not return audio data.");
    }

    return base64Audio;
};


export const analyzeFridge = async (base64Images: string[], mealType: string, dietaryRestrictions: string[], cuisineType: string): Promise<GeminiResponse> => {
  const model = 'gemini-2.5-flash';
  
  const dietaryPrompt = dietaryRestrictions.length > 0 
    ? `Important: All suggested recipes must be suitable for the following dietary preferences: ${dietaryRestrictions.join(', ')}.`
    : '';
  
  const mealTypePrompt = mealType !== 'Any' ? `The user is looking for ${mealType.toLowerCase()} recipes.` : '';
  const cuisinePrompt = cuisineType !== 'Any' ? `The user has requested ${cuisineType} cuisine. Please tailor the recipes accordingly.` : '';


  const prompt = `You are a creative culinary AI. Analyze the ingredients across all provided images and perform the following tasks:

1.  **Identify Ingredients**: List all edible ingredients you can see.
2.  **Suggest Staples**: Identify up to 5 common pantry staples (like "eggs", "onion", "butter") that are NOT visible but would greatly expand the recipe possibilities. Return these in the \`ingredientsToConfirm\` array so the user can confirm they have them.
3.  **Generate Recipes**: Create 3-5 diverse recipes. These recipes should primarily use the visible ingredients but can ALSO use the staples you listed in \`ingredientsToConfirm\`. **Important**: Ensure at least one suggested recipe uses *only* the visible ingredients and does not require any items from \`ingredientsToConfirm\`, serving as a baseline option.
4.  **Detail Each Recipe**: For each recipe, provide all the details as per the JSON schema.
    *   **Crucially**, for each recipe, populate the \`usesConfirmedIngredients\` array with the exact items from your \`ingredientsToConfirm\` list that this specific recipe requires.
    *   List any other non-staple ingredients that are not visible in the photos under \`missingIngredients\`.
    *   Provide estimated nutritional information (calories, protein, carbs, fat).

${mealTypePrompt}
${cuisinePrompt}
${dietaryPrompt}

Return your response as a single, valid JSON object adhering to the provided schema. Do not add any explanatory text outside the JSON structure.
`;

  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: img,
    },
  }));

  const textPart = { text: prompt };

  const response = await ai.models.generateContent({
    model: model,
    contents: { parts: [...imageParts, textPart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: schema,
    },
  });
  
  const responseText = response.text.trim();
  try {
    const parsedJson = JSON.parse(responseText);
    // Ensure calories field from older schema versions is handled
    if (Array.isArray(parsedJson.recipes)) {
        parsedJson.recipes.forEach((recipe: any) => {
            if (recipe.calories && !recipe.nutrition) {
                recipe.nutrition = {
                    calories: recipe.calories,
                    protein: 'N/A',
                    carbs: 'N/A',
                    fat: 'N/A'
                };
            }
        });
    }
    return parsedJson;
  } catch (e) {
    console.error("Failed to parse Gemini JSON response:", responseText);
    throw new Error("Received an invalid format from the AI.");
  }
};
