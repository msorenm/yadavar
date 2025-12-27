
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CheckList } from './components/CheckList';
import { CheckForm } from './components/CheckForm';
import { TelegramSettings } from './components/TelegramSettings';
import { AuditLogs } from './components/AuditLogs';
import { Check, CheckStatus, TelegramConfig, AuditLog } from './types';
import { db } from './services/db';
import { analyzeChecks } from './services/gemini';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [checks, setChecks] = useState<Check[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [editingCheck, setEditingCheck] = useState<Check | undefined>(undefined);
  const [tgConfig, setTgConfig] = useState<TelegramConfig>({
    botToken: '',
    chatId: '',
    isActive: false,
    notifyOnCreate: true,
    notifyOnDelete: true,
    notifyOnStatusChange: true,
    notifyDaysBefore: 1
  });
  const [smartAnalysis, setSmartAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // لود داده‌ها از لایه دیتابیس (Professional Persistence)
  useEffect(() => {
    const initData = async () => {
      const [fetchedChecks, fetchedLogs, fetchedTgConfig] = await Promise.all([
        db.getChecks(),
        db.getLogs(),
        db.getTelegramConfig()
      ]);
      setChecks(fetchedChecks);
      setLogs(fetchedLogs);
      setTgConfig(fetchedTgConfig);
      
      // اجرای بررسی خودکار یادآوری‌ها در بدو ورود
      await db.checkReminders();
      
      setLoading(false);
    };
    initData();
  }, []);

  const handleSaveCheck = useCallback(async (check: Check) => {
    setChecks(prev => {
      const exists = prev.find(c => c.id === check.id);
      if (exists) return prev.map(c => c.id === check.id ? check : c);
      return [check, ...prev];
    });
    
    await db.saveCheck(check);
    const updatedLogs = await db.getLogs();
    setLogs(updatedLogs);
    setEditingCheck(undefined);
    setActiveTab('checks');
  }, []);

  const handleDeleteCheck = useCallback(async (id: string) => {
    if (window.confirm('آیا از حذف این رکورد مالی و ارسال اعلان تلگرام اطمینان دارید؟')) {
      setChecks(prev => prev.filter(c => c.id !== id));
      await db.deleteCheck(id);
      const updatedLogs = await db.getLogs();
      setLogs(updatedLogs);
    }
  }, []);

  const handleStatusChange = useCallback(async (id: string, status: CheckStatus) => {
    const currentCheck = checks.find(c => c.id === id);
    if (currentCheck) {
      const updatedCheck = { ...currentCheck, status };
      setChecks(prev => prev.map(c => c.id === id ? updatedCheck : c));
      await db.saveCheck(updatedCheck);
      const updatedLogs = await db.getLogs();
      setLogs(updatedLogs);
    }
  }, [checks]);

  const handleSaveTelegram = useCallback(async (conf: TelegramConfig) => {
    setTgConfig(conf);
    await db.saveTelegramConfig(conf);
  }, []);

  const runAnalysis = useCallback(async () => {
    setLoading(true);
    const result = await analyzeChecks(checks);
    setSmartAnalysis(result);
    setLoading(false);
  }, [checks]);

  if (loading && checks.length === 0) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0f172a] text-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-2xl shadow-blue-500/20"></div>
          <div className="text-center">
            <h2 className="text-xl font-black tracking-tighter">در حال فراخوانی هسته مرکزی تیسا...</h2>
            <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-[0.3em]">Secure Finance Engine Online</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="transition-all duration-200">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <Dashboard checks={checks} />
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="font-black text-slate-800 flex items-center gap-4 text-xl">
                   <span className="text-blue-600 bg-blue-50 p-3 rounded-2xl">✨</span> 
                   تحلیل هوشمند نقدینگی و ریسک چک‌ها
                 </h3>
                 <button 
                   onClick={runAnalysis}
                   className="px-10 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:-translate-y-1 active:translate-y-0"
                 >
                   پردازش فوق سریع Gemini AI
                 </button>
              </div>
              {smartAnalysis ? (
                <div className="p-8 bg-slate-50 border-r-8 border-blue-600 rounded-2xl text-sm leading-relaxed text-slate-700 whitespace-pre-wrap font-bold shadow-inner">
                  {smartAnalysis}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50">
                  <div className="text-4xl mb-4 opacity-20">📊</div>
                  <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Ready to analyze your financial data</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'checks' && (
          <div className="animate-in fade-in slide-in-from-left-8 duration-300">
            <CheckList
              checks={checks}
              onDelete={handleDeleteCheck}
              onEdit={(c) => { setEditingCheck(c); setActiveTab('add'); }}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

        {activeTab === 'add' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <CheckForm
              onSave={handleSaveCheck}
              onCancel={() => { setEditingCheck(undefined); setActiveTab('checks'); }}
              initialData={editingCheck}
            />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <AuditLogs logs={logs} />
          </div>
        )}

        {activeTab === 'telegram' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <TelegramSettings
              config={tgConfig}
              onSave={handleSaveTelegram}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
