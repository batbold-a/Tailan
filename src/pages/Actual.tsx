import React from 'react';
import { Card, Button, Input, Label } from '../components/UI';
import { 
  Save, 
  ChevronLeft, 
  ChevronRight, 
  Link as LinkIcon,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Assignment, MonthlyActual } from '../types';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

export const ActualPage = () => {
  const { session } = useAuth();
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [plans, setPlans] = React.useState<Record<string, number>>({});
  const [actuals, setActuals] = React.useState<Record<string, Partial<MonthlyActual>>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  const [year, setYear] = React.useState(new Date().getFullYear());
  const [month, setMonth] = React.useState(new Date().getMonth() + 1);

  React.useEffect(() => {
    fetchData();
  }, [year, month]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: asgs } = await supabase.from('assignments').select('*').order('category');
      const { data: plns } = await supabase
        .from('monthly_plan')
        .select('*')
        .eq('year', year)
        .eq('month', month);
      const { data: acts } = await supabase
        .from('monthly_actual')
        .select('*')
        .eq('year', year)
        .eq('month', month);

      if (asgs) setAssignments(asgs);
      
      const planMap: Record<string, number> = {};
      plns?.forEach(p => { planMap[p.assignment_id] = p.planned_count; });
      setPlans(planMap);

      const actualMap: Record<string, Partial<MonthlyActual>> = {};
      acts?.forEach(a => {
        actualMap[a.assignment_id] = {
          completed_count: a.completed_count,
          evidence_link: a.evidence_link,
          notes: a.notes
        };
      });
      setActuals(actualMap);
    } finally {
      setLoading(false);
    }
  };

  const validate = (id: string, actual: number, plan: number) => {
    if (actual > plan) {
      setErrors(prev => ({ ...prev, [id]: `Cannot exceed planned target (${plan})` }));
      return false;
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
    return true;
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);

    const upserts = assignments.map(asg => ({
      user_id: session.user.id,
      assignment_id: asg.id,
      year,
      month,
      completed_count: actuals[asg.id]?.completed_count || 0,
      evidence_link: actuals[asg.id]?.evidence_link || null,
      notes: actuals[asg.id]?.notes || null
    }));

    const { error } = await supabase.from('monthly_actual').upsert(upserts, {
      onConflict: 'user_id,year,month,assignment_id'
    });

    if (error) alert('Error saving actuals: ' + error.message);
    setSaving(false);
  };

  const changeMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setMonth(newMonth);
    setYear(newYear);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Execution Log</h1>
          <p className="text-slate-500 mt-1">Record completed counts and evidence for each assignment.</p>
        </div>
        <div className="flex items-center gap-4">
          {Object.keys(errors).length > 0 && (
            <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 animate-pulse">
              Please fix errors before saving
            </span>
          )}
          <div className="flex items-center bg-slate-100/50 border border-slate-200 rounded-2xl p-1 shadow-xl shadow-slate-200/50 transition-all hover:shadow-2xl hover:shadow-slate-200/60">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-slate-900 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-6 font-bold text-slate-900 min-w-[160px] text-center tracking-tight">
              {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(year, month - 1))} {year}
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-slate-900 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3">Assignment</th>
                <th className="pb-3 w-24 text-center">Planned</th>
                <th className="pb-3 w-24 text-center">Completed</th>
                <th className="pb-3">Evidence Link</th>
                <th className="pb-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => <tr key={i} className="h-20 animate-pulse bg-slate-50/50"></tr>)
              ) : assignments.map((asg) => {
                const plan = plans[asg.id] || 0;
                const actualVal = actuals[asg.id]?.completed_count;
                const isDone = plan > 0 && (actualVal || 0) >= plan;
                const hasError = errors[asg.id];

                return (
                  <tr key={asg.id} className={cn(
                    "hover:bg-slate-50/50 transition-colors", 
                    isDone && !hasError && "bg-emerald-50/20",
                    hasError && "bg-rose-50/30"
                  )}>
                    <td className="py-4">
                      <div className="font-medium text-slate-900">{asg.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">{asg.category}</span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase px-1.5 rounded",
                          asg.target_type === 'Percentage' ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
                        )}>
                          {asg.target_type}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center font-mono text-slate-400 font-bold">
                      {plan === 0 ? '-' : `${plan}${asg.target_type === 'Percentage' ? '%' : ''}`}
                    </td>
                    <td className="py-4">
                      <div className="relative">
                        <Input 
                          type="number" 
                          min="0"
                          max={asg.target_type === 'Percentage' ? "100" : undefined}
                          className={cn(
                            "h-10 font-mono text-center pr-6 rounded-xl transition-all", 
                            isDone && !hasError ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 font-bold" : "bg-slate-50/50 border-slate-100 focus:bg-white",
                            hasError && "border-rose-300 bg-rose-50 text-rose-600 focus:border-rose-500 focus:ring-rose-500"
                          )}
                          value={(actualVal === 0 || actualVal === undefined) ? '' : actualVal}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                            validate(asg.id, val, plan);
                            setActuals({
                              ...actuals, 
                              [asg.id]: { ...actuals[asg.id], completed_count: val }
                            });
                          }}
                        />
                        {asg.target_type === 'Percentage' && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                        )}
                      </div>
                      {hasError && (
                        <p className="text-[10px] text-rose-500 font-bold mt-1 ml-1">{hasError}</p>
                      )}
                    </td>
                    <td className="py-4 px-2">
                      <div className="relative">
                        <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                        <Input 
                          placeholder="https://..."
                          className="h-9 text-xs pl-7"
                          value={actuals[asg.id]?.evidence_link || ''}
                          onChange={(e) => setActuals({
                            ...actuals, 
                            [asg.id]: { ...actuals[asg.id], evidence_link: e.target.value }
                          })}
                        />
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="relative">
                        <MessageSquare className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                        <Input 
                          placeholder="Notes..."
                          className="h-9 text-xs pl-7"
                          value={actuals[asg.id]?.notes || ''}
                          onChange={(e) => setActuals({
                            ...actuals, 
                            [asg.id]: { ...actuals[asg.id], notes: e.target.value }
                          })}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <Button 
            className="gap-2 px-8 py-6 text-base" 
            onClick={handleSave} 
            disabled={saving || Object.keys(errors).length > 0}
          >
            {saving ? 'Saving...' : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Save Progress
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
