
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, MealLog, HealthAudit } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_TEXT = 'gemini-3-flash-preview';
const MODEL_VISION = 'gemini-3-flash-preview'; 

export const generateOnboardingProfile = async (
  age: number,
  weight: number,
  height: number,
  gender: string,
  goals: string[]
): Promise<{ dailyCalories: number; protein: number; carbs: number; fats: number; iron: number; vitaminA: number; zinc: number; calcium: number; folate: number; iodine: number; message: string }> => {
  try {
    const prompt = `
      Act as a professional nutritionist specializing in Rwandan health and malnutrition prevention.
      Calculate the nutritional needs for a person with:
      - Age: ${age}
      - Weight: ${weight} kg
      - Height: ${height} cm
      - Gender: ${gender}
      - Goals: ${goals.join(", ")}

      1. Calculate Daily Calories & Macros (Protein, Carbs, Fats).
      2. Calculate critical Micronutrient targets specifically to prevent malnutrition (Iron, Vitamin A, Zinc, Calcium, Folate, Iodine).
      3. Provide a short, motivating welcome message (max 2 sentences).
    `;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dailyCalories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
            iron: { type: Type.NUMBER, description: "Iron target in mg" },
            vitaminA: { type: Type.NUMBER, description: "Vitamin A target in mcg" },
            zinc: { type: Type.NUMBER, description: "Zinc target in mg" },
            calcium: { type: Type.NUMBER, description: "Calcium target in mg" },
            folate: { type: Type.NUMBER, description: "Folate target in mcg" },
            iodine: { type: Type.NUMBER, description: "Iodine target in mcg" },
            message: { type: Type.STRING },
          },
          required: ["dailyCalories", "protein", "carbs", "fats", "iron", "vitaminA", "zinc", "calcium", "folate", "iodine", "message"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Onboarding Error:", error);
    // Fallback defaults for an average adult
    return {
      dailyCalories: 2000,
      protein: 60,
      carbs: 250,
      fats: 70,
      iron: 18,
      vitaminA: 900,
      zinc: 11,
      calcium: 1000,
      folate: 400,
      iodine: 150,
      message: "Welcome! Let's focus on a balanced Rwandan diet.",
    };
  }
};

export const analyzeMeal = async (
  imageBase64: string | null,
  description: string,
  userProfile?: UserProfile | null
): Promise<{ 
  isFood: boolean;
  message?: string;
  name: string; 
  calories: number; 
  protein: number; 
  carbs: number; 
  fats: number; 
  iron: number;
  vitaminA: number;
  zinc: number;
  calcium: number;
  folate: number;
  iodine: number;
  suggestions: string[];
  alerts: string[];
  missing: string[];
  riskSeverity: 'Low' | 'Medium' | 'High';
}> => {
  try {
    const parts: any[] = [];
    
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: "image/png",
        },
      });
    }

    let promptText = `Analyze this image/text. `;
    if (description) promptText += `Description: "${description}". `;
    if (userProfile) promptText += `User Context: Rwandan, ${userProfile.age}y/o, Goals: ${userProfile.goals.join(", ")}. `;
    
    promptText += `
      1. CRITICAL: First check if the image/text represents FOOD or a MEAL.
      2. If it is NOT food (e.g. a selfie, a car, a landscape, generic object), set "isFood" to false, "message" to "This does not look like a meal", and fill other numeric fields with 0.
      3. If it IS food, set "isFood" to true.
      4. Identify the main dish (use local Rwandan names if applicable, e.g., Isombe, Ugali, Dodo).
      5. Estimate Calories and Macros (Protein, Carbs, Fats).
      6. CRITICAL: Estimate Micronutrients (Iron, Vit A, Zinc, Calcium, Folate, Iodine). If unknown, estimate based on ingredients (e.g., Dodo/Spinach = high Iron/Vit A).
      7. Provide 3 specific suggestions to improve nutrient density relative to the user's goals (e.g., "Add lemon to greens to absorb iron").
      8. Provide alerts if the meal is significantly low in key nutrients or high in unhealthy fats/sugar.
      9. List specific food groups or nutrients MISSING from this meal that make it incomplete (e.g. "Missing vegetables", "No protein source").
      10. Assess Risk Severity: "High" if the meal is extremely unbalanced or deficient for the user, "Medium" if average, "Low" if healthy.
    `;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: MODEL_VISION,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isFood: { type: Type.BOOLEAN, description: "True if image is food, False otherwise" },
            message: { type: Type.STRING, description: "Error message if not food" },
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
            iron: { type: Type.NUMBER },
            vitaminA: { type: Type.NUMBER },
            zinc: { type: Type.NUMBER },
            calcium: { type: Type.NUMBER },
            folate: { type: Type.NUMBER },
            iodine: { type: Type.NUMBER },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            alerts: { type: Type.ARRAY, items: { type: Type.STRING } },
            missing: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of missing food groups" },
            riskSeverity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          },
          required: ["isFood", "name", "calories", "protein", "carbs", "fats", "iron", "vitaminA", "suggestions", "missing", "riskSeverity"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      isFood: true, // Fallback to allow manual entry if AI fails
      name: "Unknown Meal",
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      iron: 0,
      vitaminA: 0,
      zinc: 0,
      calcium: 0,
      folate: 0,
      iodine: 0,
      suggestions: ["Could not analyze meal. Please try again."],
      alerts: [],
      missing: [],
      riskSeverity: 'Low'
    };
  }
};

