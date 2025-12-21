
import React, { useState } from 'react';
import { generateOnboardingProfile } from '../geminiService';
import { useApp } from '../AppContext';
import { Button, InputField, Logo } from '../components/UI';
import { Loader2, ArrowRight, ArrowLeft, Target, Ruler, Zap, ShieldCheck, Heart, Smile, Droplets, Users, Check, PieChart, Download } from 'lucide-react';
import { UserProfile } from '../types';

const GENDERS = ['Male', 'Female', 'Other'];

const GOAL_OPTIONS = [
  { id: 'growth', label: 'Healthy height & growth', icon: Ruler },
  { id: 'bones', label: 'Strong teeth & bones', icon: Smile },
  { id: 'immunity', label: 'Boost immunity', icon: ShieldCheck },
  { id: 'anemia', label: 'Prevent anemia & fatigue', icon: Droplets },
  { id: 'pregnancy', label: 'Healthy pregnancy', icon: Heart },
  { id: 'brain', label: 'Brain development', icon: Zap },
  { id: 'diversity', label: 'Nutrient diversity', icon: PieChart },
  { id: 'family', label: 'Family & child health', icon: Users },
];

const TRANSLATIONS = {
    English: {
        welcomeTitle: "Let's get started",
        welcomeSubtitle: "Personalize your nutrition plan to prevent deficiency.",
        firstName: "First Name",
        language: "Language",
        continue: "Continue",
        install: "Install App",
        bodyStats: "Your Body Stats",
        bodyStatsSubtitle: "We use this to calculate specific nutrient needs.",
        age: "Age",
        gender: "Gender",
        weight: "Weight (kg)",
        height: "Height (cm)",
        yourGoals: "Your Goals",
        goalsSubtitle: "Select all that apply to you.",
        createPlan: "Create My Plan"
    },
    Kinyarwanda: {
        welcomeTitle: "Dutangire",
        welcomeSubtitle: "Tegura gahunda yawe yo kurya neza wirinde imirire mibi.",
        firstName: "Izina",
        language: "Ururimi",
        continue: "Komeza",
        install: "Manura App",
        bodyStats: "Ibipimo byawe",
        bodyStatsSubtitle: "Tubikoresha kubara intungamubiri ukeneye.",
        age: "Imyaka",
        gender: "Igitsina",
        weight: "Ibiro (kg)",
        height: "Uburebure (cm)",
        yourGoals: "Intego Zawe",
        goalsSubtitle: "Hitamo ibihuye nawe.",
        createPlan: "Kora Gahunda Yanjye"
    },
    French: {
        welcomeTitle: "Commençons",
        welcomeSubtitle: "Personnalisez votre plan nutritionnel pour éviter les carences.",
        firstName: "Prénom",
        language: "Langue",
        continue: "Continuer",
        install: "Installer l'app",
        bodyStats: "Vos Statistiques",
        bodyStatsSubtitle: "Nous les utilisons pour calculer vos besoins.",
        age: "Âge",
        gender: "Genre",
        weight: "Poids (kg)",
        height: "Taille (cm)",
        yourGoals: "Vos Objectifs",
        goalsSubtitle: "Sélectionnez tout ce qui s'applique.",
        createPlan: "Créer Mon Plan"
    }
};

