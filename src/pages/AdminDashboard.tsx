import React, { useState } from 'react';
import { BarChart3, Users, Settings } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { StatsCards } from '../components/Dashboard/StatsCards';
import { KanbanBoard } from '../components/Dashboard/KanbanBoard';
import { UserManagement } from '../components/Admin/UserManagement';

type TabType = 'dashboard' | 'users' | 'settings';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard' as TabType, name: 'Dashboard', icon: BarChart3 },
    { id: 'users' as TabType, name: 'Usuários', icon: Users },
    { id: 'settings' as TabType, name: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">
            Gerencie indicações, usuários e monitore o desempenho do sistema.
          </p>
        </div>

        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <StatsCards />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Status das Indicações
                </h2>
                <KanbanBoard />
              </div>
            </div>
          )}

          {activeTab === 'users' && <UserManagement />}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Configurações do Sistema
              </h3>
              <p className="text-gray-600">
                Funcionalidades de configuração serão implementadas em breve.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};