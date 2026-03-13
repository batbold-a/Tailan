import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Check, 
  ArrowRight, 
  BarChart3, 
  CalendarRange, 
  ClipboardList, 
  Zap,
  Shield,
  Globe,
  ChevronRight
} from 'lucide-react';
import { Button, Input } from '../components/UI';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export const LandingPage = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-3">
                <Logo />
                <span className="text-2xl font-black tracking-tighter">Tailan</span>
              </div>
              <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
                <a href="#features" className="hover:text-slate-900 transition-colors">{t('landing.nav_features')}</a>
                <a href="#pricing" className="hover:text-slate-900 transition-colors">{t('landing.nav_pricing')}</a>
                <a href="#solutions" className="hover:text-slate-900 transition-colors">{t('landing.nav_solutions')}</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth" className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4">{t('landing.nav_login')}</Link>
              <Link to="/auth?signup=true">
                <Button className="rounded-full px-6 bg-slate-900 hover:bg-slate-800 font-bold">{t('landing.nav_start_trial')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                <Zap className="w-3 h-3 fill-indigo-600" />
                {t('landing.hero_badge')}
              </div>
              <h1 className="text-7xl sm:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900 mb-8">
                {t('landing.hero_title_1')} <br /> 
                <span className="text-indigo-600">{t('landing.hero_title_2')}</span>
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-lg">
                {t('landing.hero_desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 max-w-md relative">
                  <Input 
                    placeholder={t('landing.hero_input')}
                    className="h-14 rounded-full pl-6 pr-32 border-slate-200 focus:ring-indigo-500"
                  />
                  <Button className="absolute right-1.5 top-1.5 h-11 rounded-full px-6 bg-slate-900 hover:bg-slate-800 font-bold">
                    {t('landing.nav_start_trial')}
                  </Button>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400 font-medium">
                {t('landing.hero_subtext')}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 border border-slate-100 overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/dashboard/1200/800" 
                  alt="Tailan Dashboard" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-emerald-100 rounded-full blur-3xl opacity-50 -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">{t('landing.trust_title')}</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-40 grayscale">
            <span className="text-2xl font-black tracking-tighter">STRIPE</span>
            <span className="text-2xl font-black tracking-tighter">VERCEL</span>
            <span className="text-2xl font-black tracking-tighter">LINEAR</span>
            <span className="text-2xl font-black tracking-tighter">SHOPIFY</span>
            <span className="text-2xl font-black tracking-tighter">NOTION</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl font-black tracking-tighter text-slate-900 mb-6">{t('landing.feat_title')}</h2>
            <p className="text-lg text-slate-500">{t('landing.feat_desc')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ClipboardList}
              title={t('landing.feat_1_title')}
              description={t('landing.feat_1_desc')}
              color="indigo"
            />
            <FeatureCard 
              icon={CalendarRange}
              title={t('landing.feat_2_title')}
              description={t('landing.feat_2_desc')}
              color="emerald"
            />
            <FeatureCard 
              icon={BarChart3}
              title={t('landing.feat_3_title')}
              description={t('landing.feat_3_desc')}
              color="amber"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black tracking-tighter mb-6">{t('landing.price_title')}</h2>
            <p className="text-indigo-200 text-lg">{t('landing.price_desc')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard 
              tier={t('landing.price_starter')}
              price="0"
              description={t('landing.price_starter_desc')}
              features={['Up to 5 assignments', 'Monthly tracking', 'Basic reports', 'Community support']}
              t={t}
            />
            <PricingCard 
              tier={t('landing.price_pro')}
              price="49"
              description={t('landing.price_pro_desc')}
              features={['Unlimited assignments', 'Annual forecasting', 'Advanced analytics', 'Priority support', 'Evidence attachments']}
              featured
              t={t}
            />
            <PricingCard 
              tier={t('landing.price_ent')}
              price={t('landing.price_custom')}
              description={t('landing.price_ent_desc')}
              features={['SSO & SAML', 'Custom reporting', 'Dedicated manager', 'Audit logs', 'Unlimited users']}
              t={t}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="bg-indigo-50 rounded-[3rem] p-16 md:p-24 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-8">
                {t('landing.cta_title_1')} <br /> {t('landing.cta_title_2')}
              </h2>
              <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
                {t('landing.cta_desc')}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/auth?signup=true">
                  <Button className="h-16 px-10 rounded-full bg-slate-900 hover:bg-slate-800 text-lg font-bold">
                    {t('landing.nav_start_trial')}
                  </Button>
                </Link>
                <Button variant="outline" className="h-16 px-10 rounded-full border-slate-200 text-lg font-bold bg-white">
                  {t('landing.btn_contact_sales')}
                </Button>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl -ml-32 -mb-32"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <Logo />
                <span className="text-2xl font-black tracking-tighter">Tailan</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t('landing.footer_desc')}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">{t('landing.footer_product')}</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('landing.footer_features')}</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('landing.footer_integ')}</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('landing.nav_pricing')}</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('landing.footer_changelog')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">{t('landing.footer_company')}</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('landing.footer_about')}</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('landing.footer_careers')}</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('landing.footer_privacy')}</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('landing.footer_terms')}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">{t('landing.footer_connect')}</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('landing.footer_twitter')}</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('landing.footer_linkedin')}</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('landing.footer_github')}</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">{t('landing.footer_discord')}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-slate-400 font-medium">{t('landing.footer_rights')}</p>
            <div className="flex items-center gap-6 text-slate-400">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-bold">{t('landing.footer_lang')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Logo = () => (
  <div className="w-10 h-10 flex items-center justify-center">
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
      <defs>
        <linearGradient id="logoBlueL" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#004e92" />
          <stop offset="100%" stopColor="#000428" />
        </linearGradient>
        <linearGradient id="logoGreenL" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#56ab2f" />
          <stop offset="100%" stopColor="#a8e063" />
        </linearGradient>
      </defs>
      <path d="M10,35 L55,35 L50,48 L42,48 L30,85 L15,85 L27,48 L15,48 Z" fill="url(#logoBlueL)" />
      <path d="M52,85 L64,48 C66,38 75,35 90,35 L90,48 C80,48 78,52 76,60 L64,85 Z" fill="url(#logoGreenL)" />
    </svg>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description, color }: any) => (
  <div className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all duration-500 group">
    <div className={cn(
      "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110",
      color === 'indigo' ? "bg-indigo-100 text-indigo-600" : 
      color === 'emerald' ? "bg-emerald-100 text-emerald-600" : 
      "bg-amber-100 text-amber-600"
    )}>
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{description}</p>
  </div>
);

