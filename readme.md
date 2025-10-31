<div align="center">
  <h1>RecipeAI: Your Personal AI Sous-Chef</h1>
  <p>
    <strong>Snap a photo of your fridge, and get instant recipe suggestions with step-by-step, hands-free cooking instructions.</strong>
  </p>
</div>

---

## 📖 Description

RecipeAI is an intelligent web application designed to be your ultimate kitchen assistant. Ever stared into a full fridge and thought, "I have nothing to eat"? RecipeAI solves that problem. By simply uploading photos of your available ingredients, the app leverages the power of Google's Gemini multimodal AI to identify what you have and generate a curated list of delicious recipes you can make right now.

The application goes beyond simple suggestions. It provides detailed nutritional information, estimates prep time, and automatically creates a shopping list for any missing items. The standout feature is the hands-free **Cooking Mode**, which guides you through each recipe step-by-step with clear, voice-narrated instructions, making the cooking process seamless and enjoyable.

This project was built to reduce food waste, inspire culinary creativity, and make home cooking more accessible for everyone.

## ✨ Key Features

-   📸 **AI Ingredient Recognition**: Uses a multimodal AI model to accurately identify ingredients from your uploaded photos.
-   🧑‍🍳 **Personalized Recipe Suggestions**: Generates multiple recipe options tailored to your available ingredients.
-   🍲 **Advanced Filtering**: Refine suggestions by meal type (breakfast, dinner), cuisine (Italian, Mexican), and dietary needs (vegetarian, gluten-free).
-   🛒 **Automatic Shopping List**: Creates a convenient shopping list for any ingredients you're missing for a chosen recipe.
-   🔊 **Hands-Free Cooking Mode**: An interactive, full-screen view with step-by-step instructions.
-   🎤 **Voice-Guided Instructions**: Utilizes Text-to-Speech to read out cooking steps, allowing you to focus on cooking without touching your device.
-   📚 **Personal Cookbook**: Saves your cooked recipes to a personal "Cookbook" using local storage, allowing you to rate them and easily cook them again.

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript
-   **AI Model**: Google Gemini 2.5 Flash (for multimodal analysis) & Gemini TTS (for voice synthesis)
-   **Styling**: Tailwind CSS
-   **Build Tool**: Vite
-   **API Client**: `@google/genai`

## 🚀 Installation & Setup

Follow these steps to get a local copy up and running.

**Prerequisites:**
-   Node.js (v18 or higher)
-   npm or yarn

**Installation:**

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/DVDHSN/RecipeAI.git
    cd RecipeAI
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a new file named `.env` in the root of the project.
    -   Add your Google Gemini API key to this file:
        ```env
        GEMINI_API_KEY="YOUR_API_KEY_HERE"
        ```
    -   You can get a free API key from [Google AI Studio](https://ai.google.dev/).

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application should now be running on `http://localhost:3000`.

##  kullanım Usage

1.  **Upload Photos**: Drag and drop or click to upload one or more photos of your ingredients (e.g., the inside of your fridge, your pantry).
2.  **Set Preferences**: Choose your desired meal type, cuisine, and any dietary restrictions. These are optional.
3.  **Generate Recipes**: Click the "Generate Recipes" button. The AI will analyze your photos and present several recipe options.
4.  **Confirm Staples**: If the AI thinks certain common pantry staples (like eggs or onions) would improve the recipes, it will ask you to confirm if you have them.
5.  **Browse Results**: Explore the suggested recipes. You can view prep time, nutritional info, and missing ingredients for each.
6.  **View Shopping List**: Switch to the "Shopping List" tab to see all missing ingredients from the suggested recipes combined into one list.
7.  **Start Cooking**: Click "Cook Now" on any recipe card to enter the hands-free Cooking Mode.
8.  **Follow Instructions**: Navigate through steps using the on-screen buttons. Click the microphone icon to have the current step read aloud to you.

## 📂 File Structure

Here is a brief overview of the key directories and files in the project:

```
/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable React components for each view (Upload, Results, Cooking, etc.)
│   ├── hooks/               # Custom React hooks (e.g., useTextToSpeech)
│   ├── services/            # API service integrations (geminiService.ts)
│   ├── types.ts             # TypeScript type definitions
│   ├── App.tsx              # Main application component, manages state and views
│   └── index.tsx            # React application entry point
├── .env                     # Environment variables (needs to be created)
├── index.html               # Main HTML entry point
├── package.json             # Project dependencies and scripts
└── vite.config.ts           # Vite build configuration
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the 