export const generateDailyTip = async (goals: string[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: `Give me a single, short (under 20 words) nutrition tip for a Rwandan user. Focus on their goals: ${goals.join(", ")}. Prioritize local foods.`,
    });
    return response.text || "Eat orange sweet potatoes for Vitamin A!";
  } catch (e) {
    return "Add lemon to your greens to help absorb more Iron.";
  }
};

export const generateMealPlan = async (user: UserProfile): Promise<any> => {
  try {
    const prompt = `
      Create a 1-day meal plan for a user in Rwanda to prevent malnutrition.
      User: ${user.age} years old, Goals: ${user.goals.join(", ")}.
      Focus on nutrient-dense local foods (Isombe, Amaranth, Small fish, Beans).
      Include Breakfast, Lunch, Dinner, and Snack.
      Return JSON.
    `;
    
    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
         responseMimeType: "application/json",
         responseSchema: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              meals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ["Breakfast", "Lunch", "Dinner", "Snack"] },
                    description: { type: Type.STRING },
                    calories: { type: Type.NUMBER }
                  }
                }
              }
            }
         }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const generateHealthAudit = async (user: UserProfile, logs: MealLog[]): Promise<HealthAudit | null> => {
  try {
    // Summarize logs for token efficiency
    const logSummary = logs.map(l => ({
      name: l.name,
      cal: l.calories,
      iron: l.micros?.iron,
      vitA: l.micros?.vitaminA,
      zinc: l.micros?.zinc,
      date: new Date(l.timestamp).toDateString()
    }));

    const prompt = `
      Analyze the eating habits of this Rwandan user based on their recent meal logs to detect malnutrition risks.
      
      User Profile:
      - Age: ${user.age}, Gender: ${user.gender}
      - Daily Targets: Iron ${user.dailyMicros.iron}mg, Vit A ${user.dailyMicros.vitaminA}mcg, Zinc ${user.dailyMicros.zinc}mg.
      - Goals: ${user.goals.join(', ')}

      Recent Logs (Last 7 days):
      ${JSON.stringify(logSummary)}

      Task:
      1. Determine a Risk Level (Low, Medium, High) based on how often they miss micronutrient targets (especially Iron and Vit A).
      2. Calculate an Overall Health Score (0-100).
      3. Identify MISSING nutrients (e.g. "Low Iron", "Low Protein").
      4. If Risk is Medium or High, provide serious WARNINGS (e.g. "Risk of Anemia detected").
      5. Provide concrete food recommendations available in Rwanda to fix these gaps (e.g. "Eat more small fish/indagara for calcium").

      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            overallScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingNutrients: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["riskLevel", "overallScore", "summary", "warnings", "missingNutrients", "recommendations"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as HealthAudit;

  } catch (error) {
    console.error("Health Audit Error:", error);
    return null;
  }
};
