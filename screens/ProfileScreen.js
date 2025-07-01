// screens/ProfileScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed
import { CommonActions } from '@react-navigation/native'; // For resetting navigation stack

export default function ProfileScreen({ navigation }) {
  const { appUser, currentUser, loading, logout } = useAuth(); // Get user and logout function

  const handleLogout = async () => {
    try {
      await logout();
      // After logout, reset the navigation stack to go back to the AuthScreen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }], // Assuming your AuthScreen route name is 'Auth'
        })
      );
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to log out. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  // Ensure appUser and currentUser exist before trying to access their properties
  if (!appUser || !currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Not Logged In</Text>
        <Text style={styles.subtitle}>Please log in to view your profile.</Text>
        {/* Potentially add a button to navigate to AuthScreen if you didn't reset navigation */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>
      <Text style={styles.username}>Username: {appUser.username}</Text>
      <Text style={styles.uid}>User ID: {currentUser.uid}</Text>
      {/* You can add more profile information here from appUser if you store it */}
      <Button title="Logout" onPress={handleLogout} color="#dc3545" />
    </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  username: {
    fontSize: 20,
    marginBottom: 10,
    color: '#555',
  },
  uid: {
    fontSize: 14,
    color: '#888',
    marginBottom: 30,
  },
});