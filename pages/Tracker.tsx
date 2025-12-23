
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { generateHealthAudit } from '../geminiService';
import { Card, Button } from '../components/UI';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { TrendingUp, History, Droplets, Activity, AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';
import { HealthAudit } from '../types';

export const Tracker = () => {
  const { logs, user } = useApp();
  const [audit, setAudit] = useState<HealthAudit | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Prepare chart data for the last 7 days
  const data = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.getDate() === date.getDate() && 
             logDate.getMonth() === date.getMonth();
    });
    
    return {
      name: format(date, 'EEE'),
      calories: dayLogs.reduce((sum, log) => sum + log.calories, 0),
      iron: dayLogs.reduce((sum, log) => sum + (log.micros?.iron || 0), 0)
    };
  });

  const runAudit = async () => {
    if (!user || logs.length === 0) return;
    setLoadingAudit(true);
    const result = await generateHealthAudit(user, logs.slice(0, 20)); // Analyze last 20 logs
    setAudit(result);
    setLoadingAudit(false);
  };

  return (
    <div className="p-6 md:p-0 space-y-8 animate-fade-in pb-24">
      <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Health Tracker</h1>
      </div>

      {/* AI Health Audit Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <BrainCircuit size={20} className="text-indigo-600"/> AI Health Check
            </h3>
            {!audit && logs.length > 0 && (
                <Button onClick={runAudit} disabled={loadingAudit} className="w-auto py-2 px-4 text-xs h-auto bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200">
                    {loadingAudit ? 'Analyzing...' : 'Run Audit'}
                </Button>
            )}
        </div>

        {logs.length === 0 ? (
             <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-8 text-center">
                 <p className="text-gray-500 font-medium">Log at least one meal to unlock AI health analysis.</p>
             </div>
        ) : !audit ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white p-4 rounded-full shadow-sm text-indigo-600">
                    <Activity size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <p className="text-indigo-900 font-bold text-lg mb-1">
                        Get personalized health insights
                    </p>
                    <p className="text-indigo-700/80 text-sm">
                        Our AI checks for malnutrition risks and suggests dietary improvements based on your history.
                    </p>
                </div>
                {!loadingAudit && <div className="text-xs text-indigo-400 font-medium whitespace-nowrap">Tap 'Run Audit' to start</div>}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {/* Score Card */}
                <div className="flex gap-4 lg:col-span-1">
                    <Card className={`flex-1 p-5 border-2 flex flex-col justify-center ${audit.riskLevel === 'High' ? 'border-red-100 bg-red-50' : audit.riskLevel === 'Medium' ? 'border-orange-100 bg-orange-50' : 'border-green-100 bg-green-50'}`}>
                        <div className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">Risk Level</div>
                        <div className={`text-3xl font-extrabold ${audit.riskLevel === 'High' ? 'text-red-600' : audit.riskLevel === 'Medium' ? 'text-orange-600' : 'text-green-600'}`}>
                            {audit.riskLevel}
                        </div>
                    </Card>
                     <Card className="flex-1 p-5 border border-gray-100 flex flex-col justify-center">
                        <div className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Health Score</div>
                        <div className="text-3xl font-extrabold text-gray-900">{audit.overallScore}/100</div>
                    </Card>
                </div>

                {/* Summary & Missing */}
                <Card className="shadow-md lg:col-span-2">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-2">Analysis Summary</h4>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">{audit.summary}</p>
                            
                            {audit.riskLevel !== 'Low' && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-3 shadow-sm mb-4">
                                    <div className="flex items-center gap-2 text-red-700 font-bold mb-2 text-xs uppercase tracking-wide">
                                        <AlertTriangle size={14} /> Attention Needed
                                    </div>
                                    <ul className="space-y-1">
                                        {audit.warnings.map((warn, i) => (
                                            <li key={i} className="text-xs text-red-600 font-medium flex gap-2">
                                                <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                                {warn}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {audit.missingNutrients.length > 0 && (
                                <div className="mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Missing Nutrients</span>
                                    <div className="flex flex-wrap gap-2">
                                        {audit.missingNutrients.map((n, i) => (
                                            <span key={i} className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                                                {n}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 pt-4 md:pt-0">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-3">Recommended Foods</span>
                            <div className="space-y-3">
                                {audit.recommendations.map((rec, i) => (
                                    <div key={i} className="flex gap-3 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded-xl">
                                         <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0"/>
                                         {rec}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        )}
      </section>

      {/* Charts Section */}
      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mt-8">
         <Activity size={20} className="text-gray-500"/> Trends
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Micronutrient Trend - Critical for Malnutrition */}
          <Card className="border-none shadow-md bg-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider block mb-1">Critical Nutrient</span>
                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">Iron Intake (mg)</h3>
                </div>
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                    <Droplets size={20} />
                </div>
            </div>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{top: 10, right: 0, left: 0, bottom: 0}}>
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#9CA3AF', fontWeight: 500}} 
                            dy={10}
                        />
                        <Tooltip 
                            cursor={{fill: '#F9FAFB', radius: 8}} 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px'}} 
                            labelStyle={{display: 'none'}}
                        />
                        <Bar 
                            dataKey="iron" 
                            fill="#ef4444" 
                            radius={[6, 6, 6, 6]} 
                            barSize={24}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border-none shadow-md">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Weekly Trend</span>
                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">Calories</h3>
                </div>
                <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center">
                    <TrendingUp size={20} />
                </div>
            </div>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{top: 10, right: 0, left: 0, bottom: 0}}>
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fontSize: 12, fill: '#9CA3AF', fontWeight: 500}} 
                            dy={10}
                        />
                        <Tooltip 
                            cursor={{fill: '#F9FAFB', radius: 8}} 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px'}} 
                            labelStyle={{display: 'none'}}
                        />
                        <Bar 
                            dataKey="calories" 
                            fill="#000000" 
                            radius={[6, 6, 6, 6]} 
                            barSize={24}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </Card>
      </div>

      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 ml-1 flex items-center gap-2"><History size={14}/> Recent Logs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {logs.length === 0 ? (
                <div className="col-span-full">
                    <p className="text-center text-gray-400 py-10 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200">No history available.</p>
                </div>
            ) : (
                logs.slice(0, 10).map(log => (
                    <div key={log.id} className="bg-white p-5 rounded-3xl border border-gray-100 flex items-center gap-4 hover:shadow-sm transition-shadow">
                        <div className="bg-gray-50 text-gray-900 font-bold w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                            {format(new Date(log.timestamp), 'd MMM')}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 truncate">{log.name}</h4>
                            <p className="text-xs font-medium text-gray-400 mt-0.5">{format(new Date(log.timestamp), 'h:mm a')}</p>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-gray-900">{log.calories}</div>
                            {log.micros?.iron > 3 && (
                                <div className="text-[10px] text-red-500 font-bold flex items-center justify-end gap-1"><Droplets size={8}/> High Iron</div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};
