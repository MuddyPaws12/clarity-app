import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { ProjectCard } from '../components/ProjectCard';
import { ColorPicker } from '../components/ColorPicker';
import { COLORS, FONT_SIZES, PROJECT_COLORS } from '../utils/theme';
import { useResponsive, getResponsivePadding } from '../utils/responsive';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

interface ProjectsScreenProps {
  onSelectProject: (projectId: string) => void;
}

export function ProjectsScreen({ onSelectProject }: ProjectsScreenProps) {
  const { projects, lists, tasks, createProject, deleteProject, exportData, importData } = useApp();
  const { isTablet, isLandscape } = useResponsive();
  const [modalVisible, setModalVisible] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const padding = getResponsivePadding(isTablet);

  const handleCreateProject = async () => {
    const trimmed = projectName.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      await createProject(trimmed, selectedColor);
      setProjectName('');
      setSelectedColor(PROJECT_COLORS[0]);
      setModalVisible(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    Alert.alert(
      'Delete Project',
      `Delete "${projectName}" and all its tasks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteProject(projectId);
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    try {
      const json = await exportData();
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `clarity-backup-${timestamp}.json`;
      
      const fileUri = `data:application/json;base64,${Buffer.from(json).toString('base64')}`;
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Clarity Data',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export data');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });
      if (result.type === 'success') {
        const fileUri = result.uri;
        const content = await fetch(fileUri).then(res => res.text());
        Alert.alert(
          'Import Data',
          'This will replace all current data. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Import',
              style: 'destructive',
              onPress: async () => {
                try {
                  await importData(content);
                  Alert.alert('Success', 'Data imported successfully!');
                } catch (error) {
                  Alert.alert('Import Failed', 'Invalid backup file');
                }
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const getProjectTaskCount = (projectId: string) => {
    const projectLists = lists[projectId] || [];
    return projectLists.reduce((count, list) => {
      return count + (tasks[list.id]?.length || 0);
    }, 0);
  };

  const numColumns = isTablet ? (isLandscape ? 2 : 2) : 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingHorizontal: padding.horizontal, paddingVertical: padding.vertical }]}>
          <Text style={styles.title}>Projects</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.menuBtn} onPress={() => setMenuVisible(true)}>
              <Text style={styles.menuBtnText}>⋮</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        {projects.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No projects yet</Text>
            <Text style={styles.emptySubtext}>Create one to get started</Text>
          </View>
        ) : (
          <FlatList
            data={projects}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            key={numColumns}
            columnWrapperStyle={numColumns > 1 ? { gap: padding.horizontal } : undefined}
            renderItem={({ item: project }) => (
              <TouchableOpacity
                onPress={() => onSelectProject(project.id)}
                onLongPress={() => handleDeleteProject(project.id, project.name)}
                activeOpacity={0.7}
                style={numColumns > 1 ? { flex: 1 } : {}}
              >
                <View style={[styles.cardWrapper, { marginHorizontal: numColumns > 1 ? 0 : padding.horizontal }]}>
                  <ProjectCard
                    project={project}
                    lists={lists[project.id] || []}
                    taskCount={getProjectTaskCount(project.id)}
                  />
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={[styles.listContent, { paddingHorizontal: numColumns === 1 ? 0 : padding.horizontal }]}
            scrollEnabled={true}
          />
        )}
        <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { paddingHorizontal: padding.horizontal, paddingVertical: padding.vertical * 2 }]}>
                <Text style={styles.modalTitle}>New Project</Text>
                <TextInput
                  style={[styles.modalInput, { paddingHorizontal: padding.horizontal, paddingVertical: padding.vertical }]}
                  placeholder="Project name"
                  placeholderTextColor={COLORS.gray400}
                  value={projectName}
                  onChangeText={setProjectName}
                  editable={!loading}
                  autoFocus
                />
                <Text style={[styles.colorLabel, { marginTop: padding.vertical * 2, marginBottom: padding.vertical }]}>Choose a color:</Text>
                <ColorPicker selectedColor={selectedColor} onSelectColor={setSelectedColor} />
                <View style={[styles.modalButtons, { marginTop: padding.vertical * 2 }]}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => {
                      setModalVisible(false);
                      setProjectName('');
                      setSelectedColor(PROJECT_COLORS[0]);
                    }}
                    disabled={loading}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalCreateBtn,
                      !projectName.trim() && styles.modalCreateBtnDisabled,
                    ]}
                    onPress={handleCreateProject}
                    disabled={!projectName.trim() || loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.modalCreateText}>Create</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
        <Modal visible={menuVisible} animationType="fade" transparent={true} onRequestClose={() => setMenuVisible(false)}>
          <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuVisible(false)}>
            <View style={styles.menuContent}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  handleExport();
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.menuItemText}>📥 Export Data</Text>
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  handleImport();
                  setMenuVisible(false);
                }}
              >
                <Text style={styles.menuItemText}>📤 Import Data</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.gray100 },
  container: { flex: 1, backgroundColor: COLORS.gray100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '700', color: COLORS.gray800 },
  headerButtons: { flexDirection: 'row', gap: 8 },
  menuBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: COLORS.gray100, borderRadius: 8 },
  menuBtnText: { fontSize: FONT_SIZES.lg, color: COLORS.gray600 },
  addBtn: { backgroundColor: COLORS.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  addBtnText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  listContent: { paddingVertical: 16 },
  cardWrapper: { marginBottom: 12 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.gray500, marginBottom: 8 },
  emptySubtext: { fontSize: FONT_SIZES.base, color: COLORS.gray400 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '90%' },
  modalTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.gray800, marginBottom: 16 },
  colorLabel: { fontSize: FONT_SIZES.base, fontWeight: '600', color: COLORS.gray700 },
  modalInput: { borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 8, fontSize: FONT_SIZES.base, marginBottom: 16, color: COLORS.gray800 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: COLORS.gray300, alignItems: 'center' },
  modalCancelText: { color: COLORS.gray600, fontSize: FONT_SIZES.base, fontWeight: '600' },
  modalCreateBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  modalCreateBtnDisabled: { backgroundColor: COLORS.gray300 },
  modalCreateText: { color: '#fff', fontSize: FONT_SIZES.base, fontWeight: '600' },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-start', paddingTop: 60 },
  menuContent: { marginLeft: 'auto', marginRight: 16, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 5 },
  menuItem: { paddingHorizontal: 16, paddingVertical: 12 },
  menuItemText: { fontSize: FONT_SIZES.base, color: COLORS.gray800, fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: COLORS.gray200 },
});
