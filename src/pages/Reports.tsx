import React from 'react';
import { Routes, Route, Link, useSearchParams, Navigate } from 'react-router-dom';
import { Card, Button } from '../components/UI';
import { 
  Printer, 
  Download, 
  Calendar, 
  BarChart, 
  PieChart as PieChartIcon,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  CalendarDays,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { supabase } from '../lib/supabase';
import { Assignment } from '../types';
import { cn } from '../lib/utils';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ReportsPage = () => {
  return (
    <div className="space-y-12">
      <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-[1.25rem] w-fit shadow-inner mb-4">
        <Link 
          to="/reports/monthly" 
          className={cn(
            "text-sm font-bold px-8 py-2.5 rounded-[1rem] transition-all duration-300",
            window.location.pathname.includes('monthly') ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Monthly Report
        </Link>
        <Link 
          to="/reports/annual" 
          className={cn(
            "text-sm font-bold px-8 py-2.5 rounded-[1rem] transition-all duration-300",
            window.location.pathname.includes('annual') ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Annual Summary
        </Link>
      </div>

      <Routes>
        <Route path="monthly" element={<MonthlyReport />} />
        <Route path="annual" element={<AnnualReport />} />
        <Route path="*" element={<Navigate to="monthly" replace />} />
      </Routes>
    </div>
  );
};

const MonthlyReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
  const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchData();
  }, [year, month]);

  const fetchData = async () => {
    setLoading(true);
    const { data: asgs } = await supabase.from('assignments').select('*');
    const { data: plans } = await supabase.from('monthly_plan').select('*').eq('year', year).eq('month', month);
    const { data: actuals } = await supabase.from('monthly_actual').select('*').eq('year', year).eq('month', month);

    const reportData = asgs?.map(asg => {
      const plan = plans?.find(p => p.assignment_id === asg.id)?.planned_count || 0;
      const actual = actuals?.find(a => a.assignment_id === asg.id)?.completed_count || 0;
      return {
        name: asg.name,
        category: asg.category,
        planned: plan,
        completed: actual,
        variance: actual - plan,
        completionRate: plan > 0 ? (actual / plan) * 100 : 0
      };
    }) || [];

    setData(reportData);
    setLoading(false);
  };

  const categoryData = React.useMemo(() => {
    const cats: Record<string, number> = {};
    data.forEach(d => {
      cats[d.category] = (cats[d.category] || 0) + d.completed;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [data]);

  const stats = React.useMemo(() => {
    const totalPlanned = data.reduce((sum, d) => sum + d.planned, 0);
    const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
    return {
      totalPlanned,
      totalCompleted,
      rate: totalPlanned > 0 ? (totalCompleted / totalPlanned) * 100 : 0,
      behind: data.filter(d => d.planned > 0 && d.completed < d.planned).length
    };
  }, [data]);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-14 pt-8 print:m-0 print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 print:hidden">
        <div>
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-8">Monthly Execution Report</h1>
          <div className="flex items-center gap-3 mt-12">
            <div className="bg-white border border-slate-100 rounded-2xl px-2 py-1 flex items-center gap-1 shadow-sm">
              <select 
                className="bg-transparent border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer hover:bg-slate-50 transition-colors"
                value={month}
                onChange={(e) => setSearchParams({ year: year.toString(), month: e.target.value })}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(2024, i))}
                  </option>
                ))}
              </select>
              <div className="w-px h-4 bg-slate-200 mx-2"></div>
              <select 
                className="bg-transparent border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer hover:bg-slate-50 transition-colors"
                value={year}
                onChange={(e) => setSearchParams({ year: e.target.value, month: month.toString() })}
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>
        <Button variant="outline" className="gap-2.5 h-12 px-8 rounded-2xl glass border-slate-200/60 shadow-xl shadow-slate-200/50 font-bold" onClick={handlePrint}>
          <Printer className="w-4 h-4" />
          Print Report
        </Button>
      </div>

      {/* Report Header (Print Only) */}
      <div className="hidden print:block text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">WorkPlan Execution Report</h1>
        <p className="text-slate-600 mt-2">
          Period: {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(year, month - 1))} {year}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportStat 
          label="Total Planned" 
          value={stats.totalPlanned} 
          icon={<CalendarDays className="w-5 h-5 text-indigo-500" />}
          color="indigo"
        />
        <ReportStat 
          label="Total Completed" 
          value={stats.totalCompleted} 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          color="emerald"
        />
        <ReportStat 
          label="Completion Rate" 
          value={`${stats.rate.toFixed(1)}%`} 
          icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
          color="amber"
        />
        <ReportStat 
          label="Lagging Items" 
          value={stats.behind} 
          icon={<AlertCircle className="w-5 h-5 text-rose-500" />}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Execution Performance by Assignment">
          <div className="h-[400px] mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart 
                data={data.slice(0, 12)} 
                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                barGap={-32} // Overlay the bars
              >
                <defs>
                  <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 500 }}
                  tickMargin={12}
                  className="text-slate-500"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                  tickMargin={12}
                  className="text-slate-500"
                />
                <Tooltip 
                  cursor={{ fill: 'currentColor', opacity: 0.1 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 min-w-[200px]">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{data.category}</p>
                          <p className="text-sm font-bold text-slate-900 mb-3">{label}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500">Planned</span>
                              <span className="font-mono font-bold text-slate-700">{data.planned}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500">Completed</span>
                              <span className="font-mono font-bold text-indigo-600">{data.completed}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Efficiency</span>
                              <span className={cn(
                                "text-xs font-bold px-1.5 py-0.5 rounded",
                                data.completionRate >= 100 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                              )}>
                                {data.completionRate.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }}
                />
                <Bar 
                  dataKey="planned" 
                  fill="url(#colorPlanned)" 
                  name="Planned Target" 
                  radius={[8, 8, 0, 0]} 
                  barSize={32}
                  stroke="currentColor"
                  className="text-slate-300"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                />
                <Bar 
                  dataKey="completed" 
                  fill="url(#colorCompleted)" 
                  name="Actual Progress" 
                  radius={[8, 8, 0, 0]} 
                  barSize={32}
                />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Completed by Category">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Detailed Performance Table">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-semibold text-slate-500 border-b border-slate-100">
                <th className="pb-3">Assignment</th>
                <th className="pb-3">Category</th>
                <th className="pb-3 text-center">Planned</th>
                <th className="pb-3 text-center">Completed</th>
                <th className="pb-3 text-center">Variance</th>
                <th className="pb-3 text-right">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((row, i) => (
                <tr key={i}>
                  <td className="py-3 font-medium text-slate-900">{row.name}</td>
                  <td className="py-3 text-slate-500">{row.category}</td>
                  <td className="py-3 text-center font-mono">{row.planned}</td>
                  <td className="py-3 text-center font-mono">{row.completed}</td>
                  <td className="py-3 text-center">
                    <span className={cn(
                      "font-mono font-medium",
                      row.variance < 0 ? "text-rose-600" : "text-emerald-600"
                    )}>
                      {row.variance > 0 ? `+${row.variance}` : row.variance}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono">
                    {row.completionRate.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const AnnualReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

  const [data, setData] = React.useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    setLoading(true);
    const { data: asgs } = await supabase.from('assignments').select('*');
    const { data: plans } = await supabase.from('monthly_plan').select('*').eq('year', year);
    const { data: actuals } = await supabase.from('monthly_actual').select('*').eq('year', year);

    // Calculate annual totals per assignment
    const reportData = asgs?.map(asg => {
      const totalCompleted = actuals?.filter(a => a.assignment_id === asg.id).reduce((sum, a) => sum + a.completed_count, 0) || 0;
      const remaining = asg.annual_target - totalCompleted;
      
      // Behind schedule logic: expected_to_date = annual_target * (current_month/12)
      const currentMonth = new Date().getMonth() + 1;
      const expectedToDate = (asg.annual_target * currentMonth) / 12;
      const isBehind = totalCompleted < expectedToDate;

      return {
        name: asg.name,
        target: asg.annual_target,
        completed: totalCompleted,
        remaining: Math.max(0, remaining),
        isBehind,
        progress: asg.annual_target > 0 ? (totalCompleted / asg.annual_target) * 100 : 0
      };
    }) || [];

    // Monthly trends
    const trends = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const mPlans = plans?.filter(p => p.month === month).reduce((sum, p) => sum + p.planned_count, 0) || 0;
      const mActuals = actuals?.filter(a => a.month === month).reduce((sum, a) => sum + a.completed_count, 0) || 0;
      return {
        month: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(year, i)),
        planned: mPlans,
        completed: mActuals,
        rate: mPlans > 0 ? (mActuals / mPlans) * 100 : 0
      };
    });

    setData(reportData);
    setMonthlyTrends(trends);
    setLoading(false);
  };

  const stats = React.useMemo(() => {
    const totalTarget = data.reduce((sum, d) => sum + d.target, 0);
    const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
    return {
      totalTarget,
      totalCompleted,
      rate: totalTarget > 0 ? (totalCompleted / totalTarget) * 100 : 0,
      behindCount: data.filter(d => d.isBehind).length
    };
  }, [data]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Annual Summary {year}</h1>
          <p className="text-slate-500 mt-1">Year-to-date performance and forecasting.</p>
        </div>
        <select 
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900"
          value={year}
          onChange={(e) => setSearchParams({ year: e.target.value })}
        >
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-600 text-white border-none">
          <p className="text-indigo-100 text-sm font-medium">Annual Completion</p>
          <h3 className="text-4xl font-bold mt-2">{stats.rate.toFixed(1)}%</h3>
          <div className="mt-4 h-2 bg-indigo-400/30 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${stats.rate}%` }}></div>
          </div>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm font-medium">Total Annual Target</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalTarget}</h3>
          <p className="text-slate-400 text-xs mt-1">Assignments across all categories</p>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm font-medium">Assignments Behind</p>
          <h3 className="text-3xl font-bold text-rose-600 mt-2">{stats.behindCount}</h3>
          <p className="text-slate-400 text-xs mt-1">Based on linear monthly projection</p>
        </Card>
      </div>

      <Card title="Annual Performance Trends">
        <div className="h-[400px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={monthlyTrends}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                className="text-slate-500"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-slate-500"
                label={{ value: 'Completion %', angle: -90, position: 'insideLeft', offset: 10, fill: 'currentColor', fontSize: 10, fontWeight: 700, className: "text-slate-400" }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 min-w-[180px]">
                        <p className="text-sm font-bold text-slate-900 mb-3">{label} {year}</p>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">Planned</span>
                            <span className="text-xs font-mono font-bold text-slate-700">{data.planned}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">Completed</span>
                            <span className="text-xs font-mono font-bold text-indigo-600">{data.completed}</span>
                          </div>
                          <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Success Rate</span>
                            <span className={cn(
                              "text-sm font-black",
                              data.rate >= 80 ? "text-emerald-500" : "text-amber-500"
                            )}>
                              {data.rate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600 }}
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#6366f1" 
                name="Monthly Success Rate" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#fff', stroke: '#6366f1', strokeWidth: 2 }} 
                activeDot={{ r: 8, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Annual Progress by Assignment">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3">Assignment</th>
                <th className="pb-3">Annual Target</th>
                <th className="pb-3">Completed YTD</th>
                <th className="pb-3">Remaining</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 font-medium text-slate-900">{row.name}</td>
                  <td className="py-4 font-mono text-slate-600">{row.target}</td>
                  <td className="py-4 font-mono text-slate-900">{row.completed}</td>
                  <td className="py-4 font-mono text-slate-500">{row.remaining}</td>
                  <td className="py-4">
                    {row.isBehind ? (
                      <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-bold uppercase">
                        <TrendingUp className="w-3 h-3 rotate-180" /> Behind
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase">
                        <TrendingUp className="w-3 h-3" /> On Track
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-xs font-mono text-slate-500">{row.progress.toFixed(0)}%</span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", row.isBehind ? "bg-rose-500" : "bg-emerald-500")} 
                          style={{ width: `${Math.min(100, row.progress)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const ReportStat = ({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) => {
  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 ring-indigo-500/10',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/10',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/10',
  };

  const barColorMap: Record<string, string> = {
    indigo: 'bg-indigo-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
  };

  return (
    <div className="stat-card glass rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 flex flex-col gap-6 transition-all duration-500 border-white hover:border-indigo-100">
      <div className="flex items-center justify-between">
        <div className={cn("w-14 h-14 rounded-2xl border ring-4 flex items-center justify-center shadow-sm", colorMap[color])}>
          {icon}
        </div>
        <div className="h-1.5 w-14 bg-slate-100 rounded-full overflow-hidden">
          <div className={cn("h-full w-2/3 rounded-full", barColorMap[color])}></div>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-3">{label}</p>
        <p className="text-5xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  );
};
