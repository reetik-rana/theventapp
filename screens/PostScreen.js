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
  ScrollView, // Import ScrollView
} from 'react-native';
import ThoughtInput from '../components/ThoughtInput';
import Header from '../components/Header';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../services/firebaseConfig';
import { db } from '../firebaseConfig';

const PostScreen = ({ navigation }) => {
  const [thoughtText, setThoughtText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (thoughtText.trim().length === 0) {
      Alert.alert('Empty thought', 'Please enter some text to share.');
      return;
    }

    setIsPosting(true);

    try {
      // Generate a random animal emoji to use as anonymous identity
      const animalEmojis = ['🐱', '🐶', '🐼', '🦊', '🐸', '🦁', '🐯', '🐨', '🐰', '🦄', '🐻', '🐭', '🦊', '🐮'];
      const randomEmoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];

      await addDoc(collection(db, 'thoughts'), {
        text: thoughtText,
        createdAt: serverTimestamp(),
        anonymousId: randomEmoji,
        likes: 0,
      });

      setThoughtText('');
      setIsPosting(false);
      Alert.alert('Success', 'Your thought has been shared anonymously!');
      navigation.navigate('Home');
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
          <Text style={styles.subtitle}>Your identity will be kept anonymous</Text>

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
                <Text style={styles.postButtonText}>Share Anonymously</Text>
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
    backgroundColor: '#f8f8f8', // Light gray background
    padding: 20,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingVertical: 20, // Add some vertical padding to the content area
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333', // Dark gray text
    marginBottom: 10, // Slightly more margin below the label
    ...Platform.select({
      web: {
        fontSize: 24, // Increase font size for web
      },
    }),
  },
  subtitle: {
    fontSize: 14,
    color: '#777', // Medium gray text
    marginBottom: 20, // More margin below the subtitle
    ...Platform.select({
      web: {
        fontSize: 18, // Increase font size for web
      },
    }),
  },
  inputScrollView: {
    backgroundColor: '#fff', // White background for the input
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd', // Light gray border
    padding: 15,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 15, // Margin below the input area
    maxHeight: 200,
    ...Platform.select({
      web: {
        fontSize: 40, // Increase font size for web
        lineHeight: 40, // Adjust line height for better readability
      },
    }),
  },
  input: {
    flexGrow: 1,
    textAlignVertical: 'top',
    padding: 0, // Remove padding from the TextInput itself as it's in the ScrollView
    fontSize: 16,
    lineHeight: 24,
    ...Platform.select({
      web: {
        fontSize: 40, // Increase font size for web
        lineHeight: 40, // Adjust line height for better readability
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
        fontSize: 20, // Increase font size for web
      },
    }),
  },
  buttonContainer: {
    marginBottom: 20,
  },
  postButton: {
    backgroundColor: '#007bff', // Professional blue
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
        fontSize: 30, // Increase font size for web
      },
    }),
  },
});

export default PostScreen;