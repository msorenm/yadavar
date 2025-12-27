
import React, { useMemo } from 'react';
import { Check, CheckStatus } from '../types';
import { formatCurrency, toJalali } from '../utils/jalali';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  checks: Check[];
}

export const Dashboard: React.FC<DashboardProps> = ({ checks }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    return {
      totalAmount: checks.filter(c => c.status === CheckStatus.PENDING).reduce((sum, c) => sum + c.amount, 0),
      pendingCount: checks.filter(c => c.status === CheckStatus.PENDING).length,
      upcomingThisWeek: checks.filter(c => {
        const d = new Date(c.dueDate);
        return d >= now && d <= nextWeek && c.status === CheckStatus.PENDING;
      }).length,
      bouncedCount: checks.filter(c => c.status === CheckStatus.BOUNCED).length,
    };
  }, [checks]);

  const chartData = useMemo(() => {
    const groups = checks.reduce((acc: any, check) => {
      acc[check.status] = (acc[check.status] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(groups).map(key => ({ name: key, count: groups[key] }));
  }, [checks]);

  const COLORS = ['#2563eb', '#10b981', '#ef4444', '#f59e0b', '#6366f1'];

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      {/* Stats Cards - New Glass Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'مجموع چک‌های در انتظار', value: formatCurrency(stats.totalAmount), color: 'blue', icon: '💰' },
          { label: 'تعداد چک‌های معوق', value: `${stats.pendingCount} فقره`, color: 'slate', icon: '📂' },
          { label: 'سررسید هفته جاری', value: `${stats.upcomingThisWeek} مورد`, color: 'amber', icon: '⏳' },
          { label: 'چک‌های برگشتی (بحرانی)', value: `${stats.bouncedCount} فقره`, color: 'red', icon: '🚨' },
        ].map((card, idx) => (
          <div key={idx} className="group bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${card.color}-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`}></div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-3xl">{card.icon}</span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md bg-${card.color}-50 text-${card.color}-600 border border-${card.color}-100`}>REAL_TIME</span>
            </div>
            <p className="text-slate-400 text-xs font-bold mb-1 uppercase tracking-tight">{card.label}</p>
            <p className="text-2xl font-black text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Chart and Recent Checks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              توزیع آماری وضعیت اسناد
            </h3>
            <div className="flex gap-2">
               <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
               <span className="w-3 h-3 bg-slate-200 rounded-full"></span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0f172a] p-10 rounded-3xl shadow-2xl shadow-blue-900/20 text-white relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -mb-32 -mr-32 blur-3xl"></div>
          <h3 className="text-xl font-black mb-8 flex items-center gap-3">
             <span className="text-blue-500">📅</span>
             سررسیدهای بحرانی
          </h3>
          <div className="space-y-4 relative z-10">
            {checks
              .filter(c => c.status === CheckStatus.PENDING)
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 5)
              .map(check => (
                <div key={check.id} className="group flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300 border border-white/5 hover:border-white/20">
                  <div>
                    <p className="text-sm font-black text-slate-100">{check.issuer}</p>
                    <p className="text-[10px] text-blue-400 font-bold mt-0.5 uppercase tracking-wider">{toJalali(check.dueDate)}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-blue-300 font-black">{formatCurrency(check.amount)}</p>
                    <span className="text-[8px] opacity-50 font-bold tracking-widest uppercase">Validated</span>
                  </div>
                </div>
              ))}
            {checks.length === 0 && (
              <div className="text-center py-20 opacity-30 italic text-sm">لیست سررسیدها خالی است</div>
            )}
          </div>
          <button className="w-full mt-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/20">
             مشاهده دفتر کل چک‌ها
          </button>
        </div>
      </div>
    </div>
  );
};
