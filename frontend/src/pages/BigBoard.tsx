import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';
import { RankingChart } from '../components/RankingChart';

function LiveTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right">
      <div className="text-3xl font-bold text-[var(--color-brand-blue)]">
        {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-gray-400 uppercase tracking-widest text-sm">
        {currentTime.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}

export default function BigBoard() {
  const { data: rankingData, isLoading } = useQuery({
    queryKey: ['ranking_bigboard'],
    queryFn: async () => {
      const res = await api.get('/stats/ranking');
      return res.data;
    },
    refetchInterval: 30000 // refetch every 30s for the live board
  });

  if (isLoading) return <div className="h-screen bg-[var(--color-background-dark)] flex items-center justify-center text-white text-3xl font-bold">Cargando Tablero...</div>;

  const data = rankingData || [];

  return (
    <div className="h-screen bg-[var(--color-background-dark)] text-white overflow-hidden flex flex-col relative">
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[var(--color-brand-red)] rounded-full mix-blend-multiply filter blur-[150px] opacity-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[var(--color-brand-blue)] rounded-full mix-blend-multiply filter blur-[150px] opacity-10"></div>

      {/* Header */}
      <header className="p-8 pb-4 flex justify-between items-end  z-10">
        <div>
          <h1 className="text-6xl font-black tracking-tight mb-2 uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 font-sans tracking-tight drop-shadow-sm">
            Namai
          </h1>
          <span className="text-gray-300 text-2xl font-semibold tracking-wide uppercase">Top Agentes</span>
        </div>
        <LiveTime />
      </header>

      {/* Main Board */}
      <div className="flex-1 relative z-10 px-8 pb-8 pt-2 h-full min-h-0">
        <RankingChart data={data} variant="bigboard" />
      </div>
    </div>
  );
}
