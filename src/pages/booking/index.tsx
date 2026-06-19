import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import BookingCard from '@/components/BookingCard';
import { generateTimeSlots, allocateRoom, getBookingsForMember } from '@/utils';
import type { TimeSlot, Booking } from '@/types/booking';
import styles from './index.module.scss';

const BookingPage: React.FC = () => {
  const { rooms, bookings, member, addBooking } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [allocatedRoomName, setAllocatedRoomName] = useState<string | null>(null);

  const dates = useMemo(() => {
    const result: { weekday: string; day: string; fullDate: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = dayjs().add(i, 'day');
      result.push({
        weekday: i === 0 ? '今天' : i === 1 ? '明天' : d.format('ddd'),
        day: d.format('DD'),
        fullDate: d.format('YYYY-MM-DD'),
      });
    }
    return result;
  }, []);

  const timeSlots: TimeSlot[] = useMemo(() => {
    const baseSlots = generateTimeSlots();
    const dateStr = dates[selectedDate]?.fullDate;
    const existingBookings = getBookingsForMember(bookings, member.id)
      .filter(b => b.date === dateStr && b.status !== 'cancelled');

    return baseSlots.map(slot => {
      const isBooked = existingBookings.some(b => b.startTime === slot.startTime);
      return { ...slot, available: !isBooked };
    });
  }, [selectedDate, bookings, member.id, dates]);

  const handleSelectDate = (index: number) => {
    setSelectedDate(index);
    setSelectedSlot(null);
    setAllocatedRoomName(null);
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot.startTime);
    const room = allocateRoom(rooms, slot.startTime);
    if (room) {
      setAllocatedRoomName(room.name);
    } else {
      setAllocatedRoomName(null);
    }
  };

  const handleConfirm = () => {
    if (!selectedSlot || !allocatedRoomName) return;

    if (member.remainingQuota <= 0) {
      Taro.showToast({ title: '本周额度已用完', icon: 'none' });
      return;
    }

    const dateStr = dates[selectedDate]?.fullDate;
    const newBooking: Booking = {
      id: `B${Date.now()}`,
      memberId: member.id,
      roomId: '',
      roomName: '',
      date: dateStr,
      startTime: selectedSlot,
      endTime: `${String(parseInt(selectedSlot) + 1).padStart(2, '0')}:00`,
      status: 'confirmed',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
      allocatedRoom: allocatedRoomName,
    };

    addBooking(newBooking);
    console.info('[Booking] 预约成功', newBooking);

    Taro.showToast({ title: '预约成功', icon: 'success' });
    setSelectedSlot(null);
    setAllocatedRoomName(null);
  };

  const myBookings = getBookingsForMember(bookings, member.id)
    .filter(b => b.status !== 'cancelled')
    .slice(0, 5);

  const canConfirm = selectedSlot && allocatedRoomName;

  return (
    <View className={styles.page}>
      <View className={styles.dateSection}>
        <Text className={styles.dateLabel}>选择日期</Text>
        <ScrollView scrollX className={styles.dateRow}>
          {dates.map((date, index) => (
            <View
              key={index}
              className={classnames(
                styles.dateItem,
                selectedDate === index && styles.dateItemActive
              )}
              onClick={() => handleSelectDate(index)}
            >
              <Text className={styles.dateWeekday}>{date.weekday}</Text>
              <Text className={styles.dateDay}>{date.day}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.slotSection}>
        <Text className={styles.slotLabel}>选择时段</Text>
        <TimeSlotPicker
          slots={timeSlots}
          selectedSlot={selectedSlot}
          onSelect={handleSelectSlot}
        />
      </View>

      {selectedSlot && allocatedRoomName && (
        <View className={styles.resultCard}>
          <Text className={styles.resultTitle}>🎯 智能分配结果</Text>
          <View className={styles.resultInfo}>
            <Text className={styles.resultLabel}>分配鼓房</Text>
            <Text className={styles.resultValue}>{allocatedRoomName}</Text>
          </View>
          <View className={styles.resultInfo}>
            <Text className={styles.resultLabel}>练习时段</Text>
            <Text className={styles.resultValue}>
              {selectedSlot}-{String(parseInt(selectedSlot) + 1).padStart(2, '0')}:00
            </Text>
          </View>
          <View className={styles.resultInfo}>
            <Text className={styles.resultLabel}>消耗额度</Text>
            <Text className={styles.resultValue}>1小时</Text>
          </View>
          <Text className={styles.resultHint}>
            系统已为您选择占用率最低的空闲鼓房，避免碎片化排期
          </Text>
        </View>
      )}

      {selectedSlot && !allocatedRoomName && (
        <View className={styles.resultCard}>
          <Text className={styles.resultTitle}>😔 该时段暂无空闲鼓房</Text>
          <Text className={styles.resultHint}>请尝试其他时段</Text>
        </View>
      )}

      <View className={styles.historySection}>
        <Text className={styles.historyTitle}>我的预约</Text>
        {myBookings.length > 0 ? (
          myBookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <View className={styles.emptyTip}>
            <Text className={styles.emptyText}>暂无预约记录</Text>
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        <View
          className={classnames(
            styles.confirmBtn,
            !canConfirm && styles.confirmBtnDisabled
          )}
          onClick={handleConfirm}
        >
          <Text className={styles.confirmBtnText}>
            {canConfirm ? '确认预约' : '请选择时段'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BookingPage;
