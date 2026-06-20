import type { Room } from '@/types/room';

const standardSchedule = [
  { startTime: '09:00', endTime: '10:00', status: 'free' as const },
  { startTime: '10:00', endTime: '11:00', status: 'free' as const },
  { startTime: '11:00', endTime: '12:00', status: 'free' as const },
  { startTime: '14:00', endTime: '15:00', status: 'free' as const },
  { startTime: '15:00', endTime: '16:00', status: 'free' as const },
  { startTime: '16:00', endTime: '17:00', status: 'free' as const },
  { startTime: '19:00', endTime: '20:00', status: 'free' as const },
  { startTime: '20:00', endTime: '21:00', status: 'free' as const },
];

export const mockRooms: Room[] = [
  {
    id: 'R001',
    name: '鼓房 A1',
    floor: 1,
    equipmentLevel: 'standard',
    status: 'active',
    baseSchedule: [...standardSchedule],
    reservedSlots: [
      { startTime: '12:00', endTime: '14:00', reason: 'system', label: '午间设备维护' },
    ],
  },
  {
    id: 'R002',
    name: '鼓房 A2',
    floor: 1,
    equipmentLevel: 'professional',
    status: 'active',
    baseSchedule: [...standardSchedule],
    reservedSlots: [
      { startTime: '12:00', endTime: '14:00', reason: 'system', label: '午间设备维护' },
    ],
  },
  {
    id: 'R003',
    name: '鼓房 B1',
    floor: 2,
    equipmentLevel: 'premium',
    status: 'active',
    baseSchedule: [...standardSchedule],
    reservedSlots: [
      { startTime: '12:00', endTime: '14:00', reason: 'system', label: '午间设备维护' },
      { startTime: '17:00', endTime: '19:00', reason: 'system', label: '教师专用时段' },
    ],
  },
  {
    id: 'R004',
    name: '鼓房 B2',
    floor: 2,
    equipmentLevel: 'standard',
    status: 'maintenance',
    baseSchedule: [...standardSchedule],
  },
  {
    id: 'R005',
    name: '鼓房 C1',
    floor: 3,
    equipmentLevel: 'professional',
    status: 'active',
    baseSchedule: [...standardSchedule],
    reservedSlots: [
      { startTime: '12:00', endTime: '14:00', reason: 'system', label: '午间设备维护' },
    ],
  },
  {
    id: 'R006',
    name: '鼓房 C2',
    floor: 3,
    equipmentLevel: 'premium',
    status: 'active',
    baseSchedule: [...standardSchedule],
    reservedSlots: [
      { startTime: '12:00', endTime: '14:00', reason: 'system', label: '午间设备维护' },
      { startTime: '17:00', endTime: '19:00', reason: 'unavailable', label: '团课专用' },
    ],
  },
  {
    id: 'R007',
    name: '鼓房 D1',
    floor: 1,
    equipmentLevel: 'standard',
    status: 'active',
    baseSchedule: [...standardSchedule],
  },
  {
    id: 'R008',
    name: '鼓房 D2',
    floor: 2,
    equipmentLevel: 'professional',
    status: 'active',
    baseSchedule: [...standardSchedule],
    reservedSlots: [
      { startTime: '12:00', endTime: '14:00', reason: 'system', label: '午间设备维护' },
    ],
  },
  {
    id: 'R009',
    name: '鼓房 E1',
    floor: 3,
    equipmentLevel: 'standard',
    status: 'active',
    baseSchedule: [...standardSchedule],
  },
  {
    id: 'R010',
    name: '鼓房 E2',
    floor: 1,
    equipmentLevel: 'premium',
    status: 'active',
    baseSchedule: [...standardSchedule],
    reservedSlots: [
      { startTime: '12:00', endTime: '14:00', reason: 'system', label: '午间设备维护' },
      { startTime: '17:00', endTime: '19:00', reason: 'system', label: '教师专用时段' },
    ],
  },
];
