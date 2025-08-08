import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Phone, User, MessageSquare, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const indicationSchema = z.object({
  indicated_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  indicated_phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  observation: z.string().optional(),
});

type IndicationFormData = z.infer<typeof indicationSchema>;

export const NewIndicationForm: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IndicationFormData>({
    resolver: zodResolver(indicationSchema),
  });

  const getRandomSeller = async () => {
    const { data: sellers } = await supabase
      .from('sellers')
      .select('*')
      .eq('active', true);

    if (!sellers || sellers.length === 0) {
      throw new Error('Nenhum vendedor ativo encontrado');
    }

    const randomIndex = Math.floor(Math.random() * sellers.length);
    return sellers[randomIndex];
  };

  const onSubmit = async (data: IndicationFormData) => {
    if (!user) return;

    try {
      setLoading(true);
      setSuccess(false);

      // Get random seller
      const seller = await getRandomSeller();

      // Create indication
      const { error: insertError } = await supabase
        .from('indications')
        .insert({
          indicated_name: data.indicated_name,
          indicated_phone: data.indicated_phone,
          observation: data.observation || '',
          user_id: user.id,
          user_name: user.name,
          seller_id: seller.id,
          seller_name: seller.name,
          status: 'em_contato',
        });

      if (insertError) throw insertError;

      // Trigger webhook (simulated)
      const webhookPayload = {
        indicated_name: data.indicated_name,
        indicated_phone: data.indicated_phone,
        observation: data.observation || '',
        user_name: user.name,
        seller_name: seller.name,
      };

      console.log('Webhook payload:', webhookPayload);

      setSuccess(true);
      reset();

      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Erro ao criar indicação:', error);
      alert(error.message || 'Erro ao criar indicação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Nova Indicação
            </h2>
          </div>
        </div>

        {success && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <UserPlus className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Indicação criada com sucesso!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  A indicação foi distribuída automaticamente para um vendedor.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label htmlFor="indicated_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Indicado *
            </label>
            <div className="relative">
              <input
                {...register('indicated_name')}
                type="text"
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite o nome completo"
              />
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>
            {errors.indicated_name && (
              <p className="mt-1 text-sm text-red-600">{errors.indicated_name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="indicated_phone" className="block text-sm font-medium text-gray-700 mb-2">
              Número de Telefone *
            </label>
            <div className="relative">
              <input
                {...register('indicated_phone')}
                type="tel"
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(11) 99999-9999"
              />
              <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>
            {errors.indicated_phone && (
              <p className="mt-1 text-sm text-red-600">{errors.indicated_phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="observation" className="block text-sm font-medium text-gray-700 mb-2">
              Observação (Opcional)
            </label>
            <div className="relative">
              <textarea
                {...register('observation')}
                rows={4}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Informações adicionais sobre o indicado..."
              />
              <MessageSquare className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            </div>
            {errors.observation && (
              <p className="mt-1 text-sm text-red-600">{errors.observation.message}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Indicação
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};