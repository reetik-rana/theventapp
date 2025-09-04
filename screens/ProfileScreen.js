// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Switch, Alert, SafeAreaView, TouchableOpacity, Linking, ScrollView, Platform, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { doc, collection, onSnapshot, query, where, updateDoc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { appUser, currentUser, loading, logout } = useAuth();
  const { theme, toggleTheme, colors, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [publicProfile, setPublicProfile] = useState(true);
  const [profilePic, setProfilePic] = useState(null);

  const handleUpdateApp = () => {
    Linking.openURL('https://github.com/reetik-rana/theventapp/releases').catch((err) => {
      Alert.alert('Error', 'Could not open the update page.');
    });
  };

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setUnreadNotifications(querySnapshot.size);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch publicProfile and profilePic settings on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.publicProfile !== undefined) {
          setPublicProfile(data.publicProfile);
        }
        if (data.profilePic) {
          setProfilePic(data.profilePic);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  // Update publicProfile in Firestore
  const handleTogglePublicProfile = async () => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, { publicProfile: !publicProfile });
      setPublicProfile(!publicProfile);
    } catch (error) {
      Alert.alert('Error', 'Could not update profile visibility.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Failed to log out', 'Please try again.');
    }
  };

  // --- NEW FUNCTION TO UPLOAD IMAGE TO CLOUDINARY ---
  const pickAndUpload = async () => {
    if (!currentUser) {
      Alert.alert('Not logged in', 'Please log in to upload a profile picture.');
      return;
    }
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Permission to access photos is required.');
        return;
      }

      const mediaTypes =
        (ImagePicker.MediaType && ImagePicker.MediaType.Images) ||
        (ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,          // needed for direct base64 upload
      });

      if (result.canceled || !result.assets || !result.assets.length) {
        return;
      }

      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert('Error', 'Could not read image data (no base64). Try another image.');
        return;
      }

      // TODO: Replace with your Cloudinary cloud name & unsigned preset
      const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/dycn1rw2e/image/upload';
      const UPLOAD_PRESET = 'thevent-profile-pics';

      const mime = asset.mimeType || 'image/jpeg';
      const dataUrl = `data:${mime};base64,${asset.base64}`;

      const formData = new FormData();
      formData.append('file', dataUrl);
      formData.append('upload_preset', UPLOAD_PRESET);

      Alert.alert('Uploading', 'Uploading your profile picture...');

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData, // Let React Native set multipart headers automatically
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.secure_url) {
        const errMsg =
          (responseData.error && responseData.error.message) ||
          'Unknown upload error (no secure_url). Check preset / cloud name.';
        throw new Error(errMsg);
      }

      const photoURL = responseData.secure_url;
      await updateDoc(doc(db, 'users', currentUser.uid), { profilePic: photoURL });
      setProfilePic(photoURL);
      Alert.alert('Success', 'Profile picture uploaded!');
    } catch (err) {
      console.error('Upload error', err);
      Alert.alert('Upload failed', err.message || 'Could not upload image. Please try again.');
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
        <View style={{ height: 10 }} />
        <View style={styles.profileContent}>
          <Text style={[styles.title, { color: colors.text }]}>Not Logged In</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>Please log in to view your profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ height: Platform.OS === 'web' ? 8 : Math.max(insets.top, 12) }} />
      <Header
        tagline="Manage your account"
        headerBgColor="black"
        headerTextColor="white"
        taglineFontSize={20}
        showLogo={false}
      />
      <View style={{ height: Platform.OS === 'web' ? 10 : 8 }} />
      <ScrollView
        contentContainerStyle={[styles.profileContentScroll, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={true}
      >
        {/* --- MODIFIED: Display the profile picture --- */}
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 12 }} />
        ) : (
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 32 }}>{appUser.anonymousId || '🙂'}</Text>
          </View>
        )}
        <Text style={[styles.username, { color: colors.text }]}>Username: {appUser.username}</Text>
        <Text style={[styles.uid, { color: colors.placeholder }]}>User ID: {currentUser.uid}</Text>

        {/* --- ADDED: Upload / Change Profile Picture Button --- */}
        <TouchableOpacity
          style={[styles.myPostsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={pickAndUpload}
        >
          <Ionicons name="camera" size={20} color={colors.text} />
          <Text style={[styles.myPostsButtonText, { color: colors.text }]}>Upload / Change Profile Picture</Text>
        </TouchableOpacity>

        {/* Public Profile Toggle removed */}

        <TouchableOpacity
          style={[styles.notificationsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications" size={24} color={colors.text} />
          <Text style={[styles.notificationsButtonText, { color: colors.text }]}>
            Notifications
          </Text>
          {unreadNotifications > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{unreadNotifications}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.myPostsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('UserPosts')}
        >
          <Ionicons name="document-text" size={24} color={colors.text} />
          <Text style={[styles.myPostsButtonText, { color: colors.text }]}>
            My Posts
          </Text>
        </TouchableOpacity>

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

        <TouchableOpacity
          style={[styles.updateAppButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleUpdateApp}
        >
          <Ionicons name="cloud-download" size={24} color={colors.text} />
          <Text style={[styles.updateAppButtonText, { color: colors.text }]}>Update App</Text>
        </TouchableOpacity>
        <Text style={[styles.updateAppInstruction, { color: colors.placeholder }]}>To update, tap the button above, then scroll down and click the .apk file under "Assets" to download and install the latest version.</Text>

        <Button title="Logout" onPress={handleLogout} color="#dc3545" />
      </ScrollView>
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
  profileContentScroll: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
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
  notificationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    maxWidth: 300,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  notificationsButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  myPostsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    maxWidth: 300,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  myPostsButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  updateAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    maxWidth: 300,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  updateAppButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  updateAppInstruction: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  badge: {
    position: 'absolute',
    right: 15,
    top: 10,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});