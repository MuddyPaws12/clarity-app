import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types/models';
import { COLORS, FONT_SIZES } from '../utils/theme';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
        <View style={[styles.checkboxInner, task.completed && styles.checked]}>
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
      <Text
        style={[
          styles.title,
          task.completed && styles.completedTitle,
        ]}
        numberOfLines={2}
      >
        {task.title}
      </Text>
      <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteBtnText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gray200,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  checkmark: {
    color: '#fff',
    fontSize: FONT_SIZES.base,
    fontWeight: 'bold',
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray800,
    fontWeight: '500',
  },
  completedTitle: {
    color: COLORS.gray400,
    textDecorationLine: 'line-through',
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  deleteBtnText: {
    fontSize: 24,
    color: COLORS.gray300,
  },
});
