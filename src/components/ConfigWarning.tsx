import React from 'react';
import { Card, Button } from './UI';
import { AlertTriangle, ExternalLink, Settings } from 'lucide-react';

export const ConfigWarning = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-amber-200 bg-amber-50/30">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Supabase Configuration Required</h2>
          <p className="text-slate-600 mt-2 text-sm">
            To use WorkPlan, you need to connect your own Supabase project. This error usually happens when environment variables are missing.
          </p>

          <div className="mt-6 w-full space-y-4 text-left">
            <div className="bg-white p-4 rounded-xl border border-amber-100 text-xs font-mono text-slate-700">
              <p className="font-bold mb-2 text-amber-800">Required Variables:</p>
              <p>VITE_SUPABASE_URL=...</p>
              <p>VITE_SUPABASE_ANON_KEY=...</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Setup Steps:
              </h4>
              <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1">
                <li>Create a project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">supabase.com</a></li>
                <li>Go to Project Settings &gt; API</li>
                <li>Copy the Project URL and anon key</li>
                <li>Add them to the "Secrets" panel in Tailan settings</li>
              </ol>
            </div>
          </div>

          <Button 
            className="w-full mt-8 gap-2"
            onClick={() => window.location.reload()}
          >
            I've added the keys, reload app
          </Button>
        </div>
      </Card>
    </div>
  );
};
