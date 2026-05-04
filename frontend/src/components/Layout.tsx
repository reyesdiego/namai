import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { Home, Users, Settings, LogOut, Award, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import classNames from 'classnames';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    ...(user?.role === 'admin' ? [
      { path: '/agents', icon: Users, label: 'Agentes' },
      { path: '/points', icon: Settings, label: 'Configuración Puntos' },
      { path: '/assign', icon: Award, label: 'Asignar Puntos' },
    ] : []),
    { path: '/bigboard', icon: BarChart2, label: 'Big Board (TV)' },
  ];

  return (
    <div className="flex h-screen bg-[var(--color-background-dark)] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={classNames(
        "flex flex-col border-r border-white/10 glass z-10 transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-[var(--color-brand-blue)] rounded-full p-1 border-2 border-[var(--color-background-dark)] z-20 hover:scale-110 transition-transform hidden sm:block shadow-lg"
          title={isCollapsed ? "Expandir" : "Colapsar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className={classNames("p-6 flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
          <div className="w-8 h-8 rounded-full bg-[var(--color-brand-red)] flex items-center justify-center font-bold text-lg shrink-0">
            N
          </div>
          {!isCollapsed && <h1 className="text-xl font-bold tracking-wider truncate">NAMAI</h1>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={classNames(
                  'flex items-center gap-3 py-3 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-[var(--color-brand-blue)] text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white',
                  isCollapsed ? "justify-center px-0" : "px-4"
                )}
              >
                <Icon size={20} className={isActive && !isCollapsed ? '' : 'group-hover:scale-110 transition-transform shrink-0'} />
                {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <div className={classNames(
            "flex items-center gap-3 mb-4",
            isCollapsed ? "justify-center" : "px-4"
          )}>
            {user?.photo_url ? (
              <img src={`http://127.0.0.1:8000${user.photo_url}`} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold shrink-0">
                {user?.name?.charAt(0)}
              </div>
            )}
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-[var(--color-brand-red)] font-medium capitalize">{user?.role}</p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
            className={classNames(
              "flex items-center gap-2 w-full py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors group",
              isCollapsed ? "justify-center px-0" : "px-4"
            )}
          >
            <LogOut size={16} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <header className="h-16 border-b border-white/5 glass flex items-center px-8 sticky top-0 z-20">
          <h2 className="text-lg font-semibold text-gray-200">
            {menuItems.find(m => m.path === location.pathname)?.label || 'Panel'}
          </h2>
        </header>
        <div className="p-8 pb-20">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
