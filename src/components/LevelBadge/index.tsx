import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { LEVEL_CONFIG } from '@/types/member';
import type { MemberLevel } from '@/types/member';
import styles from './index.module.scss';

interface LevelBadgeProps {
  level: MemberLevel;
  size?: 'small' | 'medium' | 'large';
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ level, size = 'medium' }) => {
  const config = LEVEL_CONFIG[level];
  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  return (
    <View
      className={classnames(styles.badge, sizeClass[size])}
      style={{ background: config.color }}
    >
      <Text className={styles.text}>{config.label}</Text>
    </View>
  );
};

export default LevelBadge;
