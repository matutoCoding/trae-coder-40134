import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import LevelBadge from '@/components/LevelBadge';
import QuotaProgress from '@/components/QuotaProgress';
import { LEVEL_CONFIG } from '@/types/member';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { member, bookings } = useAppStore();
  const levelConfig = LEVEL_CONFIG[member.level];

  const totalBookings = bookings.filter(
    b => b.memberId === member.id && b.status !== 'cancelled'
  ).length;

  const completedBookings = bookings.filter(
    b => b.memberId === member.id && b.status === 'completed'
  ).length;

  const handleLevelHistory = () => {
    Taro.navigateTo({ url: '/pages/levelHistory/index' });
  };

  const handleAssessment = () => {
    Taro.navigateTo({ url: '/pages/assessment/index' });
  };

  const handleBookingHistory = () => {
    Taro.switchTab({ url: '/pages/booking/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.profileCard}>
        <Image
          className={styles.avatar}
          src={member.avatar}
          mode="aspectFill"
        />
        <View className={styles.profileInfo}>
          <Text className={styles.profileName}>{member.name}</Text>
          <View className={styles.profileLevel}>
            <LevelBadge level={member.level} size="medium" />
          </View>
          <Text className={styles.profileDate}>
            入会时间：{member.joinDate}
          </Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>额度概览</Text>
        <View className={styles.quotaCard}>
          <QuotaProgress
            used={member.usedQuota}
            total={member.weeklyQuota}
            label="本周练习额度"
          />
          <View className={styles.levelInfo}>
            <Text className={styles.levelLabel}>当前等级</Text>
            <Text className={styles.levelQuota} style={{ color: levelConfig.color }}>
              {levelConfig.label}（{levelConfig.weeklyQuota}h/周）
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>功能菜单</Text>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={handleLevelHistory}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>📋</Text>
              <Text className={styles.menuLabel}>等级变更记录</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleAssessment}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>🥁</Text>
              <Text className={styles.menuLabel}>节奏考核</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={handleBookingHistory}>
            <View className={styles.menuLeft}>
              <Text className={styles.menuIcon}>📅</Text>
              <Text className={styles.menuLabel}>预约记录</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>练习统计</Text>
        <View className={styles.summaryCard}>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>累计预约</Text>
            <Text className={styles.summaryValue}>{totalBookings}次</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>已完成</Text>
            <Text className={styles.summaryValue}>{completedBookings}次</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>当前等级</Text>
            <Text className={styles.summaryValue} style={{ color: levelConfig.color }}>
              {levelConfig.label}
            </Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>等级有效期</Text>
            <Text className={styles.summaryValue}>{member.currentLevelSince} 起</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MinePage;
