import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { Booking } from '@/types/booking';
import { getBookingStatusText } from '@/utils';
import styles from './index.module.scss';

interface BookingCardProps {
  booking: Booking;
  showCancel?: boolean;
  onClick?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, showCancel = false, onClick, onCancel }) => {
  const statusClass = {
    pending: styles.statusPending,
    confirmed: styles.statusConfirmed,
    cancelled: styles.statusCancelled,
    completed: styles.statusCompleted,
  };

  const canCancel = showCancel && booking.status === 'confirmed';

  const handleCancel = (e: any) => {
    e?.stopPropagation?.();
    onCancel?.(booking.id);
  };

  return (
    <View className={styles.card} onClick={() => onClick?.(booking.id)}>
      <View className={styles.top}>
        <View className={styles.timeWrap}>
          <Text className={styles.time}>{booking.startTime}-{booking.endTime}</Text>
          <Text className={styles.date}>{booking.date}</Text>
        </View>
        <View className={classnames(styles.statusTag, statusClass[booking.status])}>
          <Text className={styles.statusText}>{getBookingStatusText(booking.status)}</Text>
        </View>
      </View>
      <View className={styles.bottom}>
        <View className={styles.bottomLeft}>
          <Text className={styles.roomName}>{booking.allocatedRoom || '待分配'}</Text>
          <Text className={styles.createdAt}>预约于 {booking.createdAt}</Text>
        </View>
        {canCancel && (
          <View className={styles.cancelBtn} onClick={handleCancel}>
            <Text className={styles.cancelBtnText}>取消</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default BookingCard;
