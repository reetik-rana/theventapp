// screens/PostDetailsScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
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
  getDocs,
} from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// This recursive function fetches all replies and their nested replies
const fetchRepliesRecursively = async (collectionRef) => {
  const q = query(collectionRef, orderBy('createdAt', 'asc'));
  const querySnapshot = await getDocs(q);
  const replies = [];

  for (const docSnapshot of querySnapshot.docs) {
    const replyData = { id: docSnapshot.id, ...docSnapshot.data() };
    const nestedRepliesRef = collection(docSnapshot.ref, 'replies');
    replyData.replies = await fetchRepliesRecursively(nestedRepliesRef);
    replies.push(replyData);
  }

  return replies;
};

const ReplyItem = ({ item, level, postId, onReplyPress }) => {
  const { colors } = useTheme();
  const marginLeft = level * 20;

  return (
    <View style={[styles.replyItemContainer, { marginLeft: marginLeft, borderLeftColor: colors.border }]}>
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
        <TouchableOpacity onPress={() => onReplyPress(item)} style={styles.nestedReplyButton}>
            <Text style={[styles.nestedReplyButtonText, { color: colors.secondary }]}>Reply</Text>
        </TouchableOpacity>
      </View>
      {/* Recursively render nested replies */}
      {item.replies && item.replies.map(reply => (
        <ReplyItem key={reply.id} item={reply} level={level + 1} postId={postId} onReplyPress={onReplyPress} />
      ))}
    </View>
  );
};

const PostDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;

  const { colors } = useTheme();
  const { currentUser, appUser } = useAuth();
  const insets = useSafeAreaInsets();

  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [parentReply, setParentReply] = useState(null);

  useEffect(() => {
    if (!postId) {
      console.error("No postId provided to PostDetailsScreen");
      setLoading(false);
      Alert.alert("Error", "Could not load post details.");
      navigation.goBack();
      return;
    }

    const postDocRef = doc(db, 'posts', postId);
    
    // Create an onSnapshot listener for the post data
    const unsubscribePost = onSnapshot(postDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setPost({ id: docSnapshot.id, ...docSnapshot.data() });
      } else {
        console.warn("Post does not exist:", postId);
        setPost(null);
        Alert.alert("Error", "The post you are trying to view does not exist.");
        navigation.goBack();
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching post:", error);
      Alert.alert("Error", "Failed to load post details.");
      setLoading(false);
    });

    // Create a new listener to fetch replies recursively
    const repliesCollectionRef = collection(db, 'posts', postId, 'replies');
    const unsubscribeReplies = onSnapshot(repliesCollectionRef, async () => {
      try {
        const fetchedReplies = await fetchRepliesRecursively(repliesCollectionRef);
        setReplies(fetchedReplies);
      } catch (error) {
        console.error("Error fetching replies:", error);
        Alert.alert("Error", "Failed to load replies.");
      }
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
      // Logic to add a nested reply to a comment or a top-level reply to a post
      const repliesCollectionRef = parentReply
        ? collection(db, 'posts', postId, 'replies', parentReply.id, 'replies')
        : collection(db, 'posts', postId, 'replies');

      await addDoc(repliesCollectionRef, {
        userId: currentUser.uid,
        username: appUser.username || appUser.anonymousId || 'Anonymous',
        text: replyText.trim(),
        createdAt: serverTimestamp(),
      });
      setReplyText('');
      setParentReply(null); // Clear parent reply
      
      // NEW: Add a notification to the original post author
      if (post && post.userId !== currentUser.uid) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: post.userId,
          type: 'reply',
          postId: postId,
          postText: post.text.substring(0, 50) + '...', // Truncate for notification
          senderUsername: appUser.username || 'Anonymous',
          read: false,
          createdAt: serverTimestamp(),
        });
      }
      
    } catch (error) {
      console.error('Error adding reply:', error);
      Alert.alert('Error', 'Failed to add reply.');
    } finally {
      setIsReplying(false);
    }
  };

  const handleReplyPress = (reply) => {
    setParentReply(reply);
    // You can also focus the text input here
  };

  const renderReplyItem = ({ item }) => {
    return <ReplyItem item={item} level={0} postId={postId} onReplyPress={handleReplyPress} />;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.noPostContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.noPostsText, { color: colors.text }]}>Post not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={{color: colors.primary}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: 'black' }]}>
        <Text style={[styles.headerTitle, { color: 'white' }]}>Post Details</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonHeader}>
            <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ 
          ios: 90,
          android: 20 
        })}
        enabled={true}
      >
        <FlatList
          style={styles.flatListStyle}
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {currentUser && (
          <View style={[styles.replyInputContainer, { 
            backgroundColor: colors.card, 
            borderTopColor: colors.border,
            paddingBottom: insets.bottom || 10
          }]}>
            <TextInput
              style={[styles.replyTextInput, { 
                color: colors.text, 
                borderColor: colors.border,
                backgroundColor: colors.background
              }]}
              placeholder={parentReply ? `Replying to ${parentReply.username}` : "Write a reply..."}
              placeholderTextColor={colors.placeholder}
              multiline
              value={replyText}
              onChangeText={setReplyText}
              editable={!isReplying}
              textAlignVertical="top"
            />
            {parentReply && (
              <TouchableOpacity onPress={() => setParentReply(null)} style={styles.cancelReplyButton}>
                <Ionicons name="close-circle" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.replyButton, 
                { 
                  backgroundColor: replyText.trim() && !isReplying ? colors.primary : colors.border 
                }
              ]}
              onPress={handleAddReply}
              disabled={isReplying || !replyText.trim()}
            >
              <Text style={[
                styles.replyButtonText,
                { color: replyText.trim() && !isReplying ? 'white' : colors.placeholder }
              ]}>
                {isReplying ? 'Replying...' : 'Reply'}
              </Text>
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
  flatListStyle: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 25,
    paddingHorizontal: 15,
    borderBottomWidth: 0,
    borderBottomColor: '#333',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButtonHeader: {
    position: 'absolute',
    left: 30,
    top: 28,
    zIndex: 1,
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
  replyItemContainer: {
    paddingVertical: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#E0E0E0',
    paddingLeft: 10,
    marginBottom: 8,
  },
  replyItem: {
    borderRadius: 8,
    padding: 10,
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
    alignItems: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    gap: 10,
    position: 'relative',
  },
  replyTextInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  replyButton: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  replyButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  noPostContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPostsText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'gray',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  tagContainer: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  nestedReplyButton: {
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  nestedReplyButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cancelReplyButton: {
    position: 'absolute',
    top: -10,
    right: 15,
    zIndex: 1,
  },
});

export default PostDetailsScreen;