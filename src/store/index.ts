import { create } from 'zustand';
import type { Room, TimeBlock } from '@/types/room';
import type { Booking } from '@/types/booking';
import type { Member, MemberLevel, LevelChangeRecord } from '@/types/member';
import type { Assessment } from '@/types/assessment';
import { LEVEL_CONFIG } from '@/types/member';
import { mockRooms } from '@/data/rooms';
import { mockBookings } from '@/data/bookings';
import { mockMember, mockLevelHistory } from '@/data/members';
import { mockAssessments } from '@/data/assessments';
import dayjs from 'dayjs';

interface AppState {
  rooms: Room[];
  bookings: Booking[];
  member: Member;
  levelHistory: LevelChangeRecord[];
  assessments: Assessment[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (bookingId: string) => void;
  deductQuota: () => void;
  updateRoomSchedule: (roomId: string, startTime: string, bookingId: string) => void;
  changeLevel: (newLevel: MemberLevel) => void;
  addAssessment: (assessment: Assessment) => void;
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

  deductQuota: () =>
    set((state) => {
      if (state.member.remainingQuota <= 0) return state;
      const newUsed = state.member.usedQuota + 1;
      const newRemaining = Math.max(state.member.weeklyQuota - newUsed, 0);
      return {
        member: {
          ...state.member,
          usedQuota: newUsed,
          remainingQuota: newRemaining,
        },
      };
    }),

  updateRoomSchedule: (roomId, startTime, bookingId) =>
    set((state) => {
      const newRooms = state.rooms.map((room) => {
        if (room.id !== roomId) return room;
        const newSchedule = room.todaySchedule.map((block: TimeBlock) =>
          block.startTime === startTime
            ? { ...block, status: 'booked' as const, bookingId }
            : block
        );
        const totalSlots = newSchedule.length;
        const bookedSlots = newSchedule.filter((b: TimeBlock) => b.status === 'booked').length;
        const newRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;
        const newStatus: Room['status'] = newRate >= 100 ? 'occupied' : 'free';
        return { ...room, todaySchedule: newSchedule, occupancyRate: newRate, status: newStatus };
      });
      return { rooms: newRooms };
    }),

  changeLevel: (newLevel) =>
    set((state) => {
      const oldLevel = state.member.level;
      if (oldLevel === newLevel) return state;

      const oldConfig = LEVEL_CONFIG[oldLevel];
      const newConfig = LEVEL_CONFIG[newLevel];
      const oldLevelIndex = Object.keys(LEVEL_CONFIG).indexOf(oldLevel);
      const newLevelIndex = Object.keys(LEVEL_CONFIG).indexOf(newLevel);
      const isUpgrade = newLevelIndex > oldLevelIndex;

      let carryOver = 0;
      let note = '';
      if (isUpgrade) {
        carryOver = Math.round(state.member.remainingQuota * (newConfig.weeklyQuota / oldConfig.weeklyQuota) * 10) / 10;
        note = `升级，剩余${state.member.remainingQuota}h按比例结转为${carryOver}h`;
      } else {
        if (newLevel === 'basic') {
          carryOver = 0;
          note = `降级至基础会员，剩余额度清零`;
        } else {
          carryOver = Math.min(state.member.remainingQuota, Math.round(newConfig.weeklyQuota * 0.5 * 10) / 10);
          note = `降级，剩余额度结转上限为${carryOver}h`;
        }
      }

      const newMember: Member = {
        ...state.member,
        level: newLevel,
        weeklyQuota: newConfig.weeklyQuota,
        usedQuota: newConfig.weeklyQuota - carryOver,
        remainingQuota: carryOver,
        currentLevelSince: dayjs().format('YYYY-MM-DD'),
      };

      const record: LevelChangeRecord = {
        id: `LC${Date.now()}`,
        memberId: state.member.id,
        fromLevel: oldLevel,
        toLevel: newLevel,
        changeDate: dayjs().format('YYYY-MM-DD'),
        reason: isUpgrade ? '升级' : '降级',
        quotaBefore: oldConfig.weeklyQuota,
        quotaAfter: newConfig.weeklyQuota,
        quotaCarryOver: carryOver,
        note,
      };

      console.info('[Member] 等级变更', { from: oldLevel, to: newLevel, carryOver, note });

      return {
        member: newMember,
        levelHistory: [record, ...state.levelHistory],
      };
    }),

  addAssessment: (assessment) =>
    set((state) => ({ assessments: [assessment, ...state.assessments] })),
}));
