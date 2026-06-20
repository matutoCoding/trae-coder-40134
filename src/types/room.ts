export type RoomStatus = 'free' | 'occupied' | 'maintenance';
export type EquipmentLevel = 'standard' | 'professional' | 'premium';

export interface ReservedSlot {
  startTime: string;
  endTime: string;
  reason: 'system' | 'unavailable';
  label: string;
}

export interface Room {
  id: string;
  name: string;
  floor: number;
  equipmentLevel: EquipmentLevel;
  status: 'active' | 'maintenance';
  baseSchedule: TimeBlock[];
  reservedSlots?: ReservedSlot[];
}

export interface TimeBlock {
  startTime: string;
  endTime: string;
  status: 'free' | 'booked-self' | 'booked-other' | 'maintenance' | 'reserved-system' | 'reserved-unavailable';
  bookingId?: string;
  memberName?: string;
  sourceLabel?: string;
}

export interface DaySchedule {
  date: string;
  blocks: TimeBlock[];
  occupancyRate: number;
  dayStatus: 'free' | 'partial' | 'full';
}
