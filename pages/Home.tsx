
import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { generateDailyTip } from '../geminiService';
import { Card, Button, Logo } from '../components/UI';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Plus, Flame, Sparkles, ChevronRight, Utensils, Droplets, Zap, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

export const Home = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { user, logs } = useApp();
  const [tip, setTip] = useState<string>("Loading insight...");

  // Calculate daily totals
  const todayLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      const today = new Date();
      return logDate.getDate() === today.getDate() && 
             logDate.getMonth() === today.getMonth() && 
             logDate.getFullYear() === today.getFullYear();
  });

  const consumed = todayLogs.reduce((acc, log) => ({
    calories: acc.calories + log.calories,
    iron: acc.iron + (log.micros?.iron || 0),
    vitaminA: acc.vitaminA + (log.micros?.vitaminA || 0),
    zinc: acc.zinc + (log.micros?.zinc || 0),
  }), { calories: 0, iron: 0, vitaminA: 0, zinc: 0 });

  // Calculate Nutrition Score based on Micronutrient completion
  const targets = {
    calories: user?.dailyCalories || 2000,
    iron: user?.dailyMicros?.iron || 18,
    vitaminA: user?.dailyMicros?.vitaminA || 900,
    zinc: user?.dailyMicros?.zinc || 11
  };

  const ironScore = Math.min(100, (consumed.iron / targets.iron) * 100);
  const vitAScore = Math.min(100, (consumed.vitaminA / targets.vitaminA) * 100);
  const zincScore = Math.min(100, (consumed.zinc / targets.zinc) * 100);
  
  const overallScore = Math.round((ironScore + vitAScore + zincScore) / 3);
  
  // Chart Data for Nutrition Score
  const chartData = [
    { name: 'Score', value: overallScore, color: '#000000' }, 
    { name: 'Remaining', value: 100 - overallScore, color: '#f3f4f6' }, 
  ];

  useEffect(() => {
    if (user?.goals) {
      generateDailyTip(user.goals).then(setTip);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="px-6 space-y-8 animate-fade-in">
      {/* Minimal Header */}
      <div className="flex justify-between items-center pt-2">
        <Logo size="small" />
        <div onClick={() => onNavigate('profile')} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 font-bold border border-gray-200 cursor-pointer">
            {user.name.charAt(0).toUpperCase()}
        </div>
      </div>

      <div className="mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Hello, {user.name.split(' ')[0]}</h1>
            <p className="text-sm font-medium text-gray-400">{format(new Date(), 'EEEE, d MMM')}</p>
      </div>

      {/* Main Nutrition Score Ring */}
      <div className="relative flex justify-center py-4">
        <div className="h-64 w-64 relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        innerRadius={80}
                        outerRadius={100}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={10}
                    >
                        {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-5xl font-extrabold tracking-tighter text-gray-900">{overallScore}</span>
                 <span className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-wider">Nutri Score</span>
            </div>
        </div>
      </div>

      {/* Micronutrient Progress Bars (Focus on Malnutrition Prevention) */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">Micronutrients</h3>
        <div className="grid grid-cols-1 gap-3">
             {/* Iron */}
             <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-red-50 p-2 rounded-full text-red-600"><Droplets size={20}/></div>
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold text-gray-900">Iron</span>
                        <span className="text-xs font-semibold text-gray-400">{consumed.iron.toFixed(1)} / {targets.iron} mg</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{width: `${ironScore}%`}}></div>
                    </div>
                </div>
             </div>
             
             {/* Vitamin A */}
             <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-orange-50 p-2 rounded-full text-orange-600"><Zap size={20}/></div>
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold text-gray-900">Vitamin A</span>
                        <span className="text-xs font-semibold text-gray-400">{Math.round(consumed.vitaminA)} / {targets.vitaminA} mcg</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{width: `${vitAScore}%`}}></div>
                    </div>
                </div>
             </div>
             
             {/* Zinc */}
             <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-indigo-50 p-2 rounded-full text-indigo-600"><ShieldCheck size={20}/></div>
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-bold text-gray-900">Zinc</span>
                        <span className="text-xs font-semibold text-gray-400">{consumed.zinc.toFixed(1)} / {targets.zinc} mg</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{width: `${zincScore}%`}}></div>
                    </div>
                </div>
             </div>
        </div>
      </div>

      {/* AI Insight Pill */}
      <div className="bg-black text-white p-5 rounded-3xl flex gap-4 items-center shadow-lg shadow-gray-200">
        <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-sm">
            <Sparkles size={18} className="text-yellow-300" />
        </div>
        <div>
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-0.5">AI Insight</h3>
            <p className="text-sm font-medium leading-snug">{tip}</p>
        </div>
      </div>

       {/* Meals List */}
       <div className="pb-12">
         <div className="flex justify-between items-end mb-4">
            <h3 className="text-lg font-bold text-gray-900">Today's Logs</h3>
            <span className="text-xs font-semibold text-gray-400">{Math.round(consumed.calories)} Kcal Eaten</span>
         </div>
         
         {todayLogs.length === 0 ? (
             <div onClick={() => onNavigate('input')} className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                 <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                    <Plus size={24} />
                 </div>
                 <p className="text-gray-500 font-medium text-sm">Log your first meal</p>
             </div>
         ) : (
             <div className="space-y-3">
                 {todayLogs.map(log => (
                     <div key={log.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                         {log.image ? (
                             <img src={`data:image/png;base64,${log.image.replace(/^data:image\/.+;base64,/, '')}`} alt={log.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                         ) : (
                             <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                 <Utensils size={20} />
                             </div>
                         )}
                         <div className="flex-1">
                             <h4 className="font-bold text-gray-900 text-sm">{log.name}</h4>
                             <p className="text-xs text-gray-500 font-medium">{format(new Date(log.timestamp), 'h:mm a')}</p>
                         </div>
                         <div className="text-right">
                             <span className="block font-bold text-gray-900">{log.calories}</span>
                             <span className="text-[10px] text-gray-400 uppercase font-bold">Kcal</span>
                         </div>
                     </div>
                 ))}
             </div>
         )}
       </div>
    </div>
  );
};
