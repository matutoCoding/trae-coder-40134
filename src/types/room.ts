export type RoomStatus = 'free' | 'occupied' | 'maintenance';
export type EquipmentLevel = 'standard' | 'professional' | 'premium';

export interface Room {
  id: string;
  name: string;
  floor: number;
  equipmentLevel: EquipmentLevel;
  status: 'active' | 'maintenance';
  baseSchedule: TimeBlock[];
}

export interface TimeBlock {
  startTime: string;
  endTime: string;
  status: 'free' | 'booked-self' | 'booked-other' | 'maintenance' | 'unavailable';
  bookingId?: string;
  memberName?: string;
}

export interface DaySchedule {
  date: string;
  blocks: TimeBlock[];
  occupancyRate: number;
  dayStatus: 'free' | 'partial' | 'full';
}
