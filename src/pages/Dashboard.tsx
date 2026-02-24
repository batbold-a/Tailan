import React from 'react';
import { Card, Button } from '../components/UI';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  ArrowRight,
  Plus,
  Zap,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { Assignment } from '../types';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export const Dashboard = () => {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalPlanned: 0,
    totalCompleted: 0,
    completionRate: 0,
    behindCount: 0
  });
  const [trendData, setTrendData] = React.useState<any[]>([]);
  const [selectedYear] = React.useState(new Date().getFullYear());
  const [selectedMonth] = React.useState(new Date().getMonth() + 1);

  React.useEffect(() => {
    fetchDashboardData();
  }, [selectedYear, selectedMonth]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: assignments } = await supabase.from('assignments').select('*');
      const { data: plans } = await supabase
        .from('monthly_plan')
        .select('*')
        .eq('year', selectedYear)
        .eq('month', selectedMonth);
      const { data: actuals } = await supabase
        .from('monthly_actual')
        .select('*')
        .eq('year', selectedYear)
        .eq('month', selectedMonth);

      const totalPlanned = plans?.reduce((sum, p) => sum + p.planned_count, 0) || 0;
      const totalCompleted = actuals?.reduce((sum, a) => sum + a.completed_count, 0) || 0;
      const completionRate = totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0;

      const behind = assignments?.filter(asg => {
        const plan = plans?.find(p => p.assignment_id === asg.id)?.planned_count || 0;
        const actual = actuals?.find(a => a.assignment_id === asg.id)?.completed_count || 0;
        return plan > 0 && actual < plan;
      }) || [];

      setStats({
        totalPlanned,
        totalCompleted,
        completionRate,
        behindCount: behind.length
      });

      // Calculate 6-month trend
      const trend = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(selectedYear, selectedMonth - 1 - i, 1);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        
        const { data: p } = await supabase.from('monthly_plan').select('planned_count').eq('year', y).eq('month', m);
        const { data: a } = await supabase.from('monthly_actual').select('completed_count').eq('year', y).eq('month', m);
        
        const tp = p?.reduce((sum, item) => sum + item.planned_count, 0) || 0;
        const tc = a?.reduce((sum, item) => sum + item.completed_count, 0) || 0;
        const rate = tp > 0 ? (tc / tp) * 100 : 0;
        
        trend.push({
          month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d),
          rate
        });
      }
      setTrendData(trend);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedDemoData = async () => {
    if (!confirm('This will add demo assignments, plans, and actuals. Continue?')) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Create Assignments
      const demoAsgs = [
        { user_id: user.id, name: 'Teach laws at university', category: 'Training', frequency_type: 'Yearly', target_type: 'Count', annual_target: 4 },
        { user_id: user.id, name: 'Wildlife survival training', category: 'Public Training', frequency_type: 'Monthly', target_type: 'Count', annual_target: 24 },
        { user_id: user.id, name: 'Safety Equipment Audit', category: 'Compliance', frequency_type: 'Monthly', target_type: 'Count', annual_target: 12 },
        { user_id: user.id, name: 'Quarterly Stakeholder Review', category: 'Management', frequency_type: 'Quarterly', target_type: 'Count', annual_target: 4 },
        { user_id: user.id, name: 'System Implementation Progress', category: 'IT', frequency_type: 'Monthly', target_type: 'Percentage', annual_target: 100 }
      ];

      const { data: createdAsgs } = await supabase.from('assignments').insert(demoAsgs).select();

      if (createdAsgs) {
        // 2. Create Plans for current month
        const demoPlans = createdAsgs.map(asg => ({
          user_id: user.id,
          assignment_id: asg.id,
          year: selectedYear,
          month: selectedMonth,
          planned_count: Math.round(asg.annual_target / 12) || 1
        }));
        await supabase.from('monthly_plan').insert(demoPlans);

        // 3. Create Actuals for current month (some completed, some lagging)
        const demoActuals = createdAsgs.map((asg, i) => ({
          user_id: user.id,
          assignment_id: asg.id,
          year: selectedYear,
          month: selectedMonth,
          completed_count: i === 0 ? 0 : Math.round(asg.annual_target / 12),
          notes: i === 0 ? 'Delayed due to scheduling' : 'Completed on time'
        }));
        await supabase.from('monthly_actual').insert(demoActuals);
      }

      alert('Demo data seeded successfully!');
      fetchDashboardData();
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error seeding data. Check console.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}
      </div>
      <div className="h-64 bg-slate-200 rounded-2xl"></div>
    </div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview for {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2024, selectedMonth - 1))} {selectedYear}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2.5 h-12 px-6 rounded-2xl glass border-slate-200/60 shadow-sm hover:shadow-md transition-all" onClick={seedDemoData}>
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-bold">Seed Demo Data</span>
          </Button>
          <Link to="/plan">
            <Button variant="outline" className="gap-2.5 h-12 px-6 rounded-2xl glass border-slate-200/60 shadow-sm hover:shadow-md transition-all">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span className="font-bold text-slate-700">Update Plan</span>
            </Button>
          </Link>
          <Link to="/actual">
            <Button className="gap-2.5 h-12 px-8 rounded-2xl bg-slate-900 shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all">
              <Plus className="w-4 h-4" />
              <span className="font-bold">Log Progress</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Planned" 
          value={stats.totalPlanned} 
          icon={Calendar} 
          color="indigo" 
        />
        <StatCard 
          title="Total Completed" 
          value={stats.totalCompleted} 
          icon={CheckCircle2} 
          color="emerald" 
        />
        <StatCard 
          title="Completion Rate" 
          value={`${stats.completionRate.toFixed(1)}%`} 
          icon={TrendingUp} 
          color="amber" 
        />
        <StatCard 
          title="Behind Schedule" 
          value={stats.behindCount} 
          icon={AlertCircle} 
          color="rose" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Completion Rate Trend Chart */}
        <Card title="Completion Rate Trend" subtitle="Performance over the last 6 months" className="lg:col-span-2">
          {trendData.length > 0 ? (
            <div className="h-[340px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 600 }}
                    tickMargin={12}
                    className="text-slate-400"
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 11 }}
                    tickMargin={12}
                    className="text-slate-400"
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 min-w-[150px]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-900">Completion</span>
                              <span className="text-lg font-black text-indigo-600">{payload[0].value?.toFixed(1)}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRate)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-slate-900 font-medium">All caught up!</h3>
              <p className="text-slate-500 text-sm mt-1">No assignments are currently behind schedule.</p>
            </div>
          )}
        </Card>

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
          <Card title="Quick Links">
            <div className="space-y-3">
              <QuickLink to="/assignments" label="Manage Assignments" />
              <QuickLink to="/reports/monthly" label="View Monthly Report" />
              <QuickLink to="/reports/annual" label="Annual Summary" />
            </div>
          </Card>
          
          <Card className="bg-indigo-600 text-white border-none">
            <h3 className="font-semibold text-lg mb-2">Pro Tip</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Use the "Bulk Import" feature in Assignments to quickly set up your entire annual plan from a spreadsheet or text list.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) => {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 ring-indigo-500/10',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/10',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/10',
  };

  return (
    <div className="stat-card glass rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 flex flex-col gap-6 transition-all duration-500 border-white hover:border-indigo-100">
      <div className={cn("w-14 h-14 rounded-2xl border ring-4 flex items-center justify-center shadow-sm", colorMap[color])}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-3">{title}</p>
        <p className="text-5xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  );
};

const QuickLink = ({ to, label }: { to: string; label: string }) => (
  <Link 
    to={to} 
    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
  >
    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">{label}</span>
    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
  </Link>
);
