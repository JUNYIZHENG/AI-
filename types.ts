
export interface Attendee {
  id: string;
  name: string;
  phoneNumber: string;
  company: string;
  avatar?: string;
  status: 'pending' | 'checked-in';
  registerTime: number;
  checkInTime?: number;
  personalizedWelcome?: string;
  roomNumber?: string;
  participationType: '1-day-d1' | '1-day-d2' | '2-day';
  qrCode?: string;
  mealsTaken?: string[];
  mealTimestamps?: Record<string, number>;
  tableNumber?: string;
  breakfastStatus?: 'not-taken' | 'taken';
}

export interface UniversalQRCodeConfig {
  limit: number;
  currentCount: number;
}

export type View = 'admin-list' | 'admin-qr' | 'universal-scan';
