import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Header from '../components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ViewUserProfileScreen = ({ route }) => {
  const { userId } = route.params;
  const { colors } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        } else {
          setUser(null);
        }
      } catch (e) {
        Alert.alert('Error', 'Could not load user profile.');
        setUser(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!user || user.publicProfile === false) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Header tagline="User Profile" headerBgColor="black" headerTextColor="white" taglineFontSize={20} showLogo={false} />
        <Text style={{ color: colors.text, fontSize: 18, marginTop: 20 }}>This profile is private.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ height: Platform.OS === 'web' ? 8 : Math.max(insets.top, 12) }} />
      <Header tagline="User Profile" headerBgColor="black" headerTextColor="white" taglineFontSize={20} showLogo={false} />
      <View style={{ padding: 20 }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold' }}>{user.username}</Text>
        <Text style={{ color: colors.placeholder, fontSize: 14, marginTop: 8 }}>User ID: {userId}</Text>
        {/* Add more public info here if desired */}
      </View>
    </SafeAreaView>
  );
};

export default ViewUserProfileScreen;

const styles = StyleSheet.create({
  // Add styles as needed
});