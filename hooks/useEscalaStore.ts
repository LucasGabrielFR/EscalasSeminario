
import { useState, useEffect, useCallback } from 'react';
import { Person, Role, Schedule, ViewMode } from '../types';
import { generateAutomaticSchedule } from '../services/scheduleLogic';

export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export const useEscalaStore = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.SCHEDULE_LIST);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

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

  useEffect(() => {
    localStorage.setItem('escala_people', JSON.stringify(people));
    localStorage.setItem('escala_roles', JSON.stringify(roles));
    localStorage.setItem('escala_projects', JSON.stringify(schedules));
  }, [people, roles, schedules]);

  const addPerson = (name: string, whatsapp: string) => {
    setPeople(prev => [...prev, { id: generateId(), name, whatsapp }]);
  };

  const deletePerson = (id: string) => {
    if (window.confirm("Excluir esta pessoa?")) {
      setPeople(prev => prev.filter(p => p.id !== id));
    }
  };

  const addRole = (name: string) => {
    setRoles(prev => [...prev, { id: generateId(), name }]);
  };

  const deleteRole = (id: string) => {
    if (window.confirm("Excluir esta função?")) {
      setRoles(prev => prev.filter(r => r.id !== id));
    }
  };

  const createSchedule = (settings: any, name: string) => {
    const created = generateAutomaticSchedule(people, roles, settings, name);
    setSchedules(prev => [created, ...prev]);
    setSelectedScheduleId(created.id);
    setView(ViewMode.SCHEDULE_EDIT);
  };

  const deleteSchedule = (id: string) => {
    if (window.confirm("Excluir esta escala permanentemente?")) {
      setSchedules(prev => prev.filter(s => s.id !== id));
      if (selectedScheduleId === id) setSelectedScheduleId(null);
    }
  };

  const updateAssignment = (scheduleId: string, weekIdx: number, dayIdx: number, roleId: string, personId: string) => {
    setSchedules(prev => prev.map(s => {
      if (s.id !== scheduleId) return s;
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

  const regenerateSchedule = (id: string) => {
    const active = schedules.find(s => s.id === id);
    if (!active) return;
    try {
      const updated = generateAutomaticSchedule(people, roles, active.settings, active.name);
      setSchedules(prev => prev.map(s => s.id === id ? { ...updated, id: s.id } : s));
    } catch (e: any) {
      alert("Erro ao regerar. Verifique se as pessoas ainda existem.");
    }
  };

  return {
    view, setView,
    people, addPerson, deletePerson,
    roles, addRole, deleteRole,
    schedules, createSchedule, deleteSchedule, updateAssignment, regenerateSchedule,
    selectedScheduleId, setSelectedScheduleId
  };
};
