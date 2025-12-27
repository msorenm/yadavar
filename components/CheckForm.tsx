
import React, { useState, useEffect } from 'react';
import { Check, CheckStatus } from '../types';
import { JALALI_MONTHS, jalaliToGregorian, toJalaliParts } from '../utils/jalali';

interface CheckFormProps {
  onSave: (check: Check) => void;
  onCancel: () => void;
  initialData?: Check;
}

export const CheckForm: React.FC<CheckFormProps> = ({ onSave, onCancel, initialData }) => {
  const initialJalali = initialData 
    ? toJalaliParts(initialData.dueDate) 
    : toJalaliParts(new Date());

  const [jalaliDate, setJalaliDate] = useState(initialJalali);
  const [formData, setFormData] = useState<Partial<Check>>(initialData || {
    amount: 0,
    dueDate: new Date().toISOString(),
    issuer: '',
    issuerNationalId: '',
    recipient: '',
    bankName: '',
    branchName: '',
    checkNumber: '',
    sayadId: '',
    status: CheckStatus.PENDING,
    description: ''
  });

  useEffect(() => {
    const gregDate = jalaliToGregorian(jalaliDate.year, jalaliDate.month, jalaliDate.day);
    setFormData(prev => ({ ...prev, dueDate: gregDate.toISOString() }));
  }, [jalaliDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.sayadId && formData.sayadId.length !== 16) {
      alert('خطا: شناسه صیاد باید دقیقاً ۱۶ رقم باشد.');
      return;
    }
    const finalCheck: Check = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(formData as Omit<Check, 'id' | 'createdAt' | 'updatedAt'>)
    };
    onSave(finalCheck);
  };

  const years = Array.from({ length: 15 }, (_, i) => 1400 + i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const inputClasses = "w-full p-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all duration-200 placeholder:text-slate-400 font-medium";
  const selectClasses = "p-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all duration-200 font-bold cursor-pointer hover:bg-slate-50";
  const labelClasses = "block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5";

  return (
    <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200 border border-slate-200 overflow-hidden max-w-5xl mx-auto animate-in fade-in zoom-in duration-300">
      <div className="bg-[#0f172a] p-6 text-white flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span className="p-2 bg-blue-600 rounded-lg text-lg">📝</span>
            ثبت و ویرایش اسناد مالی (سامانه صیاد)
          </h3>
          <p className="text-xs text-slate-400 mt-1">اطلاعات وارد شده مستقیماً در دیتابیس مرکزی تیسا ذخیره می‌گردد.</p>
        </div>
        <div className="hidden sm:block text-left">
          <span className="text-[10px] bg-slate-800 px-3 py-1.5 rounded-full text-blue-400 font-bold uppercase tracking-widest border border-slate-700">Audit Ready</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* بخش مبلغ */}
          <div className="space-y-1">
            <label className={labelClasses}>💰 مبلغ وجه (ریال)</label>
            <input
              type="number"
              required
              placeholder="مثال: 500,000,000"
              value={formData.amount || ''}
              onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
              className={`${inputClasses} text-lg text-blue-700 font-black`}
            />
          </div>
          
          {/* بخش شناسه صیاد */}
          <div className="space-y-1">
            <label className={labelClasses}>🆔 شناسه صیاد (۱۶ رقم)</label>
            <input
              type="text"
              maxLength={16}
              required
              placeholder="---- ---- ---- ----"
              value={formData.sayadId}
              onChange={e => setFormData({ ...formData, sayadId: e.target.value })}
              className={`${inputClasses} text-center font-mono tracking-[0.2em] text-lg bg-slate-50`}
            />
          </div>

          {/* انتخابگر تاریخ شمسی */}
          <div className="space-y-1">
            <label className={labelClasses}>📅 تاریخ سررسید (شمسی)</label>
            <div className="grid grid-cols-3 gap-2">
              <select 
                value={jalaliDate.day}
                onChange={e => setJalaliDate({...jalaliDate, day: parseInt(e.target.value)})}
                className={selectClasses}
              >
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select 
                value={jalaliDate.month}
                onChange={e => setJalaliDate({...jalaliDate, month: parseInt(e.target.value)})}
                className={selectClasses}
              >
                {JALALI_MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
              <select 
                value={jalaliDate.year}
                onChange={e => setJalaliDate({...jalaliDate, year: parseInt(e.target.value)})}
                className={selectClasses}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* اطلاعات هویتی */}
          <div className="space-y-1">
            <label className={labelClasses}>👤 نام صادرکننده</label>
            <input
              type="text"
              required
              placeholder="نام و نام خانوادگی / شرکت"
              value={formData.issuer}
              onChange={e => setFormData({ ...formData, issuer: e.target.value })}
              className={inputClasses}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClasses}>💳 کد ملی / شناسه ملی</label>
            <input
              type="text"
              required
              placeholder="۱۰ یا ۱۱ رقم"
              value={formData.issuerNationalId}
              onChange={e => setFormData({ ...formData, issuerNationalId: e.target.value })}
              className={inputClasses}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClasses}>🏦 اطلاعات بانکی</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="بانک"
                required
                value={formData.bankName}
                onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                className="w-1/2 p-3.5 rounded-lg border border-slate-300 bg-white outline-none focus:border-blue-600 font-medium"
              />
              <input
                type="text"
                placeholder="شعبه"
                value={formData.branchName}
                onChange={e => setFormData({ ...formData, branchName: e.target.value })}
                className="w-1/2 p-3.5 rounded-lg border border-slate-300 bg-white outline-none focus:border-blue-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* توضیحات */}
        <div className="space-y-1 pt-4 border-t border-slate-100">
          <label className={labelClasses}>📝 بابت / توضیحات قرارداد</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="جزئیات معامله، شماره قرارداد و غیره..."
            className={`${inputClasses} resize-none`}
          />
        </div>

        {/* دکمه‌ها */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-all duration-200 border border-transparent hover:border-slate-200 text-sm"
          >
            انصراف و بازگشت
          </button>
          <button
            type="submit"
            className="px-12 py-3.5 bg-blue-600 text-white rounded-xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-sm"
          >
            تایید و ثبت نهایی در دیتابیس
          </button>
        </div>
      </form>
    </div>
  );
};
