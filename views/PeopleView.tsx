
import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Person } from '../types';

interface PeopleProps {
  people: Person[];
  onAdd: (name: string, wa: string) => void;
  onEdit: (id: string, name: string, wa: string) => void;
  onDelete: (id: string) => void;
}

const PeopleView: React.FC<PeopleProps> = ({ people, onAdd, onEdit, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editWa, setEditWa] = useState('');

  const handleEditClick = (p: Person) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditWa(p.whatsapp);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim() && editWa.trim()) {
      onEdit(id, editName.trim(), editWa.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-4xl font-black text-slate-900 mb-8">Equipe</h2>
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 mb-10">
        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Adicionar Integrante</label>
        <form onSubmit={e => { e.preventDefault(); const f=new FormData(e.currentTarget); onAdd(f.get('name') as string, f.get('wa') as string); e.currentTarget.reset(); }} className="flex flex-col md:flex-row gap-4">
          <input name="name" placeholder="Nome" className="flex-[2] px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" required />
          <input name="wa" placeholder="Zap (55...)" className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" required />
          <button className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all"><Plus size={24}/></button>
        </form>
      </div>
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-4 font-black text-[10px] text-slate-400 uppercase text-left tracking-widest">Nome</th>
              <th className="px-8 py-4 font-black text-[10px] text-slate-400 uppercase text-left tracking-widest">WhatsApp</th>
              <th className="px-8 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {people.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                {editingId === p.id ? (
                  <>
                    <td className="px-8 py-5">
                      <input 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                        autoFocus
                      />
                    </td>
                    <td className="px-8 py-5">
                      <input 
                        value={editWa}
                        onChange={(e) => setEditWa(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs"
                      />
                    </td>
                    <td className="px-8 py-5 text-right space-x-2">
                      <button onClick={() => handleSaveEdit(p.id)} className="p-2 text-green-500 hover:bg-green-50 rounded-xl transition-all"><Check size={18}/></button>
                      <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><X size={18}/></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-8 py-5 font-bold text-slate-800">{p.name}</td>
                    <td className="px-8 py-5 text-slate-400 text-xs font-bold">{p.whatsapp}</td>
                    <td className="px-8 py-5 text-right space-x-2">
                      <button onClick={() => handleEditClick(p)} className="p-2 text-slate-200 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18}/></button>
                      <button onClick={() => onDelete(p.id)} className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {people.length === 0 && (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center text-slate-300 italic">Ninguém cadastrado ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PeopleView;
