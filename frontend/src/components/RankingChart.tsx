import { useRef, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList, Tooltip } from 'recharts';

interface RankingChartProps {
  data: any[];
  variant?: 'dashboard' | 'bigboard';
}

export function RankingChart({ data, variant = 'dashboard' }: RankingChartProps) {
  const isBigBoard = variant === 'bigboard';
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerHeight(entries[0].contentRect.height);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const processedData = data.map((agent: any, index: number) => {
    const position = index + 1;
    let medal = '';
    if (position === 1) medal = '🥇 ';
    else if (position === 2) medal = '🥈 ';
    else if (position === 3) medal = '🥉 ';

    return {
      ...agent,
      displayName: `${position}. ${medal}${agent.name}`
    };
  });

  const fontYAxis = isBigBoard ? 24 : 14;
  const fontLabel = 14; // Forced to 14 for testing insideRight on BigBoard
  const widthYAxis = isBigBoard ? 300 : 150;
  const marginRight = isBigBoard ? 200 : 80;
  const barSize = isBigBoard ? 40 : 25;
  const rowHeight = isBigBoard ? 80 : 50;

  const calculatedHeight = Math.max(containerHeight, processedData.length * rowHeight);
  const isOverflowing = containerHeight > 0 && calculatedHeight > containerHeight;

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      style={isOverflowing ? { WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)', maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)' } : {}}
    >
      <div
        className={`w-full ${isOverflowing ? 'animate-slide-infinite' : ''}`}
        style={{ height: calculatedHeight, paddingTop: isOverflowing ? (isBigBoard ? '3rem' : '1.5rem') : '0' }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={processedData}
            layout="vertical"
            margin={{ top: isBigBoard ? 20 : 5, right: marginRight, left: 10, bottom: isBigBoard ? 20 : 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="displayName"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#f8fafc', fontSize: fontYAxis, fontWeight: 'bold' }}
              width={widthYAxis}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
            />
            <Bar
              dataKey="total_points"
              radius={[0, 8, 8, 0]}
              barSize={barSize}
              animationDuration={2000}
            >
              {processedData.map((_entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index < 3 ? 'var(--color-brand-red)' : 'var(--color-brand-blue)'}
                />
              ))}
              <LabelList
                dataKey="total_points"
                position="insideRight"
                fill="white"
                fontSize={fontLabel}
                fontWeight="bold"
                formatter={(val) => `${val} pts`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
