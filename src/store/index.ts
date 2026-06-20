import { create } from 'zustand';
import type { Room } from '@/types/room';
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
  addWaitlist: (booking: Booking) => void;
  convertWaitlist: (bookingId: string, roomId: string, roomName: string) => void;
  expireWaitlist: (date: string) => void;
  deductQuota: () => void;
  returnQuota: () => void;
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
    set((state) => {
      const target = state.bookings.find(b => b.id === bookingId);
      if (!target || target.status === 'cancelled') return state;

      const isWaitlist = target.status === 'waitlist';
      const newUsed = isWaitlist ? state.member.usedQuota : Math.max(state.member.usedQuota - 1, 0);
      const newRemaining = isWaitlist ? state.member.remainingQuota : Math.min(state.member.weeklyQuota - newUsed, state.member.weeklyQuota);

      console.info('[Booking] 取消预约', { bookingId, room: target.roomName, time: target.startTime, wasWaitlist: isWaitlist });

      return {
        bookings: state.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
        ),
        member: {
          ...state.member,
          usedQuota: newUsed,
          remainingQuota: newRemaining,
        },
      };
    }),

  addWaitlist: (booking) =>
    set((state) => {
      const sameSlotWaitlists = state.bookings.filter(
        b => b.date === booking.date && b.startTime === booking.startTime && b.status === 'waitlist'
      );
      const waitlistBooking: Booking = {
        ...booking,
        status: 'waitlist',
        isWaitlist: true,
        waitlistPosition: sameSlotWaitlists.length + 1,
      };
      return { bookings: [waitlistBooking, ...state.bookings] };
    }),

  convertWaitlist: (bookingId, roomId, roomName) =>
    set((state) => {
      const target = state.bookings.find(b => b.id === bookingId);
      if (!target || target.status !== 'waitlist') return state;

      return {
        bookings: state.bookings.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: 'waitlist-converted' as const,
                roomId,
                roomName,
                allocatedRoom: roomName,
                isWaitlist: false,
              }
            : b
        ),
        member: {
          ...state.member,
          usedQuota: state.member.usedQuota + 1,
          remainingQuota: Math.max(state.member.weeklyQuota - (state.member.usedQuota + 1), 0),
        },
      };
    }),

  expireWaitlist: (date) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.status === 'waitlist' && b.date === date
          ? { ...b, status: 'waitlist-expired' as const }
          : b
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

  returnQuota: () =>
    set((state) => {
      const newUsed = Math.max(state.member.usedQuota - 1, 0);
      const newRemaining = Math.min(state.member.weeklyQuota - newUsed, state.member.weeklyQuota);
      return {
        member: {
          ...state.member,
          usedQuota: newUsed,
          remainingQuota: newRemaining,
        },
      };
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
