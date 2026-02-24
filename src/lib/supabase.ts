import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder');

// --- Mock Supabase Client for Local Testing ---
const createMockClient = () => {
  const getStorage = (key: string) => JSON.parse(localStorage.getItem(`workplan_${key}`) || '[]');
  const setStorage = (key: string, data: any) => localStorage.setItem(`workplan_${key}`, JSON.stringify(data));

  const mockFrom = (table: string) => {
    return {
      select: () => ({
        order: () => Promise.resolve({ data: getStorage(table), error: null }),
        eq: (col: string, val: any) => ({
          eq: (col2: string, val2: any) => Promise.resolve({ 
            data: getStorage(table).filter((item: any) => item[col] === val && item[col2] === val2), 
            error: null 
          }),
          order: () => Promise.resolve({ 
            data: getStorage(table).filter((item: any) => item[col] === val), 
            error: null 
          }),
          select: () => Promise.resolve({ 
            data: getStorage(table).filter((item: any) => item[col] === val), 
            error: null 
          }),
          then: (cb: any) => cb({ data: getStorage(table).filter((item: any) => item[col] === val), error: null })
        }),
        then: (cb: any) => cb({ data: getStorage(table), error: null })
      }),
      insert: (items: any[]) => {
        const data = getStorage(table);
        const newItems = items.map(item => ({ ...item, id: crypto.randomUUID(), created_at: new Date().toISOString() }));
        setStorage(table, [...data, ...newItems]);
        return { select: () => Promise.resolve({ data: newItems, error: null }), then: (cb: any) => cb({ data: newItems, error: null }) };
      },
      update: (payload: any) => ({
        eq: (col: string, val: any) => {
          const data = getStorage(table);
          const updated = data.map((item: any) => item[col] === val ? { ...item, ...payload } : item);
          setStorage(table, updated);
          return Promise.resolve({ data: updated, error: null });
        }
      }),
      upsert: (items: any[]) => {
        const data = getStorage(table);
        let updated = [...data];
        items.forEach(item => {
          const idx = updated.findIndex((i: any) => 
            i.assignment_id === item.assignment_id && i.year === item.year && i.month === item.month
          );
          if (idx > -1) updated[idx] = { ...updated[idx], ...item };
          else updated.push({ ...item, id: crypto.randomUUID() });
        });
        setStorage(table, updated);
        return Promise.resolve({ data: updated, error: null });
      },
      delete: () => ({
        eq: (col: string, val: any) => {
          const data = getStorage(table);
          setStorage(table, data.filter((item: any) => item[col] !== val));
          return Promise.resolve({ error: null });
        }
      })
    };
  };

  return {
    from: mockFrom,
    auth: {
      getSession: () => Promise.resolve({ data: { session: { user: { id: 'demo-user' } } }, error: null }),
      getUser: () => Promise.resolve({ data: { user: { id: 'demo-user' } }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
};

export const supabase = isSupabaseConfigured 
  ? createClient<any>(supabaseUrl, supabaseAnonKey)
  : (createMockClient() as any);
