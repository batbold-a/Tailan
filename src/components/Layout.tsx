import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  CalendarRange, 
  CheckCircle2, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from './UI';
import { cn } from '../lib/utils';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/assignments', icon: ClipboardList, label: 'Assignments' },
    { to: '/plan', icon: CalendarRange, label: 'Plan' },
    { to: '/actual', icon: CheckCircle2, label: 'Actual' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                    <defs>
                      <linearGradient id="logoBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#004e92" />
                        <stop offset="100%" stopColor="#000428" />
                      </linearGradient>
                      <linearGradient id="logoGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#56ab2f" />
                        <stop offset="100%" stopColor="#a8e063" />
                      </linearGradient>
                    </defs>
                    {/* Slanted T Stem and Left Top (Blue) */}
                    <path 
                      d="M10,35 L55,35 L50,48 L42,48 L30,85 L15,85 L27,48 L15,48 Z" 
                      fill="url(#logoBlue)" 
                    />
                    {/* Curved Flourish (Green) */}
                    <path 
                      d="M52,85 L64,48 C66,38 75,35 90,35 L90,48 C80,48 78,52 76,60 L64,85 Z" 
                      fill="url(#logoGreen)" 
                    />
                  </svg>
                </div>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">Tailan</span>
              </div>
              
              <nav className="hidden md:flex items-center gap-1 ml-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => cn(
                      "flex items-center gap-2.5 px-5 py-2.5 rounded-[1.25rem] text-sm font-bold transition-all duration-300",
                      isActive 
                        ? "bg-indigo-50 text-indigo-700 shadow-sm" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/50"
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={cn("w-4 h-4", isActive ? "text-indigo-600" : "text-slate-400")} />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <button 
                className="md:hidden p-2 text-slate-600"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600'}
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} Tailan. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
