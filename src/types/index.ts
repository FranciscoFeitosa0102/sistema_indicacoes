export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Seller {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

export interface Indication {
  id: string;
  indicated_name: string;
  indicated_phone: string;
  observation?: string;
  user_id: string;
  user_name: string;
  seller_id: string;
  seller_name: string;
  status: 'em_contato' | 'negociacao' | 'fechamento' | 'fechados' | 'nao_interessado';
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: Indication['status'];
  color: string;
  count: number;
}