const PricingCard = ({ tier, price, description, features, featured, t }: any) => (
  <div className={cn(
    "p-10 rounded-[2.5rem] flex flex-col transition-all duration-500",
    featured 
      ? "bg-white text-slate-900 shadow-2xl shadow-indigo-500/20 scale-105 z-10 border-2 border-indigo-500" 
      : "bg-slate-800/50 border border-slate-700 text-white hover:bg-slate-800"
  )}>
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-2">{tier}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-5xl font-black tracking-tighter">
          {price === t('landing.price_custom') ? price : `$${price}`}
        </span>
        {price !== t('landing.price_custom') && <span className={cn("text-sm font-bold", featured ? "text-slate-400" : "text-slate-500")}>/mo</span>}
      </div>
      <p className={cn("mt-4 text-sm leading-relaxed", featured ? "text-slate-500" : "text-slate-400")}>{description}</p>
    </div>
    <div className="space-y-4 mb-10 flex-1">
      {features.map((f: string) => (
        <div key={f} className="flex items-center gap-3">
          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", featured ? "bg-indigo-100 text-indigo-600" : "bg-slate-700 text-indigo-400")}>
            <Check className="w-3 h-3" />
          </div>
          <span className="text-sm font-medium">{f}</span>
        </div>
      ))}
    </div>
    <Button className={cn(
      "h-14 rounded-full font-bold text-lg transition-all",
      featured 
        ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
        : "bg-white hover:bg-slate-100 text-slate-900"
    )}>
      {price === t('landing.price_custom') ? t('landing.btn_contact_sales') : t('landing.nav_start_trial')}
    </Button>
  </div>
);
