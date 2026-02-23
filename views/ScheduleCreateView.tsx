
import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import { Person, Role } from '../types';

interface CreateProps {
  people: Person[];
  roles: Role[];
  onBack: () => void;
  onCreate: (settings: any, name: string) => void;
}

const ScheduleCreateView: React.FC<CreateProps> = ({ people, roles, onBack, onCreate }) => {
  const [newSched, setNewSched] = useState({
    name: `Escala ${new Date().toLocaleDateString()}`,
    weeks: 4,
    days: [1, 2, 3, 4, 5], 
    people: people.map(p => p.id),
    roles: roles.map(r => r.id)
  });

  const handleCreate = () => {
    onCreate({
      durationWeeks: newSched.weeks,
      daysOfWeek: newSched.days,
      personIds: newSched.people,
      roleIds: newSched.roles
    }, newSched.name);
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-8 hover:text-blue-600 transition-colors">
        <ArrowLeft size={16}/> Voltar
      </button>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Configurar Ciclo</h2>
      <p className="text-slate-400 mb-8 text-sm">Ajuste os parâmetros para a geração inteligente.</p>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Projeto</label>
          <input 
            className="w-full text-lg font-bold bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={newSched.name}
            onChange={e => setNewSched({...newSched, name: e.target.value})}
            placeholder="Ex: Escala Mensal Março"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semanas</label>
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl">
              <button onClick={() => setNewSched({...newSched, weeks: Math.max(1, newSched.weeks-1)})} className="p-3 bg-white rounded-xl shadow-sm"><ChevronLeft size={18}/></button>
              <span className="text-xl font-black text-blue-600">{newSched.weeks}</span>
              <button onClick={() => setNewSched({...newSched, weeks: newSched.weeks+1})} className="p-3 bg-white rounded-xl shadow-sm"><ChevronRight size={18}/></button>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dias Ativos</label>
            <div className="flex flex-wrap gap-2">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                <button
                  key={i}
                  onClick={() => setNewSched(prev => ({ ...prev, days: prev.days.includes(i) ? prev.days.filter(x => x !== i) : [...prev.days, i].sort() }))}
                  className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${newSched.days.includes(i) ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Equipe ({newSched.people.length})</label>
            <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
              {people.map(p => (
                <label key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors">
                  <input type="checkbox" checked={newSched.people.includes(p.id)} onChange={e => setNewSched(prev => ({...prev, people: e.target.checked ? [...prev.people, p.id] : prev.people.filter(x => x !== p.id)}))} className="rounded text-blue-600" />
                  <span className="text-xs font-bold text-slate-700">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Funções ({newSched.roles.length})</label>
            <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
              {roles.map(r => (
                <label key={r.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors">
                  <input type="checkbox" checked={newSched.roles.includes(r.id)} onChange={e => setNewSched(prev => ({...prev, roles: e.target.checked ? [...prev.roles, r.id] : prev.roles.filter(x => x !== r.id)}))} className="rounded text-blue-600" />
                  <span className="text-xs font-bold text-slate-700">{r.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleCreate}
          className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95"
        >
          <Wand2 size={22}/> GERAR ESCALA
        </button>
      </div>
    </div>
  );
};

export default ScheduleCreateView;
