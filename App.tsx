
import React, { useState } from 'react';
import { AppProvider, useApp } from './AppContext';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Input } from './pages/Input';
import { Tracker } from './pages/Tracker';
import { Plans } from './pages/Plans';
import { Profile } from './pages/Profile';
import { NavItem } from './components/UI';
import { Home as HomeIcon, Plus, BarChart2, User as UserIcon, Activity } from 'lucide-react';

const AppContent = () => {
  const { user, loading } = useApp();
  const [currentPage, setCurrentPage] = useState('home');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
           <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
           <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user || !user.onboarded) {
    return <Onboarding />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <Home onNavigate={setCurrentPage} />;
      case 'input': return <Input onBack={() => setCurrentPage('home')} onComplete={() => setCurrentPage('home')} />;
      case 'tracker': return <Tracker />;
      case 'plans': return <Plans onBack={() => setCurrentPage('home')} />;
      case 'profile': return <Profile />;
      default: return <Home onNavigate={setCurrentPage} />;
    }
  };

  // Modern apps often hide nav on modal-like pages
  const hideNav = currentPage === 'input';

  return (
    // Max width wrapper for desktop viewing, full width on mobile
    <div className="h-[100dvh] w-full bg-white sm:max-w-md sm:mx-auto sm:border-x sm:border-gray-100 relative shadow-2xl flex flex-col overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-[#fafafa]">
        <div className="pt-safe pb-24 min-h-full">
            {renderPage()}
        </div>
      </div>

      {/* Floating Bottom Navigation */}
      {!hideNav && (
        <div className="absolute bottom-6 left-4 right-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl px-6 py-4 flex justify-between items-center">
            <NavItem Icon={HomeIcon} label="Home" active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
            <NavItem Icon={Activity} label="Analysis" active={currentPage === 'tracker'} onClick={() => setCurrentPage('tracker')} />
            
            {/* Center Action Button */}
            <button 
                onClick={() => setCurrentPage('input')}
                className="w-14 h-14 bg-black rounded-full shadow-lg shadow-black/20 flex items-center justify-center text-white transition-transform active:scale-95 -mt-8 border-4 border-[#fafafa]"
            >
                <Plus size={28} strokeWidth={2.5} />
            </button>
            
            <NavItem Icon={BarChart2} label="Plans" active={currentPage === 'plans'} onClick={() => setCurrentPage('plans')} />
            <NavItem Icon={UserIcon} label="Profile" active={currentPage === 'profile'} onClick={() => setCurrentPage('profile')} />
          </div>
        </div>
      )}
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
