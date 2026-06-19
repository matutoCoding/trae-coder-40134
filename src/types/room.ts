export type RoomStatus = 'free' | 'occupied' | 'maintenance';
export type EquipmentLevel = 'standard' | 'professional' | 'premium';

export interface Room {
  id: string;
  name: string;
  floor: number;
  equipmentLevel: EquipmentLevel;
  status: RoomStatus;
  todaySchedule: TimeBlock[];
  occupancyRate: number;
}

export interface TimeBlock {
  startTime: string;
  endTime: string;
  status: 'free' | 'booked';
  bookingId?: string;
}
