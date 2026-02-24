import React from 'react';
import { Card, Button, Input, Label } from '../components/UI';
import { 
  Save, 
  ChevronLeft, 
  ChevronRight, 
  Zap,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Assignment } from '../types';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

export const PlanPage = () => {
  const { session } = useAuth();
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [plans, setPlans] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  
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

      if (asgs) setAssignments(asgs);
      
      const planMap: Record<string, number> = {};
      plns?.forEach(p => {
        planMap[p.assignment_id] = p.planned_count;
      });
      setPlans(planMap);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);

    const upserts = assignments.map(asg => ({
      user_id: session.user.id,
      assignment_id: asg.id,
      year,
      month,
      planned_count: plans[asg.id] || 0
    }));

    const { error } = await supabase.from('monthly_plan').upsert(upserts, {
      onConflict: 'user_id,year,month,assignment_id'
    });

    if (error) alert('Error saving plan: ' + error.message);
    setSaving(false);
  };

  const fillDefaults = () => {
    const newPlans = { ...plans };
    assignments.forEach(asg => {
      if (!newPlans[asg.id]) {
        newPlans[asg.id] = Math.round(asg.annual_target / 12);
      }
    });
    setPlans(newPlans);
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
          <h1 className="text-3xl font-bold text-slate-900">Monthly Planning</h1>
          <p className="text-slate-500 mt-1">Set expected targets for each assignment.</p>
        </div>
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

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Assignment Targets</h2>
          <Button variant="outline" size="sm" className="gap-2" onClick={fillDefaults}>
            <Zap className="w-4 h-4 text-amber-500" />
            Fill Defaults
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3">Assignment</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Annual Target</th>
                <th className="pb-3 w-32">Planned Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => <tr key={i} className="h-16 animate-pulse bg-slate-50/50"></tr>)
              ) : assignments.map((asg) => (
                <tr key={asg.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4">
                    <div className="font-medium text-slate-900">{asg.name}</div>
                    <div className="text-xs text-slate-500 uppercase">{asg.category}</div>
                  </td>
                  <td className="py-4">
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      asg.target_type === 'Percentage' ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {asg.target_type}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-slate-500">
                    {asg.annual_target}{asg.target_type === 'Percentage' ? '%' : ''} total
                  </td>
                  <td className="py-4">
                    <div className="relative">
                      <Input 
                        type="number" 
                        min="0"
                        max={asg.target_type === 'Percentage' ? "100" : undefined}
                        className="h-10 font-mono text-center pr-8 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white transition-all"
                        value={(plans[asg.id] === 0 || plans[asg.id] === undefined) ? '' : plans[asg.id]}
                        placeholder="0"
                        onChange={(e) => setPlans({...plans, [asg.id]: e.target.value === '' ? 0 : parseInt(e.target.value) || 0})}
                      />
                      {asg.target_type === 'Percentage' && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">%</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end">
          <Button className="gap-2 px-8 py-6 text-base" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : (
              <>
                <Save className="w-5 h-5" />
                Save Monthly Plan
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
