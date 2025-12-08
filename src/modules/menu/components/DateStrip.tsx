import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getWeekDates, getDayName, getDayNumber, isSameDay, formatDateForKey } from '../models/types';
import { colors, spacing } from '../../../theme';

interface DateStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const DateStrip: React.FC<DateStripProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const today = new Date();
  const dates = getWeekDates(selectedDate, 7);

  const isToday = (date: Date): boolean => {
    return isSameDay(date, today);
  };

  const isPast = (date: Date): boolean => {
    const dateStr = formatDateForKey(date);
    const todayStr = formatDateForKey(today);
    return dateStr < todayStr;
  };

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    onDateChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    onDateChange(newDate);
  };

  const handleTodayPress = () => {
    onDateChange(new Date());
  };

  // Scroll to selected date on mount
  useEffect(() => {
    // Small delay to ensure layout is complete
    setTimeout(() => {
      const selectedIndex = dates.findIndex((d) => isSameDay(d, selectedDate));
      if (selectedIndex >= 0 && scrollRef.current) {
        const itemWidth = 56; // approximate width of each date item
        const scrollX = Math.max(0, (selectedIndex - 2) * itemWidth);
        scrollRef.current.scrollTo({ x: scrollX, animated: false });
      }
    }, 100);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.monthYear}>
          {selectedDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity style={styles.todayButton} onPress={handleTodayPress}>
          <MaterialIcons name="today" size={16} color={colors.primary} />
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stripRow}>
        <TouchableOpacity style={styles.arrowButton} onPress={handlePrevWeek}>
          <MaterialIcons name="chevron-left" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datesContainer}
        >
          {dates.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const dateIsToday = isToday(date);
            const dateIsPast = isPast(date);

            return (
              <TouchableOpacity
                key={formatDateForKey(date)}
                style={[
                  styles.dateItem,
                  isSelected && styles.dateItemSelected,
                  dateIsToday && !isSelected && styles.dateItemToday,
                ]}
                onPress={() => onDateChange(date)}
              >
                <Text
                  style={[
                    styles.dayName,
                    isSelected && styles.dayNameSelected,
                    dateIsPast && !isSelected && styles.dayNamePast,
                  ]}
                >
                  {getDayName(date)}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    isSelected && styles.dayNumberSelected,
                    dateIsPast && !isSelected && styles.dayNumberPast,
                  ]}
                >
                  {getDayNumber(date)}
                </Text>
                {dateIsToday && (
                  <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={styles.arrowButton} onPress={handleNextWeek}>
          <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  monthYear: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: spacing.borderRadiusSm,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  stripRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    padding: spacing.xs,
  },
  datesContainer: {
    paddingHorizontal: spacing.xs,
  },
  dateItem: {
    width: 48,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    borderRadius: spacing.borderRadiusMd,
    backgroundColor: colors.background,
  },
  dateItemSelected: {
    backgroundColor: colors.primary,
  },
  dateItemToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dayNameSelected: {
    color: colors.white,
  },
  dayNamePast: {
    color: colors.textMuted,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dayNumberSelected: {
    color: colors.white,
  },
  dayNumberPast: {
    color: colors.textMuted,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 3,
  },
  todayDotSelected: {
    backgroundColor: colors.white,
  },
});

export default DateStrip;
