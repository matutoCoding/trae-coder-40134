export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  memberId: string;
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
  allocatedRoom?: string;
}

export interface TimeSlot {
  label: string;
  startTime: string;
  endTime: string;
  available: boolean;
  roomId?: string;
}
