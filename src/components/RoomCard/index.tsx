import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { Room } from '@/types/room';
import { getEquipmentLevelText } from '@/utils';
import styles from './index.module.scss';

interface RoomCardProps {
  room: Room;
  dayStatus: 'free' | 'partial' | 'full';
  occupancyRate: number;
  onClick?: (roomId: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, dayStatus, occupancyRate, onClick }) => {
  const statusMap = {
    free: { text: '空闲', class: styles.statusFree },
    partial: { text: '部分占用', class: styles.statusPartial },
    full: { text: '已满', class: styles.statusFull },
  };

  const displayStatus = room.status === 'maintenance'
    ? { text: '维修中', class: styles.statusMaintenance }
    : statusMap[dayStatus];

  return (
    <View className={styles.card} onClick={() => onClick?.(room.id)}>
      <View className={styles.header}>
        <Text className={styles.name}>{room.name}</Text>
        <View className={classnames(styles.statusTag, displayStatus.class)}>
          <Text className={styles.statusText}>{displayStatus.text}</Text>
        </View>
      </View>
      <View className={styles.info}>
        <Text className={styles.infoText}>{room.floor}F</Text>
        <Text className={styles.infoDivider}>|</Text>
        <Text className={styles.infoText}>{getEquipmentLevelText(room.equipmentLevel)}</Text>
      </View>
      <View className={styles.progressWrap}>
        <View className={styles.progressBg}>
          <View
            className={styles.progressFill}
            style={{ width: `${occupancyRate}%` }}
          />
        </View>
        <Text className={styles.progressText}>占用 {occupancyRate}%</Text>
      </View>
    </View>
  );
};

export default RoomCard;
