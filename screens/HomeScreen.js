// screens/HomeScreen.js
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
  ScrollView,
  Modal,
  Dimensions,
  TextInput,
} from 'react-native';
import Header from '../components/Header';
import { db } from '../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { categories } from '../utils/helpers';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const numColumns = isWeb ? 3 : 2;

// Recursively count all replies and their nested replies
const countRepliesRecursively = async (repliesRef) => {
  let count = 0;
  const snapshot = await getDocs(repliesRef);
  count += snapshot.size;
  for (const docSnap of snapshot.docs) {
    const nestedRepliesRef = collection(docSnap.ref, 'replies');
    count += await countRepliesRecursively(nestedRepliesRef);
  }
  return count;
};

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors, isDarkMode } = useTheme();
  const { currentUser } = useAuth();
  const navigation = useNavigation();

  const [postActivityStatus, setPostActivityStatus] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchedPosts = [];
      const newPostActivityStatus = {};

      const promises = querySnapshot.docs.map(async (docSnapshot) => {
        const postData = { id: docSnapshot.id, ...docSnapshot.data() };
        fetchedPosts.push(postData);

        const likesRef = collection(db, 'posts', postData.id, 'likes');
        const likesSnapshot = await getDocs(likesRef);
        const likeCount = likesSnapshot.size;
        const isLiked = currentUser ? likesSnapshot.docs.some(doc => doc.id === currentUser.uid) : false;

        // Use recursive count for replies
        const repliesRef = collection(db, 'posts', postData.id, 'replies');
        const replyCount = await countRepliesRecursively(repliesRef);

        newPostActivityStatus[postData.id] = { isLiked, likeCount, replyCount };
      });

      await Promise.all(promises);

      setPosts(fetchedPosts);
      setPostActivityStatus(newPostActivityStatus);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load posts.');
    });

    return () => unsubscribe();
  }, [currentUser]);

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

      await setDoc(likeDocRef, {
        timestamp: new Date(),
      });

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

    if (selectedCategory !== 'All' && item.tag !== selectedCategory) {
      return null;
    }
    
    // Search logic to conditionally render items
    const searchTextLower = searchText.toLowerCase();
    const postTextLower = item.text.toLowerCase();
    const postAuthorLower = item.username.toLowerCase(); // NEW: Get username in lowercase
    if (searchText && !postTextLower.includes(searchTextLower) && !postAuthorLower.includes(searchTextLower)) { // NEW: Check against username
      return null;
    }

    return (
      <TouchableOpacity
        style={[styles.postItem, { backgroundColor: colors.card, borderColor: colors.border }]}
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

  const filteredPosts = posts.filter(post => selectedCategory === 'All' || post.tag === selectedCategory);
  const searchedPosts = filteredPosts.filter(post =>
    post.text.toLowerCase().includes(searchText.toLowerCase()) ||
    post.username.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        tagline="We listen and We don't judge"
        headerBgColor="black"
        headerTextColor="white"
        taglineFontSize={20}
        showLogo={false}
        centerTagline={true}
      />
      <View style={[styles.filterContainer, { borderColor: colors.border }]}>
        <Text style={[styles.filterLabel, { color: colors.text }]}>Filter by:</Text>
        <TouchableOpacity
          style={[styles.filterButton, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={[styles.filterButtonText, { color: colors.text }]}>
            {selectedCategory}
          </Text>
          <Ionicons name="caret-down" size={16} color={colors.text} style={styles.dropdownIcon} />
        </TouchableOpacity>
      </View>
      <View style={[styles.searchContainer, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search thoughts or username..."
          placeholderTextColor={colors.placeholder}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {searchedPosts.length === 0 ? (
        <View style={styles.noPostsContainer}>
          <Text style={[styles.noPostsText, { color: colors.text }]}>No posts found.</Text>
        </View>
      ) : (
        <View style={styles.contentWrapper}>
            <FlatList
              data={searchedPosts}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContentContainer}
            />
        </View>
      )}

      {/* Category Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCategoryModal}
        onRequestClose={() => {
          setShowCategoryModal(!showCategoryModal);
        }}
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
  contentWrapper: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1000,
  },
  listContentContainer: {
    padding: 20,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  filterLabel: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: 'bold',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    marginRight: 5,
  },
  dropdownIcon: {
    marginLeft: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    margin: 20,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
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
  modalItem: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  modalItemText: {
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postItem: Platform.select({
    web: {
      borderRadius: 8,
      padding: 15,
      margin: 10,
      width: 300,
      height: 200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
      borderWidth: 1,
    },
    default: {
      borderRadius: 8,
      padding: 15,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.41,
      elevation: 2,
      borderWidth: 1,
    },
  }),
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

export default HomeScreen;