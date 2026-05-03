import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { AddTaskInput } from '../components/AddTaskInput';
import { TaskItem } from '../components/TaskItem';
import { COLORS, FONT_SIZES } from '../utils/theme';
import { useResponsive, getResponsivePadding } from '../utils/responsive';

interface ProjectDetailScreenProps {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetailScreen({ projectId, onBack }: ProjectDetailScreenProps) {
  const { projects, lists, tasks, createList, createTask, toggleTask, deleteTask, deleteList } = useApp();
  const { isTablet } = useResponsive();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [listName, setListName] = useState('');

  const padding = getResponsivePadding(isTablet);

  const project = projects.find((p) => p.id === projectId);
  const projectLists = lists[projectId] || [];
  const activeList = selectedListId ? projectLists.find((l) => l.id === selectedListId) : projectLists[0];

  if (!project) return null;

  const handleCreateList = async () => {
    const trimmed = listName.trim();
    if (!trimmed) return;
    await createList(projectId, trimmed);
    setListName('');
    setModalVisible(false);
    const updatedLists = lists[projectId] || [];
    if (updatedLists.length > 0) {
      setSelectedListId(updatedLists[updatedLists.length - 1].id);
    }
  };

  const handleDeleteList = (listId: string, listName: string) => {
    Alert.alert(
      'Delete List',
      `Delete "${listName}" and all its tasks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteList(listId);
            setSelectedListId(null);
          },
        },
      ]
    );
  };

  const listTasks = activeList ? (tasks[activeList.id] || []) : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
      >
        <View style={[styles.header, { paddingHorizontal: padding.horizontal, paddingVertical: padding.vertical }]}>
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { flex: 1, textAlign: 'center' }]} numberOfLines={1}>{project.name}</Text>
          <TouchableOpacity style={styles.addListBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.addListText}>+ List</Text>
          </TouchableOpacity>
        </View>
        {projectLists.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No lists yet</Text>
            <Text style={styles.emptySubtext}>Create a list to organize tasks</Text>
          </View>
        ) : (
          <>
            <View style={styles.listTabs}>
              <FlatList
                data={projectLists}
                keyExtractor={(item) => item.id}
                renderItem={({ item: list }) => (
                  <TouchableOpacity
                    style={[
                      styles.listTab,
                      activeList?.id === list.id && styles.listTabActive,
                    ]}
                    onPress={() => setSelectedListId(list.id)}
                    onLongPress={() => handleDeleteList(list.id, list.name)}
                  >
                    <Text
                      style={[
                        styles.listTabText,
                        activeList?.id === list.id && styles.listTabTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {list.name}
                    </Text>
                  </TouchableOpacity>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.listTabsContent, { paddingHorizontal: padding.horizontal }]}
              />
            </View>
            {activeList && (
              <FlatList
                data={listTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item: task }) => (
                  <View style={[styles.taskWrapper, { paddingHorizontal: padding.horizontal }]}>
                    <TaskItem
                      task={task}
                      onToggle={() => toggleTask(task.id)}
                      onDelete={() => deleteTask(task.id)}
                    />
                  </View>
                )}
                contentContainerStyle={[styles.tasksList, { paddingHorizontal: padding.horizontal === 0 ? 16 : 0 }]}
                ListFooterComponent={
                  <View style={[styles.addTaskContainer, { paddingHorizontal: padding.horizontal }]}>
                    <AddTaskInput
                      onAdd={(title) => createTask(activeList.id, projectId, title)}
                    />
                  </View>
                }
                scrollEnabled={true}
              />
            )}
          </>
        )}
        <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
          <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
            >
              <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { paddingHorizontal: padding.horizontal, paddingVertical: padding.vertical * 2 }]}>
                  <Text style={styles.modalTitle}>New List</Text>
                  <TextInput
                    style={[styles.modalInput, { paddingHorizontal: padding.horizontal, paddingVertical: padding.vertical }]}
                    placeholder="List name (e.g., Today, Backlog, Waiting)"
                    placeholderTextColor={COLORS.gray400}
                    value={listName}
                    onChangeText={setListName}
                    autoFocus
                  />
                  <View style={[styles.modalButtons, { marginTop: padding.vertical * 2 }]}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => {
                        setModalVisible(false);
                        setListName('');
                      }}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalCreateBtn,
                        !listName.trim() && styles.modalCreateBtnDisabled,
                      ]}
                      onPress={handleCreateList}
                      disabled={!listName.trim()}
                    >
                      <Text style={styles.modalCreateText}>Create</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.gray100 },
  container: { flex: 1, backgroundColor: COLORS.gray100 },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  backBtn: { fontSize: FONT_SIZES.base, fontWeight: '600', color: COLORS.primary },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.gray800 },
  addListBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.gray100, borderRadius: 6 },
  addListText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  listTabs: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  listTabsContent: { paddingVertical: 0 },
  listTab: { paddingHorizontal: 12, paddingVertical: 12, marginRight: 8, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  listTabActive: { borderBottomColor: COLORS.primary },
  listTabText: { fontSize: FONT_SIZES.base, fontWeight: '600', color: COLORS.gray400 },
  listTabTextActive: { color: COLORS.primary },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.gray500, marginBottom: 8 },
  emptySubtext: { fontSize: FONT_SIZES.base, color: COLORS.gray400 },
  taskWrapper: { paddingVertical: 4 },
  tasksList: { paddingVertical: 16 },
  addTaskContainer: { marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '90%' },
  modalTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.gray800, marginBottom: 16 },
  modalInput: { borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 8, fontSize: FONT_SIZES.base, marginBottom: 16, color: COLORS.gray800 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gray300, alignItems: 'center' },
  modalCancelText: { color: COLORS.gray600, fontSize: FONT_SIZES.base, fontWeight: '600' },
  modalCreateBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center' },
  modalCreateBtnDisabled: { backgroundColor: COLORS.gray300 },
  modalCreateText: { color: '#fff', fontSize: FONT_SIZES.base, fontWeight: '600' },
});
