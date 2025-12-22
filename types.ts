
export interface Macros {
  protein: number;
  carbs: number;
  fats: number;
}

export interface Micros {
  iron: number; // mg
  vitaminA: number; // mcg
  zinc: number; // mg
  calcium: number; // mg
  folate: number; // mcg
  iodine: number; // mcg
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: 'Male' | 'Female' | 'Other';
  goals: string[]; // Changed from single goal to array
  language: 'English' | 'Kinyarwanda' | 'French';
  dailyCalories: number;
  dailyMacros: Macros;
  dailyMicros: Micros;
  onboarded: boolean;
}

export interface MealLog {
  id: string;
  timestamp: number;
  name: string;
  calories: number;
  macros: Macros;
  micros: Micros;
  image?: string; // base64
  notes?: string;
  ingredients?: string[]; // New: List of ingredients
  suggestions?: string[];
  alerts?: string[]; // Malnutrition risk alerts
  missing?: string[]; // New: List of missing food groups/nutrients
  riskSeverity?: 'Low' | 'Medium' | 'High'; // New: Severity of the meal's nutritional gap
}

export interface DailyPlan {
  day: string;
  meals: {
    type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
    description: string;
    calories: number;
  }[];
}

export interface HealthAudit {
  riskLevel: 'Low' | 'Medium' | 'High';
  overallScore: number; // 0-100
  summary: string;
  warnings: string[]; // Serious health warnings
  missingNutrients: string[]; // List of specific nutrients lacking
  recommendations: string[]; // Food-based recommendations
}

export interface DraftMeal {
  mode: 'initial' | 'camera' | 'barcode' | 'analyzing' | 'result';
  image: string | null;
  text: string;
  analysis: any | null;
}

export interface AppState {
  user: UserProfile | null;
  logs: MealLog[];
  plans: DailyPlan[];
  loading: boolean;
  draftMeal: DraftMeal | null;
}
