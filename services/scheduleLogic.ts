
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
        // 1. Filter out people already assigned to ANY role on this day
        // 2. Filter out people who already did THIS role this week
        const candidates = [...people].filter(p => {
          // Rule: No multiple functions on the same day
          const assignedToday = assignments.some(a => a.personId === p.id);
          if (assignedToday) return false;

          // Rule: No same function in the same week
          // Check if person has been assigned this roleId in any previous day of this week
          // We can check `lastWeekAssignments` but that tracks ACROSS weeks (maybe? let me re-read).
          // Actually, `lastWeekAssignments` in the original code seemed to track across weeks or just be a variable name for "previous assignment data".
          // In the original code: `lastWeekAssignments` was used to avoid same person in same role on same day as LAST week if implied, 
          // but the variable scope was outside the week loop? No, it was init inside the function but outside the week loop.
          // BUT the user request is generic: "não repetir a mesma função na mesma semana".

          // Let's check the current week's assignments so far.
          // We need to look at `weekDays` (days already processed in this week)
          for (const prevDay of weekDays) {
            const hasRole = prevDay.assignments.some(a => a.roleId === role.id && a.personId === p.id);
            if (hasRole) return false;
          }

          return true;
        });

        // Sort candidates
        // Goal: "use o máximo de pessoas das selecionadas por semana" -> Prioritize those who have assignments count == 0 this week?
        // Or simply lowest workload overall?

        // Let's count assignments for each person THIS WEEK
        const assignmentsThisWeek: Record<string, number> = {};
        people.forEach(p => assignmentsThisWeek[p.id] = 0);

        weekDays.forEach(d => {
          d.assignments.forEach(a => {
            assignmentsThisWeek[a.personId] = (assignmentsThisWeek[a.personId] || 0) + 1;
          });
        });
        // Also include assignments from current day (already processed roles)
        assignments.forEach(a => {
          assignmentsThisWeek[a.personId] = (assignmentsThisWeek[a.personId] || 0) + 1;
        });

        candidates.sort((a, b) => {
          // Priority 1: Least assignments THIS WEEK (to maximize rotation/people usage logic)
          // "use o máximo de pessoas" implies spreading the load.
          const weekDiff = assignmentsThisWeek[a.id] - assignmentsThisWeek[b.id];
          if (weekDiff !== 0) return weekDiff;

          // Priority 2: Total workload (cumulative across all weeks)
          const workDiff = workload[a.id] - workload[b.id];
          if (workDiff !== 0) return workDiff;

          // Priority 3: Random
          return Math.random() - 0.5;
        });

        if (candidates.length > 0) {
          const selected = candidates[0];
          assignments.push({ roleId: role.id, personId: selected.id });
          workload[selected.id]++;
          peopleUsedThisWeek.add(selected.id);

          if (!lastWeekAssignments[role.id]) lastWeekAssignments[role.id] = {};
          lastWeekAssignments[role.id][dayIdx] = selected.id;
        } else {
          // Fallback: If no one satisfies ALL constraints, what do we do?
          // The prompt says "tente colocar...". If impossible, maybe we relax the "same role per week" constraint?
          // Or we just pick someone who isn't working today (strict day constraint).
          // Let's try to relax "Same role per week" if strict list is empty, but KEEP "Same day" constraint strictly.

          const relaxCandidates = [...people].filter(p => {
            // Keep strict Day constraint
            const assignedToday = assignments.some(a => a.personId === p.id);
            return !assignedToday;
          });

          // Sort by workload
          relaxCandidates.sort((a, b) => workload[a.id] - workload[b.id]);

          if (relaxCandidates.length > 0) {
            const selected = relaxCandidates[0];
            assignments.push({ roleId: role.id, personId: selected.id });
            workload[selected.id]++;
            peopleUsedThisWeek.add(selected.id);
          }
          // If still empty, it means EVERYONE is assigned today already (or no people). 
          // We skip assignment or force someone (double shift). The prompt says "ela não pode fazer outra função no mesmo dia".
          // So we define it as strict. Assignments might be empty for this role.
        }
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
