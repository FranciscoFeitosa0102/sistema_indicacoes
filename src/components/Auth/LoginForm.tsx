import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, Mail, Lock, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerForm,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegister,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      await login(data.email, data.password);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar conta');
      }

      setSuccess('Conta criada com sucesso! Você pode fazer login agora.');
      resetRegister();
      setIsRegistering(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    setSuccess(null);
    reset();
    resetRegister();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isRegistering ? 'Criar nova conta' : 'Acesse sua conta'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Indicações
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={isRegistering ? handleRegisterSubmit(onRegisterSubmit) : handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <Shield className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <div className="mt-1 relative">
                  <input
                    {...registerForm('name')}
                    type="text"
                    autoComplete="name"
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Digite seu nome completo"
                  />
                  <User className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                </div>
                {registerErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.name.message}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <input
                  {...(isRegistering ? registerForm('email') : register('email'))}
                  type="email"
                  autoComplete="email"
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Digite seu email"
                />
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              </div>
              {(isRegistering ? registerErrors.email : errors.email) && (
                <p className="mt-1 text-sm text-red-600">{(isRegistering ? registerErrors.email : errors.email)?.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1 relative">
                <input
                  {...(isRegistering ? registerForm('password') : register('password'))}
                  type="password"
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Digite sua senha"
                />
                <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              </div>
              {(isRegistering ? registerErrors.password : errors.password) && (
                <p className="mt-1 text-sm text-red-600">{(isRegistering ? registerErrors.password : errors.password)?.message}</p>
              )}
            </div>

            {isRegistering && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Senha
                </label>
                <div className="mt-1 relative">
                  <input
                    {...registerForm('confirmPassword')}
                    type="password"
                    autoComplete="new-password"
                    className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirme sua senha"
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                </div>
                {registerErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{registerErrors.confirmPassword.message}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (isRegistering ? 'Criando conta...' : 'Entrando...') : (isRegistering ? 'Criar Conta' : 'Entrar')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};