export const Onboarding = () => {
  const { setUser, installPrompt, installApp } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: 25,
    weight: 70,
    height: 170,
    gender: 'Female' as UserProfile['gender'],
    goals: [] as string[],
    language: 'English' as UserProfile['language']
  });

  const t = TRANSLATIONS[formData.language] || TRANSLATIONS['English'];

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const toggleGoal = (goalLabel: string) => {
    setFormData(prev => {
      if (prev.goals.includes(goalLabel)) {
        return { ...prev, goals: prev.goals.filter(g => g !== goalLabel) };
      } else {
        return { ...prev, goals: [...prev.goals, goalLabel] };
      }
    });
  };

  const handleFinish = async () => {
    setLoading(true);
    const profile = await generateOnboardingProfile(
      formData.age,
      formData.weight,
      formData.height,
      formData.gender,
      formData.goals
    );

    setUser({
      ...formData,
      dailyCalories: profile.dailyCalories,
      dailyMacros: {
        protein: profile.protein,
        carbs: profile.carbs,
        fats: profile.fats
      },
      dailyMicros: {
        iron: profile.iron,
        vitaminA: profile.vitaminA,
        zinc: profile.zinc,
        calcium: profile.calcium,
        folate: profile.folate,
        iodine: profile.iodine
      },
      onboarded: true
    });
    setLoading(false);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex flex-col h-full justify-center space-y-8 animate-fade-in p-2">
            <div className="space-y-4">
                <div className="mb-6">
                    <Logo size="large" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.welcomeTitle}</h2>
                <p className="text-gray-800 font-medium opacity-80">{t.welcomeSubtitle}</p>
            </div>
            
            <InputField
              label={t.firstName}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Keza"
            />
            
             <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 ml-1">{t.language}</label>
              <div className="grid grid-cols-3 gap-3">
                {['English', 'Kinyarwanda', 'French'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setFormData({ ...formData, language: lang as any })}
                    className={`p-3 rounded-2xl text-sm font-semibold transition-all backdrop-blur-md ${
                      formData.language === lang
                        ? 'bg-black text-white shadow-lg shadow-black/10'
                        : 'bg-white/40 text-gray-800 hover:bg-white/60 border border-white/20'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Persistent Install Card */}
            <div className="fixed bottom-24 left-6 right-6 z-50 bg-white/80 backdrop-blur-xl border border-white/50 p-4 rounded-3xl flex items-center justify-between shadow-2xl animate-bounce-slow">
                <div>
                    <p className="text-indigo-900 font-bold text-sm">Get the App</p>
                    <p className="text-indigo-800 text-xs opacity-80">Install for offline use</p>
                </div>
                {installPrompt ? (
                    <button onClick={installApp} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform">
                        <Download size={14}/> {t.install}
                    </button>
                ) : (
                    <button disabled className="bg-green-50 text-green-700 border border-green-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 opacity-80">
                        <Check size={14}/> Installed
                    </button>
                )}
            </div>

            <div className="pt-8">
                <Button onClick={handleNext} disabled={!formData.name}>{t.continue} <ArrowRight size={18}/></Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col h-full justify-center space-y-8 animate-fade-in p-2">
             <div className="space-y-2">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-black/10">
                    <Ruler size={24} />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.bodyStats}</h2>
                <p className="text-gray-800 font-medium opacity-80">{t.bodyStatsSubtitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <InputField
                label={t.age}
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
              />
               <div className="col-span-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2 ml-1">{t.gender}</label>
                <div className="relative">
                    <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value as UserProfile['gender']})}
                        className="w-full px-5 py-4 rounded-2xl bg-white/50 backdrop-blur-sm border-0 text-gray-900 font-medium appearance-none outline-none focus:ring-2 focus:ring-black/5"
                    >
                        {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <ArrowRight size={16} className="rotate-90" />
                    </div>
                </div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
                 <InputField
                label={t.weight}
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
              />
              <InputField
                label={t.height}
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
              />
            </div>
            <div className="flex gap-4 pt-8">
                <Button variant="ghost" onClick={handleBack} className="w-auto px-0 bg-white/20 hover:bg-white/40"><ArrowLeft size={20}/></Button>
                <Button onClick={handleNext}>{t.continue} <ArrowRight size={18}/></Button>
            </div>
          </div>
        );
      case 3: // Goals - Mobile Scrolling Fix & Glass UI
        return (
          <div className="animate-fade-in flex flex-col h-full overflow-hidden">
             {/* Fixed Header */}
             <div className="space-y-2 flex-shrink-0 mb-4 pt-2 px-2">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-black/10">
                    <Target size={24} />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{t.yourGoals}</h2>
                <p className="text-gray-800 font-medium opacity-80">{t.goalsSubtitle}</p>
            </div>

            {/* Scrollable Middle Content - Flex-1 ensures it fills space between header and footer */}
            <div className="flex-1 overflow-y-auto no-scrollbar min-h-0 px-2 pb-6">
                <div className="grid grid-cols-2 gap-3">
                  {GOAL_OPTIONS.map((goal) => {
                    const isSelected = formData.goals.includes(goal.label);
                    const Icon = goal.icon;
                    return (
                        <button
                          key={goal.id}
                          onClick={() => toggleGoal(goal.label)}
                          className={`p-4 rounded-3xl border text-left transition-all duration-300 flex flex-col justify-between h-36 relative overflow-hidden group ${
                            isSelected
                              ? 'border-black/50 bg-black text-white shadow-xl shadow-black/20 scale-[1.02]'
                              : 'border-white/10 bg-white/40 backdrop-blur-xl text-gray-800 hover:bg-white/60 shadow-lg shadow-emerald-900/5'
                          }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${isSelected ? 'bg-white/20' : 'bg-white/60 backdrop-blur-sm shadow-sm'}`}>
                                <Icon size={20} className={isSelected ? 'text-white' : 'text-gray-900'} />
                            </div>
                            <span className={`font-bold text-sm leading-tight pr-2 ${isSelected ? 'text-white' : 'text-gray-900'}`}>{goal.label}</span>
                            
                            {isSelected && (
                                <div className="absolute top-3 right-3 bg-white text-black rounded-full p-0.5 animate-scale-in">
                                    <Check size={12} strokeWidth={4} />
                                </div>
                            )}
                        </button>
                    );
                  })}
                </div>
            </div>

             {/* Fixed Footer ("Fixed on sky") */}
             <div className="flex gap-4 pt-4 pb-0 flex-shrink-0 z-20 px-2 bg-gradient-to-t from-lime-300/20 to-transparent">
                <Button variant="ghost" onClick={handleBack} className="w-auto px-0 bg-white/20 hover:bg-white/40 backdrop-blur-md"><ArrowLeft size={20}/></Button>
                <Button onClick={handleFinish} disabled={loading || formData.goals.length === 0} className="shadow-xl shadow-black/10">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : t.createPlan}
                </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    // Enforce full height of viewport for mobile scrolling consistency
    <div className="h-full w-full p-6 pb-safe flex flex-col max-w-md mx-auto">
        <div className="mb-6 flex gap-2 flex-shrink-0 z-10 px-2">
            {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-black' : 'bg-black/10'}`} />
            ))}
        </div>
        
        {/* Step Content Container */}
        <div className="flex-1 min-h-0 relative z-10">
            {renderStep()}
        </div>
    </div>
  );
};
