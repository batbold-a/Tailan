import React from 'react';
import { Card, Button } from '../components/UI';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  LogOut,
  User,
  Calendar,
  Zap,
} from 'lucide-react';

const LEMON_SQUEEZY_PORTAL = 'https://tailanos.lemonsqueezy.com/billing';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active:     { label: 'Идэвхтэй',  color: 'emerald', icon: CheckCircle2 },
  on_trial:   { label: '7 хоногийн туршилт', color: 'indigo', icon: Zap },
  cancelled:  { label: 'Цуцалсан',   color: 'amber',   icon: XCircle },
  expired:    { label: 'Дуусгавар',  color: 'rose',    icon: XCircle },
  paused:     { label: 'Түр зогссон', color: 'slate',  icon: Clock },
  inactive:   { label: 'Идэвхгүй',  color: 'slate',   icon: Clock },
};

export const SettingsPage = () => {
  const { session, subscriptionData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const status = subscriptionData?.status || 'inactive';
  const cfg = statusConfig[status] ?? statusConfig.inactive;
  const StatusIcon = cfg.icon;

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    indigo:  'bg-indigo-50 text-indigo-700 border-indigo-200',
    amber:   'bg-amber-50 text-amber-700 border-amber-200',
    rose:    'bg-rose-50 text-rose-700 border-rose-200',
    slate:   'bg-slate-100 text-slate-600 border-slate-200',
  };

  const billingDate = subscriptionData?.current_period_end
    ? new Intl.DateTimeFormat('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' }).format(
        new Date(subscriptionData.current_period_end)
      )
    : null;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Тохиргоо</h1>
        <p className="text-slate-500 mt-1">Бүртгэл болон төлбөрийн тохиргоо</p>
      </div>

      {/* Account Info Card */}
      <Card title="Бүртгэлийн мэдээлэл" subtitle="Таны нэвтрэх хаяг ба бүртгэл">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{session?.user?.email}</p>
              <p className="text-xs text-slate-400 mt-0.5">Supabase-р баталгаажсан</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2 text-rose-600 border-rose-100 hover:bg-rose-50 hover:border-rose-200"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Гарах
          </Button>
        </div>
      </Card>

      {/* Billing Card */}
      <Card title="Захиалга & Төлбөр" subtitle="Одоогийн тарифын төлөвлөгөөний дэлгэрэнгүй">
        <div className="space-y-6">

          {/* Plan + Status row */}
          <div className="flex items-start justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-slate-900 text-lg tracking-tight">Tailan Pro</p>
                <p className="text-slate-500 text-sm font-medium">9,900₮ / сард</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-bold whitespace-nowrap ${colorMap[cfg.color]}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {cfg.label}
            </span>
          </div>

          {/* Next billing date */}
          {billingDate && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <span className="text-slate-500">
                  {status === 'cancelled' ? 'Хандалт дуусах огноо:' : 'Дараачийн төлбөр:'}
                </span>{' '}
                <span className="font-semibold text-slate-800">{billingDate}</span>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Manage Subscription button */}
          <div>
            <Button
              className="gap-2.5 h-12 px-6 bg-slate-900 hover:bg-indigo-700 text-white shadow-lg shadow-slate-200 transition-all"
              onClick={() => window.open(LEMON_SQUEEZY_PORTAL, '_blank')}
            >
              <CreditCard className="w-4 h-4" />
              Захиалга удирдах
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </Button>
            <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
              Төлбөрийн мэдээлэл шинэчлэх, карт солих эсвэл захиалга цуцлах.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
