
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Role } from '../types';

interface RolesProps {
  roles: Role[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

const RolesView: React.FC<RolesProps> = ({ roles, onAdd, onDelete }) => {
  return (
    <div className="max-w-xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-4xl font-black text-slate-900 mb-8">Funções</h2>
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 mb-10">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nova Função</label>
        <form onSubmit={e => { e.preventDefault(); const f=new FormData(e.currentTarget); onAdd(f.get('name') as string); e.currentTarget.reset(); }} className="flex gap-4">
          <input name="name" placeholder="Ex: Fotógrafo" className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" required />
          <button className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-50"><Plus size={24}/></button>
        </form>
      </div>
      <div className="space-y-3">
        {roles.map(r => (
          <div key={r.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center group hover:shadow-lg transition-all">
            <span className="font-black text-slate-800 uppercase text-sm tracking-tight">{r.name}</span>
            <button onClick={() => onDelete(r.id)} className="p-2 text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
          </div>
        ))}
        {roles.length === 0 && (
          <div className="py-20 text-center text-slate-300 italic">Nenhuma função definida.</div>
        )}
      </div>
    </div>
  );
};

export default RolesView;
