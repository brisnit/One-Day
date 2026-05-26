export type IncomeType =
  | "annual"
  | "monthly"
  | "biweekly"
  | "weekly"
  | "hourly"
  | "household";

export type WorkSchedule = "5" | "6" | "4" | "custom";

export interface IncomeEntry {
  id: string;
  label?: string;
  type: Exclude<IncomeType, "household">;
  amount: number;        // For non-hourly: the gross income figure
  hourlyRate?: number;   // hourly only
  hoursPerWeek?: number; // hourly only
}

export interface CalculatorInput {
  incomeType: IncomeType;
  amount: number;          // ignored when type === 'hourly' or 'household'
  hourlyRate?: number;
  hoursPerWeek?: number;
  householdEntries?: IncomeEntry[];
  schedule: WorkSchedule;
  customWorkdays?: number;
  excludeDaysOff: boolean;
  vacationDays?: number;
  sickDays?: number;
  holidays?: number;
  personalDays?: number;
}

export interface CalculatorResult {
  annualIncome: number;
  baseWorkdays: number;
  adjustedWorkdays: number;
  oneDayOffering: number;
}

export interface ImpactItem {
  id: string;
  title: string;
  description: string;
  amount: number; // suggested dollar level for this impact
  emoji: string;
}

export interface Campaign {
  slug: string;
  orgName: string;
  campaignName: string;
  visionStatement: string;
  givingLink: string;
  logoDataUrl?: string;  // optional custom logo upload (data URL)
  /**
   * Polarity of the org's logo. "light" = dark logo on a light background.
   * "dark" = light logo on a dark background. Drives text + wordmark color
   * on every accent panel in the donor flow.
   */
  logoBackground: "light" | "dark";
  accentColor: string;   // hex
  impactMessage?: string;
  impacts: ImpactItem[];
  kingdomImpactMode: boolean;
  createdAt: number;
}
