import type { Room, TimeBlock } from '@/types/room';
import type { Booking, TimeSlot } from '@/types/booking';

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

export const allocateRoom = (rooms: Room[], timeSlot: string): Room | null => {
  const freeRooms = rooms.filter(
    r => r.status === 'free' &&
    r.todaySchedule.some((b: TimeBlock) => b.startTime === timeSlot && b.status === 'free')
  );
  if (freeRooms.length === 0) return null;
  const sorted = [...freeRooms].sort((a, b) => a.occupancyRate - b.occupancyRate);
  return sorted[0];
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
