import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface QuotaProgressProps {
  used: number;
  total: number;
  label?: string;
}

const QuotaProgress: React.FC<QuotaProgressProps> = ({ used, total, label = '本周额度' }) => {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.label}>{label}</Text>
        <Text className={styles.count}>
          <Text className={styles.used}>{used}</Text>
          <Text className={styles.divider}>/</Text>
          <Text className={styles.total}>{total}h</Text>
        </Text>
      </View>
      <View className={styles.progressBg}>
        <View
          className={styles.progressFill}
          style={{ width: `${percentage}%` }}
        />
      </View>
      <Text className={styles.hint}>剩余 {total - used} 小时</Text>
    </View>
  );
};

export default QuotaProgress;
