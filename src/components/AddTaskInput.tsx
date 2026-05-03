import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES } from '../utils/theme';

interface AddTaskInputProps {
  onAdd: (title: string) => Promise<void>;
  placeholder?: string;
}

export function AddTaskInput({ onAdd, placeholder = 'Add a task...' }: AddTaskInputProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await onAdd(trimmed);
      setInput('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray400}
        value={input}
        onChangeText={setInput}
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.addBtn, !input.trim() && styles.addBtnDisabled]}
        onPress={handleAdd}
        disabled={!input.trim() || loading}
      >
        <Text style={styles.addBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.gray50,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray800,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: {
    backgroundColor: COLORS.gray300,
  },
  addBtnText: {
    color: '#fff',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
});
