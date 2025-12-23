
import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { generateDailyTip, generateNotificationTip } from '../geminiService';
import { Card, Button, Logo } from '../components/UI';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Plus, Flame, Sparkles, ChevronRight, Utensils, Droplets, Zap, ShieldCheck, Download } from 'lucide-react';
import { format } from 'date-fns';

export const Home = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { user, logs, installPrompt, installApp } = useApp();
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

  // Daily Tip Generation (General)
  useEffect(() => {
    if (user?.goals) {
      generateDailyTip(user.goals).then(setTip);
    }
  }, [user]);

  // Push Notification Logic (Progress-based)
  useEffect(() => {
    const triggerNotification = async () => {
        if (!user) return;
        
        // Check if we already notified today
        const lastNotifDate = localStorage.getItem('nitrai_last_notif_date');
        const todayStr = new Date().toDateString();
        
        if (lastNotifDate === todayStr) {
            return;
        }

        if (!("Notification" in window)) {
            return;
        }

        const send = async () => {
             const notificationBody = await generateNotificationTip(user, logs);
             try {
                new Notification("NitrAi Daily Update", {
                    body: notificationBody,
                    icon: "https://cdn-icons-png.flaticon.com/512/4264/4264818.png"
                });
                localStorage.setItem('nitrai_last_notif_date', todayStr);
             } catch (e) {
                console.error("Notification failed", e);
             }
        };

        if (Notification.permission === "granted") {
            setTimeout(send, 3000);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    send();
                }
            });
        }
    };

    triggerNotification();
  }, [user, logs]);

  if (!user) return null;

  return (
    <div className="px-6 md:px-0 space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex justify-between items-center pt-2 md:pt-0">
        <div className="md:hidden flex items-center gap-3">
            <Logo size="small" />
             {installPrompt && (
                <button onClick={installApp} className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center text-black border border-black/5 cursor-pointer hover:bg-black/10 transition-all animate-pulse shadow-sm">
                    <Download size={16} />
                </button>
            )}
        </div>
        <div className="hidden md:block">
             <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
                <h3 className="text-sm font-bold text-gray-900">{user.name}</h3>
                <p className="text-xs text-gray-400">{format(new Date(), 'EEEE, d MMM')}</p>
             </div>
             <div onClick={() => onNavigate('profile')} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 font-bold border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors">
                {user.name.charAt(0).toUpperCase()}
             </div>
        </div>
      </div>

      <div className="md:hidden mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Hello, {user.name.split(' ')[0]}</h1>
            <p className="text-sm font-medium text-gray-400">{format(new Date(), 'EEEE, d MMM')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Score & Insight */}
          <div className="space-y-6">
              {/* Score Card */}
              <div className="bg-white rounded-[40px] p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Flame size={100} />
                </div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 z-10">Daily Nutrition Score</h3>
                <div className="h-56 w-56 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                innerRadius={70}
                                outerRadius={90}
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
                        <span className="text-xs font-bold text-gray-400 uppercase">Points</span>
                    </div>
                </div>
              </div>

              {/* AI Insight Pill */}
              <div className="bg-black text-white p-6 rounded-[30px] flex gap-5 items-center shadow-xl shadow-gray-200">
                <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm shrink-0">
                    <Sparkles size={24} className="text-yellow-300" />
                </div>
                <div>
                    <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider mb-1">AI Insight</h3>
                    <p className="text-sm font-medium leading-relaxed">{tip}</p>
                </div>
              </div>
          </div>

          {/* Column 2: Micronutrients */}
          <div className="space-y-4">
            <div className="flex justify-between items-baseline mb-2">
                 <h3 className="text-lg font-bold text-gray-900">Micronutrients</h3>
                 <span className="text-xs text-gray-400">Target Goals</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                {/* Iron */}
                <div className="bg-white p-5 rounded-[30px] border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
                    <div className="bg-red-50 p-3 rounded-full text-red-600"><Droplets size={24}/></div>
                    <div className="flex-1">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-bold text-gray-900">Iron</span>
                            <span className="text-xs font-semibold text-gray-400">{consumed.iron.toFixed(1)} / {targets.iron} mg</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{width: `${ironScore}%`}}></div>
                        </div>
                    </div>
                </div>
                
                {/* Vitamin A */}
                <div className="bg-white p-5 rounded-[30px] border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
                    <div className="bg-orange-50 p-3 rounded-full text-orange-600"><Zap size={24}/></div>
                    <div className="flex-1">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-bold text-gray-900">Vitamin A</span>
                            <span className="text-xs font-semibold text-gray-400">{Math.round(consumed.vitaminA)} / {targets.vitaminA} mcg</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full transition-all duration-1000" style={{width: `${vitAScore}%`}}></div>
                        </div>
                    </div>
                </div>
                
                {/* Zinc */}
                <div className="bg-white p-5 rounded-[30px] border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.02]">
                    <div className="bg-indigo-50 p-3 rounded-full text-indigo-600"><ShieldCheck size={24}/></div>
                    <div className="flex-1">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-bold text-gray-900">Zinc</span>
                            <span className="text-xs font-semibold text-gray-400">{consumed.zinc.toFixed(1)} / {targets.zinc} mg</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{width: `${zincScore}%`}}></div>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Column 3 (Desktop): Logs */}
          <div className="md:col-span-2 lg:col-span-1">
             <div className="flex justify-between items-end mb-6">
                <h3 className="text-lg font-bold text-gray-900">Today's Logs</h3>
                <span className="text-xs font-semibold text-gray-400">{Math.round(consumed.calories)} Kcal Eaten</span>
             </div>
             
             {todayLogs.length === 0 ? (
                 <div onClick={() => onNavigate('input')} className="text-center py-16 bg-white rounded-[30px] border border-dashed border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors h-64 flex flex-col items-center justify-center">
                     <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Plus size={28} />
                     </div>
                     <p className="text-gray-500 font-bold">Log your first meal</p>
                     <p className="text-xs text-gray-400 mt-1">Snap a photo or scan barcode</p>
                 </div>
             ) : (
                 <div className="space-y-4">
                     {todayLogs.map(log => (
                         <div key={log.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-md transition-shadow">
                             {log.image ? (
                                 <img src={`data:image/png;base64,${log.image.replace(/^data:image\/.+;base64,/, '')}`} alt={log.name} className="w-14 h-14 rounded-xl object-cover bg-gray-100" />
                             ) : (
                                 <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
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
    </div>
  );
};
