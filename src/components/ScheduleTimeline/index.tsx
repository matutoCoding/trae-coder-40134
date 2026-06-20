import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { TimeBlock } from '@/types/room';
import { getTimeBlockStatusText } from '@/utils';
import styles from './index.module.scss';

interface ScheduleTimelineProps {
  schedule: TimeBlock[];
}

const getDotClass = (status: TimeBlock['status']) => {
  switch (status) {
    case 'free': return styles.dotFree;
    case 'booked-self': return styles.dotSelf;
    case 'booked-other': return styles.dotOther;
    case 'maintenance': return styles.dotMaintenance;
    case 'reserved-system': return styles.dotReservedSystem;
    case 'reserved-unavailable': return styles.dotReservedUnavail;
    default: return styles.dotFree;
  }
};

const getStatusClass = (status: TimeBlock['status']) => {
  switch (status) {
    case 'free': return styles.statusFree;
    case 'booked-self': return styles.statusSelf;
    case 'booked-other': return styles.statusOther;
    case 'maintenance': return styles.statusMaintenance;
    case 'reserved-system': return styles.statusReservedSystem;
    case 'reserved-unavailable': return styles.statusReservedUnavail;
    default: return styles.statusFree;
  }
};

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
            <View className={classnames(styles.dot, getDotClass(block.status))} />
            {index < schedule.length - 1 && <View className={styles.line} />}
          </View>
          <View className={styles.content}>
            <Text className={styles.timeRange}>
              {block.startTime}-{block.endTime}
            </Text>
            <Text className={classnames(styles.status, getStatusClass(block.status))}>
              {getTimeBlockStatusText(block.status)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default ScheduleTimeline;
