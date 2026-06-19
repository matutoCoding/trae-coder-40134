import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { Booking } from '@/types/booking';
import { getBookingStatusText } from '@/utils';
import styles from './index.module.scss';

interface BookingCardProps {
  booking: Booking;
  onClick?: (bookingId: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onClick }) => {
  const statusClass = {
    pending: styles.statusPending,
    confirmed: styles.statusConfirmed,
    cancelled: styles.statusCancelled,
    completed: styles.statusCompleted,
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
        <Text className={styles.roomName}>{booking.allocatedRoom || '待分配'}</Text>
        <Text className={styles.createdAt}>预约于 {booking.createdAt}</Text>
      </View>
    </View>
  );
};

export default BookingCard;
