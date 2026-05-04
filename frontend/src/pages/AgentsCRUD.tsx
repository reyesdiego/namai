import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { UserPlus, Trash2, Image as ImageIcon, Edit2 } from 'lucide-react';

export default function AgentsCRUD() {
  const queryClient = useQueryClient();
  const [editingAgentId, setEditingAgentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    begin_date: '',
    end_date: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await api.get('/agents/');
      return res.data;
    }
  });

  const createAgent = useMutation({
    mutationFn: async (fd: FormData) => {
      const res = await api.post('/agents/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setFormData({ name: '', email: '', password: '', begin_date: '', end_date: '' });
      setPhotoFile(null);
      alert("Agente creado exitosamente");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Error al crear agente");
    }
  });

  const deleteAgent = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/agents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  });

  const updateAgent = useMutation({
    mutationFn: async ({ id, fd }: { id: number, fd: FormData }) => {
      const res = await api.patch(`/agents/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      cancelEdit();
      alert("Agente actualizado exitosamente");
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || "Error al actualizar agente");
    }
  });

  const handleEditClick = (agent: any) => {
    setEditingAgentId(agent.id);
    setFormData({
      name: agent.name || '',
      email: agent.email || '',
      password: '', // Leave empty unless changing
      begin_date: agent.begin_date ? agent.begin_date.split('T')[0] : '',
      end_date: agent.end_date ? agent.end_date.split('T')[0] : ''
    });
    setPhotoFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingAgentId(null);
    setFormData({ name: '', email: '', password: '', begin_date: '', end_date: '' });
    setPhotoFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    if (formData.name) fd.append('name', formData.name);
    if (formData.email) fd.append('email', formData.email);
    if (formData.password) fd.append('password', formData.password);
    
    if (formData.begin_date) {
        fd.append('begin_date', new Date(formData.begin_date).toISOString());
    } else if (editingAgentId) {
        fd.append('begin_date', 'null');
    }

    if (formData.end_date) {
        fd.append('end_date', new Date(formData.end_date).toISOString());
    } else if (editingAgentId) {
        fd.append('end_date', 'null');
    }
    
    if (photoFile) fd.append('photo', photoFile);

    if (editingAgentId) {
      updateAgent.mutate({ id: editingAgentId, fd });
    } else {
      createAgent.mutate(fd);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="text-[var(--color-brand-blue)]" />
            {editingAgentId ? 'Editar Agente' : 'Registrar Nuevo Agente'}
          </div>
          {editingAgentId && (
            <button onClick={cancelEdit} type="button" className="text-sm text-gray-400 hover:text-white transition-colors">
              Cancelar Edición
            </button>
          )}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre Completo</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Correo Electrónico</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Contraseña {editingAgentId && <span className="text-xs text-gray-500">(Dejar en blanco para no cambiar)</span>}
            </label>
            <input required={!editingAgentId} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Foto de Perfil</label>
            <div className="relative">
              <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="w-full bg-black/20 border border-white/10 border-dashed rounded-lg p-3 text-white flex items-center gap-2">
                <ImageIcon size={20} className="text-gray-400" />
                <span className="text-sm text-gray-400 truncate">{photoFile ? photoFile.name : 'Seleccionar Imagen...'}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha de Inicio</label>
            <input type="date" value={formData.begin_date} onChange={e => setFormData({...formData, begin_date: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha de Fin (Opcional)</label>
            <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={createAgent.isPending || updateAgent.isPending} className="w-full md:w-auto px-8 py-3 bg-[var(--color-brand-blue)] hover:bg-[#002870] text-white rounded-lg font-medium transition-colors">
               {(createAgent.isPending || updateAgent.isPending) ? 'Guardando...' : (editingAgentId ? 'Actualizar Agente' : 'Crear Agente')}
            </button>
          </div>
        </form>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-6">Lista de Agentes Activos</h2>
        {isLoading ? <p>Cargando...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="p-3 font-medium">Foto</th>
                  <th className="p-3 font-medium">Nombre</th>
                  <th className="p-3 font-medium">Correo</th>
                  <th className="p-3 font-medium">Fecha Alta</th>
                  <th className="p-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {agents?.filter((a: any) => a.is_active).map((agent: any) => (
                  <tr key={agent.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      {agent.photo_url ? (
                        <img src={`http://127.0.0.1:8000${agent.photo_url}`} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold">{agent.name.charAt(0)}</div>
                      )}
                    </td>
                    <td className="p-3 text-white">{agent.name}</td>
                    <td className="p-3 text-gray-400">{agent.email}</td>
                    <td className="p-3 text-gray-400">{new Date(agent.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEditClick(agent)} className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-400/10 transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => { if(confirm('¿Eliminar agente?')) deleteAgent.mutate(agent.id); }} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
