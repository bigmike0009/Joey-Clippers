import { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, HelperText } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { ShopDay } from '@/types';
import { colors, spacing, typography, radius } from '@/theme';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (date: string, slotCount: number, notes?: string) => void;
  loading?: boolean;
  existing?: ShopDay | null;
  existingDates?: string[];
};

export function ShopDayFormModal({
  visible,
  onDismiss,
  onSubmit,
  loading,
  existing,
  existingDates = [],
}: Props) {
  const isEdit = !!existing;

  const [date, setDate] = useState<Date>(
    existing ? new Date(existing.date + 'T12:00:00') : tomorrow(),
  );
  const [showPicker, setShowPicker] = useState(false);
  const [slotCount, setSlotCount] = useState(existing ? String(existing.slot_count) : '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setDate(existing ? new Date(existing.date + 'T12:00:00') : tomorrow());
      setSlotCount(existing ? String(existing.slot_count) : '');
      setNotes(existing?.notes ?? '');
      setErrors({});
    }
  }, [visible, existing]);

  function validate() {
    const errs: Record<string, string> = {};
    const dateStr = toDateString(date);
    const today = toDateString(new Date());

    if (!isEdit && dateStr <= today) {
      errs.date = 'Date must be in the future.';
    }
    if (!isEdit && existingDates.includes(dateStr)) {
      errs.date = 'A shop day already exists for this date.';
    }

    const slots = parseInt(slotCount, 10);
    if (!slotCount || isNaN(slots) || slots < 1) {
      errs.slotCount = 'Enter a slot count of at least 1.';
    }
    return errs;
  }

  function handleSubmit() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const slots = parseInt(slotCount, 10);
    onSubmit(toDateString(date), slots, notes.trim() || undefined);
  }

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEdit ? 'Edit Shop Day' : 'New Shop Day'}</Text>

        {!isEdit && (
          <View style={styles.field}>
            <Text style={styles.label}>Date</Text>
            <Button
              mode="outlined"
              onPress={() => setShowPicker(true)}
              style={styles.dateButton}
              textColor={colors.text.primary}
            >
              {formatDisplayDate(date)}
            </Button>
            {errors.date ? <HelperText type="error">{errors.date}</HelperText> : null}

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={tomorrow()}
                onChange={(_event, selected) => {
                  setShowPicker(Platform.OS === 'ios');
                  if (selected) setDate(selected);
                }}
              />
            )}
          </View>
        )}

        <View style={styles.field}>
          <TextInput
            label="Available slots"
            value={slotCount}
            onChangeText={setSlotCount}
            keyboardType="number-pad"
            mode="outlined"
            style={styles.input}
            outlineColor={colors.neutral[300]}
            activeOutlineColor={colors.primary.default}
            error={!!errors.slotCount}
          />
          {errors.slotCount ? <HelperText type="error">{errors.slotCount}</HelperText> : null}
        </View>

        <View style={styles.field}>
          <TextInput
            label="Notes (optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            style={styles.input}
            outlineColor={colors.neutral[300]}
            activeOutlineColor={colors.primary.default}
            placeholder="e.g. bring cash"
          />
        </View>

        <View style={styles.actions}>
          <Button onPress={onDismiss} textColor={colors.text.secondary} disabled={loading}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            buttonColor={colors.primary.default}
          >
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
}

function toDateString(d: Date) {
  return d.toISOString().split('T')[0];
}

function formatDisplayDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.card,
    margin: spacing[4],
    borderRadius: radius.xl,
    padding: spacing[6],
    gap: spacing[2],
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  field: {
    gap: spacing[1],
  },
  label: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing[1],
  },
  dateButton: {
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
  },
  input: {
    backgroundColor: colors.surface.card,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
    marginTop: spacing[2],
  },
});
