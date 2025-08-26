// screens/UserPostsScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Header from '../components/Header';
import { db } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const UserPostsScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const { currentUser } = useAuth();
  const navigation = useNavigation();

  const [postActivityStatus, setPostActivityStatus] = useState({});

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'posts'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchedPosts = [];
      const newPostActivityStatus = {};

      const promises = querySnapshot.docs.map(async (docSnapshot) => {
        const postData = { id: docSnapshot.id, ...docSnapshot.data() };
        fetchedPosts.push(postData);

        const likesRef = collection(db, 'posts', postData.id, 'likes');
        const likesSnapshot = await getDocs(likesRef);
        const likeCount = likesSnapshot.size;
        const isLiked = likesSnapshot.docs.some(doc => doc.id === currentUser.uid);

        const repliesRef = collection(db, 'posts', postData.id, 'replies');
        const repliesSnapshot = await getDocs(repliesRef);
        const replyCount = repliesSnapshot.size;

        newPostActivityStatus[postData.id] = { isLiked, likeCount, replyCount };
      });

      await Promise.all(promises);

      setPosts(fetchedPosts);
      setPostActivityStatus(newPostActivityStatus);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching user posts:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load your posts.');
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleDeletePost = (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'posts', postId));
              Alert.alert('Success', 'Post deleted successfully!');
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post.');
            }
          },
        },
      ]
    );
  };

  const handleLike = async (postId, postUserId) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'You must be logged in to like a thought.');
      return;
    }
    if (currentUser.uid === postUserId) {
      Alert.alert('Action Not Allowed', 'You cannot like your own thought.');
      return;
    }

    const likeDocRef = doc(db, 'posts', postId, 'likes', currentUser.uid);

    try {
      setPostActivityStatus(prevStatus => ({
        ...prevStatus,
        [postId]: {
          ...prevStatus[postId],
          isLiked: true,
          likeCount: (prevStatus[postId]?.likeCount || 0) + 1,
        }
      }));

      await setDoc(likeDocRef, { timestamp: new Date() });

    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post.');
      setPostActivityStatus(prevStatus => ({
        ...prevStatus,
        [postId]: {
          ...prevStatus[postId],
          isLiked: false,
          likeCount: (prevStatus[postId]?.likeCount || 0) - 1,
        }
      }));
    }
  };

  const handleUnlike = async (postId) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'You must be logged in to unlike a thought.');
      return;
    }

    const likeDocRef = doc(db, 'posts', postId, 'likes', currentUser.uid);

    try {
      setPostActivityStatus(prevStatus => ({
        ...prevStatus,
        [postId]: {
          ...prevStatus[postId],
          isLiked: false,
          likeCount: (prevStatus[postId]?.likeCount || 0) - 1,
        }
      }));

      await deleteDoc(likeDocRef);

    } catch (error) {
      console.error('Error unliking post:', error);
      Alert.alert('Error', 'Failed to unlike post.');
      setPostActivityStatus(prevStatus => ({
        ...prevStatus,
        [postId]: {
          ...prevStatus[postId],
          isLiked: true,
          likeCount: (prevStatus[postId]?.likeCount || 0) + 1,
        }
      }));
    }
  };

  const renderItem = ({ item }) => {
    const activityStatus = postActivityStatus[item.id] || { isLiked: false, likeCount: 0, replyCount: 0 };
    const hasLiked = activityStatus.isLiked;
    const likeCount = activityStatus.likeCount;
    const replyCount = activityStatus.replyCount;

    const buttonDisabled = !currentUser || currentUser.uid === item.userId;

    return (
      <View style={[styles.postItemWrapper, { borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.postItem, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.postHeader}>
            <Text style={[styles.postAuthor, { color: colors.primary }]}>
              {item.username} {item.anonymousId}
            </Text>
            {item.tag && (
              <View style={[styles.tagContainer, { borderColor: colors.primary }]}>
                <Text style={[styles.tagText, { color: colors.primary }]}>{item.tag}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.postText, { color: colors.text }]}>{item.text}</Text>

          <View style={styles.postFooter}>
            {item.createdAt && (
              <Text style={[styles.postTimestamp, { color: colors.placeholder }]}>
                {new Date(item.createdAt.toDate()).toLocaleString()}
              </Text>
            )}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                onPress={(event) => {
                  event.stopPropagation();
                  if (hasLiked) {
                    handleUnlike(item.id);
                  } else {
                    handleLike(item.id, item.userId);
                  }
                }}
                style={styles.actionButton}
                disabled={buttonDisabled}
              >
                <Text style={[styles.actionButtonText, { color: hasLiked ? 'red' : colors.text }]}>
                  ❤️ {likeCount}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={(event) => {
                  event.stopPropagation();
                  navigation.navigate('PostDetails', { postId: item.id });
                }}
                style={styles.actionButton}
                disabled={false}
              >
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  💬 {replyCount}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePost(item.id)}>
          <Ionicons name="trash-outline" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        tagline="Your Posts"
        headerBgColor="black"
        headerTextColor="white"
        taglineFontSize={20}
        showLogo={false}
        centerTagline={true}
      />
      {posts.length === 0 ? (
        <View style={styles.noPostsContainer}>
          <Text style={[styles.noPostsText, { color: colors.text }]}>You haven't shared any thoughts yet.</Text>
        </View>
      ) : (
        <View style={styles.contentWrapper}>
          <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContentContainer}
            numColumns={Platform.OS === 'web' ? 3 : 1}
          />
        </View>
      )}
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
  contentWrapper: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1000,
  },
  listContentContainer: {
    padding: 20,
  },
  postItemWrapper: {
    position: 'relative',
    margin: 10,
    width: 300,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  postItem: {
    padding: 15,
    backgroundColor: 'white',
    width: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
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
  postAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  postText: {
    fontSize: 16,
    lineHeight: 24,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  postTimestamp: {
    fontSize: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginLeft: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPostsText: {
    fontSize: 18,
  },
});

export default UserPostsScreen;