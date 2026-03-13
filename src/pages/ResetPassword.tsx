import React from 'react';
import { supabase } from '../lib/supabase';
import { Button, Input, Label } from '../components/UI';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (password !== confirmPassword) {
      setError(t('auth.reset_error_match'));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t('auth.reset_error_length'));
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      // Optional: Sign out to force re-login
      await supabase.auth.signOut();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-8 lg:p-12 border border-slate-100"
      >
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            {t('auth.reset_title')}
          </h1>
          <p className="text-slate-500 font-medium">
            {t('auth.reset_desc')}
          </p>
        </header>

        {success ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <p className="text-slate-900 font-bold text-lg mb-2">
              {t('auth.reset_success')}
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="mt-6 w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800"
            >
              {t('auth.link_login')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                {t('auth.reset_label_new')}
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.reset_placeholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                {t('auth.reset_label_confirm')}
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-600 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('auth.reset_placeholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-12 h-14 rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold rounded-2xl">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-200"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                t('auth.reset_btn')
              )}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
