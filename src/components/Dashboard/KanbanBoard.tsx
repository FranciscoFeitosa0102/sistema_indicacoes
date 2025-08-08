import React, { useState, useEffect } from 'react';
import { Phone, User, Calendar, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Indication, KanbanColumn } from '../../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const columns: KanbanColumn[] = [
  { id: '1', title: 'Em Contato', status: 'em_contato', color: 'bg-yellow-100 border-yellow-300', count: 0 },
  { id: '2', title: 'Negociação', status: 'negociacao', color: 'bg-blue-100 border-blue-300', count: 0 },
  { id: '3', title: 'Fechamento', status: 'fechamento', color: 'bg-orange-100 border-orange-300', count: 0 },
  { id: '4', title: 'Fechados', status: 'fechados', color: 'bg-green-100 border-green-300', count: 0 },
  { id: '5', title: 'Não Interessados', status: 'nao_interessado', color: 'bg-red-100 border-red-300', count: 0 },
];

export const KanbanBoard: React.FC = () => {
  const [indications, setIndications] = useState<Indication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndications = async () => {
      try {
        const { data, error } = await supabase
          .from('indications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setIndications(data || []);
      } catch (error) {
        console.error('Erro ao buscar indicações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndications();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('indications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'indications' }, 
        () => {
          fetchIndications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getIndicationsByStatus = (status: Indication['status']) => {
    return indications.filter((indication) => indication.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => {
        const columnIndications = getIndicationsByStatus(column.status);
        return (
          <div key={column.id} className="bg-white rounded-lg shadow-sm border">
            <div className={`px-4 py-3 border-b border-l-4 ${column.color}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  {column.title}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {columnIndications.length}
                </span>
              </div>
            </div>
            
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {columnIndications.map((indication) => (
                <div
                  key={indication.id}
                  className="bg-gray-50 rounded-lg p-3 border hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {indication.indicated_name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {format(new Date(indication.created_at), 'dd/MM', { locale: ptBR })}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <Phone className="w-3 h-3 mr-1" />
                      {indication.indicated_phone}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-600">
                      <User className="w-3 h-3 mr-1" />
                      Indicado por: {indication.user_name}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="w-3 h-3 mr-1" />
                      Vendedor: {indication.seller_name}
                    </div>
                    
                    {indication.observation && (
                      <div className="flex items-start text-xs text-gray-600 mt-2">
                        <MessageSquare className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{indication.observation}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {columnIndications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Nenhuma indicação</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};