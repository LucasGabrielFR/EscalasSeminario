import crypto from 'crypto';
// @ts-ignore
if (!global.crypto) {
    // @ts-ignore
    global.crypto = crypto;
}

import { generateAutomaticSchedule } from './scheduleLogic';
import { Person, Role } from '../types';

// Mock data
const mockPeople: Person[] = [
    { id: '1', name: 'Alice', whatsapp: '123' },
    { id: '2', name: 'Bob', whatsapp: '123' },
    { id: '3', name: 'Charlie', whatsapp: '123' },
    { id: '4', name: 'Diana', whatsapp: '123' },
    { id: '5', name: 'Eve', whatsapp: '123' },
];

const mockRoles: Role[] = [
    { id: 'r1', name: 'Leader' },
    { id: 'r2', name: 'Singer' },
    { id: 'r3', name: 'Guitar' },
];

const settings = {
    durationWeeks: 4,
    daysOfWeek: [0, 6], // Sunday, Saturday
    personIds: mockPeople.map(p => p.id),
    roleIds: mockRoles.map(r => r.id),
};

console.log("Generating schedule...");
const schedule = generateAutomaticSchedule(mockPeople, mockRoles, settings, "Test Schedule");

console.log(`Schedule generated with ${schedule.weeks.length} weeks.`);

let errors = 0;

schedule.weeks.forEach(week => {
    week.days.forEach(day => {
        const assignmentsOnDay = new Set<string>();
        day.assignments.forEach(assignment => {
            // Check Constraint 2: No multiple functions on the same day
            if (assignmentsOnDay.has(assignment.personId)) {
                console.error(`[FAIL] Person ${assignment.personId} assigned multiple times on Week ${week.weekIndex}, Day ${day.dayIndex}`);
                errors++;
            }
            assignmentsOnDay.add(assignment.personId);
        });
    });

    // Check Constraint 1: No same function in the same week
    const roleAssignmentsInWeek = new Map<string, Set<string>>(); // roleId -> Set<personId>

    // We actually want: For a given person, can they be assigned the SAME role multiple times?
    // "não repetir a mesma função na mesma semana" -> Person P cannot do Role R twice in Week W.

    const personRoleCounts: Record<string, Record<string, number>> = {}; // personId -> roleId -> count

    week.days.forEach(day => {
        day.assignments.forEach(a => {
            if (!personRoleCounts[a.personId]) personRoleCounts[a.personId] = {};
            personRoleCounts[a.personId][a.roleId] = (personRoleCounts[a.personId][a.roleId] || 0) + 1;
        });
    });

    Object.entries(personRoleCounts).forEach(([personId, roles]) => {
        Object.entries(roles).forEach(([roleId, count]) => {
            if (count > 1) {
                console.error(`[FAIL] Person ${personId} assigned Role ${roleId} ${count} times in Week ${week.weekIndex}`);
                errors++;
            }
        });
    });
});

if (errors === 0) {
    console.log("[SUCCESS] All strict hard constraints passed.");
} else {
    console.error(`[FAIL] Found ${errors} constraint violations.`);
    process.exit(1);
}

// Check Constraint 3: Maximize people usage
// Just print distribution stats
const personCounts: Record<string, number> = {};
mockPeople.forEach(p => personCounts[p.id] = 0);

schedule.weeks.forEach(week => {
    week.days.forEach(day => {
        day.assignments.forEach(a => {
            personCounts[a.personId]++;
        });
    });
});

console.log("Workload distribution:", personCounts);
