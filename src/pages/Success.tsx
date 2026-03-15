import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, Loader2 } from 'lucide-react';

export const SuccessPage = () => {
  const navigate = useNavigate();
  const { refetchSubscription, isSubscribed, loading, subscriptionLoading } = useAuth();
  const [checking, setChecking] = React.useState(true);
  const [attempts, setAttempts] = React.useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      await refetchSubscription();
      setAttempts(prev => prev + 1);
    };

    // Check immediately, then every 2 seconds
    checkStatus();
    interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [refetchSubscription]);

  useEffect(() => {
    if (isSubscribed) {
      navigate('/', { replace: true });
    } else if (attempts >= 10) {
      // Give up after ~20 seconds
      setChecking(false);
    }
  }, [isSubscribed, attempts, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-indigo-500" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 mb-2">
          Баяр хүргэе!
        </h1>
        
        {loading || subscriptionLoading || checking ? (
          <div>
            <p className="text-slate-500 font-medium mb-6">
              Таны бүртгэлийг баталгаажуулж байна. Түр хүлээнэ үү...
            </p>
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-slate-500 font-medium mb-6">
              Бүртгэл баталгаажсангүй. Та дахин оролдох эсвэл админтай холбогдоно уу.
            </p>
            <button
              onClick={() => navigate('/')}
              className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
            >
              Үндсэн хуудас руу буцах
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
