/**
 * @component DatePicker
 * @description Custom modal date picker with month navigation.
 *              Shows current date as a button, opens a calendar modal on press.
 *              Highlights selected date and today's date.
 *
 * @used-in AddExpenseScreen, EditExpenseScreen
 *
 * @props
 *   - date: Date              — Currently selected date
 *   - onDateChange: (Date) => void — Called when user selects a new date
 *
 * @remarks The "Today" button scrolls the calendar to the current month
 *          without selecting a date. User must tap a day to select.
 *
 * @platform Android ✅ | iOS ✅ | Web ✅
 */

import { useState } from 'react';
import { StyleSheet, View, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function DatePicker({ date, onDateChange }: DatePickerProps) {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(date.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(date.getMonth());

  const handlePrevMonth = () => {
    if (pickerMonth === 0) {
      setPickerMonth(11);
      setPickerYear((y) => y - 1);
    } else {
      setPickerMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (pickerMonth === 11) {
      setPickerMonth(0);
      setPickerYear((y) => y + 1);
    } else {
      setPickerMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const selected = new Date(pickerYear, pickerMonth, day);
    onDateChange(selected);
    setShowPicker(false);
  };

  const today = new Date();
  const daysInMonth = getDaysInMonth(pickerYear, pickerMonth);
  const firstDay = getFirstDayOfMonth(pickerYear, pickerMonth);
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const isToday = (day: number) =>
    pickerYear === today.getFullYear() &&
    pickerMonth === today.getMonth() &&
    day === today.getDate();

  const isSelected = (day: number) =>
    pickerYear === date.getFullYear() &&
    pickerMonth === date.getMonth() &&
    day === date.getDate();

  const dateStr = `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

  return (
    <View>
      <Pressable
        style={[styles.dateButton, { backgroundColor: theme.backgroundElement }]}
        onPress={() => {
          setPickerYear(date.getFullYear());
          setPickerMonth(date.getMonth());
          setShowPicker(true);
        }}
      >
        <Ionicons name="calendar-outline" size={18} color={theme.primary} />
        <ThemedText style={styles.dateText}>{dateStr}</ThemedText>
        <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
      </Pressable>

      <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowPicker(false)}>
          <Pressable style={[styles.modal, { backgroundColor: theme.background }]} onPress={() => {}}>
            <View style={styles.header}>
              <Pressable onPress={handlePrevMonth} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={22} color={theme.text} />
              </Pressable>
              <ThemedText style={styles.monthTitle}>
                {MONTHS[pickerMonth]} {pickerYear}
              </ThemedText>
              <Pressable onPress={handleNextMonth} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={22} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {DAYS.map((d) => (
                <View key={d} style={styles.weekCell}>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.weekText}>{d}</ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {calendarDays.map((day, i) => (
                <View key={i} style={styles.dayCell}>
                  {day !== null && (
                    <Pressable
                      style={[
                        styles.dayBtn,
                        isSelected(day) && { backgroundColor: theme.primary },
                        isToday(day) && !isSelected(day) && { borderColor: theme.primary, borderWidth: 1 },
                      ]}
                      onPress={() => handleSelectDay(day)}
                    >
                      <ThemedText
                        style={[
                          styles.dayText,
                          isSelected(day) && { color: '#FFFFFF' },
                        ]}
                      >
                        {day}
                      </ThemedText>
                    </Pressable>
                  )}
                </View>
              ))}
            </View>

            <Pressable
              style={[styles.todayBtn, { borderColor: theme.backgroundElement }]}
              onPress={() => {
                const t = new Date();
                setPickerYear(t.getFullYear());
                setPickerMonth(t.getMonth());
              }}
            >
              <ThemedText type="small" themeColor="primary">Today</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius,
    padding: Spacing.two + 2,
    gap: Spacing.two,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: Spacing.four,
  },
  modal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius + 4,
    padding: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  navBtn: {
    padding: Spacing.one,
  },
  monthTitle: {
    fontSize: 20,
    lineHeight: 28,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: Spacing.one,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  weekText: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
  },
  todayBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    marginTop: Spacing.one,
    borderTopWidth: 1,
  },
});
