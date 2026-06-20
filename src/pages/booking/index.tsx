import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import dayjs from 'dayjs';
import { useAppStore } from '@/store';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import BookingCard from '@/components/BookingCard';
import {
  generateTimeSlots,
  allocateRoom,
  getBookingsForMember,
  getDaySchedule,
} from '@/utils';
import type { TimeSlot, Booking, AllocationResult } from '@/types/booking';
import styles from './index.module.scss';

const BookingPage: React.FC = () => {
  const { rooms, bookings, member, addBooking, deductQuota, cancelBooking } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [allocationResult, setAllocationResult] = useState<AllocationResult | null>(null);

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

  const currentDate = dates[selectedDate]?.fullDate || '';

  const timeSlots: TimeSlot[] = useMemo(() => {
    const baseSlots = generateTimeSlots();
    const myBookings = getBookingsForMember(bookings, member.id)
      .filter(b => b.date === currentDate && b.status !== 'cancelled');

    return baseSlots.map(slot => {
      const isMyBooked = myBookings.some(b => b.startTime === slot.startTime);
      const hasFreeRoom = rooms.some(room => {
        if (room.status === 'maintenance') return false;
        const sched = getDaySchedule(room, bookings, currentDate);
        return sched.blocks.some(b => b.startTime === slot.startTime && b.status === 'free');
      });
      return { ...slot, available: !isMyBooked && hasFreeRoom };
    });
  }, [selectedDate, bookings, member.id, currentDate, rooms]);

  const handleSelectDate = (index: number) => {
    setSelectedDate(index);
    setSelectedSlot(null);
    setAllocationResult(null);
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    if (member.remainingQuota <= 0) {
      Taro.showToast({ title: '本周额度已用完，无法预约', icon: 'none' });
      return;
    }
    setSelectedSlot(slot.startTime);
    const result = allocateRoom(rooms, bookings, currentDate, slot.startTime);
    setAllocationResult(result);
  };

  const handleConfirm = () => {
    if (!selectedSlot || !allocationResult) return;
    if (member.remainingQuota <= 0) {
      Taro.showToast({ title: '本周额度已用完', icon: 'none' });
      return;
    }

    const bookingId = `B${Date.now()}`;
    const room = allocationResult.room;
    const newBooking: Booking = {
      id: bookingId,
      memberId: member.id,
      roomId: room.id,
      roomName: room.name,
      date: currentDate,
      startTime: selectedSlot,
      endTime: `${String(parseInt(selectedSlot) + 1).padStart(2, '0')}:00`,
      status: 'confirmed',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
      allocatedRoom: room.name,
      allocationReason: allocationResult.reasons.join('；'),
    };

    addBooking(newBooking);
    deductQuota();

    console.info('[Booking] 预约成功', {
      date: currentDate,
      slot: selectedSlot,
      room: room.name,
      reasons: allocationResult.reasons,
    });

    Taro.showToast({ title: '预约成功', icon: 'success' });
    setSelectedSlot(null);
    setAllocationResult(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    Taro.showModal({
      title: '取消预约',
      content: '确定要取消这个预约吗？取消后额度将退回。',
      confirmText: '确定取消',
      cancelText: '再想想',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          cancelBooking(bookingId);
          Taro.showToast({ title: '已取消，额度已退回', icon: 'success' });
          setSelectedSlot(null);
          setAllocationResult(null);
        }
      },
    });
  };

  const myBookings = getBookingsForMember(bookings, member.id)
    .filter(b => b.status !== 'cancelled')
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.startTime < b.startTime ? -1 : 1;
    })
    .slice(0, 10);

  const canConfirm = selectedSlot && allocationResult && member.remainingQuota > 0;

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

      {member.remainingQuota <= 0 && (
        <View className={styles.quotaWarning}>
          <Text className={styles.quotaWarningText}>⚠️ 本周练习额度已用完，无法继续预约</Text>
        </View>
      )}

      <View className={styles.slotSection}>
        <View className={styles.slotHeader}>
          <Text className={styles.slotLabel}>选择时段</Text>
          <Text className={styles.quotaHint}>剩余额度: {member.remainingQuota}h</Text>
        </View>
        <TimeSlotPicker
          slots={timeSlots}
          selectedSlot={selectedSlot}
          onSelect={handleSelectSlot}
        />
      </View>

      {selectedSlot && allocationResult && (
        <View className={styles.resultCard}>
          <Text className={styles.resultTitle}>🎯 智能分配结果</Text>
          <View className={styles.resultInfo}>
            <Text className={styles.resultLabel}>分配鼓房</Text>
            <Text className={styles.resultValue}>{allocationResult.room.name}</Text>
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
          {allocationResult.reasons.length > 0 && (
            <View className={styles.reasonSection}>
              <Text className={styles.reasonTitle}>💡 排班助手：为什么选{allocationResult.room.name}</Text>
              {allocationResult.reasons.map((reason, i) => (
                <Text key={i} className={styles.reasonItem}>· {reason}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {selectedSlot && !allocationResult && (
        <View className={styles.resultCard}>
          <Text className={styles.resultTitle}>😔 该时段暂无空闲鼓房</Text>
          <Text className={styles.resultHint}>请尝试其他时段</Text>
        </View>
      )}

      <View className={styles.historySection}>
        <Text className={styles.historyTitle}>我的预约</Text>
        {myBookings.length > 0 ? (
          myBookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              showCancel
              onCancel={handleCancelBooking}
            />
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
            {member.remainingQuota <= 0
              ? '额度已用完'
              : canConfirm
                ? '确认预约'
                : '请选择时段'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BookingPage;
