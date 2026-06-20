import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import { getDaySchedule, getEquipmentLevelText, getTimeBlockStatusText } from '@/utils';
import type { TimeBlock } from '@/types/room';
import styles from './index.module.scss';

const getDotClass = (status: TimeBlock['status']) => {
  switch (status) {
    case 'free': return 'dotFree';
    case 'booked-self': return 'dotSelf';
    case 'booked-other': return 'dotOther';
    case 'maintenance': return 'dotMaintenance';
    case 'reserved-system': return 'dotReservedSystem';
    case 'reserved-unavailable': return 'dotReservedUnavail';
    default: return 'dotFree';
  }
};

const getLineClass = (status: TimeBlock['status']) => {
  switch (status) {
    case 'free': return 'lineFree';
    case 'booked-self': return 'lineSelf';
    case 'booked-other': return 'lineOther';
    case 'maintenance': return 'lineMaintenance';
    case 'reserved-system': return 'lineReservedSystem';
    case 'reserved-unavailable': return 'lineReservedUnavail';
    default: return 'lineFree';
  }
};

const getStatusClass = (status: TimeBlock['status']) => {
  switch (status) {
    case 'free': return 'statusFree';
    case 'booked-self': return 'statusSelf';
    case 'booked-other': return 'statusOther';
    case 'maintenance': return 'statusMaintenance';
    case 'reserved-system': return 'statusReservedSystem';
    case 'reserved-unavailable': return 'statusReservedUnavail';
    default: return 'statusFree';
  }
};

const RoomDetailPage: React.FC = () => {
  const router = useRouter();
  const roomId = router.params.id as string;
  const { rooms, bookings, member } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(0);

  const room = useMemo(() => rooms.find(r => r.id === roomId), [rooms, roomId]);

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
  const schedule = useMemo(() => {
    if (!room) return null;
    return getDaySchedule(room, bookings, currentDate, member.id);
  }, [room, bookings, currentDate, member.id]);

  const sortedBlocks = useMemo(() => {
    if (!schedule) return [];
    const order = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00', '21:00'];
    return [...schedule.blocks].sort(
      (a, b) => order.indexOf(a.startTime) - order.indexOf(b.startTime)
    );
  }, [schedule]);

  if (!room) {
    return (
      <View className={styles.page}>
        <View className={styles.empty}>
          <Text className={styles.emptyText}>鼓房不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.roomName}>{room.name}</Text>
        <View className={styles.roomMeta}>
          <Text className={styles.metaText}>{room.floor}F</Text>
          <Text className={styles.metaDivider}>|</Text>
          <Text className={styles.metaText}>{getEquipmentLevelText(room.equipmentLevel)}</Text>
        </View>
      </View>

      <View className={styles.dateSection}>
        <Text className={styles.sectionLabel}>选择日期</Text>
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

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text
            className={styles.statValue}
            style={{ color: schedule?.dayStatus === 'free' ? '#00B42A' : schedule?.dayStatus === 'partial' ? '#FF7D00' : '#F53F3F' }}
          >
            {schedule?.dayStatus === 'free' ? '空闲' : schedule?.dayStatus === 'partial' ? '部分占用' : '已满'}
          </Text>
          <Text className={styles.statLabel}>当日状态</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{schedule?.occupancyRate || 0}%</Text>
          <Text className={styles.statLabel}>占用率</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>
            {sortedBlocks.filter(b => b.status === 'free').length}
          </Text>
          <Text className={styles.statLabel}>剩余时段</Text>
        </View>
      </View>

      <View className={styles.legendSection}>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.dotSelf)} />
          <Text className={styles.legendText}>我的预约</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.dotOther)} />
          <Text className={styles.legendText}>其他学员</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.dotFree)} />
          <Text className={styles.legendText}>空闲</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.dotReservedSystem)} />
          <Text className={styles.legendText}>系统保留</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.dotReservedUnavail)} />
          <Text className={styles.legendText}>不可预约</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={classnames(styles.legendDot, styles.dotMaintenance)} />
          <Text className={styles.legendText}>维修</Text>
        </View>
      </View>

      <View className={styles.scheduleSection}>
        <Text className={styles.sectionLabel}>当日排期</Text>
        {sortedBlocks.length === 0 ? (
          <View className={styles.empty}>
            <Text className={styles.emptyText}>暂无排期信息</Text>
          </View>
        ) : (
          <View className={styles.timeline}>
            {sortedBlocks.map((block: TimeBlock, index: number) => (
              <View key={block.startTime} className={styles.timelineItem}>
                <View className={styles.timelineDotWrap}>
                  <View
                    className={classnames(
                      styles.timelineDot,
                      styles[getDotClass(block.status)]}
                  />
                  {index < sortedBlocks.length - 1 && (
                    <View
                      className={classnames(
                        styles.timelineLine,
                        styles[getLineClass(block.status)]}
                    />
                  )}
                </View>
                <View className={styles.timelineContent}>
                  <View className={styles.timelineInfo}>
                    <Text className={styles.timeRange}>
                      {block.startTime}-{block.endTime}
                    </Text>
                    <Text
                      className={classnames(
                        styles.timelineStatus,
                        styles[getStatusClass(block.status)]
                      )}
                    >
                      {getTimeBlockStatusText(block.status)}
                    </Text>
                  </View>
                  {(block.status === 'booked-self' || block.status === 'booked-other') && block.memberName && (
                    <Text className={styles.memberName}>
                      👤 {block.memberName}
                    </Text>
                  )}
                  {(block.status === 'reserved-system' || block.status === 'reserved-unavailable' || block.status === 'maintenance') && block.sourceLabel && (
                    <Text className={styles.sourceLabel}>
                      📋 {block.sourceLabel}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className={styles.tipCard}>
        <Text className={styles.tipTitle}>💡 排期说明</Text>
        <Text className={styles.tipText}>
          系统保留时段为固定不可约时段（如午间维护、教师专用）。不可预约时段为团课等专用时段。预约成功后会立即显示在对应时段中，取消后实时释放。
        </Text>
      </View>
    </View>
  );
};

export default RoomDetailPage;
