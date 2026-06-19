import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { TimeSlot } from '@/types/booking';
import styles from './index.module.scss';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSelect: (slot: TimeSlot) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ slots, selectedSlot, onSelect }) => {
  return (
    <View className={styles.container}>
      {slots.map((slot) => {
        const isSelected = selectedSlot === slot.startTime;
        const isUnavailable = !slot.available;
        return (
          <View
            key={slot.startTime}
            className={classnames(
              styles.slot,
              isSelected && styles.slotSelected,
              isUnavailable && styles.slotDisabled
            )}
            onClick={() => !isUnavailable && onSelect(slot)}
          >
            <Text
              className={classnames(
                styles.slotText,
                isSelected && styles.slotTextSelected,
                isUnavailable && styles.slotTextDisabled
              )}
            >
              {slot.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default TimeSlotPicker;
