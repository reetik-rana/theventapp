import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Make sure this path is correct

const PostThoughtScreen = () => {
  const [thoughtText, setThoughtText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePostThought = async () => {
    if (thoughtText.trim() === '') {
      Alert.alert('Warning', 'Please enter your thought before posting.');
      return;
    }

    setIsPosting(true);
    try {
      const docRef = await addDoc(collection(db, 'thoughts'), {
        text: thoughtText,
        createdAt: serverTimestamp(), // Adds a timestamp from the server
      });
      console.log('Thought posted with ID: ', docRef.id);
      setThoughtText(''); // Clear the input after successful post
      Alert.alert('Success', 'Your thought has been posted anonymously!');
    } catch (error) {
      console.error('Error posting thought: ', error);
      Alert.alert('Error', 'There was an issue posting your thought. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share Your Anonymous Thought</Text>
      <ScrollView style={styles.inputScrollView}>
        <TextInput
          style={styles.input}
          placeholder="Type your thought here..."
          placeholderTextColor="#9e9e9e"
          multiline
          value={thoughtText}
          onChangeText={setThoughtText}
          textAlignVertical="top"
          maxLength={500} // You can adjust the max length
        />
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button
          title={isPosting ? 'Posting...' : 'Post Anonymously'}
          onPress={handlePostThought}
          disabled={isPosting}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'space-between', // Distribute space between title, input, and button
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  inputScrollView: {
    flexGrow: 1, // Allow the ScrollView to grow and take available space
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
    maxHeight: 300, // Optional: Add a maximum height if needed
  },
  input: {
    flexGrow: 1, // Allow the TextInput to grow within the ScrollView
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginBottom: 20, // Add some space above the button
  },
});

export default PostThoughtScreen;