
export interface Person {
  id: string;
  name: string;
  whatsapp: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface Assignment {
  roleId: string;
  personId: string;
}

export interface ScheduleDay {
  dayLabel: string; // e.g., "Segunda", "Terça" or "Dia 1"
  dayIndex: number;
  assignments: Assignment[];
}

export interface ScheduleWeek {
  weekIndex: number;
  days: ScheduleDay[];
}

export interface Schedule {
  id: string;
  name: string;
  weeks: ScheduleWeek[];
  createdAt: string;
  settings: {
    durationWeeks: number;
    daysOfWeek: number[]; // 0-6
    personIds: string[];
    roleIds: string[];
  };
}

export enum ViewMode {
  PEOPLE = 'PEOPLE',
  ROLES = 'ROLES',
  SCHEDULE_LIST = 'SCHEDULE_LIST',
  SCHEDULE_EDIT = 'SCHEDULE_EDIT',
  SCHEDULE_CREATE = 'SCHEDULE_CREATE'
}
