import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import RoomCard from '@/components/RoomCard';
import styles from './index.module.scss';

type FilterType = 'all' | 'free' | 'occupied' | 'maintenance';
type EquipFilter = 'all' | 'standard' | 'professional' | 'premium';

const RoomsPage: React.FC = () => {
  const { rooms } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [equipFilter, setEquipFilter] = useState<EquipFilter>('all');

  const freeCount = rooms.filter(r => r.status === 'free').length;
  const occupiedCount = rooms.filter(r => r.status === 'occupied').length;
  const maintenanceCount = rooms.filter(r => r.status === 'maintenance').length;

  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const statusMatch = statusFilter === 'all' || r.status === statusFilter;
      const equipMatch = equipFilter === 'all' || r.equipmentLevel === equipFilter;
      return statusMatch && equipMatch;
    });
  }, [rooms, statusFilter, equipFilter]);

  const statusFilters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'free', label: '空闲' },
    { key: 'occupied', label: '占用' },
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
      <View className={styles.filterSection}>
        <Text className={styles.filterLabel}>状态筛选</Text>
        <View className={styles.filterRow}>
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
        </View>
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
          <Text className={classnames(styles.overviewValue, styles.overviewValueOccupied)}>
            {occupiedCount}
          </Text>
          <Text className={styles.overviewLabel}>占用</Text>
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
          filteredRooms.map(room => (
            <RoomCard key={room.id} room={room} onClick={handleRoomClick} />
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
