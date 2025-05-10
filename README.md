# AI Prompt Studio

AI Prompt Studio is a Next.js web application designed to help users customize, optimize, and generate AI prompts. It provides an intuitive interface for fine-tuning prompt parameters, using templates, defining AI roles, and managing variables to achieve optimal results from Large Language Models (LLMs) integrated via Genkit.

## 🌟 Features

-   **Prompt Customization**: Input a base prompt template and dynamically insert variables.
-   **AI Role Assignment**: Define a specific role for the AI (e.g., "Story Teller", "Code Assistant") to tailor its response style and content.
-   **Internal Prompt Optimization**: User prompts are first processed by an internal "prompt optimizer" LLM call to refine them for better clarity and effectiveness before final execution.
-   **Preset Configurations**: Load predefined prompt templates and variables for common use cases (e.g., Creative Writing, Code Generation).
-   **Variable Management**: Easily add, edit, or remove key-value pairs for placeholders in your prompt templates.
-   **Response Handling**:
    -   Display AI-generated responses clearly.
    -   Copy responses to the clipboard.
    -   Export responses as `.txt` or `.md` files.
    -   Rate AI responses (Good, Neutral, Bad).
-   **User Interface**:
    -   Modern, responsive design built with Tailwind CSS and ShadCN UI components.
    -   Light/Dark theme toggle.
    -   Interactive forms with validation and loading states.
-   **Genkit Integration**: Leverages Genkit for seamless interaction with Google's Gemini models.

## 🛠️ Tech Stack

-   **Frontend**:
    -   Next.js 15 (App Router, React Server Components)
    -   React 18
    -   TypeScript
    -   Tailwind CSS
    -   ShadCN UI (for pre-built, accessible components)
    -   Lucide Icons
    -   React Hook Form (for form handling)
    -   Zod (for schema validation on forms)
-   **Backend (AI Logic & API)**:
    -   Next.js API Routes (implicitly through Server Actions)
    -   Genkit (for defining and running AI flows with Google Gemini)
    -   Zod (for defining Genkit flow input/output schemas)
-   **Language**: TypeScript
-   **Environment**: Node.js

## 🏗️ Project Structure

```
.
├── src/
│   ├── ai/
│   │   ├── flows/
│   │   │   └── customize-ai-prompts.ts  # Genkit flow for prompt customization & execution
│   │   ├── genkit.ts                    # Genkit global configuration
│   │   └── dev.ts                       # Genkit development server entry point
│   ├── app/
│   │   ├── globals.css                  # Global styles & ShadCN theme variables
│   │   ├── layout.tsx                   # Root layout component
│   │   └── page.tsx                     # Main page for prompt customization
│   ├── components/
│   │   ├── layout/
│   │   │   └── app-header.tsx           # Application header
│   │   ├── ui/                          # ShadCN UI components
│   │   ├── prompt-customizer.tsx        # Component for prompt input and configuration
│   │   ├── response-actions.tsx         # Component for rating and exporting AI response
│   │   └── response-display.tsx         # Component for showing AI response
│   ├── hooks/
│   │   └── use-toast.ts                 # Custom hook for toast notifications
│   ├── lib/
│   │   ├── actions.ts                   # Server Actions for form submissions
│   │   └── utils.ts                     # Utility functions
├── .env                                 # Environment variables (GIT IGNORED)
├── components.json                      # ShadCN UI configuration
├── next.config.ts                       # Next.js configuration
├── package.json                         # Project dependencies and scripts
├── tailwind.config.ts                   # Tailwind CSS configuration
└── tsconfig.json                        # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm or yarn
-   A Google AI API Key (for Gemini)

### Setup and Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd ai-prompt-studio
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables**:
    Create a `.env` file in the root of the project and add your Google AI API key:
    ```env
    # .env
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```
    You can obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Running the Application

The application requires two development servers to run concurrently: the Next.js frontend server and the Genkit development server for the AI flows.

1.  **Start the Genkit development server**:
    Open a terminal and run:
    ```bash
    npm run genkit:dev
    # or (for auto-reloading on changes)
    npm run genkit:watch
    ```
    This server typically runs on `http://localhost:3400` and exposes the Genkit developer UI.

2.  **Start the Next.js development server**:
    Open another terminal and run:
    ```bash
    npm run dev
    ```
    The Next.js application will typically be available at `http://localhost:9002`.

Now, you can open `http://localhost:9002` in your browser to use the AI Prompt Studio.

