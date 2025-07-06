// App.js
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack'; // NEW: Import createStackNavigator
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import PostScreen from './screens/PostScreen';
import AboutScreen from './screens/AboutScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';
import SplashScreen from './screens/SplashScreen';
import PostDetailsScreen from './screens/PostDetailsScreen'; // NEW: Import PostDetailsScreen

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator(); // NEW: Initialize Stack Navigator

// MainTabs component remains largely the same, defines your bottom tabs
function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color: tabIconColor, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Post') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'About') {
            iconName = focused ? 'information-circle' : 'information-circle-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={tabIconColor} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.card,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false, // Ensure headers are hidden for tab screens
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Post" component={PostScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// NEW: This component defines the main app navigation flow after authentication
function AppNavigator() {
  return (
    <Stack.Navigator>
      {/* The MainTabs (bottom tabs) are now a screen within the StackNavigator */}
      <Stack.Screen
        name="MainAppTabs" // A descriptive name for the screen containing your tabs
        component={MainTabs}
        options={{ headerShown: false }} // Hide header for the tabs themselves
      />
      {/* PostDetailsScreen is also a screen in the StackNavigator, accessible from any tab */}
      <Stack.Screen
        name="PostDetails"
        component={PostDetailsScreen}
        options={{ headerShown: false }} // Hide header for PostDetailsScreen
      />
      {/* Add any other stack-based screens here if needed later (e.g., specific settings screens) */}
    </Stack.Navigator>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { currentUser, loading } = useAuth();
  const { colors } = useTheme();

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading authentication...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {/* Conditionally render AppNavigator (which contains MainTabs and PostDetails) or AuthScreen */}
      {currentUser ? <AppNavigator /> : <AuthScreen />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});