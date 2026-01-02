
import { Person, Role, Schedule, ScheduleWeek, ScheduleDay, Assignment } from '../types';

const DAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

interface GenerationSettings {
  durationWeeks: number;
  daysOfWeek: number[];
  personIds: string[];
  roleIds: string[];
}

export const generateAutomaticSchedule = (
  allPeople: Person[],
  allRoles: Role[],
  settings: GenerationSettings,
  scheduleName: string
): Schedule => {
  const weeks: ScheduleWeek[] = [];
  
  const people = allPeople.filter(p => settings.personIds.includes(p.id));
  const roles = allRoles.filter(r => settings.roleIds.includes(r.id));

  if (!scheduleName.trim()) throw new Error("O nome da escala é obrigatório.");
  if (people.length === 0) throw new Error("Selecione ao menos uma pessoa para a escala.");
  if (roles.length === 0) throw new Error("Selecione ao menos uma função para a escala.");
  if (settings.daysOfWeek.length === 0) throw new Error("Selecione ao menos um dia da semana.");

  const workload: Record<string, number> = {};
  const lastWeekAssignments: Record<string, Record<number, string>> = {}; // roleId -> dayIndex -> personId

  people.forEach(p => workload[p.id] = 0);

  for (let wIdx = 0; wIdx < settings.durationWeeks; wIdx++) {
    const weekDays: ScheduleDay[] = [];
    const peopleUsedThisWeek = new Set<string>();

    for (const dayIdx of settings.daysOfWeek) {
      const assignments: Assignment[] = [];

      roles.forEach(role => {
        // Find best person
        const candidates = [...people].sort((a, b) => {
          const diffWorkload = workload[a.id] - workload[b.id];
          if (diffWorkload !== 0) return diffWorkload;
          
          const aUsedThisWeek = peopleUsedThisWeek.has(a.id) ? 1 : 0;
          const bUsedThisWeek = peopleUsedThisWeek.has(b.id) ? 1 : 0;
          return aUsedThisWeek - bUsedThisWeek;
        });

        // Try to avoid same person in same role on same day as last week
        const filteredCandidates = candidates.filter(p => {
          const lastPerson = lastWeekAssignments[role.id]?.[dayIdx];
          return lastPerson !== p.id;
        });

        const selected = filteredCandidates.length > 0 ? filteredCandidates[0] : candidates[0];

        assignments.push({ roleId: role.id, personId: selected.id });
        
        workload[selected.id]++;
        peopleUsedThisWeek.add(selected.id);
        
        if (!lastWeekAssignments[role.id]) lastWeekAssignments[role.id] = {};
        lastWeekAssignments[role.id][dayIdx] = selected.id;
      });

      weekDays.push({
        dayIndex: dayIdx,
        dayLabel: DAY_LABELS[dayIdx],
        assignments
      });
    }

    weeks.push({
      weekIndex: wIdx + 1,
      days: weekDays
    });
  }

  return {
    id: crypto.randomUUID(),
    name: scheduleName,
    weeks,
    createdAt: new Date().toISOString(),
    settings: { ...settings }
  };
};