### Building for Production

1.  **Build the Next.js application**:
    ```bash
    npm run build
    ```
2.  **Start the production server**:
    ```bash
    npm run start
    ```
    Note: For production, ensure your Genkit flows are deployed and accessible. The current setup uses a local Genkit dev server. For a production deployment, you would typically deploy Genkit flows to a cloud environment (e.g., Firebase, Google Cloud Functions).

## 🧠 Core Logic: Prompt Customization Flow

The heart of the application is the `customizeAIPromptFlow` defined in `src/ai/flows/customize-ai-prompts.ts`. When a user submits a prompt for generation, the following steps occur:

1.  **Input Collection**: The UI collects:
    *   `promptTemplate`: The base prompt with `{{variable}}` placeholders.
    *   `variables`: Key-value pairs to substitute into the template.
    *   `role`: The desired persona for the AI.

2.  **Internal Prompt Optimization (`promptOptimizerGenkitPrompt`)**:
    *   The `promptTemplate` and `aiRole` are sent to a dedicated Genkit prompt.
    *   This prompt instructs an LLM (Gemini) to act as a "prompt engineer."
    *   Its task is to refine the `promptTemplate` into a `refinedPromptBody`. This involves clarifying the task, making requirements explicit, and structuring instructions, while preserving placeholders and *without* adding "Act as..." since the role is handled later.
    *   The temperature for this optimizer step is set lower (e.g., 0.4) for more consistent, structured output.

3.  **Variable Substitution**:
    *   The user-provided `variables` are injected into the `refinedPromptBody` (or the original `promptTemplate` if optimization fails). Placeholders like `{{variable_name}}` are replaced with their corresponding values.

4.  **Final Execution (`finalExecutionGenkitPrompt`)**:
    *   The fully processed prompt body (optimized and with variables filled) is combined with the user-selected `aiRole`.
    *   A final Genkit prompt is constructed: `{{#if role}}Act as a {{role}}.{{/if}}\n\n{{{finalFilledOptimizedPromptBody}}}`.
    *   This prompt is sent to the LLM (Gemini) to generate the final AI response.
    *   This step uses default or slightly higher temperature settings (e.g., 0.7) for more creative or diverse outputs.

5.  **Output Display**: The result from the final execution is displayed to the user.

This multi-step process, especially the internal optimization step, aims to enhance the quality and relevance of the AI-generated responses by first refining the user's initial prompt idea.

## 🔧 Key Components

-   **`PromptCustomizer` (`src/components/prompt-customizer.tsx`)**: Handles form inputs for template, variables, role, presets, and triggers the AI generation process.
-   **`ResponseDisplay` (`src/components/response-display.tsx`)**: Shows the AI's response, including a copy button.
-   **`ResponseActions` (`src/components/response-actions.tsx`)**: Allows users to rate the response and export it.
-   **`AppHeader` (`src/components/layout/app-header.tsx`)**: Contains the application title and theme toggle.

## ⚙️ Server Actions & Genkit

-   Client-side form submissions are handled by Server Actions defined in `src/lib/actions.ts`.
-   The `handleCustomizePrompt` server action calls the `customizeAIPromptFlow` Genkit flow.
-   Genkit flows (`src/ai/flows/customize-ai-prompts.ts`) use Zod for defining input and output schemas, ensuring type safety and clear contracts for the AI interactions.
-   Safety settings for Gemini are configured within the Genkit prompts to manage content generation.

## 🎨 Styling & Theme

-   The application uses Tailwind CSS for utility-first styling.
-   ShadCN UI provides a set of beautifully designed and accessible components.
-   Theme (colors, radius, etc.) is defined in `src/app/globals.css` using CSS HSL variables, allowing for easy customization and a dynamic light/dark mode toggle.

## 💡 Potential Future Enhancements

-   User authentication to save and manage prompts.
-   A history of generated prompts and responses.
-   More advanced parameter tuning (e.g., max tokens, frequency penalty).
-   Support for different LLM models or providers through Genkit.
-   Real-time streaming of AI responses.
-   More sophisticated parsing in the `promptOptimizerGenkitPrompt` to extract Role, Task, Requirements, and Instructions from the user's raw prompt if they are implicitly provided.
-   Ability for users to directly edit the four key elements (Role, Task, Requirements, Instructions) of a prompt before optimization or execution.

---

This README provides a comprehensive overview of the AI Prompt Studio application. If you have any questions or encounter issues, please refer to the code or open an issue in the repository.
