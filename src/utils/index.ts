import type { Room, TimeBlock, DaySchedule } from '@/types/room';
import type { Booking, TimeSlot, AllocationResult } from '@/types/booking';
import type { Member } from '@/types/member';

const SLOT_ORDER = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00', '21:00'];

export const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const hours = [9, 10, 11, 14, 15, 16, 19, 20];
  hours.forEach(h => {
    const start = `${String(h).padStart(2, '0')}:00`;
    const end = `${String(h + 1).padStart(2, '0')}:00`;
    slots.push({
      label: `${start}-${end}`,
      startTime: start,
      endTime: end,
      available: true,
    });
  });
  return slots;
};

export const getDaySchedule = (room: Room, bookings: Booking[], date: string): DaySchedule => {
  if (room.status === 'maintenance') {
    return {
      date,
      blocks: [],
      occupancyRate: 100,
      dayStatus: 'full',
    };
  }

  const dayBookings = bookings.filter(
    b => b.roomId === room.id && b.date === date && b.status !== 'cancelled'
  );

  const blocks: TimeBlock[] = room.baseSchedule.map(block => {
    const booking = dayBookings.find(b => b.startTime === block.startTime);
    if (booking) {
      return {
        ...block,
        status: 'booked' as const,
        bookingId: booking.id,
        memberName: booking.memberId === 'M001' ? '我' : `学员${booking.id.slice(-2)}`,
      };
    }
    return { ...block };
  });

  const totalSlots = blocks.length;
  const bookedSlots = blocks.filter(b => b.status === 'booked').length;
  const occupancyRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

  let dayStatus: DaySchedule['dayStatus'] = 'free';
  if (bookedSlots === 0) dayStatus = 'free';
  else if (bookedSlots >= totalSlots) dayStatus = 'full';
  else dayStatus = 'partial';

  return { date, blocks, occupancyRate, dayStatus };
};

const isSlotFree = (blocks: TimeBlock[], startTime: string): boolean => {
  const block = blocks.find(b => b.startTime === startTime);
  return block?.status === 'free';
};

const getSortedBlocks = (blocks: TimeBlock[]): TimeBlock[] => {
  return [...blocks].sort((a, b) => SLOT_ORDER.indexOf(a.startTime) - SLOT_ORDER.indexOf(b.startTime));
};

const findContinuousFreeBlocks = (blocks: TimeBlock[]): { start: string; length: number; end: string }[] => {
  const sorted = getSortedBlocks(blocks);
  const segments: { start: string; length: number; end: string }[] = [];
  let current: { start: string; length: number; end: string } | null = null;

  for (const block of sorted) {
    if (block.status === 'free') {
      if (!current) {
        current = { start: block.startTime, length: 1, end: block.endTime };
      } else {
        const prevEnd = current.end;
        const idx = SLOT_ORDER.indexOf(block.startTime);
        const prevIdx = SLOT_ORDER.indexOf(prevEnd);
        if (idx === prevIdx) {
          current.length++;
          current.end = block.endTime;
        } else {
          segments.push(current);
          current = { start: block.startTime, length: 1, end: block.endTime };
        }
      }
    } else if (current) {
      segments.push(current);
      current = null;
    }
  }
  if (current) segments.push(current);
  return segments;
};

