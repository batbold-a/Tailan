import React from 'react';
import { supabase } from '../lib/supabase';
import { Button, Input, Label, Card } from '../components/UI';
import { CalendarRange, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const AuthPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const signUpRequested = searchParams.get('signup') === 'true';
    setIsLogin(!signUpRequested);
  }, [searchParams]);

  React.useEffect(() => {
    const authError =
      searchParams.get('error_description') ||
      searchParams.get('error') ||
      searchParams.get('message');

    if (authError) {
      setError(decodeURIComponent(authError.replace(/\+/g, ' ')));
    }
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        // Supabase might require email confirmation depending on settings
        // But for now we just show a success message or handle auto-login if enabled
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100 italic-none">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Left Side: Branding/Splash */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 flex items-center justify-center">
                 <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                    <defs>
                      <linearGradient id="logoBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                      <linearGradient id="logoGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <path d="M10,35 L55,35 L50,48 L42,48 L30,85 L15,85 L27,48 L15,48 Z" fill="url(#logoBlue)" />
                    <path d="M52,85 L64,48 C66,38 75,35 90,35 L90,48 C80,48 78,52 76,60 L64,85 Z" fill="url(#logoGreen)" />
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
                <Trans
                  i18nKey="auth.slogan_title"
                  defaults="Master your <br /><0>productivity</0> flow."
                  components={[
                    <span className="text-indigo-400" />,
                    <br />
                  ]}
                />
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-sm font-medium">
                {t('auth.slogan_desc')}
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 flex items-center gap-8 mt-12 pb-4 border-b border-white/10">
            <div>
              <p className="text-3xl font-black text-white">{t('auth.stat_uptime')}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('auth.stat_uptime_label')}</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white">{t('auth.stat_users')}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('auth.stat_users_label')}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <header className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                {isLogin ? t('auth.title_login') : t('auth.title_signup')}
              </h1>
              <p className="text-slate-500 font-medium">
                {isLogin ? t('auth.toggle_signup') : t('auth.toggle_login')}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-indigo-600 font-bold hover:underline underline-offset-4"
                >
                  {isLogin ? t('auth.link_signup') : t('auth.link_login')}
                </button>
              </p>
            </header>

            <form onSubmit={handleAuth} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  {t('auth.label_email')}
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth.placeholder_email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {t('auth.label_password')}
                  </Label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => navigate('/forgot-password')}
                      className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {t('auth.forgot_password')}
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('auth.placeholder_password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-2xl"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? t('auth.btn_login') : t('auth.btn_signup')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <footer className="mt-12 text-center text-[10px] font-medium text-slate-400 px-8">
              {t('auth.footer_text')}{' '}
              <a href="#" className="underline underline-offset-2 hover:text-indigo-600 transition-colors">{t('auth.footer_terms')}</a> {t('auth.footer_and')}{' '}
              <a href="#" className="underline underline-offset-2 hover:text-indigo-600 transition-colors">{t('auth.footer_privacy')}</a>.
            </footer>
          </div>
        </div>

      </div>
    </div>
  );
};

