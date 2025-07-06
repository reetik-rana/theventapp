// screens/PostScreen.js
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
  // Removed TextInput as it's not directly used here
} from 'react-native';
import ThoughtInput from '../components/ThoughtInput';
import Header from '../components/Header';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const PostScreen = ({ navigation }) => {
  const [thoughtText, setThoughtText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { currentUser, appUser } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const handlePost = async () => {
    if (thoughtText.trim().length === 0) {
      Alert.alert('Empty thought', 'Please enter some text to share.');
      return;
    }

    if (!currentUser || !appUser) {
      Alert.alert('Login Required', 'You must be logged in to share a thought.');
      return;
    }

    setIsPosting(true);

    try {
      const animalEmojis = ['🐱', '🐶', '🐼', '🦊', '🐸', '🦁', '🐯', '🐨', '🐰', '🦄', '🐻', '🐭', '🦊', '🐮'];
      const randomEmoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];

      await addDoc(collection(db, 'posts'), {
        text: thoughtText,
        createdAt: serverTimestamp(),
        userId: currentUser.uid,
        username: appUser.username,
        anonymousId: randomEmoji,
        likes: 0,
      });

      setThoughtText('');
      setIsPosting(false);
      Alert.alert('Success', 'Your thought has been shared!');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error adding thought:', error);
      setIsPosting(false);
      Alert.alert('Error', 'There was a problem sharing your thought. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        tagline="Share what's on your mind"
        headerBgColor="black"
        headerTextColor="white"
        taglineFontSize={20}
        showLogo={false}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={[styles.content, { paddingHorizontal: 20 }]}>
          <Text style={[styles.label, { color: colors.text }]}>What's on your mind?</Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>Your thought will be shared under your username</Text>

          <ScrollView style={[styles.inputScrollView, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThoughtInput
              value={thoughtText}
              onChangeText={setThoughtText}
              placeholder="Type your thoughts here..."
              placeholderTextColor={colors.placeholder}
              maxLength={500}
              // The `style` prop here is for the ScrollView, not directly for TextInput
              // The TextInput styling is handled within ThoughtInput.js
            />
          </ScrollView>

          <View style={styles.counterContainer}>
            <Text style={[styles.counter, { color: colors.text }]}>{thoughtText.length}/500</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.postButton,
                { backgroundColor: colors.primary },
                (!thoughtText.trim() || isPosting) && styles.disabledButton
              ]}
              onPress={handlePost}
              disabled={!thoughtText.trim() || isPosting}
            >
              {isPosting ? (
                <ActivityIndicator color={colors.card} />
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
    // REMOVED: padding: 20, from here
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingVertical: 20,
    // ADDED: paddingHorizontal: 20, to ensure content below header is padded
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    ...Platform.select({
      web: {
        fontSize: 24,
      },
    }),
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    ...Platform.select({
      web: {
        fontSize: 18,
      },
    }),
  },
  inputScrollView: {
    borderRadius: 8,
    borderWidth: 1,
    // Removed padding here because ThoughtInput handles its own padding
    fontSize: 16, // This applies to the ScrollView, not the TextInput inside
    lineHeight: 24, // This applies to the ScrollView, not the TextInput inside
    marginBottom: 15,
    maxHeight: 200,
    ...Platform.select({
      web: {
        fontSize: 40,
        lineHeight: 40,
      },
    }),
  },
  // The `input` style within PostScreen.js is not applied to `ThoughtInput` directly
  // ThoughtInput handles its own internal TextInput styling.
  // This `input` style block can likely be removed or is vestigial.
  // For now, I'll leave it as is if it's not causing issues, but it's worth noting.
  input: {
    flexGrow: 1,
    textAlignVertical: 'top',
    padding: 0, // ThoughtInput already has padding
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