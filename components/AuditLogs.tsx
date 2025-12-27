
import React from 'react';
import { AuditLog } from '../types';
import { toJalali } from '../utils/jalali';

export const AuditLogs: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <h3 className="font-bold text-slate-700">سابقه فعالیت‌های سیستم (Audit Trail)</h3>
      </div>
      <table className="w-full text-right text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold">
          <tr>
            <th className="p-4">زمان</th>
            <th className="p-4">نوع عملیات</th>
            <th className="p-4">جزئیات</th>
            <th className="p-4">شناسه مرجع</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {logs.map(log => (
            <tr key={log.id} className="hover:bg-slate-50 transition">
              <td className="p-4 text-slate-500 font-mono">{toJalali(log.timestamp)}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                  log.action.includes('حذف') ? 'bg-red-50 text-red-600' : 
                  log.action.includes('ثبت') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {log.action}
                </span>
              </td>
              <td className="p-4 text-slate-600">{log.details}</td>
              <td className="p-4 font-mono text-slate-400">{log.checkId}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr><td colSpan={4} className="p-10 text-center text-slate-400">هیچ واقعه‌ای ثبت نشده است.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
