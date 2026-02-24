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

export const LandingPage = () => {
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
                <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
                <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
                <a href="#solutions" className="hover:text-slate-900 transition-colors">Solutions</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth" className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4">Log in</Link>
              <Link to="/auth?signup=true">
                <Button className="rounded-full px-6 bg-slate-900 hover:bg-slate-800 font-bold">Start free trial</Button>
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
                New: Annual Forecasting 2.0
              </div>
              <h1 className="text-7xl sm:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900 mb-8">
                The platform <br /> 
                <span className="text-indigo-600">for execution.</span>
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-lg">
                Tailan helps high-performing teams plan, track, and report on their annual goals with precision. Built for clarity, designed for speed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 max-w-md relative">
                  <Input 
                    placeholder="Enter your work email" 
                    className="h-14 rounded-full pl-6 pr-32 border-slate-200 focus:ring-indigo-500"
                  />
                  <Button className="absolute right-1.5 top-1.5 h-11 rounded-full px-6 bg-slate-900 hover:bg-slate-800 font-bold">
                    Start free trial
                  </Button>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400 font-medium">
                Try Tailan free for 3 days, no credit card required.
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
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-8">Trusted by industry leaders</p>
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
            <h2 className="text-5xl font-black tracking-tighter text-slate-900 mb-6">Everything you need to scale execution.</h2>
            <p className="text-lg text-slate-500">Stop fighting spreadsheets. Tailan provides a unified system for your entire organization's work plan.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={ClipboardList}
              title="Assignment Management"
              description="Centralize every task, project, and recurring responsibility in one place."
              color="indigo"
            />
            <FeatureCard 
              icon={CalendarRange}
              title="Dynamic Planning"
              description="Build monthly and annual targets that adapt to your team's capacity."
              color="emerald"
            />
            <FeatureCard 
              icon={BarChart3}
              title="Automated Reporting"
              description="Generate boardroom-ready execution reports with a single click."
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
            <h2 className="text-5xl font-black tracking-tighter mb-6">Simple, transparent pricing.</h2>
            <p className="text-indigo-200 text-lg">Choose the plan that's right for your business.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard 
              tier="Starter"
              price="0"
              description="Perfect for individuals tracking personal goals."
              features={['Up to 5 assignments', 'Monthly tracking', 'Basic reports', 'Community support']}
            />
            <PricingCard 
              tier="Pro"
              price="49"
              description="Everything you need for a growing team."
              features={['Unlimited assignments', 'Annual forecasting', 'Advanced analytics', 'Priority support', 'Evidence attachments']}
              featured
            />
            <PricingCard 
              tier="Enterprise"
              price="Custom"
              description="Advanced security and controls for large orgs."
              features={['SSO & SAML', 'Custom reporting', 'Dedicated manager', 'Audit logs', 'Unlimited users']}
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
                Ready to master <br /> your execution?
              </h2>
              <p className="text-xl text-slate-600 mb-12 max-w-2xl mx-auto">
                Join over 10,000 teams who use Tailan to turn their annual plans into reality.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/auth?signup=true">
                  <Button className="h-16 px-10 rounded-full bg-slate-900 hover:bg-slate-800 text-lg font-bold">
                    Start free trial
                  </Button>
                </Link>
                <Button variant="outline" className="h-16 px-10 rounded-full border-slate-200 text-lg font-bold bg-white">
                  Contact sales
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
                The world's most intuitive execution platform for high-performing teams.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Connect</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Discord</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-slate-400 font-medium">© 2026 Tailan. All rights reserved.</p>
            <div className="flex items-center gap-6 text-slate-400">
              <Globe className="w-5 h-5" />
              <span className="text-sm font-bold">English (US)</span>
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

const PricingCard = ({ tier, price, description, features, featured }: any) => (
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
          {price === 'Custom' ? price : `$${price}`}
        </span>
        {price !== 'Custom' && <span className={cn("text-sm font-bold", featured ? "text-slate-400" : "text-slate-500")}>/mo</span>}
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
      {price === 'Custom' ? 'Contact sales' : 'Start free trial'}
    </Button>
  </div>
);
