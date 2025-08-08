import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: any;

// Verifica se Supabase está corretamente configurado
const isSupabaseConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  supabaseUrl !== 'your-supabase-url' &&
  supabaseAnonKey !== 'your-supabase-anon-key' &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 50;

if (isSupabaseConfigured) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('[SUPABASE] Variáveis de ambiente ausentes. Usando MOCK.');

  // MOCK LOCAL
  function createMockSupabase() {
    // Mock query builder with proper method chaining
    const createMockQueryBuilder = (tableName: string) => {
      const mockData: any = {
        users: [
          { id: 'mock-user-id', email: 'usuario@teste.com', role: 'user', name: 'Usuário Teste' },
          { id: 'mock-admin-id', email: 'admin@sistema.com', role: 'admin', name: 'Admin Sistema' }
        ],
        indicacoes: [
          {
            id: '1',
            indicated_name: 'João Silva',
            indicated_phone: '(11) 99999-9999',
            observation: 'Cliente interessado em seguro completo',
            status: 'em_contato',
            seller_id: 'vendedor-1',
            seller_name: 'Carlos Vendas',
            user_id: 'mock-user-id',
            user_name: 'Usuário Teste',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            indicated_name: 'Maria Santos',
            indicated_phone: '(11) 88888-8888',
            observation: 'Interessada em plano familiar',
            status: 'negociacao',
            seller_id: 'vendedor-2',
            seller_name: 'Ana Comercial',
            user_id: 'mock-user-id',
            user_name: 'Usuário Teste',
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            indicated_name: 'Pedro Costa',
            indicated_phone: '(11) 77777-7777',
            observation: 'Cliente corporativo',
            status: 'fechados',
            seller_id: 'vendedor-1',
            seller_name: 'Carlos Vendas',
            user_id: 'mock-user-id',
            user_name: 'Usuário Teste',
            created_at: new Date().toISOString()
          },
          {
            id: '4',
            indicated_name: 'Ana Oliveira',
            indicated_phone: '(11) 66666-6666',
            observation: 'Não teve interesse no momento',
            status: 'nao_interessado',
            seller_id: 'vendedor-2',
            seller_name: 'Ana Comercial',
            user_id: 'mock-user-id',
            user_name: 'Usuário Teste',
            created_at: new Date().toISOString()
          }
        ],
        vendedores: [
          { id: 'vendedor-1', name: 'Carlos Vendas', active: true },
          { id: 'vendedor-2', name: 'Ana Comercial', active: true }
        ]
      };

      let currentData = mockData[tableName] || [];
      let filters: any = {};
      let selectFields = '*';
      let orderBy: any = null;
      let limitCount: number | null = null;

      const queryBuilder = {
        select: (fields = '*') => {
          selectFields = fields;
          return queryBuilder;
        },
        insert: async (data: any) => {
          await new Promise(resolve => setTimeout(resolve, 100));
          const newItem = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() };
          currentData.push(newItem);
          localStorage.setItem(`mock_${tableName}`, JSON.stringify(currentData));
          return { data: [newItem], error: null };
        },
        update: async (data: any) => {
          await new Promise(resolve => setTimeout(resolve, 100));
          const filteredData = currentData.filter((item: any) => {
            return Object.keys(filters).every(key => item[key] === filters[key]);
          });
          filteredData.forEach((item: any) => Object.assign(item, data));
          localStorage.setItem(`mock_${tableName}`, JSON.stringify(currentData));
          return { data: filteredData, error: null };
        },
        delete: async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          const filteredData = currentData.filter((item: any) => {
            return !Object.keys(filters).every(key => item[key] === filters[key]);
          });
          localStorage.setItem(`mock_${tableName}`, JSON.stringify(filteredData));
          return { data: [], error: null };
        },
        eq: (column: string, value: any) => {
          filters[column] = value;
          return queryBuilder;
        },
        neq: (column: string, value: any) => {
          filters[`${column}_neq`] = value;
          return queryBuilder;
        },
        gte: (column: string, value: any) => {
          filters[`${column}_gte`] = value;
          return queryBuilder;
        },
        lte: (column: string, value: any) => {
          filters[`${column}_lte`] = value;
          return queryBuilder;
        },
        order: (column: string, options?: { ascending?: boolean }) => {
          orderBy = { column, ascending: options?.ascending !== false };
          return queryBuilder;
        },
        limit: (count: number) => {
          limitCount = count;
          return queryBuilder;
        },
        single: async () => {
          const result = await queryBuilder.execute();
          return { data: result.data?.[0] || null, error: result.error };
        },
        head: async () => {
          return { data: null, error: null, count: currentData.length };
        },
        execute: async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Load from localStorage if available
          const stored = localStorage.getItem(`mock_${tableName}`);
          if (stored) {
            currentData = JSON.parse(stored);
          }

          let result = [...currentData];

          // Apply filters
          Object.keys(filters).forEach(key => {
            if (key.endsWith('_neq')) {
              const column = key.replace('_neq', '');
              result = result.filter(item => item[column] !== filters[key]);
            } else if (key.endsWith('_gte')) {
              const column = key.replace('_gte', '');
              result = result.filter(item => item[column] >= filters[key]);
            } else if (key.endsWith('_lte')) {
              const column = key.replace('_lte', '');
              result = result.filter(item => item[column] <= filters[key]);
            } else {
              result = result.filter(item => item[key] === filters[key]);
            }
          });

          // Apply ordering
          if (orderBy) {
            result.sort((a, b) => {
              const aVal = a[orderBy.column];
              const bVal = b[orderBy.column];
              if (orderBy.ascending) {
                return aVal > bVal ? 1 : -1;
              } else {
                return aVal < bVal ? 1 : -1;
              }
            });
          }

          // Apply limit
          if (limitCount) {
            result = result.slice(0, limitCount);
          }

          return { data: result, error: null, count: result.length };
        }
      };

      // Make execute the default behavior for await
      return new Proxy(queryBuilder, {
        get(target, prop) {
          if (prop === 'then') {
            return target.execute().then.bind(target.execute());
          }
          return target[prop as keyof typeof target];
        }
      });
    };

    return {
      from: (tableName: string) => createMockQueryBuilder(tableName),
      auth: {
        getSession: async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          const user = localStorage.getItem('mock_user');
          return {
            data: {
              session: user ? {
                user: {
                  ...JSON.parse(user),
                  aud: 'authenticated',
                  role: 'authenticated',
                  email: 'mock@email.com'
                }
              } : null
            },
            error: null
          };
        },
        signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const users = [
            { id: 'mock-admin-id', email: 'admin@sistema.com', password: 'admin123', role: 'admin', name: 'Admin Sistema' },
            { id: 'mock-user-id', email: 'usuario@teste.com', password: '123456', role: 'user', name: 'Usuário Teste' }
          ];
          
          const user = users.find(u => u.email === email && u.password === password);
          
          if (user) {
            const { password: _, ...userWithoutPassword } = user;
            localStorage.setItem('mock_user', JSON.stringify(userWithoutPassword));
            return {
              data: {
                user: { ...userWithoutPassword, aud: 'authenticated', role: 'authenticated' },
                session: { user: userWithoutPassword }
              },
              error: null
            };
          }
          
          return {
            data: { user: null, session: null },
            error: { message: 'Credenciais inválidas' }
          };
        },
        signUp: async ({ email, password, options }: any) => {
          await new Promise(resolve => setTimeout(resolve, 200));
          const newUser = {
            id: `user-${Date.now()}`,
            email,
            role: 'user',
            name: options?.data?.name || 'Novo Usuário'
          };
          localStorage.setItem('mock_user', JSON.stringify(newUser));
          return {
            data: {
              user: { ...newUser, aud: 'authenticated', role: 'authenticated' },
              session: { user: newUser }
            },
            error: null
          };
        },
        signOut: async () => {
          localStorage.removeItem('mock_user');
          return { error: null };
        },
        onAuthStateChange: (callback: (event: string, session: any) => void) => {
          // Simulate initial session check
          setTimeout(() => {
            const user = localStorage.getItem('mock_user');
            if (user) {
              callback('SIGNED_IN', { user: JSON.parse(user) });
            } else {
              callback('SIGNED_OUT', null);
            }
          }, 100);
          
          // Return unsubscribe function
          return {
            data: {
              subscription: {
                unsubscribe: () => {}
              }
            }
          };
        }
      },
      channel: (channelName: string) => ({
        on: (event: string, callback: Function) => ({
          subscribe: () => ({
            unsubscribe: () => {}
          })
        })
      })
    };
  }

  supabase = createMockSupabase();
}

export { supabase };
