import type { Room, TimeBlock } from '@/types/room';
import type { Booking, TimeSlot, AllocationResult } from '@/types/booking';

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

const countContinuousFreeAround = (schedule: TimeBlock[], targetStart: string): number => {
  const sorted = [...schedule].sort(
    (a, b) => SLOT_ORDER.indexOf(a.startTime) - SLOT_ORDER.indexOf(b.startTime)
  );
  let count = 0;
  let found = false;
  let afterCount = 0;
  for (const block of sorted) {
    if (block.startTime === targetStart) {
      found = true;
      if (block.status === 'free') count++;
      continue;
    }
    if (!found) {
      if (block.status === 'free') count++;
      else count = 0;
    } else {
      if (block.status === 'free') afterCount++;
      else break;
    }
  }
  return count + afterCount;
};

const countFreeSlots = (schedule: TimeBlock[]): number => {
  return schedule.filter(b => b.status === 'free').length;
};

export const allocateRoom = (rooms: Room[], timeSlot: string): AllocationResult | null => {
  const freeRooms = rooms.filter(
    r => r.status !== 'maintenance' &&
    r.todaySchedule.some((b: TimeBlock) => b.startTime === timeSlot && b.status === 'free')
  );
  if (freeRooms.length === 0) return null;

  const scored = freeRooms.map(room => {
    const reasons: string[] = [];
    const continuity = countContinuousFreeAround(room.todaySchedule, timeSlot);
    const freeCount = countFreeSlots(room.todaySchedule);
    const occupancy = room.occupancyRate;

    let score = 0;

    score += continuity * 30;
    if (continuity >= 3) {
      reasons.push(`该鼓房在此时段前后有${continuity}个连续空闲时段，适合连续练习`);
    } else if (continuity >= 2) {
      reasons.push(`该鼓房前后有${continuity}个连续空闲时段`);
    }

    if (freeCount <= 2) {
      score += 50;
      reasons.push(`该鼓房今日仅剩${freeCount}个空闲时段，优先分配减少碎片`);
    } else if (freeCount <= 4) {
      score += 30;
      reasons.push(`该鼓房今日空闲时段较少(${freeCount}个)，优先排入`);
    }

    score += (100 - occupancy) * 0.5;

    if (occupancy < 40) {
      reasons.push(`占用率仅${occupancy}%，负载较轻`);
    } else if (occupancy < 70) {
      reasons.push(`当前占用率${occupancy}%，负载适中`);
    }

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
    free: '空闲',
    occupied: '占用',
    maintenance: '维修中',
  };
  return map[status];
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
