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
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between', // Distribute space
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 20,
  },
  inputScrollView: {
    flexGrow: 1, // Allow scrolling area to grow
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#212121',
    marginBottom: 8, // Space between input and counter
    maxHeight: 200, // Optional: Limit initial height
  },
  counterContainer: {
    alignItems: 'flex-end',
    marginBottom: 20, // Space between counter and button
  },
  counter: {
    fontSize: 12,
    color: '#757575',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  postButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#b39ddb',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PostScreen;