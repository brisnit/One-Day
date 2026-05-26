import type { CalculatorInput, CalculatorResult, IncomeEntry, IncomeType, WorkSchedule } from "./types";

export const SCHEDULE_WORKDAYS: Record<Exclude<WorkSchedule, "custom">, number> = {
  "4": 208,
  "5": 260,
  "6": 312,
};

// Recommended default when "Exclude days off" is enabled with no further input
export const DEFAULT_WORKDAYS_WITH_TIME_OFF = 235;

export function annualizeEntry(entry: IncomeEntry): number {
  switch (entry.type) {
    case "annual":
      return entry.amount;
    case "monthly":
      return entry.amount * 12;
    case "biweekly":
      return entry.amount * 26;
    case "weekly":
      return entry.amount * 52;
    case "hourly":
      return (entry.hourlyRate ?? 0) * (entry.hoursPerWeek ?? 0) * 52;
    default:
      return 0;
  }
}

export function annualIncome(input: CalculatorInput): number {
  if (input.incomeType === "household") {
    return (input.householdEntries ?? []).reduce(
      (sum, e) => sum + annualizeEntry(e),
      0
    );
  }
  if (input.incomeType === "hourly") {
    return (input.hourlyRate ?? 0) * (input.hoursPerWeek ?? 0) * 52;
  }
  const type = input.incomeType as Exclude<IncomeType, "hourly" | "household">;
  return annualizeEntry({
    id: "_",
    type,
    amount: input.amount,
  });
}

export function baseWorkdays(input: CalculatorInput): number {
  if (input.schedule === "custom") {
    return Math.max(1, input.customWorkdays ?? DEFAULT_WORKDAYS_WITH_TIME_OFF);
  }
  return SCHEDULE_WORKDAYS[input.schedule];
}

export function adjustedWorkdays(input: CalculatorInput): number {
  const base = baseWorkdays(input);
  if (!input.excludeDaysOff) return base;
  const off =
    (input.vacationDays ?? 0) +
    (input.sickDays ?? 0) +
    (input.holidays ?? 0) +
    (input.personalDays ?? 0);
  return Math.max(1, base - off);
}

export function calculate(input: CalculatorInput): CalculatorResult {
  const annual = annualIncome(input);
  const base = baseWorkdays(input);
  const days = adjustedWorkdays(input);
  const offering = days > 0 ? annual / days : 0;
  return {
    annualIncome: annual,
    baseWorkdays: base,
    adjustedWorkdays: days,
    oneDayOffering: offering,
  };
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export function validate(input: CalculatorInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (input.incomeType === "household") {
    const entries = input.householdEntries ?? [];
    if (entries.length === 0) {
      issues.push({ field: "householdEntries", message: "Add at least one income source." });
    } else {
      entries.forEach((e, i) => {
        if (e.type === "hourly") {
          if (!e.hourlyRate || e.hourlyRate <= 0)
            issues.push({ field: `entry-${i}-rate`, message: "Enter an hourly rate." });
          if (!e.hoursPerWeek || e.hoursPerWeek <= 0)
            issues.push({ field: `entry-${i}-hours`, message: "Enter hours per week." });
        } else if (!e.amount || e.amount <= 0) {
          issues.push({ field: `entry-${i}-amount`, message: "Enter an income amount." });
        }
      });
    }
  } else if (input.incomeType === "hourly") {
    if (!input.hourlyRate || input.hourlyRate <= 0)
      issues.push({ field: "hourlyRate", message: "Enter your hourly rate." });
    if (!input.hoursPerWeek || input.hoursPerWeek <= 0)
      issues.push({ field: "hoursPerWeek", message: "Enter your weekly hours." });
  } else {
    if (!input.amount || input.amount <= 0)
      issues.push({ field: "amount", message: "Enter an income amount." });
  }

  if (input.schedule === "custom" && (!input.customWorkdays || input.customWorkdays < 1)) {
    issues.push({ field: "customWorkdays", message: "Enter a valid number of workdays." });
  }

  if (input.excludeDaysOff) {
    const off =
      (input.vacationDays ?? 0) +
      (input.sickDays ?? 0) +
      (input.holidays ?? 0) +
      (input.personalDays ?? 0);
    if (off >= baseWorkdays(input)) {
      issues.push({
        field: "daysOff",
        message: "Days off can't equal or exceed total workdays.",
      });
    }
  }

  return issues;
}
