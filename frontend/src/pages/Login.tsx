import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { api } from '../utils/api';
import { jwtDecode } from "jwt-decode";
import { Lock, User } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const formParams = new URLSearchParams();
    formParams.append('username', email);
    formParams.append('password', password);

    try {
      const { data } = await api.post('/token', formParams, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      
      const token = data.access_token;
      
      // We set the token temporarily to trigger the user fetch,
      // Or we can manually fetch the user here:
      localStorage.setItem('token', token);
      const userRes = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      login(token, userRes.data);
      navigate('/');
    } catch (err: any) {
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background-dark)] relative overflow-hidden text-slate-100">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-[var(--color-brand-blue)] rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[var(--color-brand-red)] rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
      
      <div className="w-full max-w-md p-8 rounded-2xl glass z-10 shadow-2xl relative">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto bg-[var(--color-brand-red)] rounded-2xl rotate-45 flex items-center justify-center mb-6 shadow-lg shadow-red-500/30">
            <div className="-rotate-45 text-2xl font-bold">N</div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-white">Namai Real Estate</h2>
          <p className="text-gray-400">Inicia sesión en tu cuenta</p>
        </div>

        {error && (
          <div className="p-4 mb-6 text-sm text-red-200 bg-red-900/30 border border-red-500/50 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-gray-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent outline-none transition-all placeholder-gray-600"
                placeholder="agente@namai.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent outline-none transition-all placeholder-gray-600"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-[var(--color-brand-blue)] to-blue-600 hover:to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
