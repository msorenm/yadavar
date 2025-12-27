
import React, { useState } from 'react';
import { TelegramConfig } from '../types';
import { toJalali } from '../utils/jalali';

interface TelegramSettingsProps {
  config: TelegramConfig;
  onSave: (config: TelegramConfig) => void;
}

export const TelegramSettings: React.FC<TelegramSettingsProps> = ({ config, onSave }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [testLoading, setTestLoading] = useState(false);

  const handleTest = async () => {
    setTestLoading(true);
    try {
      const url = `https://api.telegram.org/bot${localConfig.botToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: localConfig.chatId,
          text: '⚡️ <b>اتصال سیستم تیسا برقرار شد!</b>\nاین یک پیام تست برای تایید تنظیمات بات تلگرام شماست.',
          parse_mode: 'HTML'
        })
      });
      if (res.ok) alert('پیام تست با موفقیت ارسال شد!');
      else alert('خطا در ارسال پیام. توکن یا Chat ID را بررسی کنید.');
    } catch (e) {
      alert('اتصال به سرور تلگرام برقرار نشد.');
    }
    setTestLoading(false);
  };

  const labelClasses = "text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block";
  const cardClasses = "bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className={cardClasses}>
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-blue-200">🤖</div>
            <div>
              <h3 className="text-xl font-black text-slate-800">مرکز کنترل بات تلگرام</h3>
              <p className="text-sm text-slate-400 font-medium">مدیریت متمرکز اعلان‌ها و یادآوری‌های هوشمند</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${localConfig.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
              {localConfig.isActive ? 'System Online' : 'System Offline'}
            </span>
            {localConfig.lastSyncTimestamp && (
               <span className="text-[9px] text-slate-400 mt-2">آخرین همگام‌سازی: {toJalali(localConfig.lastSyncTimestamp)}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className={labelClasses}>توکن امنیتی بات (Bot Token)</label>
              <input
                type="password"
                value={localConfig.botToken}
                onChange={e => setLocalConfig({ ...localConfig, botToken: e.target.value })}
                placeholder="0000000000:AA..."
                className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all font-mono text-sm bg-slate-50"
              />
            </div>
            <div>
              <label className={labelClasses}>شناسه چت مدیریت (Chat ID)</label>
              <input
                type="text"
                value={localConfig.chatId}
                onChange={e => setLocalConfig({ ...localConfig, chatId: e.target.value })}
                placeholder="123456789"
                className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all font-mono text-sm bg-slate-50"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-sm font-black text-slate-700 mb-4 flex items-center gap-2">
               <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
               تنظیمات هوشمند اطلاع‌رسانی
            </h4>
            
            <div className="space-y-3">
              {[
                { key: 'notifyOnCreate', label: 'اعلان هنگام ثبت چک جدید' },
                { key: 'notifyOnDelete', label: 'اعلان هنگام حذف سند' },
                { key: 'notifyOnStatusChange', label: 'اعلان تغییر وضعیت چک' },
                { key: 'isActive', label: 'فعالسازی کلی سیستم اطلاع‌رسانی' },
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:border-blue-200 transition-colors">
                  <span className="text-xs font-bold text-slate-600">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={(localConfig as any)[item.key]}
                    onChange={e => setLocalConfig({ ...localConfig, [item.key]: e.target.checked })}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200">
               <label className={labelClasses}>زمان یادآوری سررسید (روز قبل)</label>
               <input
                 type="number"
                 min="1"
                 max="30"
                 value={localConfig.notifyDaysBefore}
                 onChange={e => setLocalConfig({ ...localConfig, notifyDaysBefore: parseInt(e.target.value) })}
                 className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 font-bold text-center"
               />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
          <button
            onClick={handleTest}
            disabled={testLoading}
            className="py-4 border-2 border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {testLoading ? 'در حال ارسال...' : '🧪 ارسال پیام تست'}
          </button>
          <button
            onClick={() => onSave(localConfig)}
            className="py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            💾 ذخیره و همگام‌سازی در دیتابیس
          </button>
        </div>
      </div>

      <div className="bg-blue-900 text-white p-10 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <h4 className="text-lg font-black mb-4 flex items-center gap-3">
          <span className="text-blue-400">💡</span> 
          راهنمای پیکربندی حرفه‌ای
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm opacity-90 leading-relaxed font-medium">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="font-black text-blue-300 mb-2">گام اول:</p>
            بات @BotFather را در تلگرام استارت کرده و با دستور /newbot یک بات بسازید. توکن دریافتی را کپی کنید.
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="font-black text-blue-300 mb-2">گام دوم:</p>
            بات @userinfobot را استارت کنید تا شناسه عددی (Chat ID) خود را دریافت نمایید.
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="font-black text-blue-300 mb-2">گام سوم:</p>
            اطلاعات را در پنل بالا وارد کرده و دکمه «ذخیره و همگام‌سازی» را فشار دهید تا سیستم همیشه آنلاین بماند.
          </div>
        </div>
      </div>
    </div>
  );
};
