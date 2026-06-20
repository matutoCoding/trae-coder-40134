import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { LEVEL_CONFIG } from '@/types/member';
import { getBookingStatusText } from '@/utils';
import styles from './index.module.scss';

const BookingDetailPage: React.FC = () => {
  const router = useRouter();
  const { bookings, rooms, member, cancelBooking } = useAppStore();
  const bookingId = router.params?.id as string;

  const booking = useMemo(
    () => bookings.find(b => b.id === bookingId),
    [bookings, bookingId]
  );

  const room = useMemo(
    () => rooms.find(r => r.id === booking?.roomId),
    [rooms, booking?.roomId]
  );

  const levelConfig = LEVEL_CONFIG[member.level];
  const equipmentLevel = room ? LEVEL_CONFIG[room.equipmentLevel] : null;

  const handleCancel = () => {
    if (!booking || booking.status !== 'confirmed') return;
    Taro.showModal({
      title: '确认取消',
      content: '取消预约后，1小时练习额度将退回，该鼓房时段也会被释放。',
      confirmText: '确认取消',
      cancelText: '再想想',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          cancelBooking(booking.id);
          Taro.showToast({ title: '已取消，额度已退回', icon: 'success' });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
        }
      },
    });
  };

  if (!booking) {
    return (
      <View className={styles.page}>
        <Text className={styles.emptyText}>预约不存在</Text>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.statusCard}>
        <View className={classnames(styles.statusBadge, styles[`status${booking.status}`])}>
          {getBookingStatusText(booking.status)}
        </View>
        <Text className={styles.statusRoom}>{room?.name || '鼓房'}</Text>
        <Text className={styles.statusTime}>
          {booking.date} {booking.startTime} - {booking.endTime}
        </Text>
      </View>

      <View className={styles.infoCard}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>预约编号</Text>
          <Text className={styles.infoValue}>{booking.id}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>练习时长</Text>
          <Text className={styles.infoValue}>1 小时</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>预约日期</Text>
          <Text className={styles.infoValue}>{booking.date}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>练习时段</Text>
          <Text className={styles.infoValue}>
            {booking.startTime} - {booking.endTime}
          </Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>鼓房</Text>
          <Text className={styles.infoValue}>{room?.name || '-'}</Text>
        </View>
        {room && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>鼓房位置</Text>
            <Text className={styles.infoValue}>{room.floor}F</Text>
          </View>
        )}
        {equipmentLevel && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>设备等级</Text>
            <Text className={styles.infoValue} style={{ color: equipmentLevel.color }}>
              {equipmentLevel.label}
            </Text>
          </View>
        )}
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>会员等级</Text>
          <Text className={styles.infoValue} style={{ color: levelConfig.color }}>
            {levelConfig.label}
          </Text>
        </View>
        {booking.allocationReason && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>分配说明</Text>
            <Text className={styles.infoValueReason}>{booking.allocationReason}</Text>
          </View>
        )}
      </View>

      {booking.status === 'confirmed' && (
        <View className={styles.actionSection}>
          <View className={styles.cancelBtn} onClick={handleCancel}>
            <Text className={styles.cancelBtnText}>取消预约</Text>
          </View>
          <View className={styles.cancelHint}>
            <Text className={styles.cancelHintText}>
              取消后额度将退回，鼓房时段自动释放
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default BookingDetailPage;
