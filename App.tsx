
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Shield, Calendar, MessageSquare, Plus, Trash2, 
  Wand2, ChevronLeft, ChevronRight, FileText, AlertTriangle, 
  ArrowLeft, CheckCircle2, MoreVertical, LayoutGrid, Settings2
} from 'lucide-react';
import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Person, Role, Schedule, ViewMode, ScheduleWeek, ScheduleDay, Assignment } from './types';
import { generateAutomaticSchedule } from './services/scheduleLogic';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<ViewMode>(ViewMode.SCHEDULE_LIST);
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('escala_people');
    return saved ? JSON.parse(saved) : [];
  });
  const [roles, setRoles] = useState<Role[]>(() => {
    const saved = localStorage.getItem('escala_roles');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Leitor' },
      { id: '2', name: 'Acólito' }
    ];
  });
  const [schedules, setSchedules] = useState<Schedule[]>(() => {
    const saved = localStorage.getItem('escala_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  // Form state for creation
  const [newSched, setNewSched] = useState({
    name: '',
    weeks: 4,
    days: [0], // Default Sunday
    people: [] as string[],
    roles: [] as string[]
  });

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('escala_people', JSON.stringify(people));
    localStorage.setItem('escala_roles', JSON.stringify(roles));
    localStorage.setItem('escala_projects', JSON.stringify(schedules));
  }, [people, roles, schedules]);

  // --- DERIVED STATE ---
  const activeSchedule = useMemo(() => 
    schedules.find(s => s.id === selectedScheduleId) || null
  , [schedules, selectedScheduleId]);

  // --- ACTIONS ---
  const handleAddPerson = (name: string, whatsapp: string) => {
    if (!name.trim() || !whatsapp.trim()) return alert("Preencha todos os campos.");
    setPeople(prev => [...prev, { id: generateId(), name, whatsapp }]);
  };

  const handleAddRole = (name: string) => {
    if (!name.trim()) return alert("Dê um nome à função.");
    setRoles(prev => [...prev, { id: generateId(), name }]);
  };

  const handleDeleteSchedule = (id: string) => {
    if (window.confirm("Excluir esta escala permanentemente?")) {
      setSchedules(prev => prev.filter(s => s.id !== id));
      if (selectedScheduleId === id) setSelectedScheduleId(null);
    }
  };

  const handleCreate = () => {
    if (!newSched.name.trim()) return alert("Nome da escala obrigatório.");
    if (newSched.people.length === 0) return alert("Selecione participantes.");
    if (newSched.roles.length === 0) return alert("Selecione funções.");

    try {
      const settings = {
        durationWeeks: newSched.weeks,
        daysOfWeek: newSched.days,
        personIds: newSched.people,
        roleIds: newSched.roles
      };
      const created = generateAutomaticSchedule(people, roles, settings, newSched.name);
      setSchedules(prev => [created, ...prev]);
      setSelectedScheduleId(created.id);
      setView(ViewMode.SCHEDULE_EDIT);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRegenerate = () => {
    if (!activeSchedule) return;
    if (window.confirm("Isso apagará alterações manuais. Deseja regerar?")) {
      try {
        const updated = generateAutomaticSchedule(people, roles, activeSchedule.settings, activeSchedule.name);
        setSchedules(prev => prev.map(s => s.id === activeSchedule.id ? { ...updated, id: s.id } : s));
      } catch (e: any) {
        alert("Erro ao regerar: participante ou função não encontrada.");
      }
    }
  };

  const updateAssignment = (weekIdx: number, dayIdx: number, roleId: string, personId: string) => {
    if (!selectedScheduleId) return;
    setSchedules(prev => prev.map(s => {
      if (s.id !== selectedScheduleId) return s;
      const newWeeks = [...s.weeks];
      const week = { ...newWeeks[weekIdx] };
      const day = { ...week.days[dayIdx] };
      const assignments = [...day.assignments];
      
      const idx = assignments.findIndex(a => a.roleId === roleId);
      if (idx >= 0) {
        assignments[idx] = { ...assignments[idx], personId };
      } else {
        assignments.push({ roleId, personId });
      }
      
      day.assignments = assignments;
      week.days[dayIdx] = day;
      newWeeks[weekIdx] = week;
      
      return { ...s, weeks: newWeeks };
    }));
  };

  const checkConflicts = (week: ScheduleWeek, day: ScheduleDay, roleId: string, personId: string) => {
    if (!personId) return null;
    const conflicts = [];
    if (day.assignments.filter(a => a.personId === personId).length > 1) {
      conflicts.push("Múltiplas funções no dia.");
    }
    let roleCount = 0;
    week.days.forEach(d => {
      if (d.assignments.some(a => a.roleId === roleId && a.personId === personId)) roleCount++;
    });
    if (roleCount > 1) conflicts.push("Repetição na semana.");
    return conflicts.length > 0 ? conflicts : null;
  };

  const sendWhatsApp = (p: Person, s: Schedule) => {
    let msg = `Olá *${p.name}*! Sua escala *${s.name}*:\n\n`;
    let found = false;
    s.weeks.forEach(w => {
      let weekStr = `🔹 *Semana ${w.weekIndex}*\n`;
      let details = "";
      w.days.forEach(d => {
        const mine = d.assignments.filter(a => a.personId === p.id);
        if (mine.length > 0) {
          const rolesStr = mine.map(a => roles.find(r => r.id === a.roleId)?.name).join(", ");
          details += `• ${d.dayLabel}: ${rolesStr}\n`;
          found = true;
        }
      });
      if (details) msg += weekStr + details + "\n";
    });
    if (!found) return alert("Sem atribuições para esta pessoa.");
    window.open(`https://api.whatsapp.com/send?phone=${p.whatsapp.replace(/\D/g, '')}&text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- VIEWS ---

  const Sidebar = () => (
    <nav className="w-full md:w-20 lg:w-64 bg-white border-r border-slate-200 p-4 flex md:flex-col gap-2 sticky top-0 z-50 shadow-sm print:hidden">
      <div className="hidden md:flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <Calendar size={20} />
        </div>
        <span className="hidden lg:block font-extrabold text-slate-800 text-lg tracking-tight">EscalaPro</span>
      </div>
      <NavItem active={view === ViewMode.SCHEDULE_LIST} onClick={() => setView(ViewMode.SCHEDULE_LIST)} icon={<LayoutGrid size={22}/>} label="Escalas" />
      <NavItem active={view === ViewMode.PEOPLE} onClick={() => setView(ViewMode.PEOPLE)} icon={<Users size={22}/>} label="Pessoas" />
      <NavItem active={view === ViewMode.ROLES} onClick={() => setView(ViewMode.ROLES)} icon={<Shield size={22}/>} label="Funções" />
    </nav>
  );

  const NavItem = ({ active, onClick, icon, label }: any) => (
    <button onClick={onClick} className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>
      <span className={active ? 'scale-110 transition-transform' : ''}>{icon}</span>
      <span className={`hidden lg:block text-sm font-bold tracking-tight ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      <style>{`
        @media print {
          nav, button, select, .print-hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; width: 100% !important; }
          .break-inside-avoid { break-inside: avoid; }
          body { background: white; }
          .bg-yellow-400 { background-color: #fbbf24 !important; -webkit-print-color-adjust: exact; }
          .text-blue-600 { color: #2563eb !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>
      
      <Sidebar />

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        {view === ViewMode.SCHEDULE_LIST && (
          <div className="max-w-6xl mx-auto">
            <header className="flex justify-between items-end mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Suas Escalas</h1>
                <p className="text-slate-400 text-sm mt-1">Organização impecável em poucos cliques.</p>
              </div>
              <button 
                onClick={() => {
                  setNewSched({ name: `Escala ${schedules.length + 1}`, weeks: 4, days: [0], people: people.map(p=>p.id), roles: roles.map(r=>r.id) });
                  setView(ViewMode.SCHEDULE_CREATE);
                }}
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
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6">{s.weeks.length} Semanas • {s.settings.daysOfWeek.length} Dias</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setSelectedScheduleId(s.id); setView(ViewMode.SCHEDULE_EDIT); }}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-xs font-bold hover:bg-blue-700 transition-colors"
                      >
                        Gerenciar
                      </button>
                      <button 
                        onClick={() => handleDeleteSchedule(s.id)}
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
        )}

        {view === ViewMode.SCHEDULE_CREATE && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setView(ViewMode.SCHEDULE_LIST)} className="flex items-center gap-2 text-slate-400 font-bold text-sm mb-8 hover:text-blue-600 transition-colors">
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
        )}

        {view === ViewMode.SCHEDULE_EDIT && activeSchedule && (
          <div className="max-w-7xl mx-auto pb-40 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 print:hidden">
              <div className="flex items-center gap-5">
                <button onClick={() => setView(ViewMode.SCHEDULE_LIST)} className="p-3 bg-white rounded-2xl shadow-sm hover:text-blue-600 transition-all"><ArrowLeft size={20}/></button>
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{activeSchedule.name}</h2>
                  <p className="text-slate-400 text-sm font-bold mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span> Escala Ativa • {activeSchedule.weeks.length} Ciclos
                  </p>
                </div>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-100 px-6 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                  <FileText size={18}/> PDF
                </button>
                <button onClick={handleRegenerate} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95">
                  <Settings2 size={18}/> Regerar
                </button>
              </div>
            </header>

            <h1 className="hidden print:block text-3xl font-black text-blue-600 uppercase text-center mb-10 tracking-widest">{activeSchedule.name}</h1>

            <div className="space-y-16">
              {activeSchedule.weeks.map((week, wIdx) => (
                <div key={wIdx} className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden break-inside-avoid">
                  <div className="bg-yellow-400/10 px-8 py-6 flex justify-between items-center border-b border-yellow-100">
                    <h3 className="font-black text-slate-800 text-lg uppercase tracking-tighter italic">SEMANA {week.weekIndex}</h3>
                  </div>
                  <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-50/50">
                          <th className="px-8 py-4 text-[10px] font-black text-blue-600 uppercase border-b w-32 tracking-widest">Data</th>
                          {activeSchedule.settings.roleIds.map(rid => (
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
                            {activeSchedule.settings.roleIds.map(rid => {
                              const assignment = day.assignments.find(a => a.roleId === rid);
                              const conflicts = checkConflicts(week, day, rid, assignment?.personId || '');
                              return (
                                <td key={rid} className="px-6 py-4">
                                  <div className="relative group/sel">
                                    <select 
                                      className={`w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded-xl p-2 text-sm font-bold transition-all appearance-none cursor-pointer ${conflicts ? 'text-amber-600 bg-amber-50' : 'text-slate-700'}`}
                                      value={assignment?.personId || ''}
                                      onChange={(e) => updateAssignment(wIdx, dIdx, rid, e.target.value)}
                                    >
                                      <option value="">(Vazio)</option>
                                      {people.filter(p => activeSchedule.settings.personIds.includes(p.id)).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                      ))}
                                    </select>
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
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-800 text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-600"/> Enviar WhatsApp
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-hide">
                  {people.filter(p => activeSchedule.settings.personIds.includes(p.id)).map(p => (
                    <button
                      key={p.id}
                      onClick={() => sendWhatsApp(p, activeSchedule)}
                      className="bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold transition-all"
                    >
                      {p.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === ViewMode.PEOPLE && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-8">Equipe</h2>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 mb-10">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Adicionar Integrante</label>
              <form onSubmit={e => { e.preventDefault(); const f=new FormData(e.currentTarget); handleAddPerson(f.get('name') as string, f.get('wa') as string); e.currentTarget.reset(); }} className="flex flex-col md:flex-row gap-4">
                <input name="name" placeholder="Nome" className="flex-[2] px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                <input name="wa" placeholder="Zap (55...)" className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
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
                      <td className="px-8 py-5 font-bold text-slate-800">{p.name}</td>
                      <td className="px-8 py-5 text-slate-400 text-xs font-bold">{p.whatsapp}</td>
                      <td className="px-8 py-5 text-right">
                        <button onClick={() => setPeople(prev => prev.filter(x => x.id !== p.id))} className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === ViewMode.ROLES && (
          <div className="max-w-xl mx-auto animate-in fade-in duration-500">
            <h2 className="text-4xl font-black text-slate-900 mb-8">Funções</h2>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 mb-10">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nova Função</label>
              <form onSubmit={e => { e.preventDefault(); const f=new FormData(e.currentTarget); handleAddRole(f.get('name') as string); e.currentTarget.reset(); }} className="flex gap-4">
                <input name="name" placeholder="Ex: Fotógrafo" className="flex-1 px-6 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                <button className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-50"><Plus size={24}/></button>
              </form>
            </div>
            <div className="space-y-3">
              {roles.map(r => (
                <div key={r.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex justify-between items-center group hover:shadow-lg transition-all">
                  <span className="font-black text-slate-800 uppercase text-sm tracking-tight">{r.name}</span>
                  <button onClick={() => setRoles(prev => prev.filter(x => x.id !== r.id))} className="p-2 text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
