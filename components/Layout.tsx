
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'میز کار مرکزی', icon: '🏛️' },
    { id: 'checks', label: 'دفتر کل چک‌ها', icon: '📖' },
    { id: 'add', label: 'ثبت مدرک مالی', icon: '📝' },
    { id: 'logs', label: 'ردیابی وقایع (Audit)', icon: '🔍' },
    { id: 'telegram', label: 'درگاه اطلاع‌رسانی', icon: '📡' },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar - Ultra Premium Official Style */}
      <aside className="w-80 bg-[#0f172a] text-slate-300 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.1)] z-50 transition-all duration-300">
        <div className="p-8 border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/10">T</div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">سامانه تیسا</h1>
              <p className="text-[10px] text-blue-400 uppercase font-bold tracking-[0.2em]">Secure Treasury v1.2</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 font-bold scale-[1.02]'
                  : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span className={`text-xl transition-transform group-hover:scale-110 ${activeTab === item.id ? 'opacity-100' : 'opacity-70'}`}>{item.icon}</span>
              <span className="text-sm tracking-wide">{item.label}</span>
              {activeTab === item.id && (
                <div className="mr-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 bg-[#020617] border-t border-slate-800/50">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              <span className="text-slate-400 uppercase">System Status: Active</span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 w-3/4 animate-progress"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-12 shadow-sm sticky top-0 z-40">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Finance Control</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
             <div className="hidden lg:flex flex-col items-end border-l pr-8 border-slate-100">
                <span className="text-sm font-black text-slate-800">مدیریت عالی سیستم</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 mt-1">SUPER_ADMIN_LEVEL_1</span>
             </div>
             <div className="flex gap-2">
                <button className="bg-slate-100 p-3 rounded-xl hover:bg-slate-200 transition text-slate-600 shadow-sm border border-slate-200/50">
                  🔔
                </button>
                <button className="bg-slate-900 p-3 rounded-xl hover:bg-black transition text-white shadow-lg">
                  🚪
                </button>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
