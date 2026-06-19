import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { TimeBlock } from '@/types/room';
import styles from './index.module.scss';

interface ScheduleTimelineProps {
  schedule: TimeBlock[];
}

const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ schedule }) => {
  if (schedule.length === 0) {
    return (
      <View className={styles.empty}>
        <Text className={styles.emptyText}>暂无排期</Text>
      </View>
    );
  }

  return (
    <View className={styles.container}>
      {schedule.map((block, index) => (
        <View key={index} className={styles.block}>
          <View className={styles.dotWrap}>
            <View
              className={classnames(
                styles.dot,
                block.status === 'booked' ? styles.dotBooked : styles.dotFree
              )}
            />
            {index < schedule.length - 1 && <View className={styles.line} />}
          </View>
          <View className={styles.content}>
            <Text className={styles.timeRange}>
              {block.startTime}-{block.endTime}
            </Text>
            <Text
              className={classnames(
                styles.status,
                block.status === 'booked' ? styles.statusBooked : styles.statusFree
              )}
            >
              {block.status === 'booked' ? '已预约' : '空闲'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default ScheduleTimeline;
