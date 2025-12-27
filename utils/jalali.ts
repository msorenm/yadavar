
/**
 * Utility functions for Jalali date conversion and formatting.
 * Optimized for professional financial systems.
 */

export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export function toJalali(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d);
}

export function toJalaliParts(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  }).formatToParts(d);
  
  return {
    year: parseInt(parts.find(p => p.type === 'year')?.value || '1402'),
    month: parseInt(parts.find(p => p.type === 'month')?.value || '1'),
    day: parseInt(parts.find(p => p.type === 'day')?.value || '1')
  };
}

/**
 * Converts Jalali year, month, day to Gregorian Date object.
 * Based on standard algorithmic conversion for financial accuracy.
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const sal_a = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let gy: number, gm: number, gd: number;
  let g_day_no: number, j_day_no: number;
  let i: number;

  const jy_calc = jy - 979;
  const jm_calc = jm - 1;
  const jd_calc = jd - 1;

  j_day_no = 365 * jy_calc + Math.floor(jy_calc / 33) * 8 + Math.floor((jy_calc % 33 + 3) / 4);
  for (i = 0; i < jm_calc; ++i) {
    j_day_no += (i < 6) ? 31 : 30;
  }
  j_day_no += jd_calc;

  g_day_no = j_day_no + 79;
  gy = 1600 + 400 * Math.floor(g_day_no / 146097); 
  g_day_no = g_day_no % 146097;

  let leap = true;
  if (g_day_no >= 36525) {
    g_day_no--;
    gy += 100 * Math.floor(g_day_no / 36524);
    g_day_no = g_day_no % 36524;
    if (g_day_no >= 365) {
      g_day_no++;
    } else {
      leap = false;
    }
  }

  gy += 4 * Math.floor(g_day_no / 1461);
  g_day_no %= 1461;
  if (g_day_no >= 366) {
    leap = false;
    g_day_no--;
    gy += Math.floor(g_day_no / 365);
    g_day_no = g_day_no % 365;
  }

  for (i = 0; g_day_no >= sal_a[i] + (i === 1 && leap ? 1 : 0); i++) {
    // skip
  }
  gm = i;
  gd = g_day_no - sal_a[i - 1] - (i > 2 && leap ? 1 : 0) + 1;

  return new Date(gy, gm - 1, gd);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' ریال';
}

export function getDaysRemaining(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
