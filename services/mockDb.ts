
import { Attendee, UniversalQRCodeConfig } from '../types';

const DB_KEY = 'confcheck_attendees';
const UNIVERSAL_CONFIG_KEY = 'confcheck_universal_config';

const INITIAL_UNIVERSAL_CONFIG: UniversalQRCodeConfig = {
  limit: 50,
  currentCount: 0
};

const INITIAL_IMPORT: Attendee[] = [
  { id: '1001', name: '王利民', phoneNumber: '13800000001', qrCode:'21234', company: '全球数字经济研究院', status: 'checked-in', checkInTime: Date.now() - 3600000, registerTime: Date.now(), participationType: '2-day', mealsTaken: ['d1_b', 'd1_l'], mealTimestamps: { 'd1_b': Date.now() - 7200000, 'd1_l': Date.now() - 3600000 }, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop' },
  { id: '1002', name: '张爱国', phoneNumber: '13800000002', company: '智联科技集团', status: 'pending', registerTime: Date.now(), participationType: '1-day-d1', mealsTaken: [], avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop', qrCode: '15923' },
  { id: '1003', name: '李明', phoneNumber: '13800000003', company: '创新领航工业', status: 'checked-in', checkInTime: Date.now() - 7200000, registerTime: Date.now(), participationType: '2-day', mealsTaken: ['d1_b', 'd1_l', 'd1_d'], mealTimestamps: { 'd1_b': Date.now() - 10800000, 'd1_l': Date.now() - 7200000, 'd1_d': Date.now() - 3600000 }, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', qrCode: '21104' },
  { id: '1004', name: '赵丽', phoneNumber: '13800000004', company: '未来通讯', status: 'pending', registerTime: Date.now(), participationType: '1-day-d2', mealsTaken: [], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', qrCode: '13382' },
  { id: '1005', name: '陈强', phoneNumber: '13800000005', company: '萝卜教育科技', status: 'checked-in', checkInTime: Date.now() - 1800000, registerTime: Date.now(), participationType: '2-day', mealsTaken: ['d1_b'], mealTimestamps: { 'd1_b': Date.now() - 1800000 }, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop', qrCode: '29951' },
  { id: '1006', name: '刘芳', phoneNumber: '13800000006', company: '智印办公设备', status: 'pending', registerTime: Date.now(), participationType: '1-day-d1', mealsTaken: [], avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', qrCode: '14402' },
  { id: '1007', name: '黄勇', phoneNumber: '13800000007', company: '宏图喷墨中心', status: 'checked-in', checkInTime: Date.now() - 500000, registerTime: Date.now(), participationType: '2-day', mealsTaken: [], avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop', qrCode: '25583' },
  { id: 'UB-DEMO', name: '无胸卡人员', phoneNumber: 'N/A', company: '现场临时人员', status: 'checked-in', registerTime: Date.now(), checkInTime: Date.now(), participationType: '1-day-d1', mealsTaken: ['d1_l'], mealTimestamps: { 'd1_l': Date.now() } },
];

const generateQRCode = (participationType: Attendee['participationType']) => {
  const firstDigit = participationType === '2-day' ? '2' : '1';
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return firstDigit + randomPart;
};

export const mockDb = {
  getAttendees: (): Attendee[] => {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_IMPORT));
      return INITIAL_IMPORT;
    }
    return JSON.parse(data);
  },
  saveAttendee: (attendee: Attendee) => {
    const attendees = mockDb.getAttendees();
    const index = attendees.findIndex(a => a.id === attendee.id);
    
    // Ensure qrCode exists (except for "No Badge Personnel")
    if (!attendee.qrCode && attendee.name !== '无胸卡人员') {
      attendee.qrCode = generateQRCode(attendee.participationType);
    }

    if (index > -1) {
      attendees[index] = { ...attendees[index], ...attendee };
    } else {
      attendees.push(attendee);
    }
    localStorage.setItem(DB_KEY, JSON.stringify(attendees));
  },
  resetData: () => {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_IMPORT));
    localStorage.setItem(UNIVERSAL_CONFIG_KEY, JSON.stringify(INITIAL_UNIVERSAL_CONFIG));
    return INITIAL_IMPORT;
  },
  findByPhone: (phone: string) => mockDb.getAttendees().find(a => a.phoneNumber === phone),
  findByName: (name: string) => mockDb.getAttendees().find(a => a.name === name),
  
  getUniversalConfig: (): UniversalQRCodeConfig => {
    const data = localStorage.getItem(UNIVERSAL_CONFIG_KEY);
    if (!data) {
      localStorage.setItem(UNIVERSAL_CONFIG_KEY, JSON.stringify(INITIAL_UNIVERSAL_CONFIG));
      return INITIAL_UNIVERSAL_CONFIG;
    }
    return JSON.parse(data);
  },
  updateUniversalConfig: (config: Partial<UniversalQRCodeConfig>) => {
    const current = mockDb.getUniversalConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(UNIVERSAL_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  },
  recordUniversalMeal: (mealId: string) => {
    const config = mockDb.getUniversalConfig();
    
    // Increment count (allow exceeding the limit)
    mockDb.updateUniversalConfig({ currentCount: config.currentCount + 1 });
    
    // Create a "No Badge" attendee record
    const participationType: Attendee['participationType'] = '1-day-d1';
    const newAttendee: Attendee = {
      id: `UB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: '无胸卡人员',
      phoneNumber: 'N/A',
      company: '现场临时人员',
      status: 'checked-in',
      registerTime: Date.now(),
      checkInTime: Date.now(),
      participationType,
      mealsTaken: [mealId],
      mealTimestamps: { [mealId]: Date.now() }
    };
    
    mockDb.saveAttendee(newAttendee);
    return newAttendee;
  }
};
