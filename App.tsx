
import React, { useMemo } from 'react';
import { useEscalaStore } from './hooks/useEscalaStore';
import { ViewMode } from './types';
import Sidebar from './components/Sidebar';
import ScheduleListView from './views/ScheduleListView';
import ScheduleCreateView from './views/ScheduleCreateView';
import ScheduleEditView from './views/ScheduleEditView';
import PeopleView from './views/PeopleView';
import RolesView from './views/RolesView';
import NotificationSettingsView from './views/NotificationSettingsView';

const App: React.FC = () => {
  const store = useEscalaStore();

  const activeSchedule = useMemo(() => 
    store.schedules.find(s => s.id === store.selectedScheduleId) || null
  , [store.schedules, store.selectedScheduleId]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      <style>{`
        @media print {
          nav, button, select, .print-hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; width: 100% !important; }
          .break-inside-avoid { break-inside: avoid; }
          body { background: white; }
          .bg-yellow-400 { background-color: #fbbf24 !important; -webkit-print-color-adjust: exact; }
          .bg-yellow-400\/10 { background-color: transparent !important; }
          .text-blue-600 { color: #2563eb !important; -webkit-print-color-adjust: exact; }
          .rounded-\[40px\] { border-radius: 8px !important; }
          table { width: 100% !important; border: 1px solid #e2e8f0 !important; }
          th, td { border: 1px solid #e2e8f0 !important; padding: 8px !important; }
        }
      `}</style>
      
      <Sidebar view={store.view} setView={store.setView} />

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        {store.view === ViewMode.SCHEDULE_LIST && (
          <ScheduleListView 
            schedules={store.schedules} 
            people={store.people} 
            roles={store.roles}
            onSelect={(id) => { store.setSelectedScheduleId(id); store.setView(ViewMode.SCHEDULE_EDIT); }}
            onCreate={() => store.setView(ViewMode.SCHEDULE_CREATE)}
            onDelete={store.deleteSchedule}
          />
        )}

        {store.view === ViewMode.SCHEDULE_CREATE && (
          <ScheduleCreateView 
            people={store.people} 
            roles={store.roles} 
            onBack={() => store.setView(ViewMode.SCHEDULE_LIST)}
            onCreate={store.createSchedule}
          />
        )}

        {store.view === ViewMode.SCHEDULE_EDIT && activeSchedule && (
          <ScheduleEditView 
            schedule={activeSchedule} 
            people={store.people} 
            roles={store.roles} 
            onBack={() => store.setView(ViewMode.SCHEDULE_LIST)}
            onUpdate={store.updateAssignment}
            onRegenerate={() => store.regenerateSchedule(activeSchedule.id)}
          />
        )}

        {store.view === ViewMode.PEOPLE && (
          <PeopleView 
            people={store.people} 
            onAdd={store.addPerson} 
            onDelete={store.deletePerson} 
          />
        )}

        {store.view === ViewMode.ROLES && (
          <RolesView 
            roles={store.roles} 
            onAdd={store.addRole} 
            onDelete={store.deleteRole} 
          />
        )}

        {store.view === ViewMode.NOTIFICATIONS && (
          <NotificationSettingsView 
            schedules={store.schedules}
          />
        )}
      </main>
    </div>
  );
};

export default App;
