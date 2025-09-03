// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Switch, Alert, SafeAreaView, TouchableOpacity, Linking, ScrollView, Platform, Image } from 'react-native'; // ADDED: ScrollView, Platform, Image
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { doc, collection, onSnapshot, query, where, updateDoc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

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

  // Fetch publicProfile setting on mount
  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!currentUser) return;
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().publicProfile !== undefined) {
        setPublicProfile(userDoc.data().publicProfile);
      }
    };
    fetchPublicProfile();
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

  // Helper: convert a local file URI to a Blob using XMLHttpRequest (more reliable than fetch on RN)
  const uriToBlob = (uri) => {
    return new Promise((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      } catch (e) {
        reject(e);
      }
    });
  };

  // Try dynamic import of expo-image-picker. If not available, fallback to paste-URL modal.
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
      // SAFE: prefer ImagePicker.MediaType (new API). Do not reference deprecated MediaTypeOptions.
      const mediaTypesOption = (ImagePicker && ImagePicker.MediaType && ImagePicker.MediaType.Images) || undefined;

      const launchOptions = {
        quality: 0.8,
        base64: false,
      };
      if (mediaTypesOption) launchOptions.mediaTypes = mediaTypesOption;

      const result = await ImagePicker.launchImageLibraryAsync(launchOptions);
      if (result.cancelled) return;

      // upload to Firebase Storage
      const storage = getStorage();

      // Try fetch().blob() first, fallback to XHR uriToBlob if fetch fails
      let blob;
      try {
        const response = await fetch(result.uri);
        blob = await response.blob();
      } catch (fetchErr) {
        // fallback for platforms/engines where fetch cannot read file:// URIs
        blob = await uriToBlob(result.uri);
      }

      const fileRef = storageRef(storage, `profilePictures/${currentUser.uid}.jpg`);
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);

      // save to Firestore and update local preview
      await updateDoc(doc(db, 'users', currentUser.uid), { profilePic: url });
      setProfilePic(url);
      // Optional: update appUser in context so other screens see the new pic immediately
      // (updateAuthUserProfile && updateAuthUserProfile({ profilePic: url }));
      Alert.alert('Success', 'Profile picture uploaded.');
    } catch (err) {
      console.error('Upload error', err);
      Alert.alert(
        'Upload failed',
        'Could not upload image. Ensure the app has storage permissions and expo-image-picker is installed. Please try again.'
      );
    }
  };

  // NEW: initialize profilePic from context (appUser) or Firestore on mount
  useEffect(() => {
    let mounted = true;
    const initProfilePic = async () => {
      if (appUser && appUser.profilePic) {
        if (mounted) setProfilePic(appUser.profilePic);
        return;
      }
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (mounted) setProfilePic(data.profilePic || null);
        }
      } catch (e) {
        // ignore – picture optional
      }
    };
    initProfilePic();
    return () => { mounted = false; };
  }, [appUser, currentUser]);

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
      {/* Scrollable profile content */}
      <ScrollView
        contentContainerStyle={[styles.profileContentScroll, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={true}
      >
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 12 }} />
        ) : (
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 32 }}>{appUser.anonymousId || '🙂'}</Text>
          </View>
        )}
        <Text style={[styles.username, { color: colors.text }]}>Username: {appUser.username}</Text>
        <Text style={[styles.uid, { color: colors.placeholder }]}>User ID: {currentUser.uid}</Text>

        {/* Upload / Change Profile Picture */}
        <TouchableOpacity
          style={[styles.myPostsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={pickAndUpload}
        >
          <Ionicons name="camera" size={20} color={colors.text} />
          <Text style={[styles.myPostsButtonText, { color: colors.text }]}>Upload / Change Profile Picture</Text>
        </TouchableOpacity>

        {/* Public Profile Toggle */}
        <View style={styles.themeToggleContainer}>
          <Text style={[styles.themeToggleText, { color: colors.text }]}>
            Allow others to view my profile
          </Text>
          <Switch
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={publicProfile ? colors.card : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleTogglePublicProfile}
            value={publicProfile}
          />
        </View>

        {/* View as public profile */}
        <TouchableOpacity
          style={[styles.myPostsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('ViewUserProfile', { userId: currentUser.uid })}
        >
          <Ionicons name="eye" size={24} color={colors.text} />
          <Text style={[styles.myPostsButtonText, { color: colors.text }]}>
            View My Public Profile
          </Text>
        </TouchableOpacity>

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
    justifyContent: 'flex-start', // start at top so scrolling feels natural
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
  myPostsButton: { // NEW: Style for the My Posts button
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
  myPostsButtonText: { // NEW: Style for the My Posts button text
    fontSize: 18,
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