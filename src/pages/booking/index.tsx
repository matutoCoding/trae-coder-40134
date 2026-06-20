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
  isSlotFullyBooked,
  getWeekOverview,
} from '@/utils';
import type { TimeSlot, Booking, AllocationResult } from '@/types/booking';
import styles from './index.module.scss';

const BookingPage: React.FC = () => {
  const { rooms, bookings, member, addBooking, deductQuota, cancelBooking, addWaitlist } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [allocationResult, setAllocationResult] = useState<AllocationResult | null>(null);
  const [showWeekView, setShowWeekView] = useState(false);

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
      .filter(b => b.date === currentDate && b.status !== 'cancelled' && b.status !== 'waitlist-expired');

    return baseSlots.map(slot => {
      const isMyBooked = myBookings.some(b => b.startTime === slot.startTime);
      const hasFreeRoom = rooms.some(room => {
        if (room.status === 'maintenance') return false;
        const sched = getDaySchedule(room, bookings, currentDate, member.id);
        return sched.blocks.some(b => b.startTime === slot.startTime && b.status === 'free');
      });
      const fullyBooked = !hasFreeRoom && isSlotFullyBooked(rooms, bookings, currentDate, slot.startTime, member.id);
      return { ...slot, available: !isMyBooked && hasFreeRoom, isFull: fullyBooked };
    });
  }, [selectedDate, bookings, member.id, currentDate, rooms]);

  const weekOverview = useMemo(() => getWeekOverview(rooms, bookings, member.id), [rooms, bookings, member.id]);

  const handleSelectDate = (index: number) => {
    setSelectedDate(index);
    setSelectedSlot(null);
    setAllocationResult(null);
    setShowWeekView(false);
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    if (member.remainingQuota <= 0) {
      Taro.showToast({ title: '本周额度已用完，无法预约', icon: 'none' });
      return;
    }
    if (slot.isFull) return;
    setSelectedSlot(slot.startTime);
    const result = allocateRoom(rooms, bookings, currentDate, slot.startTime, member.id);
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

    Taro.showToast({ title: '预约成功', icon: 'success' });
    setSelectedSlot(null);
    setAllocationResult(null);
  };

  const handleWaitlist = () => {
    if (!selectedSlot) return;
    if (member.remainingQuota <= 0) {
      Taro.showToast({ title: '本周额度已用完，无法候补', icon: 'none' });
      return;
    }

    const bookingId = `WL${Date.now()}`;
    const waitlistBooking: Booking = {
      id: bookingId,
      memberId: member.id,
      roomId: '',
      roomName: '',
      date: currentDate,
      startTime: selectedSlot,
      endTime: `${String(parseInt(selectedSlot) + 1).padStart(2, '0')}:00`,
      status: 'waitlist',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
      isWaitlist: true,
    };

    addWaitlist(waitlistBooking);
    Taro.showToast({ title: '已加入候补', icon: 'success' });
    setSelectedSlot(null);
    setAllocationResult(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    const isWaitlist = booking.status === 'waitlist';
    Taro.showModal({
      title: isWaitlist ? '取消候补' : '取消预约',
      content: isWaitlist
        ? '确定要取消候补吗？'
        : '确定要取消这个预约吗？取消后额度将退回。',
      confirmText: '确定取消',
      cancelText: '再想想',
      confirmColor: '#f53f3f',
      success: (res) => {
        if (res.confirm) {
          cancelBooking(bookingId);
          Taro.showToast({
            title: isWaitlist ? '候补已取消' : '已取消，额度已退回',
            icon: 'success'
          });
          setSelectedSlot(null);
          setAllocationResult(null);
        }
      },
    });
  };

  const handleBookingClick = (bookingId: string) => {
    Taro.navigateTo({ url: `/pages/bookingDetail/index?id=${bookingId}` });
  };

  const myBookings = getBookingsForMember(bookings, member.id)
    .filter(b => b.status !== 'cancelled' && b.status !== 'waitlist-expired')
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.startTime < b.startTime ? -1 : 1;
    })
    .slice(0, 10);

  const canConfirm = selectedSlot && allocationResult && member.remainingQuota > 0;
  const canWaitlist = selectedSlot && !allocationResult && member.remainingQuota > 0;

  const getTensionColor = (tension: number) => {
    if (tension >= 100) return '#f53f3f';
    if (tension >= 75) return '#ff7d00';
    if (tension >= 50) return '#ffc300';
    if (tension >= 25) return '#52c41a';
    return '#d9f7be';
  };

  const getTensionBg = (tension: number) => {
    if (tension >= 100) return 'rgba(245,63,63,0.12)';
    if (tension >= 75) return 'rgba(255,125,0,0.12)';
    if (tension >= 50) return 'rgba(255,195,0,0.12)';
    if (tension >= 25) return 'rgba(82,196,26,0.12)';
    return 'rgba(217,247,190,0.12)';
  };

  const handleWeekSlotClick = (date: string, startTime: string) => {
    const dateIdx = dates.findIndex(d => d.fullDate === date);
    if (dateIdx >= 0) {
      setSelectedDate(dateIdx);
      setShowWeekView(false);
      setSelectedSlot(startTime);
      const result = allocateRoom(rooms, bookings, date, startTime, member.id);
      setAllocationResult(result);
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.dateSection}>
        <View className={styles.dateHeader}>
          <Text className={styles.dateLabel}>选择日期</Text>
          <Text
            className={styles.weekToggle}
            onClick={() => setShowWeekView(!showWeekView)}
          >
            {showWeekView ? '📅 收起总览' : '📊 排期总览'}
          </Text>
        </View>
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

      {showWeekView && (
        <View className={styles.weekViewSection}>
          <Text className={styles.weekViewTitle}>📊 未来7天排期总览</Text>
          <ScrollView scrollX className={styles.weekGrid}>
            <View className={styles.weekGridInner}>
              <View className={styles.weekHeader}>
                <View className={styles.weekHeaderEmpty} />
                {weekOverview.map(day => (
                  <View key={day.date} className={styles.weekHeaderCell}>
                    <Text className={styles.weekHeaderWeekday}>{day.weekday}</Text>
                    <Text className={styles.weekHeaderDay}>{day.day}</Text>
                  </View>
                ))}
              </View>
              {generateTimeSlots().map(baseSlot => (
                <View key={baseSlot.startTime} className={styles.weekRow}>
                  <View className={styles.weekRowLabel}>
                    <Text className={styles.weekRowTime}>{baseSlot.startTime}</Text>
                  </View>
                  {weekOverview.map(day => {
                    const slotData = day.slots.find(s => s.startTime === baseSlot.startTime);
                    const tension = slotData?.tension || 0;
                    const fullyBooked = slotData?.fullyBooked || false;
                    return (
                      <View
                        key={`${day.date}-${baseSlot.startTime}`}
                        className={styles.weekCell}
                        style={{
                          backgroundColor: getTensionBg(tension),
                          borderColor: getTensionColor(tension),
                        }}
                        onClick={() => handleWeekSlotClick(day.date, baseSlot.startTime)}
                      >
                        <Text
                          className={styles.weekCellText}
                          style={{ color: getTensionColor(tension) }}
                        >
                          {fullyBooked ? '满' : tension >= 75 ? '紧' : tension >= 50 ? '中' : tension >= 25 ? '松' : '空'}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
          <View className={styles.weekLegend}>
            <View className={styles.weekLegendItem}>
              <View className={styles.weekLegendDot} style={{ backgroundColor: '#d9f7be' }} />
              <Text className={styles.weekLegendText}>空闲</Text>
            </View>
            <View className={styles.weekLegendItem}>
              <View className={styles.weekLegendDot} style={{ backgroundColor: '#52c41a' }} />
              <Text className={styles.weekLegendText}>宽松</Text>
            </View>
            <View className={styles.weekLegendItem}>
              <View className={styles.weekLegendDot} style={{ backgroundColor: '#ffc300' }} />
              <Text className={styles.weekLegendText}>中等</Text>
            </View>
            <View className={styles.weekLegendItem}>
              <View className={styles.weekLegendDot} style={{ backgroundColor: '#ff7d00' }} />
              <Text className={styles.weekLegendText}>紧张</Text>
            </View>
            <View className={styles.weekLegendItem}>
              <View className={styles.weekLegendDot} style={{ backgroundColor: '#f53f3f' }} />
              <Text className={styles.weekLegendText}>已满</Text>
            </View>
          </View>
        </View>
      )}

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
          <Text className={styles.resultTitle}>😔 该时段所有鼓房已满</Text>
          <Text className={styles.resultHint}>
            {member.remainingQuota > 0
              ? '可以加入候补，有人取消后自动通知您'
              : '额度不足，无法候补'}
          </Text>
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
              onClick={handleBookingClick}
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
        {canConfirm && (
          <View className={styles.confirmBtn} onClick={handleConfirm}>
            <Text className={styles.confirmBtnText}>确认预约</Text>
          </View>
        )}
        {canWaitlist && (
          <View className={styles.waitlistBtn} onClick={handleWaitlist}>
            <Text className={styles.waitlistBtnText}>🔔 加入候补</Text>
          </View>
        )}
        {!canConfirm && !canWaitlist && (
          <View className={classnames(styles.confirmBtn, styles.confirmBtnDisabled)}>
            <Text className={styles.confirmBtnText}>
              {member.remainingQuota <= 0 ? '额度已用完' : '请选择时段'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default BookingPage;