const calculateAllocationScore = (
  room: Room,
  blocks: TimeBlock[],
  targetStart: string
): { score: number; reasons: string[] } => {
  const reasons: string[] = [];
  let score = 0;

  const sorted = getSortedBlocks(blocks);
  const freeSegments = findContinuousFreeBlocks(blocks);
  const targetSegment = freeSegments.find(
    seg => targetStart >= seg.start && targetStart < seg.end
  );

  if (targetSegment) {
    const segLength = targetSegment.length;
    const targetIdx = sorted.findIndex(b => b.startTime === targetStart);
    const segStartIdx = sorted.findIndex(b => b.startTime === targetSegment.start);
    const segEndIdx = segStartIdx + segLength - 1;

    const distFromStart = targetIdx - segStartIdx;
    const distFromEnd = segEndIdx - targetIdx;
    const minDist = Math.min(distFromStart, distFromEnd);
    const isEdge = minDist === 0;

    if (isEdge) {
      score += 100;
      if (segLength >= 3) {
        reasons.push(`该时段是连续${segLength}个空闲档的边缘，从边上填可以保留中间连续空档`);
      } else {
        reasons.push(`优先填补零散空位，避免切出更多碎片`);
      }
    } else if (minDist === 1) {
      score += 60;
      reasons.push(`靠近连续空闲档边缘，不会把大段空闲切得太碎`);
    } else {
      score -= 40;
      reasons.push(`位于连续空档中间，会把一整段切开，尽量避免`);
    }

    if (segLength === 1) {
      score += 80;
      if (reasons.length === 0 || !reasons.some(r => r.includes('零散'))) {
        reasons.push(`这是一个单独的零散空位，先填掉减少碎片`);
      }
    } else if (segLength >= 4) {
      score += 30;
      reasons.push(`该鼓房有${segLength}个连续空闲，适合长时段练习`);
    }
  }

  const freeCount = blocks.filter(b => b.status === 'free').length;
  if (freeCount <= 2) {
    score += 50;
    reasons.push(`该鼓房今日仅剩${freeCount}个空闲，优先排入充分利用`);
  } else if (freeCount <= 4) {
    score += 25;
    reasons.push(`该鼓房今日空闲不多(${freeCount}个)，优先填补`);
  }

  const occupancy = Math.round(((blocks.length - freeCount) / blocks.length) * 100);
  if (occupancy < 30) {
    score += 20;
    reasons.push(`占用率仅${occupancy}%，负载较轻`);
  } else if (occupancy < 60) {
    score += 10;
    reasons.push(`占用率${occupancy}%，负载适中`);
  }

  if (reasons.length > 3) {
    return { score, reasons: reasons.slice(0, 3) };
  }

  return { score, reasons };
};

export const allocateRoom = (
  rooms: Room[],
  bookings: Booking[],
  date: string,
  timeSlot: string
): AllocationResult | null => {
  const availableRooms = rooms.filter(r => {
    if (r.status === 'maintenance') return false;
    const schedule = getDaySchedule(r, bookings, date);
    return isSlotFree(schedule.blocks, timeSlot);
  });

  if (availableRooms.length === 0) return null;

  const scored = availableRooms.map(room => {
    const schedule = getDaySchedule(room, bookings, date);
    const { score, reasons } = calculateAllocationScore(room, schedule.blocks, timeSlot);
    return { room, score, reasons };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  return {
    room: best.room,
    reasons: best.reasons,
  };
};

export const getBookingsForMember = (bookings: Booking[], memberId: string): Booking[] => {
  return bookings.filter(b => b.memberId === memberId);
};

export const getBookingStatusText = (status: Booking['status']): string => {
  const map: Record<Booking['status'], string> = {
    pending: '待确认',
    confirmed: '已确认',
    cancelled: '已取消',
    completed: '已完成',
  };
  return map[status];
};

export const getRoomStatusText = (status: Room['status']): string => {
  const map: Record<Room['status'], string> = {
    active: '运营中',
    maintenance: '维修中',
  };
  return map[status];
};

export const getDayStatusText = (dayStatus: DaySchedule['dayStatus']): string => {
  const map: Record<DaySchedule['dayStatus'], string> = {
    free: '空闲',
    partial: '部分占用',
    full: '已满',
  };
  return map[dayStatus];
};

export const getEquipmentLevelText = (level: Room['equipmentLevel']): string => {
  const map: Record<Room['equipmentLevel'], string> = {
    standard: '标准',
    professional: '专业',
    premium: '旗舰',
  };
  return map[level];
};

export const getAssessmentStatusText = (status: string): string => {
  const map: Record<string, string> = {
    passed: '通过',
    failed: '未通过',
    pending: '待考核',
  };
  return map[status] || status;
};
