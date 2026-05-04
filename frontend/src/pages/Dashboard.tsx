import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { useAuth } from '../store/AuthContext';
import { PieChart, Pie, Legend, ResponsiveContainer, Tooltip as RechartsTooltip, Cell } from 'recharts';
import { Trophy, Activity, Target } from 'lucide-react';
import { RankingChart } from '../components/RankingChart';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: rankingData, isLoading: loadingRanking } = useQuery({
    queryKey: ['ranking'],
    queryFn: async () => {
      const res = await api.get('/stats/ranking');
      return res.data;
    }
  });

  const { data: dashboardData, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/stats/dashboard');
      return res.data;
    }
  });

  const myPoints = useMemo(() => {
    if (!rankingData || !user) return 0;
    const me = rankingData.find((r: any) => r.id === user.id);
    return me ? me.total_points : 0;
  }, [rankingData, user]);

  const COLORS = ['#dc1c2e', '#003da5', '#eab308', '#22c55e', '#8b5cf6'];

  if (loadingRanking || loadingStats) return <div className="text-white">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card 1 */}
        <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy size={64} className="text-[var(--color-brand-red)]" />
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Mis Puntos</h3>
          <p className="text-4xl font-bold text-white">{myPoints}</p>
        </div>

        {/* Stat Card 2 */}
        <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity size={64} className="text-[var(--color-brand-blue)]" />
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Actividades Realizadas</h3>
          <p className="text-4xl font-bold text-white">
            {dashboardData?.activity_distribution?.reduce((acc: number, curr: any) => acc + curr.value, 0) || 0}
          </p>
        </div>

        {/* Stat Card 3 */}
        <div className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target size={64} className="text-green-500" />
          </div>
          <h3 className="text-gray-400 font-medium mb-1">Mi Posición</h3>
          <p className="text-4xl font-bold text-white">
            #{rankingData?.findIndex((r: any) => r.id === user?.id) + 1 || '-'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Agents Chart */}
        <div className="glass p-6 rounded-2xl border border-white/5 h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-white">Top Agentes</h3>
          <div className="flex-1 min-h-0 -ml-4">
            <RankingChart data={rankingData || []} variant="dashboard" />
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="glass p-6 rounded-2xl border border-white/5 h-[400px]">
          <h3 className="text-lg font-semibold mb-4 text-white">Distribución de Puntos</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={dashboardData?.activity_distribution || []}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
              >
                {dashboardData?.activity_distribution?.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
