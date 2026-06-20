import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import RoomCard from '@/components/RoomCard';
import { getDaySchedule } from '@/utils';
import type { DaySchedule } from '@/types/room';
import styles from './index.module.scss';

type StatusFilter = 'all' | 'free' | 'partial' | 'full' | 'maintenance';
type EquipFilter = 'all' | 'standard' | 'professional' | 'premium';

const RoomsPage: React.FC = () => {
  const { rooms, bookings } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [equipFilter, setEquipFilter] = useState<EquipFilter>('all');

  const dates = useMemo(() => {
    const result: { weekday: string; day: string; fullDate: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = dayjs().add(i, 'day');
      result.push({
        weekday: i === 0 ? '今天' : i === 1 ? '明天' : d.format('ddd'),
        day: d.format('DD'),
        fullDate: d.format('YYYY-MM-DD'),
      });
    }
    return result;
  }, []);

  const currentDate = dates[selectedDate]?.fullDate || '';

  const roomSchedules = useMemo(() => {
    return rooms.map(room => {
      const schedule = getDaySchedule(room, bookings, currentDate);
      return { room, schedule };
    });
  }, [rooms, bookings, currentDate]);

  const freeCount = roomSchedules.filter(
    ({ room, schedule }) => room.status !== 'maintenance' && schedule.dayStatus === 'free'
  ).length;
  const partialCount = roomSchedules.filter(
    ({ room, schedule }) => room.status !== 'maintenance' && schedule.dayStatus === 'partial'
  ).length;
  const fullCount = roomSchedules.filter(
    ({ room, schedule }) => room.status !== 'maintenance' && schedule.dayStatus === 'full'
  ).length;
  const maintenanceCount = rooms.filter(r => r.status === 'maintenance').length;

  const filteredRooms = useMemo(() => {
    return roomSchedules.filter(({ room, schedule }) => {
      if (statusFilter === 'maintenance') {
        return room.status === 'maintenance';
      }
      if (room.status === 'maintenance') return false;
      const statusMatch = statusFilter === 'all' || schedule.dayStatus === statusFilter;
      const equipMatch = equipFilter === 'all' || room.equipmentLevel === equipFilter;
      return statusMatch && equipMatch;
    });
  }, [roomSchedules, statusFilter, equipFilter]);

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'free', label: '空闲' },
    { key: 'partial', label: '部分占用' },
    { key: 'full', label: '已满' },
    { key: 'maintenance', label: '维修' },
  ];

  const equipFilters: { key: EquipFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'standard', label: '标准' },
    { key: 'professional', label: '专业' },
    { key: 'premium', label: '旗舰' },
  ];

  const handleRoomClick = (roomId: string) => {
    Taro.navigateTo({ url: `/pages/roomDetail/index?id=${roomId}` });
  };

  return (
    <View className={styles.page}>
      <View className={styles.dateSection}>
        <Text className={styles.dateLabel}>查看日期</Text>
        <ScrollView scrollX className={styles.dateRow}>
          {dates.map((date, index) => (
            <View
              key={index}
              className={classnames(
                styles.dateItem,
                selectedDate === index && styles.dateItemActive
              )}
              onClick={() => setSelectedDate(index)}
            >
              <Text className={styles.dateWeekday}>{date.weekday}</Text>
              <Text className={styles.dateDay}>{date.day}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterLabel}>状态筛选</Text>
        <ScrollView scrollX className={styles.filterRow}>
          {statusFilters.map(f => (
            <View
              key={f.key}
              className={classnames(
                styles.filterTag,
                statusFilter === f.key && styles.filterTagActive
              )}
              onClick={() => setStatusFilter(f.key)}
            >
              <Text className={styles.filterText}>{f.label}</Text>
            </View>
          ))}
        </ScrollView>
        <Text className={styles.filterLabel}>设备等级</Text>
        <View className={styles.filterRow}>
          {equipFilters.map(f => (
            <View
              key={f.key}
              className={classnames(
                styles.filterTag,
                equipFilter === f.key && styles.filterTagActive
              )}
              onClick={() => setEquipFilter(f.key)}
            >
              <Text className={styles.filterText}>{f.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.overviewSection}>
        <View className={styles.overviewCard}>
          <Text className={classnames(styles.overviewValue, styles.overviewValueFree)}>
            {freeCount}
          </Text>
          <Text className={styles.overviewLabel}>空闲</Text>
        </View>
        <View className={styles.overviewCard}>
          <Text className={classnames(styles.overviewValue, styles.overviewValuePartial)}>
            {partialCount}
          </Text>
          <Text className={styles.overviewLabel}>部分占用</Text>
        </View>
        <View className={styles.overviewCard}>
          <Text className={classnames(styles.overviewValue, styles.overviewValueFull)}>
            {fullCount}
          </Text>
          <Text className={styles.overviewLabel}>已满</Text>
        </View>
        <View className={styles.overviewCard}>
          <Text className={classnames(styles.overviewValue, styles.overviewValueRepair)}>
            {maintenanceCount}
          </Text>
          <Text className={styles.overviewLabel}>维修</Text>
        </View>
      </View>

      <View className={styles.listSection}>
        <Text className={styles.listTitle}>鼓房列表</Text>
        {filteredRooms.length > 0 ? (
          filteredRooms.map(({ room, schedule }) => (
            <RoomCard
              key={room.id}
              room={room}
              dayStatus={schedule.dayStatus}
              occupancyRate={schedule.occupancyRate}
              onClick={handleRoomClick}
            />
          ))
        ) : (
          <View className={styles.emptyTip}>
            <Text className={styles.emptyText}>暂无符合条件的鼓房</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default RoomsPage;
