import { Task, RecurrenceRule, DayOfWeek } from '../types';

const DAY_MAP: Record<DayOfWeek, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

/**
 * Calculates the next occurrence date for a recurring task.
 * @param currentDate The reference date (or task's due date)
 * @param rule The recurrence rule definition
 * @returns The ISO 8601 string of the next scheduled occurrence
 */
export function calculateNextOccurrence(currentDate: Date, rule: RecurrenceRule): Date {
  const next = new Date(currentDate.getTime());

  switch (rule.frequency) {
    case 'daily': {
      next.setDate(next.getDate() + (rule.interval || 1));
      break;
    }
    case 'weekly': {
      if (rule.days_of_week && rule.days_of_week.length > 0) {
        // Find the next matching day of the week
        const targetDays = rule.days_of_week.map((d) => DAY_MAP[d]).sort((a, b) => a - b);
        let found = false;

        for (let i = 1; i <= 7; i++) {
          const candidate = new Date(next.getTime());
          candidate.setDate(candidate.getDate() + i);
          if (targetDays.includes(candidate.getDay())) {
            next.setTime(candidate.getTime());
            found = true;
            break;
          }
        }

        if (!found) {
          next.setDate(next.getDate() + 7 * (rule.interval || 1));
        }
      } else {
        next.setDate(next.getDate() + 7 * (rule.interval || 1));
      }
      break;
    }
    case 'monthly': {
      next.setMonth(next.getMonth() + (rule.interval || 1));
      break;
    }
    case 'custom': {
      next.setDate(next.getDate() + (rule.interval || 1));
      break;
    }
  }

  // If time_of_day is specified, apply hours and minutes (e.g. "08:30")
  if (rule.time_of_day) {
    const [hours, minutes] = rule.time_of_day.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      next.setHours(hours, minutes, 0, 0);
    }
  }

  return next;
}

/**
 * Handles completing a recurring task:
 * 1. Closes the current task (sets is_completed: true, completed_by, completed_at)
 * 2. Spawns the next occurrence if recurrence is active
 */
export function completeRecurringTask(
  task: Task,
  completedByUserId: string,
  generateId: () => string
): { completedTask: Task; nextTask: Task | null } {
  const now = new Date();
  const completedTask: Task = {
    ...task,
    is_completed: true,
    completed_at: now.toISOString(),
    completed_by: completedByUserId,
    updated_at: now.toISOString(),
  };

  if (!task.recurrence) {
    return { completedTask, nextTask: null };
  }

  const baseDate = task.due_date ? new Date(task.due_date) : now;
  const nextDueDate = calculateNextOccurrence(baseDate, task.recurrence);

  // Check if past end_date
  if (task.recurrence.end_date && nextDueDate > new Date(task.recurrence.end_date)) {
    return { completedTask, nextTask: null };
  }

  const nextTask: Task = {
    ...task,
    id: generateId(),
    is_completed: false,
    completed_at: undefined,
    completed_by: undefined,
    due_date: nextDueDate.toISOString(),
    parent_recurrence_id: task.parent_recurrence_id || task.id,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  return { completedTask, nextTask };
}
