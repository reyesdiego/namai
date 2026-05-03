import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { Settings, Trash2, Edit2, Check, X } from 'lucide-react';

export default function PointsConfig() {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState('');
  const [pointsValue, setPointsValue] = useState<number | ''>('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editPointsValue, setEditPointsValue] = useState<number | ''>('');

  const { data: pointTypes, isLoading } = useQuery({
    queryKey: ['pointTypes'],
    queryFn: async () => {
      const res = await api.get('/points/types');
      return res.data;
    }
  });

  const createPointType = useMutation({
    mutationFn: async (data: { description: string, points_value: number }) => {
      const res = await api.post('/points/types', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointTypes'] });
      setDescription('');
      setPointsValue('');
    }
  });

  const updatePointType = useMutation({
    mutationFn: async (data: { id: number, description: string, points_value: number }) => {
      const res = await api.put(`/points/types/${data.id}`, { description: data.description, points_value: data.points_value });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointTypes'] });
      setEditingId(null);
    }
  });

  const deletePointType = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/points/types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pointTypes'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description && pointsValue !== '') {
      createPointType.mutate({ description, points_value: Number(pointsValue) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings className="text-[var(--color-brand-blue)]" />
          Configurar Tipo de Actividad
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-end">
          <div className="w-full md:w-1/2">
            <label className="block text-sm text-gray-400 mb-1">Descripción (Ej: Venta, Renta)</label>
            <input required type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-brand-blue)] transition-colors" />
          </div>
          <div className="w-full md:w-1/4">
            <label className="block text-sm text-gray-400 mb-1">Valor en Puntos</label>
            <input required type="number" value={pointsValue} onChange={e => setPointsValue(e.target.value ? Number(e.target.value) : '')} className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-brand-blue)] transition-colors" />
          </div>
          <div className="w-full md:w-auto">
            <button type="submit" disabled={createPointType.isPending} className="w-full px-8 py-3 bg-[var(--color-brand-blue)] hover:bg-[#002870] text-white rounded-lg font-medium transition-colors">
               Agregar
            </button>
          </div>
        </form>
      </div>

      <div className="glass p-6 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold text-white mb-6">Tipos de Actividades Registradas</h2>
        {isLoading ? <p className="text-gray-400">Cargando...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pointTypes?.filter((pt: any) => pt.is_active).map((pt: any) => (
              <div key={pt.id} className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
                {editingId === pt.id ? (
                  <div className="flex-1 space-y-2 mr-3">
                    <input 
                      type="text" 
                      value={editDescription} 
                      onChange={e => setEditDescription(e.target.value)} 
                      className="w-full bg-black/40 border border-white/20 rounded p-2 text-white text-sm focus:outline-none focus:border-[var(--color-brand-blue)]" 
                      placeholder="Descripción"
                    />
                    <input 
                      type="number" 
                      value={editPointsValue} 
                      onChange={e => setEditPointsValue(e.target.value ? Number(e.target.value) : '')} 
                      className="w-full bg-black/40 border border-white/20 rounded p-2 text-[var(--color-brand-red)] font-bold text-sm focus:outline-none focus:border-[var(--color-brand-blue)]" 
                      placeholder="Puntos"
                    />
                  </div>
                ) : (
                  <div className="flex-1 truncate pr-3">
                    <h3 className="font-semibold text-white truncate">{pt.description}</h3>
                    <p className="text-sm text-[var(--color-brand-red)] font-bold">{pt.points_value} puntos</p>
                  </div>
                )}
                
                <div className="flex gap-1">
                  {editingId === pt.id ? (
                    <>
                      <button 
                        onClick={() => updatePointType.mutate({ id: pt.id, description: editDescription, points_value: Number(editPointsValue) })} 
                        className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-400/10 transition-colors"
                        disabled={updatePointType.isPending}
                        title="Guardar"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)} 
                        className="text-gray-400 hover:text-gray-300 p-2 rounded-lg hover:bg-white/10 transition-colors"
                        title="Cancelar"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => { setEditingId(pt.id); setEditDescription(pt.description); setEditPointsValue(pt.points_value); }} 
                        className="text-[var(--color-brand-blue)] hover:text-blue-300 p-2 rounded-lg hover:bg-blue-400/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => { if(confirm('¿Eliminar tipo?')) deletePointType.mutate(pt.id); }} 
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
