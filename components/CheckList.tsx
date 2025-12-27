
import React, { useState, useMemo } from 'react';
import { Check, CheckStatus } from '../types';
import { toJalali, formatCurrency } from '../utils/jalali';

interface CheckListProps {
  checks: Check[];
  onDelete: (id: string) => void;
  onEdit: (check: Check) => void;
  onStatusChange: (id: string, status: CheckStatus) => void;
}

export const CheckList: React.FC<CheckListProps> = ({ checks, onDelete, onEdit, onStatusChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChecks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return checks;
    return checks.filter(c => 
      c.issuer.toLowerCase().includes(term) || 
      c.recipient.toLowerCase().includes(term) || 
      c.checkNumber.includes(term) ||
      c.bankName.toLowerCase().includes(term) ||
      c.sayadId.includes(term)
    );
  }, [checks, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1 group">
          <input
            type="text"
            placeholder="جستجوی آنی در دفتر کل (نام، شناسه صیاد، بانک...)"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all shadow-sm group-hover:shadow-md font-bold"
          />
          <span className="absolute left-4 top-4.5 text-xl opacity-40">🔍</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase font-black tracking-widest">
              <tr>
                <th className="p-5">شناسه صیاد</th>
                <th className="p-5">صادرکننده</th>
                <th className="p-5">بانک مرجع</th>
                <th className="p-5">مبلغ وجه</th>
                <th className="p-5">سررسید</th>
                <th className="p-5 text-center">وضعیت</th>
                <th className="p-5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChecks.map(check => (
                <tr key={check.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-5 text-xs font-mono font-bold text-slate-400 group-hover:text-blue-600">
                    {check.sayadId.replace(/(.{4})/g, '$1 ')}
                  </td>
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800">{check.issuer}</span>
                      <span className="text-[10px] text-slate-400 font-bold">{check.issuerNationalId}</span>
                    </div>
                  </td>
                  <td className="p-5">
                     <span className="text-xs font-bold text-slate-600">{check.bankName}</span>
                     <span className="text-[10px] text-slate-400 block">{check.branchName}</span>
                  </td>
                  <td className="p-5">
                    <span className="text-sm text-blue-700 font-black">{formatCurrency(check.amount)}</span>
                  </td>
                  <td className="p-5">
                    <span className="text-xs font-bold text-slate-700">{toJalali(check.dueDate)}</span>
                  </td>
                  <td className="p-5 text-center">
                    <select
                      value={check.status}
                      onChange={(e) => onStatusChange(check.id, e.target.value as CheckStatus)}
                      className={`text-[10px] px-3 py-1.5 rounded-full border-none font-black shadow-sm transition-all cursor-pointer ${
                        check.status === CheckStatus.PENDING ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                        check.status === CheckStatus.PAID ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                        check.status === CheckStatus.BOUNCED ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                        'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {Object.values(CheckStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-5">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => onEdit(check)} 
                        className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                        title="ویرایش"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => onDelete(check.id)} 
                        className="p-2.5 text-red-600 hover:bg-red-100 rounded-xl transition-all"
                        title="حذف"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredChecks.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <span className="text-5xl">🔎</span>
                      <p className="font-bold text-sm">هیچ سندی با این مشخصات یافت نشد.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
