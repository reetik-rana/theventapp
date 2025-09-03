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
  Alert,
  Modal,
  Linking,
  Image
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import {
  doc,
  collection,
  query,
  where,
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
import { categories } from '../utils/helpers';

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

// Function to get a user's UID by their username
const getUserIdByUsername = async (username) => {
  if (!username) return null;
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return userDoc.id;
  }
  return null;
};

// Recursive Reply Item Component
const ReplyItem = ({ item, level, postId, onReplyPress }) => {
  const { colors } = useTheme();
  const marginLeft = level > 0 ? level * 10 + 10 : 0;

  // Highlight tagged users in the text
  const renderTextWithTags = () => {
    if (!item.text) return null;
    const parts = item.text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <Text key={index} style={{ color: colors.secondary, fontWeight: 'bold' }}>
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  return (
    <View style={[styles.replyItemContainer, { marginLeft: marginLeft, borderLeftColor: colors.border }]}>
      <View style={[styles.replyItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.replyAuthor, { color: colors.primary }]}>
          {item.username}
        </Text>
        <Text style={[styles.replyText, { color: colors.text }]}>
          {renderTextWithTags()}
        </Text>
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

// Helper to detect and render URLs as clickable links
const renderTextWithLinks = (text, textStyle) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, idx) => {
    if (urlRegex.test(part)) {
      return (
        <Text
          key={idx}
          style={[textStyle, { color: '#1e90ff', textDecorationLine: 'underline' }]}
          onPress={() => Linking.openURL(part)}
        >
          {part}
        </Text>
      );
    }
    return <Text key={idx} style={textStyle}>{part}</Text>;
  });
};

// Helper to extract the first URL from text
const extractFirstUrl = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
};

