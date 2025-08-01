// screens/ProfileScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Switch, Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
// REMOVED: import { CommonActions } from '@react-navigation/native'; // No longer needed in this file for logout
import Header from '../components/Header';

export default function ProfileScreen({ navigation }) {
  const { appUser, currentUser, loading, logout } = useAuth();
  const { theme, toggleTheme, colors, isDarkMode } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      // REMOVED: The entire navigation.dispatch block has been removed as App.js now handles this
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Failed to log out', 'Please try again.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Loading user data...</Text>
      </SafeAreaView>
    );
  }

  if (!appUser || !currentUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          tagline="Login to see your info"
          headerBgColor="black"
          headerTextColor="white"
          taglineFontSize={16}
          showLogo={false}
        />
        <View style={styles.profileContent}>
          <Text style={[styles.title, { color: colors.text }]}>Not Logged In</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>Please log in to view your profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        tagline="Manage your account"
        headerBgColor="black"
        headerTextColor="white"
        taglineFontSize={20}
        showLogo={false}
      />
      <View style={styles.profileContent}>
        <Text style={[styles.username, { color: colors.text }]}>Username: {appUser.username}</Text>
        <Text style={[styles.uid, { color: colors.placeholder }]}>User ID: {currentUser.uid}</Text>

        <View style={styles.themeToggleContainer}>
          <Text style={[styles.themeToggleText, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={isDarkMode ? colors.card : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleTheme}
            value={isDarkMode}
          />
        </View>

        <Button title="Logout" onPress={handleLogout} color="#dc3545" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  profileContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    marginBottom: 10,
  },
  uid: {
    fontSize: 14,
    marginBottom: 30,
  },
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    maxWidth: 300,
    marginBottom: 30,
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8
  },
  themeToggleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});