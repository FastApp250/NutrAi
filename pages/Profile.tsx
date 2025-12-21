import React from 'react';
import { useApp } from '../AppContext';
import { Button, Card } from '../components/UI';
import { User, LogOut, Settings, Award } from 'lucide-react';

export const Profile = () => {
  const { user, clearSession } = useApp();

  if (!user) return null;

  return (
    <div className="p-6 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <button className="p-2 bg-gray-100 rounded-full text-gray-600"><Settings size={20}/></button>
      </div>

      <div className="flex items-center gap-5">
        <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-gray-200">
            {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mt-1">
                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">{user.age} yrs</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">{user.weight} kg</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center justify-center py-6 gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{user.dailyCalories}</span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Daily Goal</span>
        </Card>
        <Card className="flex flex-col items-center justify-center py-6 gap-2 bg-green-50 border-green-100">
            <Award className="text-green-600 mb-1" size={28}/>
            <span className="text-xs font-bold text-green-700 uppercase tracking-wide text-center px-2 truncate w-full">
                {user.goals && user.goals.length > 0 ? user.goals[0] : 'General Health'}
            </span>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider ml-1 mb-2">Settings</h3>
        <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-gray-100">
                <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-gray-700">Language</span>
                    <span className="text-sm font-semibold text-gray-900">{user.language}</span>
                </div>
                <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-gray-700">Notifications</span>
                    <div className="w-10 h-6 bg-green-500 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                </div>
            </div>
        </Card>
      </div>

      <Button variant="danger" onClick={clearSession} className="bg-red-50 text-red-600 hover:bg-red-100 shadow-none">
          <LogOut size={18} /> Sign Out
      </Button>
      
      <p className="text-center text-[10px] text-gray-400 font-medium">NutrAi v1.0.2 • Rwanda</p>
    </div>
  );
};