// Helper to get preview info for supported services
const getLinkPreview = (url) => {
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) {
    return {
      type: 'youtube',
      title: 'YouTube Video',
      thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
      brandColor: '#FF0000'
    };
  }
  if (/open\.spotify\.com/.test(url)) {
    return {
      type: 'spotify',
      title: 'Spotify Link',
      thumbnail: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png',
      brandColor: '#1DB954'
    };
  }
  if (/music\.apple\.com/.test(url)) {
    return {
      type: 'applemusic',
      title: 'Apple Music Link',
      thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Apple_Music_logo.png',
      brandColor: '#FA233B'
    };
  }
  if (/instagram\.com/.test(url)) {
    return {
      type: 'instagram',
      title: 'Instagram Post',
      thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
      brandColor: '#C13584'
    };
  }
  if (/facebook\.com/.test(url)) {
    return {
      type: 'facebook',
      title: 'Facebook Post',
      thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
      brandColor: '#1877F3'
    };
  }
  return null;
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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

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
      const repliesCollectionRef = parentReply
        ? collection(db, 'posts', postId, 'replies', parentReply.id, 'replies')
        : collection(db, 'posts', postId, 'replies');

      const taggedUsernames = replyText.match(/@(\w+)/g) || [];
      const taggedUserIds = [];

      for (const tag of taggedUsernames) {
        const username = tag.substring(1); // Remove the @
        const userId = await getUserIdByUsername(username);
        if (userId && userId !== currentUser.uid) { // Check to make sure user isn't tagging themselves
          taggedUserIds.push(userId);
        }
      }

      await addDoc(repliesCollectionRef, {
        userId: currentUser.uid,
        username: appUser.username || appUser.anonymousId || 'Anonymous',
        text: replyText.trim(),
        createdAt: serverTimestamp(),
        taggedUsers: taggedUserIds,
      });
      setReplyText('');
      setParentReply(null);

      // Immediately refetch replies so UI updates without waiting for Firestore listener
      const repliesCollectionTopLevel = collection(db, 'posts', postId, 'replies');
      const fetchedReplies = await fetchRepliesRecursively(repliesCollectionTopLevel);
      setReplies(fetchedReplies);

      // Add a notification to the original post author
      if (post && post.userId !== currentUser.uid) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: post.userId,
          type: 'reply',
          postId: postId,
          postText: post.text.substring(0, 50) + '...',
          senderUsername: appUser.username || 'Anonymous',
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      // Add notifications to tagged users
      for (const taggedUserId of taggedUserIds) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: taggedUserId,
          type: 'mention',
          postId: postId,
          postText: replyText.substring(0, 50) + '...',
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
  };

  const renderReplyItem = ({ item }) => {
    return <ReplyItem item={item} level={0} postId={postId} onReplyPress={handleReplyPress} />;
  };

  // Helper to truncate long URLs for display
  const truncateUrl = (url, maxLength = 40) => {
    if (!url) return '';
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength - 3) + '...';
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
      {/* header that respects safe-area insets */}
      <View style={[styles.header, { backgroundColor: 'black', paddingTop: (insets.top || 12) + 6, paddingBottom: 12 }]}>
        <Text style={[styles.headerTitle, { color: 'white' }]}>Post Details</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButtonHeader, { top: (insets.top || 12) + 6 }]}
        >
            <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ 
          ios: 90,
          android: 20 
        })}
        enabled={true}
      >
        <View style={{ flex: 1 }}>
          <FlatList
            style={{ flex: 1 }}
            ListHeaderComponent={() => (
              <View style={[styles.postDetailItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.postDetailAuthor, { color: colors.primary }]}>
                  {post.username} {post.anonymousId}
                </Text>
                {/* Render text with clickable links */}
                <Text style={[styles.postDetailText, { color: colors.text }]}>
                  {renderTextWithLinks(post.text, [styles.postDetailText, { color: colors.text }])}
                </Text>
                {/* Render preview for supported services */}
                {(() => {
                  const firstUrl = extractFirstUrl(post.text);
                  const preview = firstUrl ? getLinkPreview(firstUrl) : null;
                  if (firstUrl && preview) {
                    return (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(firstUrl)}
                        style={{ marginTop: 8, alignSelf: 'stretch' }}
                        activeOpacity={0.85}
                      >
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: colors.background,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: colors.border,
                          padding: 8,
                          marginHorizontal: 0,
                          maxWidth: '100%',
                          overflow: 'hidden',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.08,
                          shadowRadius: 2,
                          elevation: 1,
                        }}>
                          <Image
                            source={{ uri: preview.thumbnail }}
                            style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12, backgroundColor: '#fff' }}
                            resizeMode="contain"
                          />
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 15, marginBottom: 2 }}>
                              {preview.title}
                            </Text>
                            <Text
                              style={{
                                color: colors.placeholder,
                                fontSize: 12,
                                textDecorationLine: 'underline',
                                maxWidth: '100%',
                              }}
                              numberOfLines={1}
                              ellipsizeMode="middle"
                            >
                              {truncateUrl(firstUrl)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  }
                  if (firstUrl && !preview) {
                    return (
                      <TouchableOpacity onPress={() => Linking.openURL(firstUrl)} style={{ marginTop: 8 }}>
                        <Text
                          style={{
                            color: '#1e90ff',
                            textDecorationLine: 'underline',
                            fontSize: 13,
                            maxWidth: '100%',
                          }}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {truncateUrl(firstUrl)}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                  return null;
                })()}
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
            contentContainerStyle={[styles.repliesListContent, { flexGrow: 1 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />

          {currentUser && (
            <View style={[
              styles.replyInputContainer, 
              { 
                backgroundColor: colors.card, 
                borderTopColor: colors.border,
                paddingBottom: insets.bottom || 10
              }
            ]}>
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
        </View>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select a Category</Text>
            <FlatList
              data={['All', ...categories]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    { borderBottomColor: colors.border }
                  ]}
                  onPress={() => {
                    setSelectedCategory(item);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: colors.text }]}>
                    {item}
                  </Text>
                  {selectedCategory === item && (
                    <Ionicons name="checkmark" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity onPress={() => setShowCategoryModal(false)} style={styles.modalCloseButton}>
              <Text style={[styles.modalCloseButtonText, { color: colors.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    flex: 1,
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PostDetailsScreen;