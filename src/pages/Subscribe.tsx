import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import {
  CheckCircle2,
  Loader2,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Users,
  Shield,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import { motion } from 'motion/react';

const CHECKOUT_URL =
  (import.meta as any).env.VITE_LEMONSQUEEZY_CHECKOUT_URL ||
  'https://tailanos.lemonsqueezy.com/checkout/buy/32d6a4a7-a10c-4399-84fc-48589315860f';

const features = [
  { icon: ClipboardList,  label: 'Ажилтны тайлангийн хяналт' },
  { icon: BarChart3,      label: 'Гүйцэтгэлийн dashboard' },
  { icon: FileSpreadsheet, label: 'Excel экспорт' },
  { icon: FileText,       label: 'PDF экспорт' },
  { icon: Users,          label: 'Багийн үйл ажиллагааны тойм' },
  { icon: Shield,         label: 'Аюулгүй үүлэн хандалт' },
];

export const SubscribePage = () => {
  const { session, refetchSubscription, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = React.useState(false);

  // If disconnected/not logged in, send to /auth
  React.useEffect(() => {
    if (!session) navigate('/auth');
  }, [session, navigate]);

  // If subscription becomes active (e.g. from webhook), go to dashboard
  React.useEffect(() => {
    if (isSubscribed) {
      navigate('/');
    }
  }, [isSubscribed, navigate]);

  // Auto-refresh subscription status when returning to tab
  React.useEffect(() => {
    if (!session) return;
    
    const onFocus = () => refetchSubscription();
    window.addEventListener('focus', onFocus);
    
    // Poll every 5 seconds while on this page to catch webhook updates
    const interval = setInterval(() => {
      refetchSubscription();
    }, 5000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [session, refetchSubscription]);

  const handleSubscribe = () => {
    if (!session) {
      navigate('/auth');
      return;
    }
    const email = session.user.email || '';
    const url = new URL(CHECKOUT_URL);
    if (email) url.searchParams.set('checkout[email]', email);
    // Pass user_id as custom data so webhooks can link the subscription
    url.searchParams.set('checkout[custom][user_id]', session.user.id);
    window.open(url.toString(), '_blank');
  };

  const handleAlreadySubscribed = async () => {
    setChecking(true);
    // 1. Try to fetch the latest subscription status
    await refetchSubscription();
    
    // 2. Wait slightly to see if the React effect auto-redirects us due to the state change
    setTimeout(async () => {
      // If we are still on this page after 1.5 seconds, the subscription is truly inactive.
      // So we log out and send them to the login page so they can log into their paid account.
      if (document.location.pathname === '/subscribe') {
        await supabase.auth.signOut().catch(e => console.error(e));
        navigate('/auth');
      }
      setChecking(false);
    }, 1500);
  };

  // FOR LOCAL TESTING: Simulate a webhook success
  const handleMockPayment = async () => {
    if (!session?.user?.id) return;
    try {
      await supabase.from('subscriptions').upsert({
        user_id: session.user.id,
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }, { onConflict: 'user_id' });
      await refetchSubscription();
    } catch(e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">

        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                  <defs>
                    <linearGradient id="subLogoBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                    <linearGradient id="subLogoGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <path d="M10,35 L55,35 L50,48 L42,48 L30,85 L15,85 L27,48 L15,48 Z" fill="url(#subLogoBlue)" />
                  <path d="M52,85 L64,48 C66,38 75,35 90,35 L90,48 C80,48 78,52 76,60 L64,85 Z" fill="url(#subLogoGreen)" />
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tighter">Tailan</span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-5xl font-black leading-tight mb-6 tracking-tight">
                Бүтээмжтэй<br />
                <span className="text-indigo-400">ажиллаарай.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm font-medium">
                Ажилтнуудын гүйцэтгэлийг хянаж, сарын тайланг автоматаар үүсгэх хамгийн хялбар арга.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 flex items-center gap-8 mt-12 pb-4 border-b border-white/10">
            <div>
              <p className="text-3xl font-black text-white">7 хоног</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Үнэгүй туршилт</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">2к+</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Идэвхтэй хэрэглэгч</p>
            </div>
          </div>
        </div>

        {/* Right Side: Pricing Card */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Plan badge */}
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Tailan Pro
              </div>

              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">
                9,900₮
              </h1>
              <p className="text-slate-500 font-medium mb-2">сард нэг удаа • татвар оруулаад</p>
              <p className="text-emerald-600 text-sm font-bold mb-8 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                7 хоногийн үнэгүй туршилт — карт шаардахгүй
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-10">
                {features.map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                    <span className="w-7 h-7 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-indigo-600" />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>

              {/* Subscribe button */}
              <button
                onClick={handleSubscribe}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-4"
              >
                7 хоног үнэгүй эхлэх →
              </button>

              {/* Already subscribed */}
              <button
                onClick={handleAlreadySubscribed}
                disabled={checking}
                className="w-full h-10 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-500 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Аль хэдийн захиалсан — нэвтрэх
              </button>
            </motion.div>

            {/* Footer */}
            <footer className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[11px] text-slate-400">
                {session?.user?.email}
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-rose-500 transition-colors font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                Гарах
              </button>
            </footer>
          </div>
        </div>
      </div>

      {/* Temporary Debugging UI */}
      <div className="fixed bottom-4 right-4 bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs z-50 shadow-2xl border border-slate-700 max-w-sm font-mono break-all">
        <h3 className="font-bold text-white mb-2 pb-1 border-b border-slate-700">DEBUG INFO</h3>
        <p>User Auth State: {session ? 'Logged in' : 'Logged out'}</p>
        <p>User ID: {session?.user?.id || 'N/A'}</p>
        <p>Subscription State (isSubscribed): {isSubscribed ? 'TRUE' : 'FALSE'}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <button 
            onClick={() => refetchSubscription()} 
            className="bg-slate-800 text-white px-2 py-1 rounded hover:bg-slate-700 border border-slate-700"
          >
            Force Refetch State
          </button>
          <button 
            onClick={handleMockPayment} 
            className="bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-600/40 border border-emerald-500/30"
          >
            Simulate Webhook (Active)
          </button>
        </div>
      </div>

    </div>
  );
};
