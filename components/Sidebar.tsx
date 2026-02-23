
import React from 'react';
import { Calendar, Users, Shield, LayoutGrid } from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  view: ViewMode;
  setView: (view: ViewMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView }) => {
  const NavItem = ({ mode, icon, label }: { mode: ViewMode, icon: React.ReactNode, label: string }) => {
    const active = view === mode || (mode === ViewMode.SCHEDULE_LIST && (view === ViewMode.SCHEDULE_EDIT || view === ViewMode.SCHEDULE_CREATE));
    return (
      <button 
        onClick={() => setView(mode)} 
        className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
      >
        <span className={active ? 'scale-110 transition-transform' : ''}>{icon}</span>
        <span className={`hidden lg:block text-sm font-bold tracking-tight ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
      </button>
    );
  };

  return (
    <nav className="w-full md:w-20 lg:w-64 bg-white border-r border-slate-200 p-4 flex md:flex-col gap-2 sticky top-0 z-50 shadow-sm print:hidden">
      <div className="hidden md:flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <Calendar size={20} />
        </div>
        <span className="hidden lg:block font-extrabold text-slate-800 text-lg tracking-tight">EscalaPro</span>
      </div>
      <NavItem mode={ViewMode.SCHEDULE_LIST} icon={<LayoutGrid size={22}/>} label="Escalas" />
      <NavItem mode={ViewMode.PEOPLE} icon={<Users size={22}/>} label="Pessoas" />
      <NavItem mode={ViewMode.ROLES} icon={<Shield size={22}/>} label="Funções" />
      <div className="flex-1" />
      <NavItem mode={ViewMode.NOTIFICATIONS} icon={<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>} label="Notificações" />
    </nav>
  );
};

export default Sidebar;
