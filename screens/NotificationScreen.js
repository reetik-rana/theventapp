// screens/NotificationScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
} from 'firebase/firestore';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Query for notifications where the recipientId matches the current user's UID
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedNotifications = [];
      querySnapshot.forEach((doc) => {
        fetchedNotifications.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(fetchedNotifications);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load notifications.');
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleNotificationPress = async (notificationId, postId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });
      navigation.navigate('PostDetails', { postId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: item.read ? colors.card : colors.primary,
          borderColor: item.read ? colors.border : colors.primary,
          opacity: item.read ? 0.6 : 1,
        },
      ]}
      onPress={() => handleNotificationPress(item.id, item.postId)}
    >
      <Text style={[styles.notificationText, { color: item.read ? colors.text : 'white' }]}>
        <Text style={{ fontWeight: 'bold' }}>{item.senderUsername}</Text> replied to your thought: "{item.postText}"
      </Text>
      <Text style={[styles.notificationTimestamp, { color: item.read ? colors.placeholder : 'white' }]}>
        {item.createdAt?.toDate().toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        tagline="Your Notifications"
        headerBgColor="black"
        headerTextColor="white"
        taglineFontSize={20}
        showLogo={false}
        centerTagline={true}
      />
      {notifications.length === 0 ? (
        <View style={styles.noNotificationsContainer}>
          <Text style={[styles.noNotificationsText, { color: colors.text }]}>You have no new notifications.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    padding: 16,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  notificationText: {
    fontSize: 16,
    lineHeight: 24,
  },
  notificationTimestamp: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  noNotificationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNotificationsText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationScreen;