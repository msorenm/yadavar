
export enum CheckStatus {
  PENDING = 'در انتظار',
  PAID = 'پاس شده',
  BOUNCED = 'برگشتی',
  CANCELLED = 'ابطال شده',
  LEGAL_ACTION = 'اقدام حقوقی'
}

export interface AuditLog {
  id: string;
  action: string;
  checkId: string;
  timestamp: string;
  details: string;
}

export interface Check {
  id: string;
  amount: number;
  dueDate: string; 
  issuer: string;
  issuerNationalId: string;
  recipient: string;
  bankName: string;
  branchName: string;
  checkNumber: string;
  sayadId: string;
  status: CheckStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  isActive: boolean;
  notifyOnCreate: boolean;
  notifyOnDelete: boolean;
  notifyOnStatusChange: boolean;
  notifyDaysBefore: number;
  lastSyncTimestamp?: string;
}
