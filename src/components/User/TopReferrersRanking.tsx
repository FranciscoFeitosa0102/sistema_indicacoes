import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TopReferrer {
  user_id: string;
  user_name: string;
  total_indications: number;
  position: number;
}

export const TopReferrersRanking: React.FC = () => {
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopReferrers = async () => {
      try {
        // Get all indications grouped by user
        const { data: indications } = await supabase
          .from('indications')
          .select('user_id, user_name');

        if (indications) {
          // Count indications per user
          const userCounts = indications.reduce((acc: any, indication) => {
            const userId = indication.user_id;
            if (!acc[userId]) {
              acc[userId] = {
                user_id: userId,
                user_name: indication.user_name,
                total_indications: 0,
              };
            }
            acc[userId].total_indications++;
            return acc;
          }, {});

          // Convert to array and sort by total indications
          const sortedUsers = Object.values(userCounts)
            .sort((a: any, b: any) => b.total_indications - a.total_indications)
            .slice(0, 4) // Top 4
            .map((user: any, index) => ({
              ...user,
              position: index + 1,
            }));

          setTopReferrers(sortedUsers as TopReferrer[]);
        }
      } catch (error) {
        console.error('Erro ao buscar ranking de indicadores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopReferrers();
  }, []);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <User className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-100 rounded-lg p-2">
            <Trophy className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            Top 4 Indicadores
          </h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-purple-100 rounded-lg p-2">
          <Trophy className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Top 4 Indicadores
        </h2>
      </div>

      {topReferrers.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma indicação ainda
          </h3>
          <p className="text-gray-600">
            O ranking aparecerá quando houver indicações no sistema.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {topReferrers.map((referrer) => (
            <div
              key={referrer.user_id}
              className={`${getPositionColor(referrer.position)} rounded-lg p-4 flex items-center justify-between`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-full">
                  {getPositionIcon(referrer.position)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {referrer.user_name}
                  </h3>
                  <p className="text-sm opacity-90">
                    {referrer.position}º lugar
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {referrer.total_indications}
                </div>
                <div className="text-sm opacity-90">
                  indicações
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};