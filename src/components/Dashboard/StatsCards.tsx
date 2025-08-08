import React, { useState, useEffect } from 'react';
import { Users, UserPlus, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalUsers: number;
  totalIndications: number;
  monthlyIndications: number;
  closedDeals: number;
  notInterested: number;
}

export const StatsCards: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalIndications: 0,
    monthlyIndications: 0,
    closedDeals: 0,
    notInterested: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total users
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'user');

        // Total indications
        const { count: indicationsCount } = await supabase
          .from('indications')
          .select('*', { count: 'exact', head: true });

        // Monthly indications
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: monthlyCount } = await supabase
          .from('indications')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth.toISOString());

        // Closed deals
        const { count: closedCount } = await supabase
          .from('indications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'fechados');

        // Not interested
        const { count: notInterestedCount } = await supabase
          .from('indications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'nao_interessado');

        setStats({
          totalUsers: usersCount || 0,
          totalIndications: indicationsCount || 0,
          monthlyIndications: monthlyCount || 0,
          closedDeals: closedCount || 0,
          notInterested: notInterestedCount || 0,
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total de Usuários',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total de Indicações',
      value: stats.totalIndications,
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Indicações do Mês',
      value: stats.monthlyIndications,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Negócios Fechados',
      value: stats.closedDeals,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Não Interessados',
      value: stats.notInterested,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card) => (
        <div key={card.title} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className={`${card.bgColor} rounded-lg p-3`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};