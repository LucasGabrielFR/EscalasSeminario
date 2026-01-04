
import React from 'react';
import { ArrowLeft, FileText, Settings2, AlertTriangle, MessageSquare } from 'lucide-react';
import { Person, Role, Schedule, ScheduleWeek, ScheduleDay } from '../types';

interface EditProps {
  schedule: Schedule;
  people: Person[];
  roles: Role[];
  onBack: () => void;
  onUpdate: (sid: string, w: number, d: number, r: string, p: string) => void;
  onRegenerate: () => void;
}

const ScheduleEditView: React.FC<EditProps> = ({ schedule, people, roles, onBack, onUpdate, onRegenerate }) => {
  
  const checkConflicts = (week: ScheduleWeek, day: ScheduleDay, roleId: string, personId: string) => {
    if (!personId) return null;
    const conflicts = [];
    if (day.assignments.filter(a => a.personId === personId).length > 1) conflicts.push("Múltiplas funções no dia.");
    let roleCount = 0;
    week.days.forEach(d => {
      if (d.assignments.some(a => a.roleId === roleId && a.personId === personId)) roleCount++;
    });
    if (roleCount > 1) conflicts.push("Repetição na semana.");
    return conflicts.length > 0 ? conflicts : null;
  };

  const sendWhatsApp = (p: Person) => {
    let msg = `Olá *${p.name}*! Sua escala *${schedule.name}*:\n\n`;
    let found = false;
    schedule.weeks.forEach(w => {
      let details = "";
      w.days.forEach(d => {
        const mine = d.assignments.filter(a => a.personId === p.id);
        if (mine.length > 0) {
          const rolesStr = mine.map(a => roles.find(r => r.id === a.roleId)?.name).join(", ");
          details += `• ${d.dayLabel}: ${rolesStr}\n`;
          found = true;
        }
      });
      if (details) msg += `🔹 *Semana ${w.weekIndex}*\n${details}\n`;
    });
    if (!found) return alert("Sem atribuições para esta pessoa.");
    window.open(`https://api.whatsapp.com/send?phone=${p.whatsapp.replace(/\D/g, '')}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto pb-40 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 print:hidden">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm hover:text-blue-600 transition-all"><ArrowLeft size={20}/></button>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{schedule.name}</h2>
            <p className="text-slate-400 text-sm font-bold mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Escala Ativa • {schedule.weeks.length} Ciclos
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-100 px-6 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <FileText size={18}/> PDF
          </button>
          <button onClick={onRegenerate} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95">
            <Settings2 size={18}/> Regerar
          </button>
        </div>
      </header>

      <h1 className="hidden print:block text-3xl font-black text-blue-600 uppercase text-center mb-10 tracking-widest">{schedule.name}</h1>

      <div className="space-y-16">
        {schedule.weeks.map((week, wIdx) => (
          <div key={wIdx} className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden break-inside-avoid">
            <div className="bg-yellow-400/10 px-8 py-6 flex justify-between items-center border-b border-yellow-100">
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tighter italic">SEMANA {week.weekIndex}</h3>
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-blue-600 uppercase border-b w-32 tracking-widest">Data</th>
                    {schedule.settings.roleIds.map(rid => (
                      <th key={rid} className="px-8 py-4 text-[10px] font-black text-blue-600 uppercase border-b tracking-widest">
                        {roles.find(r => r.id === rid)?.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {week.days.map((day, dIdx) => (
                    <tr key={dIdx} className="hover:bg-blue-50/10 group transition-colors">
                      <td className="px-8 py-6 font-black text-slate-400 text-sm uppercase">{day.dayLabel}</td>
                      {schedule.settings.roleIds.map(rid => {
                        const assignment = day.assignments.find(a => a.roleId === rid);
                        const assignedPerson = people.find(p => p.id === assignment?.personId);
                        const conflicts = checkConflicts(week, day, rid, assignment?.personId || '');
                        return (
                          <td key={rid} className="px-6 py-4">
                            <div className="relative group/sel">
                              <select 
                                className={`w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded-xl p-2 text-sm font-bold transition-all appearance-none cursor-pointer ${conflicts ? 'text-amber-600 bg-amber-50' : 'text-slate-700'}`}
                                value={assignment?.personId || ''}
                                onChange={(e) => onUpdate(schedule.id, wIdx, dIdx, rid, e.target.value)}
                              >
                                <option value="">(Vazio)</option>
                                {people.filter(p => schedule.settings.personIds.includes(p.id)).map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                              
                              <div className="hidden print:block text-slate-800 font-bold text-sm">
                                {assignedPerson ? assignedPerson.name : '(Vazio)'}
                              </div>

                              {conflicts && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-2 pointer-events-none print:hidden">
                                  <AlertTriangle size={14} className="text-amber-500" />
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 w-full max-w-lg px-6 print:hidden">
        <div className="w-full bg-white/90 backdrop-blur-xl p-6 rounded-[32px] shadow-2xl border border-slate-200 flex flex-col gap-4">
          <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-widest flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-600"/> Enviar WhatsApp
          </h4>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-hide">
            {people.filter(p => schedule.settings.personIds.includes(p.id)).map(p => (
              <button
                key={p.id}
                onClick={() => sendWhatsApp(p)}
                className="bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-all"
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditView;
