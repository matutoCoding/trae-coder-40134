export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'waitlist' | 'waitlist-converted' | 'waitlist-expired';

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
  allocationReason?: string;
  isWaitlist?: boolean;
  waitlistPosition?: number;
}

export interface TimeSlot {
  label: string;
  startTime: string;
  endTime: string;
  available: boolean;
  isFull?: boolean;
  roomId?: string;
}

export interface AllocationResult {
  room: import('@/types/room').Room;
  reasons: string[];
}
