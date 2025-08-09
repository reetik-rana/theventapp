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
  Modal, // ADDED: Import Modal
  FlatList, // ADDED: Import FlatList
  ScrollView, // ADDED: Import ScrollView
} from 'react-native';
import ThoughtInput from '../components/ThoughtInput';
import Header from '../components/Header';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { categories } from '../utils/helpers';

const PostScreen = ({ navigation }) => {
  const [thoughtText, setThoughtText] = useState('');
  const [selectedTag, setSelectedTag] = useState(categories[0]);
  const [isPosting, setIsPosting] = useState(false);
  const [showTagList, setShowTagList] = useState(false);
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
        tag: selectedTag,
      });

      setThoughtText('');
      setSelectedTag(categories[0]);
      setIsPosting(false);
      Alert.alert('Success', 'Your thought has been shared!');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error adding thought:', error);
      setIsPosting(false);
      Alert.alert('Error', 'There was a problem sharing your thought. Please try again.');
    }
  };

  const renderTagItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.tagListItem,
        { backgroundColor: item === selectedTag ? colors.primary : colors.card }
      ]}
      onPress={() => {
        setSelectedTag(item);
        setShowTagList(false);
      }}
    >
      <Text style={[styles.tagListText, { color: item === selectedTag ? colors.card : colors.text }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

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

          <View style={styles.tagSection}>
            <Text style={[styles.tagLabel, { color: colors.text }]}>Selected Tag:</Text>
            <TouchableOpacity
              style={[
                styles.selectedTagButton,
                { borderColor: colors.border, backgroundColor: colors.card }
              ]}
              onPress={() => setShowTagList(true)}
            >
              <Text style={[styles.selectedTagText, { color: colors.text }]}>
                {selectedTag || 'Select a tag...'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={[styles.inputScrollView, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThoughtInput
              value={thoughtText}
              onChangeText={setThoughtText}
              placeholder="Type your thoughts here..."
              placeholderTextColor={colors.placeholder}
              maxLength={500}
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

      <Modal
        visible={showTagList}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTagList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select a Tag</Text>
            <FlatList
              data={categories}
              renderItem={renderTagItem}
              keyExtractor={(item) => item}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowTagList(false)}>
              <Text style={[styles.closeButtonText, { color: colors.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  tagSection: {
    marginBottom: 20,
  },
  tagLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  selectedTagButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  selectedTagText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tagListItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tagListText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputScrollView: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 15,
    maxHeight: 200,
    ...Platform.select({
      web: {
        fontSize: 40,
        lineHeight: 40,
      },
    }),
  },
  input: {
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