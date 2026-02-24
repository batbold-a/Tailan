export type FrequencyType = 'Yearly' | 'Monthly' | 'Quarterly' | 'Custom';
export type TargetType = 'Count' | 'Percentage';

export interface Assignment {
  id: string;
  user_id: string;
  name: string;
  category: string;
  frequency_type: FrequencyType;
  target_type: TargetType;
  annual_target: number;
  unit: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyPlan {
  id: string;
  user_id: string;
  assignment_id: string;
  year: number;
  month: number;
  planned_count: number;
}

export interface MonthlyActual {
  id: string;
  user_id: string;
  assignment_id: string;
  year: number;
  month: number;
  completed_count: number;
  evidence_link: string | null;
  notes: string | null;
}

export interface Database {
  public: {
    Tables: {
      assignments: {
        Row: Assignment;
        Insert: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Assignment, 'id' | 'created_at' | 'updated_at'>>;
      };
      monthly_plan: {
        Row: MonthlyPlan;
        Insert: Omit<MonthlyPlan, 'id'>;
        Update: Partial<Omit<MonthlyPlan, 'id'>>;
      };
      monthly_actual: {
        Row: MonthlyActual;
        Insert: Omit<MonthlyActual, 'id'>;
        Update: Partial<Omit<MonthlyActual, 'id'>>;
      };
    };
  };
}
