
import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Input } from './pages/Input';
import { Tracker } from './pages/Tracker';
import { Plans } from './pages/Plans';
import { Profile } from './pages/Profile';
import { NavItem, SidebarItem, Logo } from './components/UI';
import { Home as HomeIcon, Plus, BarChart2, User as UserIcon, Activity } from 'lucide-react';

const AppContent = () => {
  const { user, loading } = useApp();
  const [currentPage, setCurrentPage] = useState('home');

  // Loading Screen
  if (loading) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
           <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
           <div className="h-4 w-32 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  // Common Wrapper
  return (
    <div className="h-[100dvh] w-full bg-gray-50 flex overflow-hidden font-sans selection:bg-gray-200">
      
      {/* Background Blobs (Global) */}
      <div className="fixed top-[-20%] right-[-20%] w-[80%] h-[50%] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-purple-100/30 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Desktop Sidebar (Only visible on md+ and when onboarded) */}
      {user && user.onboarded && (
        <div className="hidden md:flex flex-col w-64 h-full bg-white/80 backdrop-blur-xl border-r border-gray-200 p-6 z-50 relative shrink-0">
            <div className="mb-10 pl-2">
                <Logo />
            </div>
            
            <div className="space-y-2 flex-1">
                <SidebarItem Icon={HomeIcon} label="Home" active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
                <SidebarItem Icon={Activity} label="Analysis" active={currentPage === 'tracker'} onClick={() => setCurrentPage('tracker')} />
                <SidebarItem Icon={BarChart2} label="Plans" active={currentPage === 'plans'} onClick={() => setCurrentPage('plans')} />
                <SidebarItem Icon={UserIcon} label="Profile" active={currentPage === 'profile'} onClick={() => setCurrentPage('profile')} />
            </div>

            <button 
                onClick={() => setCurrentPage('input')}
                className="mt-auto w-full py-4 bg-black text-white rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95"
            >
                <Plus size={20} /> Log Meal
            </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 h-full relative overflow-y-auto no-scrollbar scroll-smooth z-10">
        
        {(!user || !user.onboarded) ? (
            // Onboarding Wrapper
            <div className="min-h-full flex items-center justify-center p-0 md:p-8">
                <div className="w-full h-full md:h-auto md:max-w-md md:aspect-[9/16] md:max-h-[850px] bg-white md:rounded-[40px] md:shadow-2xl overflow-hidden relative">
                     <Onboarding />
                </div>
            </div>
        ) : (
            // App Pages Wrapper
            <div className="pt-safe pb-28 md:pb-8 md:pt-8 min-h-full px-0 md:px-8 max-w-7xl mx-auto">
                {(() => {
                    switch (currentPage) {
                      case 'home': return <Home onNavigate={setCurrentPage} />;
                      case 'input': return <Input onBack={() => setCurrentPage('home')} onComplete={() => setCurrentPage('home')} />;
                      case 'tracker': return <Tracker />;
                      case 'plans': return <Plans onBack={() => setCurrentPage('home')} />;
                      case 'profile': return <Profile />;
                      default: return <Home onNavigate={setCurrentPage} />;
                    }
                })()}
            </div>
        )}

        {/* Mobile Navigation (Floating) */}
        {user && user.onboarded && currentPage !== 'input' && (
            <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto">
              <div className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-3xl px-6 py-4 flex justify-between items-center transition-all">
                <NavItem Icon={HomeIcon} label="Home" active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
                <NavItem Icon={Activity} label="Analysis" active={currentPage === 'tracker'} onClick={() => setCurrentPage('tracker')} />
                
                {/* Center Action Button */}
                <button 
                    onClick={() => setCurrentPage('input')}
                    className="w-14 h-14 flex-shrink-0 aspect-square bg-black/90 backdrop-blur-md rounded-full shadow-lg shadow-gray-400/50 flex items-center justify-center text-white transition-transform active:scale-95 -mt-8 border-[3px] border-white"
                >
                    <Plus size={28} strokeWidth={2.5} />
                </button>
                
                <NavItem Icon={BarChart2} label="Plans" active={currentPage === 'plans'} onClick={() => setCurrentPage('plans')} />
                <NavItem Icon={UserIcon} label="Profile" active={currentPage === 'profile'} onClick={() => setCurrentPage('profile')} />
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
