import { create } from 'zustand';
import type { Room } from '@/types/room';
import type { Booking } from '@/types/booking';
import type { Member } from '@/types/member';
import type { Assessment } from '@/types/assessment';
import { mockRooms } from '@/data/rooms';
import { mockBookings } from '@/data/bookings';
import { mockMember, mockLevelHistory } from '@/data/members';
import { mockAssessments } from '@/data/assessments';

interface AppState {
  rooms: Room[];
  bookings: Booking[];
  member: Member;
  levelHistory: import('@/types/member').LevelChangeRecord[];
  assessments: Assessment[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  rooms: mockRooms,
  bookings: mockBookings,
  member: mockMember,
  levelHistory: mockLevelHistory,
  assessments: mockAssessments,
  addBooking: (booking) =>
    set((state) => ({ bookings: [booking, ...state.bookings] })),
  cancelBooking: (bookingId) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      ),
    })),
}));
