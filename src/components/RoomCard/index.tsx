import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { Room } from '@/types/room';
import { getRoomStatusText, getEquipmentLevelText } from '@/utils';
import styles from './index.module.scss';

interface RoomCardProps {
  room: Room;
  onClick?: (roomId: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onClick }) => {
  const statusClass = {
    free: styles.statusFree,
    occupied: styles.statusOccupied,
    maintenance: styles.statusMaintenance,
  };

  return (
    <View className={styles.card} onClick={() => onClick?.(room.id)}>
      <View className={styles.header}>
        <Text className={styles.name}>{room.name}</Text>
        <View className={classnames(styles.statusTag, statusClass[room.status])}>
          <Text className={styles.statusText}>{getRoomStatusText(room.status)}</Text>
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
            style={{ width: `${room.occupancyRate}%` }}
          />
        </View>
        <Text className={styles.progressText}>占用 {room.occupancyRate}%</Text>
      </View>
    </View>
  );
};

export default RoomCard;
