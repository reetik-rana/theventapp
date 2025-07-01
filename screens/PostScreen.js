import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import ThoughtInput from '../components/ThoughtInput';
import Header from '../components/Header';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Your Firestore instance
import { useAuth } from '../context/AuthContext'; // <--- NEW: Import useAuth hook

const PostScreen = ({ navigation }) => {
  const [thoughtText, setThoughtText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { currentUser, appUser } = useAuth(); // <--- NEW: Get currentUser and appUser from context

  const handlePost = async () => {
    if (thoughtText.trim().length === 0) {
      Alert.alert('Empty thought', 'Please enter some text to share.');
      return;
    }

    // <--- NEW: Check if user is logged in before allowing post
    if (!currentUser || !appUser) {
      Alert.alert('Login Required', 'You must be logged in to share a thought.');
      return;
    }
    // --->

    setIsPosting(true);

    try {
      // You can keep randomEmoji if you want to add another layer of 'anonymous' ID
      // even for logged-in users, or remove it if username is sufficient.
      // For now, let's keep it.
      const animalEmojis = ['🐱', '🐶', '🐼', '🦊', '🐸', '🦁', '🐯', '🐨', '🐰', '🦄', '🐻', '🐭', '🦊', '🐮'];
      const randomEmoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];

      await addDoc(collection(db, 'posts'), { // <--- CHANGED: Writing to 'posts' collection
        text: thoughtText,
        createdAt: serverTimestamp(),
        // <--- NEW: Add user-specific data
        userId: currentUser.uid,      // Firebase Authentication User ID
        username: appUser.username,   // Your custom username
        // --->
        anonymousId: randomEmoji,     // Still include if desired for display
        likes: 0, // Keep if you want to track likes
      });

      setThoughtText('');
      setIsPosting(false);
      Alert.alert('Success', 'Your thought has been shared!'); // <--- Updated message
      navigation.navigate('Home'); // Navigate to Home after successful post
    } catch (error) {
      console.error('Error adding thought:', error);
      setIsPosting(false);
      Alert.alert('Error', 'There was a problem sharing your thought. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Share a Thought" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          <Text style={styles.label}>What's on your mind?</Text>
          {/* <--- UPDATED: Message reflects user-tied posts */}
          <Text style={styles.subtitle}>Your thought will be shared under your username</Text>
          {/* ---> */}

          <ScrollView style={styles.inputScrollView}>
            <ThoughtInput
              value={thoughtText}
              onChangeText={setThoughtText}
              placeholder="Type your thoughts here..."
              maxLength={500}
            />
          </ScrollView>

          <View style={styles.counterContainer}>
            <Text style={styles.counter}>{thoughtText.length}/500</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.postButton,
                (!thoughtText.trim() || isPosting) && styles.disabledButton
              ]}
              onPress={handlePost}
              disabled={!thoughtText.trim() || isPosting}
            >
              {isPosting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.postButtonText}>Share Thought</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 20,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingVertical: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    ...Platform.select({
      web: {
        fontSize: 24,
      },
    }),
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
    ...Platform.select({
      web: {
        fontSize: 18,
      },
    }),
  },
  inputScrollView: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15,
    maxHeight: 200,
    ...Platform.select({
      web: {
        fontSize: 40,
        lineHeight: 40,
      },
    }),
  },
  input: { // This style is for ThoughtInput, ensure it's applied there.
    flexGrow: 1,
    textAlignVertical: 'top',
    padding: 0,
    fontSize: 16,
    lineHeight: 24,
    ...Platform.select({
      web: {
        fontSize: 40,
        lineHeight: 40,
      },
    }),
  },
  counterContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  counter: {
    fontSize: 12,
    color: '#777',
    ...Platform.select({
      web: {
        fontSize: 20,
      },
    }),
  },
  buttonContainer: {
    marginBottom: 20,
  },
  postButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    ...Platform.select({
      web: {
        fontSize: 30,
      },
    }),
  },
});

export default PostScreen;