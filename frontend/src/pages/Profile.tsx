import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { api } from '../utils/api';
import { User, Lock, Save } from 'lucide-react';

export default function Profile() {
  const { user, token, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
      setIsSaving(false);
      return;
    }

    try {
      const payload: any = { name };
      if (password) {
        payload.password = password;
      }

      const res = await api.patch('/users/me', payload);
      
      // Update the user in context
      if (token) {
         login(token, res.data);
      }

      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente.' });
      setPassword(''); // clear password field
      setConfirmPassword(''); // clear confirm password field
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Error al actualizar perfil.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="glass p-6 sm:p-8 rounded-3xl border border-white/5 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-blue)] rounded-full mix-blend-multiply filter blur-[80px] opacity-10"></div>
        
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <div className="p-3 bg-[var(--color-brand-blue)]/20 rounded-xl">
            <User className="text-[var(--color-brand-blue)]" size={24} />
          </div>
          Mi Perfil
        </h2>

        {message.text && (
          <div className={`p-4 mb-6 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nombre Completo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={18} className="text-gray-500" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent outline-none transition-all text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Nueva Contraseña <span className="text-xs text-gray-500 font-normal">(opcional)</span>
            </label>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Deja en blanco para no cambiarla"
                className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent outline-none transition-all text-white placeholder-gray-600"
              />
            </div>
            {password && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma la nueva contraseña"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-blue)] focus:border-transparent outline-none transition-all text-white placeholder-gray-600"
                />
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[var(--color-brand-blue)] to-blue-600 hover:to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
