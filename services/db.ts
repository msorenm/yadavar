
import { Check, AuditLog, TelegramConfig, CheckStatus } from '../types';
import { toJalali, formatCurrency } from '../utils/jalali';

const CHECKS_KEY = 'tisa_db_checks';
const LOGS_KEY = 'tisa_db_logs';
const TG_CONFIG_KEY = 'tisa_db_tg_config';

/**
 * Service for Telegram Notifications
 * ارسال مستقیم اعلان‌ها به API تلگرام
 */
const sendTelegramMessage = async (config: TelegramConfig, text: string) => {
  if (!config.isActive || !config.botToken || !config.chatId) return;
  
  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
  } catch (error) {
    console.error('Telegram Notification Error:', error);
  }
};

export const db = {
  async getChecks(): Promise<Check[]> {
    const data = localStorage.getItem(CHECKS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async getTelegramConfig(): Promise<TelegramConfig> {
    const data = localStorage.getItem(TG_CONFIG_KEY);
    return data ? JSON.parse(data) : {
      botToken: '',
      chatId: '',
      isActive: false,
      notifyOnCreate: true,
      notifyOnDelete: true,
      notifyOnStatusChange: true,
      notifyDaysBefore: 1
    };
  },

  async saveTelegramConfig(config: TelegramConfig): Promise<void> {
    localStorage.setItem(TG_CONFIG_KEY, JSON.stringify({
      ...config,
      lastSyncTimestamp: new Date().toISOString()
    }));
  },

  async saveCheck(check: Check): Promise<void> {
    const checks = await this.getChecks();
    const config = await this.getTelegramConfig();
    const index = checks.findIndex(c => c.id === check.id);
    let message = '';
    
    if (index > -1) {
      const oldStatus = checks[index].status;
      checks[index] = { ...check, updatedAt: new Date().toISOString() };
      await this.logAction('ویرایش چک', check.id, `چک شماره ${check.checkNumber} بروزرسانی شد.`);
      
      if (config.notifyOnStatusChange && oldStatus !== check.status) {
        message = `🔔 <b>تغییر وضعیت چک</b>\n\n👤 صادرکننده: ${check.issuer}\n💰 مبلغ: ${formatCurrency(check.amount)}\n🔄 وضعیت جدید: <b>${check.status}</b>\n📅 سررسید: ${toJalali(check.dueDate)}`;
      }
    } else {
      checks.push({ ...check, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      await this.logAction('ثبت چک جدید', check.id, `سند جدید با مبلغ ${check.amount} درج شد.`);
      
      if (config.notifyOnCreate) {
        message = `✅ <b>ثبت چک جدید در سیستم</b>\n\n👤 صادرکننده: ${check.issuer}\n💰 مبلغ: ${formatCurrency(check.amount)}\n📅 سررسید: ${toJalali(check.dueDate)}\n🆔 صیاد: <code>${check.sayadId}</code>`;
      }
    }
    
    localStorage.setItem(CHECKS_KEY, JSON.stringify(checks));
    if (message) await sendTelegramMessage(config, message);
  },

  async deleteCheck(id: string): Promise<void> {
    const checks = await this.getChecks();
    const config = await this.getTelegramConfig();
    const checkToDelete = checks.find(c => c.id === id);
    
    const filtered = checks.filter(c => c.id !== id);
    localStorage.setItem(CHECKS_KEY, JSON.stringify(filtered));
    await this.logAction('حذف چک', id, `سند مالی از دیتابیس حذف گردید.`);
    
    if (config.notifyOnDelete && checkToDelete) {
      const message = `🗑 <b>حذف سند مالی</b>\n\nسند متعلق به <b>${checkToDelete.issuer}</b> به مبلغ ${formatCurrency(checkToDelete.amount)} از سیستم حذف گردید.`;
      await sendTelegramMessage(config, message);
    }
  },

  async logAction(action: string, checkId: string, details: string): Promise<void> {
    const logs = await this.getLogs();
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      checkId,
      details,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
  },

  async getLogs(): Promise<AuditLog[]> {
    const data = localStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
  },

  // سیستم بررسی خودکار سررسیدها (یادآوری)
  async checkReminders(): Promise<void> {
    const checks = await this.getChecks();
    const config = await this.getTelegramConfig();
    if (!config.isActive) return;

    const now = new Date();
    for (const check of checks) {
      // Fixed: Added CheckStatus to imports to fix "Cannot find name 'CheckStatus'" error on line 126
      if (check.status !== CheckStatus.PENDING) continue;
      
      const dueDate = new Date(check.dueDate);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === config.notifyDaysBefore) {
        const message = `⏰ <b>یادآوری سررسید چک (کمتر از ${diffDays} روز)</b>\n\n⚠️ هشدار: سررسید چک <b>${check.issuer}</b> نزدیک است.\n💰 مبلغ: ${formatCurrency(check.amount)}\n📅 تاریخ: ${toJalali(check.dueDate)}\n🏦 بانک: ${check.bankName}`;
        await sendTelegramMessage(config, message);
      }
    }
  }
};
