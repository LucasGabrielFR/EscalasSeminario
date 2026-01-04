
import React from 'react';
import { Plus, Calendar, Trash2, LayoutGrid } from 'lucide-react';
import { Schedule, Person, Role } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface ListProps {
  schedules: Schedule[];
  people: Person[];
  roles: Role[];
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

const ScheduleListView: React.FC<ListProps> = ({ schedules, people, roles, onSelect, onCreate, onDelete }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Suas Escalas</h1>
          <p className="text-slate-400 text-sm mt-1">Organização impecável em poucos cliques.</p>
        </div>
        <button 
          onClick={onCreate}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
        >
          <Plus size={20}/> Nova Escala
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedules.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-500"></div>
            <div className="relative z-10">
              <h3 className="font-bold text-slate-800 text-xl mb-1 truncate">{s.name}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6">
                {s.weeks.length} Semanas • {s.settings.daysOfWeek.length} Dias • {format(parseISO(s.createdAt), 'dd MMM yyyy', { locale: ptBR })}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => onSelect(s.id)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Gerenciar
                </button>
                <button 
                  onClick={() => onDelete(s.id)}
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          </div>
        ))}
        {schedules.length === 0 && (
          <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-200 rounded-[40px] text-slate-300">
            <Calendar size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">Comece criando uma nova escala.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleListView;
