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
  CheckCircle2,
  Table
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
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#94a3b8'];

export const ReportsPage = () => {
  const { t } = useTranslation();
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
          {t('reports.monthly_tab')}
        </Link>
        <Link 
          to="/reports/annual" 
          className={cn(
            "text-sm font-bold px-8 py-2.5 rounded-[1rem] transition-all duration-300",
            window.location.pathname.includes('annual') ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"
          )}
        >
          {t('reports.annual_tab')}
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

const CustomYAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const words = payload.value.split(' ');
  const lines = [];
  let currentLine = '';
  
  words.forEach((word: string) => {
    if ((currentLine + word).length > 20) {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });
  lines.push(currentLine.trim());

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, index) => (
        <text 
          key={index}
          x={-12} 
          y={index * 14 - (lines.length - 1) * 7} 
          dy={4} 
          textAnchor="end" 
          fill="#64748b" 
          className="text-[11px] font-medium"
        >
          {line}
        </text>
      ))}
    </g>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 min-w-[160px]">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{data.name}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-slate-700">Total Count</span>
          <span className="text-lg font-black text-indigo-600">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  if (percent < 0.03) return null;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill={COLORS[index % COLORS.length]} 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-black"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const MonthlyReport = () => {
  const { t, i18n } = useTranslation();
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
    return Object.entries(cats)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
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

  const exportToExcel = () => {
    const wsData = data.map(item => ({
      'Даалгавар': item.name,
      'Ангилал': item.category,
      'Төлөвлөсөн': item.planned,
      'Гүйцэтгэсэн': item.completed,
      'Зөрүү': item.variance,
      'Хувь (%)': `${item.completionRate.toFixed(1)}%`
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Тайлан");
    XLSX.writeFile(wb, `${t('reports.monthly_report_title')}_${month}_${year}.xlsx`);
  };

  const exportToPDF = async () => {
    try {
      const reportElement = document.getElementById('monthly-report-content');
      if (!reportElement) {
        alert("Report content not found!");
        return;
      }

      // Add a small indicator that work is in progress
      const downloadBtn = document.activeElement as HTMLElement;
      const originalText = downloadBtn?.innerText;
      if (downloadBtn) downloadBtn.innerText = "Generating...";

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#f8fafc',
        windowWidth: reportElement.scrollWidth,
        windowHeight: reportElement.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('monthly-report-content');
          if (clonedElement) {
            clonedElement.style.padding = '20px';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      if (imgData === 'data:,') {
        throw new Error("Failed to capture report content as image.");
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${t('reports.monthly_report_title')}_${month}_${year}.pdf`);
      
      if (downloadBtn) downloadBtn.innerText = originalText || "PDF Report";
    } catch (error: any) {
      console.error("PDF Export failed:", error);
      alert(`Export failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-14 pt-8 print:m-0 print:p-0 print:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 print:hidden">
        <div>
          <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[1.1] mb-8">{t('reports.monthly_report_title')}</h1>
          <div className="flex items-center gap-3 mt-12">
            <div className="bg-white border border-slate-100 rounded-2xl px-2 py-1 flex items-center gap-1 shadow-sm">
              <select 
                className="bg-transparent border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer hover:bg-slate-50 transition-colors"
                value={month}
                onChange={(e) => setSearchParams({ year: year.toString(), month: e.target.value })}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Intl.DateTimeFormat(i18n.language === 'mn' ? 'mn-MN' : 'en-US', { month: 'long' }).format(new Date(year, i))}
                  </option>
                ))}
              </select>
              <div className="w-px h-4 bg-slate-200 mx-2"></div>
              <select 
                className="bg-transparent border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer hover:bg-slate-50 transition-colors"
                value={year}
                onChange={(e) => setSearchParams({ year: e.target.value, month: month.toString() })}
              >
                {[2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Button variant="outline" className="gap-2.5 h-12 px-8 rounded-2xl glass border-slate-200/60 shadow-xl shadow-slate-200/50 font-bold">
              <Download className="w-4 h-4" />
              Тайлан татах
            </Button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              <button onClick={exportToPDF} className="w-full px-6 py-4 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3">
                <FileText className="w-4 h-4 text-rose-500" />
                PDF Тайлан
              </button>
              <button onClick={exportToExcel} className="w-full px-6 py-4 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-t border-slate-50">
                <Table className="w-4 h-4 text-emerald-500" />
                Excel Өгөгдөл
              </button>
            </div>
          </div>
          <Button variant="outline" className="gap-2.5 h-12 px-8 rounded-2xl glass border-slate-200/60 shadow-xl shadow-slate-200/50 font-bold" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            {t('reports.print')}
          </Button>
        </div>
      </div>

      <div id="monthly-report-content" className="space-y-14 p-1 rounded-3xl">
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{t('reports.title_workplan')}</h1>
          <p className="text-slate-600 mt-2">
            {t('reports.period')}: {new Intl.DateTimeFormat(i18n.language === 'mn' ? 'mn-MN' : 'en-US', { month: 'long' }).format(new Date(year, month - 1))} {year}
          </p>
        </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4">
        <ReportStat 
          label={t('reports.stat_planned')} 
          value={stats.totalPlanned} 
          icon={<CalendarDays className="w-5 h-5 text-indigo-500" />}
          color="indigo"
        />
        <ReportStat 
          label={t('reports.stat_completed')} 
          value={stats.totalCompleted} 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          color="emerald"
        />
        <ReportStat 
          label={t('reports.stat_rate')} 
          value={`${stats.rate.toFixed(1)}%`} 
          icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
          color="amber"
        />
        <ReportStat 
          label={t('reports.stat_lagging')} 
          value={stats.behind} 
          icon={<AlertCircle className="w-5 h-5 text-rose-500" />}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block print:break-before-page">
        <Card 
          title={t('reports.execution_performance_title')} 
          className="lg:col-span-2 shadow-2xl shadow-slate-200/40 border-none overflow-hidden print:overflow-visible print:mb-8 print:break-inside-avoid"
        >
          <div className="h-[500px] mt-4 print:h-[550px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart 
                data={data.slice(0, 10)} 
                layout="vertical"
                margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
                barGap={-20}
              >
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={COLORS[0]} stopOpacity={1}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  domain={[0, Math.max(10, ...data.map(d => d.planned)) + 2]}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={<CustomYAxisTick />}
                  width={180}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 min-w-[200px]">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{d.category}</p>
                          <p className="text-sm font-bold text-slate-900 mb-3">{label}</p>
                          <div className="space-y-2.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-medium">Planned Target</span>
                              <span className="font-bold text-slate-700">{d.planned}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-medium">Actual Progress</span>
                              <span className="font-bold text-indigo-600">{d.completed}</span>
                            </div>
                            <div className="pt-2.5 border-t border-slate-50 flex justify-between items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase">Efficiency</span>
                              <span className={cn(
                                "text-xs font-black px-2 py-0.5 rounded-lg",
                                d.completionRate >= 100 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                              )}>
                                {d.completionRate.toFixed(1)}%
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
                  align="left" 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: '0px', paddingBottom: '30px', fontSize: '12px', fontWeight: 600, color: '#475569' }}
                />
                <Bar 
                  dataKey="planned" 
                  fill="#f1f5f9" 
                  name="Planned Target" 
                  radius={[0, 6, 6, 0]} 
                  barSize={20}
                />
                <Bar 
                  dataKey="completed" 
                  fill="url(#colorCompleted)" 
                  name="Actual Progress" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                  animationDuration={1500}
                />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title={t('reports.completed_by_category')} className="shadow-2xl shadow-slate-200/40 border-none print:break-inside-avoid print:mt-8 print:pb-12">
          <div className="h-[350px] print:h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                <defs>
                  {categoryData.map((_, index) => (
                    <linearGradient key={`gradient-${index}`} id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={1} />
                    </linearGradient>
                  ))}
                  <linearGradient id="gaugeBg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f1f5f9" stopOpacity={1} />
                    <stop offset="100%" stopColor="#e2e8f0" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="70%"
                  innerRadius={100}
                  outerRadius={140}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={8}
                  dataKey="value"
                  cornerRadius={12}
                  stroke="none"
                  label={renderCustomPieLabel}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#grad-${index})`} />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="60%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-4xl font-black text-slate-900"
                >
                  {`${stats.rate.toFixed(0)}%`}
                </text>
                <text
                  x="50%"
                  y="72%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"
                >
                  {t('reports.stat_rate')}
                </text>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: '20px', paddingBottom: '0px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title={t('reports.detailed_performance_table')} className="print:break-before-page">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-semibold text-slate-500 border-b border-slate-100">
                <th className="pb-3 px-4">{t('reports.table.assignment')}</th>
                <th className="pb-3 px-4">{t('reports.table.category')}</th>
                <th className="pb-3 px-4 text-center">{t('reports.table.planned')}</th>
                <th className="pb-3 px-4 text-center">{t('reports.table.completed')}</th>
                <th className="pb-3 px-4 text-center">{t('reports.table.variance')}</th>
                <th className="pb-3 px-4 text-right">{t('reports.table.rate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((row, i) => (
                <tr key={i}>
                  <td className="py-3 px-4 font-medium text-slate-900">{row.name}</td>
                  <td className="py-3 px-4 text-slate-500">{row.category}</td>
                  <td className="py-3 px-4 text-center font-mono">{row.planned}</td>
                  <td className="py-3 px-4 text-center font-mono">{row.completed}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      "font-mono font-medium",
                      row.variance < 0 ? "text-rose-600" : "text-emerald-600"
                    )}>
                      {row.variance > 0 ? `+${row.variance}` : row.variance}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {row.completionRate.toFixed(0)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
};

const AnnualReport = () => {
  const { t, i18n } = useTranslation();
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
        month: new Intl.DateTimeFormat(i18n.language === 'mn' ? 'mn-MN' : 'en-US', { month: 'short' }).format(new Date(year, i)),
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
          <h1 className="text-2xl font-bold text-slate-900">{t('reports.annual_summary')} {year}</h1>
          <p className="text-slate-500 mt-1">{t('reports.annual_desc')}</p>
        </div>
        <select 
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900"
          value={year}
          onChange={(e) => setSearchParams({ year: e.target.value })}
        >
          {[2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 print:mb-8">
        <Card className="bg-indigo-600 text-white border-none">
          <p className="text-indigo-100 text-sm font-medium">{t('reports.annual_completion')}</p>
          <h3 className="text-4xl font-bold mt-2">{stats.rate.toFixed(1)}%</h3>
          <div className="mt-4 h-2 bg-indigo-400/30 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${stats.rate}%` }}></div>
          </div>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm font-medium">{t('reports.total_annual_target')}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-2">{stats.totalTarget}</h3>
          <p className="text-slate-400 text-xs mt-1">{t('reports.annual_desc')}</p>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm font-medium">{t('reports.assignments_behind')}</p>
          <h3 className="text-3xl font-bold text-rose-600 mt-2">{stats.behindCount}</h3>
          <p className="text-slate-400 text-xs mt-1">{t('reports.annual_desc')}</p>
        </Card>
      </div>

      <Card title={t('reports.performance_trends')} className="print:break-before-page print:break-inside-avoid">
        <div className="h-[400px] mt-4 print:h-[450px]">
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
                label={{ value: t('reports.stat_rate'), angle: -90, position: 'insideLeft', offset: 10, fill: 'currentColor', fontSize: 10, fontWeight: 700, className: "text-slate-400" }}
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
                            <span className="text-xs text-slate-500">{t('reports.planned')}</span>
                            <span className="text-xs font-mono font-bold text-slate-700">{data.planned}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500">{t('reports.completed')}</span>
                            <span className="text-xs font-mono font-bold text-indigo-600">{data.completed}</span>
                          </div>
                          <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">{t('reports.success_rate')}</span>
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
                stroke={COLORS[0]} 
                name={t('reports.stat_rate')} 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#fff', stroke: COLORS[0], strokeWidth: 2 }} 
                activeDot={{ r: 8, strokeWidth: 0, fill: COLORS[0] }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title={t('reports.progress_by_assignment')} className="print:break-before-page">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3 px-4">{t('assignments.col_name')}</th>
                <th className="pb-3 px-4">{t('reports.annual_target')}</th>
                <th className="pb-3 px-4">{t('reports.completed_ytd')}</th>
                <th className="pb-3 px-4">{t('reports.remaining')}</th>
                <th className="pb-3 px-4">{t('reports.status')}</th>
                <th className="pb-3 px-4 text-right">{t('reports.stat_rate')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 font-medium text-slate-900">{row.name}</td>
                  <td className="py-4 px-4 font-mono text-slate-600">{row.target}</td>
                  <td className="py-4 px-4 font-mono text-slate-900">{row.completed}</td>
                  <td className="py-4 px-4 font-mono text-slate-500">{row.remaining}</td>
                  <td className="py-4 px-4">
                    {row.isBehind ? (
                      <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-bold uppercase">
                        <TrendingUp className="w-3 h-3 rotate-180" /> {t('reports.behind')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase">
                        <TrendingUp className="w-3 h-3" /> {t('reports.on_track')}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
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
    <div className="stat-card glass rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 flex flex-col gap-6 transition-all duration-500 border-white hover:border-indigo-100 print:p-6 print:rounded-3xl print:gap-4">
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
