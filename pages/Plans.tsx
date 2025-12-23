import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { generateMealPlan } from '../geminiService';
import { Button, Card } from '../components/UI';
import { Loader2, ArrowLeft, RefreshCw, Sparkles, ChefHat } from 'lucide-react';

export const Plans = ({ onBack }: { onBack: () => void }) => {
  const { user } = useApp();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    const newPlan = await generateMealPlan(user);
    setPlan(newPlan);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in pb-24">
      <div className="flex items-center justify-between">
         <h2 className="text-2xl font-bold text-gray-900">Meal Plan</h2>
         <button onClick={handleGenerate} disabled={loading} className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin"/> : <RefreshCw size={18}/>}
         </button>
      </div>

      {!plan ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <ChefHat size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No plan yet</h3>
            <p className="text-gray-500 mb-8 px-8 text-sm leading-relaxed">Tap the button above to generate a day of meals customized for your goals.</p>
            <Button onClick={handleGenerate} disabled={loading} className="w-auto px-8 mx-auto">
                {loading ? "Thinking..." : "Generate with AI"}
            </Button>
        </div>
      ) : (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl p-6 text-white shadow-lg shadow-green-200">
                <div className="flex items-start justify-between mb-4">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">Today</span>
                    <Sparkles className="text-yellow-300 opacity-80" />
                </div>
                <h3 className="text-2xl font-bold mb-1">Your Custom Protocol</h3>
                <p className="opacity-80 text-sm font-medium">Focused on local Rwandan foods</p>
            </div>

            <div className="space-y-4">
                {plan.meals?.map((meal: any, idx: number) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{meal.type}</span>
                            <span className="text-sm font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded-md">{meal.calories} kcal</span>
                        </div>
                        <h4 className="font-semibold text-gray-800 text-lg leading-snug">{meal.description}</h4>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};