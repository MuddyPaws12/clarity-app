import React, { useState } from 'react';
import { View, ActivityIndicator, SafeAreaView } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { ProjectDetailScreen } from './src/screens/ProjectDetailScreen';
import { COLORS } from './src/utils/theme';

function AppContent() {
  const { loading } = useApp();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.gray100 }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {selectedProjectId ? (
        <ProjectDetailScreen
          projectId={selectedProjectId}
          onBack={() => setSelectedProjectId(null)}
        />
      ) : (
        <ProjectsScreen onSelectProject={setSelectedProjectId} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
