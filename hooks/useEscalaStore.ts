
import { useState, useEffect, useCallback } from 'react';
import { Person, Role, Schedule, ViewMode } from '../types';
import { generateAutomaticSchedule } from '../services/scheduleLogic';
import { supabase } from '../services/supabase';

export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export const useEscalaStore = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.SCHEDULE_LIST);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  const [people, setPeople] = useState<Person[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: peopleData } = await supabase.from('people').select('*');
      const { data: rolesData } = await supabase.from('roles').select('*');
      const { data: schedulesData } = await supabase.from('schedules').select('*');

      if (peopleData) setPeople(peopleData);
      if (rolesData) setRoles(rolesData);
      if (schedulesData) {
        // Map database 'data' field to 'weeks' and 'created_at' to 'createdAt'
        const mappedSchedules = schedulesData.map(s => ({
          ...s,
          weeks: s.data || [],
          createdAt: s.created_at
        }));
        setSchedules(mappedSchedules);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addPerson = async (name: string, whatsapp: string) => {
    const newPerson = { id: generateId(), name, whatsapp };
    const { error } = await supabase.from('people').insert([newPerson]);
    if (!error) {
      setPeople(prev => [...prev, newPerson]);
    } else {
      alert("Erro ao adicionar pessoa: " + error.message);
    }
  };

  const deletePerson = async (id: string) => {
    if (window.confirm("Excluir esta pessoa?")) {
      const { error } = await supabase.from('people').delete().eq('id', id);
      if (!error) {
        setPeople(prev => prev.filter(p => p.id !== id));
      } else {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  const editPerson = async (id: string, name: string, whatsapp: string) => {
    const { error } = await supabase.from('people').update({ name, whatsapp }).eq('id', id);
    if (!error) {
      setPeople(prev => prev.map(p => p.id === id ? { ...p, name, whatsapp } : p));
    } else {
      alert("Erro ao editar pessoa: " + error.message);
    }
  };

  const addRole = async (name: string) => {
    const newRole = { id: generateId(), name };
    const { error } = await supabase.from('roles').insert([newRole]);
    if (!error) {
      setRoles(prev => [...prev, newRole]);
    } else {
      alert("Erro ao adicionar função: " + error.message);
    }
  };

  const deleteRole = async (id: string) => {
    if (window.confirm("Excluir esta função?")) {
      const { error } = await supabase.from('roles').delete().eq('id', id);
      if (!error) {
        setRoles(prev => prev.filter(r => r.id !== id));
      } else {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  const createSchedule = async (settings: any, name: string) => {
    const created = generateAutomaticSchedule(people, roles, settings, name);
    // created has 'weeks', we need to save it as 'data' in db
    // created also has 'createdAt', we need to map it to 'created_at' or let DB set it
    const { weeks, createdAt, ...rest } = created;
    const dbPayload = {
      ...rest,
      data: weeks,
      created_at: createdAt // Map camelCase to snake_case
    };

    const { error } = await supabase.from('schedules').insert([dbPayload]);

    if (!error) {
      setSchedules(prev => [created, ...prev]);
      setSelectedScheduleId(created.id);
      setView(ViewMode.SCHEDULE_EDIT);
    } else {
      alert("Erro ao criar escala: " + error.message);
    }
  };

  const deleteSchedule = async (id: string) => {
    if (window.confirm("Excluir esta escala permanentemente?")) {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (!error) {
        setSchedules(prev => prev.filter(s => s.id !== id));
        if (selectedScheduleId === id) setSelectedScheduleId(null);
      } else {
        alert("Erro ao excluir: " + error.message);
      }
    }
  };

  const updateAssignment = async (scheduleId: string, weekIdx: number, dayIdx: number, roleId: string, personId: string) => {
    const scheduleToUpdate = schedules.find(s => s.id === scheduleId);
    if (!scheduleToUpdate) return;

    const newWeeks = [...scheduleToUpdate.weeks];
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

    const updatedSchedule = { ...scheduleToUpdate, weeks: newWeeks };

    // Optimistic update
    setSchedules(prev => prev.map(s => s.id === scheduleId ? updatedSchedule : s));

    // Save to DB
    const { weeks, ...rest } = updatedSchedule;
    const { error } = await supabase.from('schedules').update({ data: weeks }).eq('id', scheduleId);
    if (error) {
      alert("Erro ao salvar alteração: " + error.message);
      // Revert? For now keeping it simple.
    }
  };

  const regenerateSchedule = async (id: string) => {
    const active = schedules.find(s => s.id === id);
    if (!active) return;
    try {
      const updated = generateAutomaticSchedule(people, roles, active.settings, active.name);
      // Save to DB
      const { weeks, ...rest } = updated;
      const { error } = await supabase.from('schedules').update({ data: weeks }).eq('id', id);

      if (!error) {
        setSchedules(prev => prev.map(s => s.id === id ? { ...updated, id: s.id } : s));
      } else {
        alert("Erro ao salvar: " + error.message);
      }
    } catch (e: any) {
      alert("Erro ao regerar. Verifique se as pessoas ainda existem.");
    }
  };

  return {
    view, setView,
    people, addPerson, editPerson, deletePerson,
    roles, addRole, deleteRole,
    schedules, createSchedule, deleteSchedule, updateAssignment, regenerateSchedule,
    selectedScheduleId, setSelectedScheduleId,
    loading
  };
};
