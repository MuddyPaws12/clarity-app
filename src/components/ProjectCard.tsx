import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Project, List as ListType } from '../types/models';
import { COLORS, FONT_SIZES } from '../utils/theme';

interface ProjectCardProps {
  project: Project;
  lists: ListType[];
  taskCount: number;
  onPress: () => void;
}

export function ProjectCard({ project, lists, taskCount, onPress }: ProjectCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: project.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.projectName}>{project.name}</Text>
      <Text style={styles.stats}>{lists.length} lists • {taskCount} tasks</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  projectName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 4,
  },
  stats: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
  },
});
