// screens/PostDetailsScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import PostDetailsSkeleton from '../components/PostDetailsSkeleton';

const PostDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { postId } = route.params;
  const { colors } = useTheme();
  const { currentUser, appUser } = useAuth();

  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    setLoading(true);

    if (!postId) {
      console.error("No postId provided to PostDetailsScreen");
      setLoading(false);
      Alert.alert("Error", "Could not load post details.");
      navigation.goBack();
      return;
    }

    const postDocRef = doc(db, 'posts', postId);
    const repliesCollectionRef = collection(db, 'posts', postId, 'replies');
    const qReplies = query(repliesCollectionRef, orderBy('createdAt', 'asc'));

    const unsubscribePost = onSnapshot(postDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setPost({ id: docSnapshot.id, ...docSnapshot.data() });
      } else {
        console.warn("Post does not exist:", postId);
        setPost(null);
        Alert.alert("Error", "The post you are trying to view does not exist.");
        navigation.goBack();
      }
    }, (error) => {
      console.error("Error fetching post:", error);
      Alert.alert("Error", "Failed to load post details.");
      setPost(null);
    });

    const unsubscribeReplies = onSnapshot(qReplies, (querySnapshot) => {
      const fetchedReplies = [];
      querySnapshot.forEach((doc) => {
        fetchedReplies.push({ id: doc.id, ...doc.data() });
      });
      setReplies(fetchedReplies);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching replies:", error);
      Alert.alert("Error", "Failed to load replies.");
      setLoading(false);
    });

    return () => {
      unsubscribePost();
      unsubscribeReplies();
    };
  }, [postId, navigation]);

  const handleAddReply = async () => {
    if (!currentUser || !appUser) {
      Alert.alert('Login Required', 'You must be logged in to reply.');
      return;
    }
    if (!replyText.trim()) {
      Alert.alert('Empty Reply', 'Please type your reply.');
      return;
    }
    if (isReplying) return;

    setIsReplying(true);

    try {
      const repliesCollectionRef = collection(db, 'posts', postId, 'replies');
      await addDoc(repliesCollectionRef, {
        userId: currentUser.uid,
        username: appUser.username || appUser.anonymousId || 'Anonymous',
        text: replyText.trim(),
        createdAt: serverTimestamp(),
      });
      setReplyText('');
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert('Error', 'Failed to add reply.');
    } finally {
      setIsReplying(false);
    }
  };

  const renderReplyItem = ({ item }) => (
    <View style={[styles.replyItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.replyAuthor, { color: colors.primary }]}>
        {item.username}
      </Text>
      <Text style={[styles.replyText, { color: colors.text }]}>{item.text}</Text>
      {item.createdAt && (
        <Text style={[styles.replyTimestamp, { color: colors.placeholder }]}>
          {new Date(item.createdAt.toDate()).toLocaleString()}
        </Text>
      )}
    </View>
  );

  if (loading || !post) {
    return <PostDetailsSkeleton />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* NEW HEADER SECTION
        We've replaced the old header with a custom view
        to control the positioning of the back button and the title.
      */}
      <View style={[styles.customHeader, { backgroundColor: 'black' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backButtonIcon, { color: 'white' }]}>
            &#x2190;
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: 'white' }]}>
          Post Details
        </Text>
      </View>
      {/* END NEW HEADER SECTION */}

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ListHeaderComponent={() => (
            <View style={[styles.postDetailItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.postDetailAuthor, { color: colors.primary }]}>
                {post.username} {post.anonymousId}
              </Text>
              <Text style={[styles.postDetailText, { color: colors.text }]}>{post.text}</Text>
              {post.createdAt && (
                <Text style={[styles.postDetailTimestamp, { color: colors.placeholder }]}>
                  {new Date(post.createdAt.toDate()).toLocaleString()}
                </Text>
              )}
              <Text style={[styles.repliesHeader, { color: colors.text }]}>Replies ({replies.length})</Text>
            </View>
          )}
          data={replies}
          renderItem={renderReplyItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.repliesListContent}
        />

        {currentUser && (
          <View style={[styles.replyInputContainer, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.replyTextInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Write a reply..."
              placeholderTextColor={colors.placeholder}
              multiline
              value={replyText}
              onChangeText={setReplyText}
              editable={!isReplying}
            />
            <TouchableOpacity
              style={[styles.replyButton, { backgroundColor: colors.primary }]}
              onPress={handleAddReply}
              disabled={isReplying || !replyText.trim()}
            >
              <Text style={styles.replyButtonText}>{isReplying ? 'Replying...' : 'Reply'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  // NEW STYLES for the custom header
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // We've changed the positioning of the back button
  backButton: {
    position: 'absolute',
    left: 5,
    top: 30,
    padding: 30,
  },
  backButtonIcon: {
    fontSize: 30,
  },
  postDetailItem: {
    borderRadius: 8,
    padding: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderWidth: 1,
  },
  postDetailAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postDetailText: {
    fontSize: 18,
    lineHeight: 26,
  },
  postDetailTimestamp: {
    fontSize: 12,
    marginTop: 10,
    textAlign: 'right',
  },
  repliesHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  repliesListContent: {
    paddingBottom: 20,
  },
  replyItem: {
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 15,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    borderWidth: 1,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  replyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  replyTimestamp: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'right',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  replyTextInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    minHeight: 40,
    maxHeight: 100,
  },
  replyButton: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noPostContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPostText: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default PostDetailsScreen;