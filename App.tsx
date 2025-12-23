
import React, { useState, useEffect, useRef } from 'react';
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
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      
      if (scrollTop > lastScrollTop.current && scrollTop > 50) {
        // Scrolling down
        setIsScrollingDown(true);
      } else if (scrollTop < lastScrollTop.current) {
        // Scrolling up
        setIsScrollingDown(false);
      }
      
      lastScrollTop.current = scrollTop;
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

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
  // Removed vibrant gradient. Using a subtle off-white/gray gradient to allow glassmorphism to still have depth.
  return (
    <div className="h-[100dvh] w-full bg-gradient-to-b from-gray-50 to-gray-100 sm:max-w-md sm:mx-auto sm:border-x sm:border-gray-200 relative shadow-2xl flex flex-col overflow-hidden text-gray-900 font-sans selection:bg-gray-200">
      
      {/* Very subtle background blobs to maintain depth for glass effects without color intensity */}
      <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-purple-100/30 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Conditional Rendering: Onboarding vs Main App */}
      {(!user || !user.onboarded) ? (
        // Onboarding takes full control of the layout
        <div className="flex-1 w-full h-full overflow-hidden relative z-10">
            <Onboarding />
        </div>
      ) : (
        // Main App Layout
        <>
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-10">
            <div className="pt-safe pb-28 min-h-full">
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
          </div>

          {/* Floating Glass Navbar */}
          <div className="absolute bottom-0 left-0 right-0 z-50 pb-safe">
            <div className={`bg-white border-t border-gray-200 px-4 py-3 flex items-center relative ${
              currentPage === 'input' ? 'justify-around gap-4' : 'justify-between'
            }`}>
              <NavItem Icon={HomeIcon} label="Dashboard" active={currentPage === 'home'} onClick={() => setCurrentPage('home')} />
              <NavItem Icon={Activity} label="Meals" active={currentPage === 'tracker'} onClick={() => setCurrentPage('tracker')} />
              
              {/* Center Action Button */}
              <button 
                  onClick={() => setCurrentPage(currentPage === 'input' ? 'home' : 'input')}
                  className={`w-14 h-14 flex-shrink-0 aspect-square bg-black rounded-full flex items-center justify-center text-white transition-all duration-300 ease-out active:scale-95 ${
                    currentPage === 'input' ? '-top-7' : 'mx-6'
                  } ${
                    isScrollingDown && currentPage !== 'input' ? 'scale-0 rotate-180' : 'scale-100 rotate-0'
                  }`}
              >
                  <Plus size={28} strokeWidth={2.5} className={`transition-transform duration-300 ${currentPage === 'input' ? 'rotate-45' : 'rotate-0'}`} />
              </button>
              
              <NavItem Icon={BarChart2} label="Meal Plan" active={currentPage === 'plans'} onClick={() => setCurrentPage('plans')} />
              <NavItem Icon={UserIcon} label="Progress" active={currentPage === 'profile'} onClick={() => setCurrentPage('profile')} />
            </div>
          </div>
        </>
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
