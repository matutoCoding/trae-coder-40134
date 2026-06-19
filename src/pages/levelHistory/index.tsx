import React from 'react';
import { View, Text } from '@tarojs/components';
import { useAppStore } from '@/store';
import { LEVEL_CONFIG } from '@/types/member';
import styles from './index.module.scss';

const LevelHistoryPage: React.FC = () => {
  const { levelHistory } = useAppStore();

  const sortedHistory = [...levelHistory].sort(
    (a, b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime()
  );

  return (
    <View className={styles.page}>
      <Text className={styles.title}>等级变更留痕</Text>
      {sortedHistory.length > 0 ? (
        sortedHistory.map(record => {
          const fromConfig = LEVEL_CONFIG[record.fromLevel];
          const toConfig = LEVEL_CONFIG[record.toLevel];
          return (
            <View key={record.id} className={styles.recordCard}>
              <View className={styles.recordHeader}>
                <Text className={styles.recordDate}>{record.changeDate}</Text>
                <View className={styles.recordReason}>
                  <Text style={{ color: '#fff' }}>{record.reason}</Text>
                </View>
              </View>
              <View className={styles.recordRow}>
                <Text className={styles.recordLabel}>变更前等级</Text>
                <Text className={styles.recordValue} style={{ color: fromConfig.color }}>
                  {fromConfig.label}
                </Text>
              </View>
              <View className={styles.recordRow}>
                <Text className={styles.recordLabel}>变更后等级</Text>
                <Text className={styles.recordValue} style={{ color: toConfig.color }}>
                  {toConfig.label}
                </Text>
              </View>
              <View className={styles.recordRow}>
                <Text className={styles.recordLabel}>变更前额度</Text>
                <Text className={styles.recordValue}>{record.quotaBefore}h/周</Text>
              </View>
              <View className={styles.recordRow}>
                <Text className={styles.recordLabel}>变更后额度</Text>
                <Text className={styles.recordValue}>{record.quotaAfter}h/周</Text>
              </View>
              <View className={styles.recordRow}>
                <Text className={styles.recordLabel}>额度结转</Text>
                <Text className={styles.recordValue}>{record.quotaCarryOver}h</Text>
              </View>
              <Text className={styles.recordNote}>{record.note}</Text>
            </View>
          );
        })
      ) : (
        <View className={styles.emptyTip}>
          <Text className={styles.emptyText}>暂无变更记录</Text>
        </View>
      )}
    </View>
  );
};

export default LevelHistoryPage;
