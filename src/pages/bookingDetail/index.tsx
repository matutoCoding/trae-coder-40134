import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useAppStore } from '@/store';
import { LEVEL_CONFIG } from '@/types/member';
import { getBookingStatusText } from '@/utils';
import styles from './index.module.scss';

const statusStyleMap: Record<string, string> = {
  pending: styles.statusPending,
  confirmed: styles.statusConfirmed,
  cancelled: styles.statusCancelled,
  completed: styles.statusCompleted,
  waitlist: styles.statusWaitlist,
  'waitlist-converted': styles.statusConverted,
  'waitlist-expired': styles.statusExpired,
};

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
    if (!booking) return;
    if (booking.status !== 'confirmed' && booking.status !== 'waitlist') return;
    const isWaitlist = booking.status === 'waitlist';
    Taro.showModal({
      title: isWaitlist ? '取消候补' : '确认取消',
      content: isWaitlist
        ? '取消候补后，您的候补位置将被释放。'
        : '取消预约后，1小时练习额度将退回，该鼓房时段也会被释放。',
      confirmText: isWaitlist ? '取消候补' : '确认取消',
      cancelText: '再想想',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          cancelBooking(booking.id);
          Taro.showToast({
            title: isWaitlist ? '候补已取消' : '已取消，额度已退回',
            icon: 'success'
          });
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

  const isWaitlist = booking.status === 'waitlist';
  const isConverted = booking.status === 'waitlist-converted';
  const isExpired = booking.status === 'waitlist-expired';

  return (
    <View className={styles.page}>
      <View className={classnames(styles.statusCard, isWaitlist && styles.statusCardWaitlist)}>
        <View className={classnames(styles.statusBadge, statusStyleMap[booking.status])}>
          {getBookingStatusText(booking.status)}
        </View>
        <Text className={styles.statusRoom}>
          {isWaitlist ? '候补排队中' : (room?.name || '鼓房')}
        </Text>
        <Text className={styles.statusTime}>
          {booking.date} {booking.startTime} - {booking.endTime}
        </Text>
        {isWaitlist && booking.waitlistPosition && (
          <Text className={styles.waitlistPosition}>
            候补位置: 第{booking.waitlistPosition}位
          </Text>
        )}
      </View>

      <View className={styles.infoCard}>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>预约编号</Text>
          <Text className={styles.infoValue}>{booking.id}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>预约类型</Text>
          <Text className={styles.infoValue}>
            {isWaitlist ? '候补预约' : isConverted ? '候补转正' : isExpired ? '候补失效' : '正式预约'}
          </Text>
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
        {!isWaitlist && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>鼓房</Text>
            <Text className={styles.infoValue}>{room?.name || booking.roomName || '-'}</Text>
          </View>
        )}
        {room && (
          <>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>鼓房位置</Text>
              <Text className={styles.infoValue}>{room.floor}F</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>设备等级</Text>
              <Text className={styles.infoValue} style={{ color: equipmentLevel?.color || '#333' }}>
                {equipmentLevel?.label || '-'}
              </Text>
            </View>
          </>
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

      {(booking.status === 'confirmed' || booking.status === 'waitlist') && (
        <View className={styles.actionSection}>
          <View className={styles.cancelBtn} onClick={handleCancel}>
            <Text className={styles.cancelBtnText}>
              {isWaitlist ? '取消候补' : '取消预约'}
            </Text>
          </View>
          <View className={styles.cancelHint}>
            <Text className={styles.cancelHintText}>
              {isWaitlist
                ? '取消候补后候补位置将被释放'
                : '取消后额度将退回，鼓房时段自动释放'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default BookingDetailPage;
