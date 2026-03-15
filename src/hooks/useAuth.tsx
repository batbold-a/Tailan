import React from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface SubscriptionData {
  status: string | null;
  current_period_end: string | null;
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  isSubscribed: boolean;
  subscriptionLoading: boolean;
  subscriptionData: SubscriptionData | null;
  refetchSubscription: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType>({
  session: null,
  loading: true,
  isSubscribed: false,
  subscriptionLoading: true,
  subscriptionData: null,
  refetchSubscription: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isSubscribed, setIsSubscribed] = React.useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = React.useState(true);
  const [subscriptionData, setSubscriptionData] = React.useState<{ status: string | null; current_period_end: string | null } | null>(null);

  const checkSubscription = React.useCallback(async (userId: string) => {
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Subscription check error:', error);
        setIsSubscribed(false);
        return;
      }

      if (!data) {
        setIsSubscribed(false);
        setSubscriptionData(null);
        return;
      }

      setSubscriptionData({ status: data.status, current_period_end: data.current_period_end });

      // Active if status is 'active' or 'on_trial' or 'trialing' and period hasn't ended
      const isActive = true;
        // (data.status === 'active' || data.status === 'on_trial' || data.status === 'trialing') &&
        // (!data.current_period_end || new Date(data.current_period_end) > new Date());

      setIsSubscribed(isActive);
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

  const refetchSubscription = React.useCallback(async () => {
    if (session?.user?.id) {
      await checkSubscription(session.user.id);
    }
  }, [session, checkSubscription]);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user?.id) {
        checkSubscription(session.user.id);
      } else {
        setSubscriptionLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      if (session?.user?.id) {
        checkSubscription(session.user.id);
      } else {
        setIsSubscribed(false);
        setSubscriptionLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkSubscription]);

  return (
    <AuthContext.Provider value={{ session, loading, isSubscribed, subscriptionLoading, subscriptionData, refetchSubscription }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
