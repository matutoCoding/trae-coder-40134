import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import LevelBadge from '@/components/LevelBadge';
import BookingCard from '@/components/BookingCard';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const { member, bookings, rooms } = useAppStore();

  const myBookings = bookings
    .filter(b => b.memberId === member.id)
    .slice(0, 3);

  const freeRoomCount = rooms.filter(r => r.status === 'free').length;
  const todayBookings = myBookings.filter(
    b => b.date === '2026-06-20' && b.status === 'confirmed'
  );

  const quotaPercent = member.weeklyQuota > 0
    ? Math.min((member.usedQuota / member.weeklyQuota) * 100, 100)
    : 0;

  const handleBooking = () => {
    Taro.switchTab({ url: '/pages/booking/index' });
  };

  const handleViewAllBookings = () => {
    Taro.switchTab({ url: '/pages/booking/index' });
  };

  const handleBookingClick = (bookingId: string) => {
    Taro.navigateTo({ url: `/pages/bookingDetail/index?id=${bookingId}` });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.greeting}>👋 你好，{member.name}</Text>
        <Text className={styles.subGreeting}>今天也要坚持练习哦</Text>
      </View>

      <View className={styles.memberCard}>
        <View className={styles.memberTop}>
          <Image
            className={styles.avatar}
            src={member.avatar}
            mode="aspectFill"
          />
          <View className={styles.memberInfo}>
            <Text className={styles.memberName}>{member.name}</Text>
            <View className={styles.levelRow}>
              <LevelBadge level={member.level} size="small" />
            </View>
          </View>
        </View>
        <View className={styles.quotaSection}>
          <View className={styles.quotaRow}>
            <Text className={styles.quotaLabel}>本周已用额度</Text>
            <View className={styles.quotaNumbers}>
              <Text className={styles.quotaUsed}>{member.usedQuota}</Text>
              <Text className={styles.quotaDivider}>/</Text>
              <Text className={styles.quotaTotal}>{member.weeklyQuota}h</Text>
            </View>
          </View>
          <View className={styles.quotaProgressBg}>
            <View
              className={styles.quotaProgressFill}
              style={{ width: `${quotaPercent}%` }}
            />
          </View>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{freeRoomCount}</Text>
          <Text className={styles.statLabel}>空闲鼓房</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{todayBookings.length}</Text>
          <Text className={styles.statLabel}>今日预约</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{member.remainingQuota}</Text>
          <Text className={styles.statLabel}>剩余额度(h)</Text>
        </View>
      </View>

      <View
        className={styles.bookingAction}
        onClick={handleBooking}
      >
        <Text className={styles.bookingActionText}>🥁 立即预约练习</Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>近期预约</Text>
          <Text className={styles.sectionMore} onClick={handleViewAllBookings}>
            查看全部
          </Text>
        </View>
        {myBookings.length > 0 ? (
          myBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onClick={handleBookingClick}
            />
          ))
        ) : (
          <View className={styles.emptyTip}>
            <Text className={styles.emptyText}>暂无预约记录</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default HomePage;
