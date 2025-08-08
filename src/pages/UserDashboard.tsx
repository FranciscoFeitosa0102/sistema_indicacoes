import React from 'react';
import { Header } from '../components/Layout/Header';
import { UserStats } from '../components/User/UserStats';
import { NewIndicationForm } from '../components/User/NewIndicationForm';
import { TopReferrersRanking } from '../components/User/TopReferrersRanking';

export const UserDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Suas Indicações
          </h1>
          <p className="text-gray-600">
            Faça novas indicações e acompanhe seus resultados.
          </p>
        </div>

        <div className="space-y-8">
          <UserStats />
          <TopReferrersRanking />
          <NewIndicationForm />
        </div>
      </div>
    </div>
  );
};