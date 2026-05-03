import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';
import { Award } from 'lucide-react';

export default function AssignPoints() {
  const queryClient = useQueryClient();
  const [agentId, setAgentId] = useState('');
  const [pointTypeId, setPointTypeId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await api.get('/agents/');
      return res.data;
    }
  });

  const { data: pointTypes } = useQuery({
    queryKey: ['pointTypes'],
    queryFn: async () => {
      const res = await api.get('/points/types');
      return res.data;
    }
  });

  const assignPoints = useMutation({
    mutationFn: async (data: { agent_id: number; point_type_id: number; notes: string }) => {
      const res = await api.post('/points/transactions', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranking', 'dashboard', 'ranking_bigboard'] });
      setAgentId('');
      setPointTypeId('');
      setNotes('');
      alert("Puntos asignados con éxito");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agentId && pointTypeId) {
      assignPoints.mutate({
        agent_id: Number(agentId),
        point_type_id: Number(pointTypeId),
        notes
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="glass p-8 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-[var(--color-brand-red)] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 pointer-events-none"></div>
        
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="text-[var(--color-brand-red)]" size={28} />
          Asignar Puntos a Agente
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Agente</label>
            <select required value={agentId} onChange={e => setAgentId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none">
              <option value="">Selecciona un Agente...</option>
              {agents?.filter((a:any) => a.is_active).map((agent: any) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Actividad / Logro</label>
            <select required value={pointTypeId} onChange={e => setPointTypeId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none">
              <option value="">Selecciona una Actividad...</option>
              {pointTypes?.filter((pt:any) => pt.is_active).map((pt: any) => (
                <option key={pt.id} value={pt.id}>
                  {pt.description} (+{pt.points_value} pts)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notas u Observaciones (Opcional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-[var(--color-brand-blue)] outline-none" placeholder="Propiedad vendida en..."></textarea>
          </div>

          <button type="submit" disabled={assignPoints.isPending} className="w-full py-4 bg-gradient-to-r from-[var(--color-brand-red)] to-red-600 hover:to-red-500 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-red-500/25 transition-all">
             {assignPoints.isPending ? 'Asignando...' : 'Confirmar Asignación'}
          </button>
        </form>
      </div>
    </div>
  );
}
