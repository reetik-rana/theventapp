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
  Linking,
  Image,
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

// Helper to detect and render URLs as clickable links
const renderTextWithLinks = (text, textStyle) => {
  // Simple URL regex
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

// Helper to get YouTube thumbnail if the link is a YouTube URL
const getYouTubeThumbnail = (url) => {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
};

// Helper to get preview info for supported services
const getLinkPreview = (url) => {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (ytMatch) {
    return {
      type: 'youtube',
      title: 'YouTube Video',
      thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
      brandColor: '#FF0000'
    };
  }
  // Spotify
  if (/open\.spotify\.com/.test(url)) {
    return {
      type: 'spotify',
      title: 'Spotify Link',
      thumbnail: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png',
      brandColor: '#1DB954'
    };
  }
  // Apple Music
  if (/music\.apple\.com/.test(url)) {
    return {
      type: 'applemusic',
      title: 'Apple Music Link',
      thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Apple_Music_logo.png',
      brandColor: '#FA233B'
    };
  }
  // Instagram
  if (/instagram\.com/.test(url)) {
    return {
      type: 'instagram',
      title: 'Instagram Post',
      thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
      brandColor: '#C13584'
    };
  }
  // Facebook
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

// Helper to get Open Graph image for a URL (async)
const fetchOgImage = async (url) => {
  try {
    const response = await fetch(url, { method: 'GET' });
    const html = await response.text();
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"\/?>/i);
    if (ogImageMatch && ogImageMatch[1]) {
      return ogImageMatch[1];
    }
  } catch (e) {
    // Ignore errors, fallback to default
  }
  return null;
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

  // For storing fetched OG images by URL
  const [ogImages, setOgImages] = useState({});

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

  // Prefetch OG images for Spotify links when posts change
  useEffect(() => {
    const fetchAllOgImages = async () => {
      const newOgImages = {};
      for (const post of posts) {
        const firstUrl = extractFirstUrl(post.text);
        const preview = firstUrl ? getLinkPreview(firstUrl) : null;
        if (
          firstUrl &&
          preview &&
          preview.type === 'spotify' &&
          !ogImages[firstUrl]
        ) {
          const img = await fetchOgImage(firstUrl);
          if (img) {
            newOgImages[firstUrl] = img;
          }
        }
      }
      if (Object.keys(newOgImages).length > 0) {
        setOgImages((prev) => ({ ...prev, ...newOgImages }));
      }
    };
    fetchAllOgImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

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

    // Extract first URL for preview
    const firstUrl = extractFirstUrl(item.text);
    const preview = firstUrl ? getLinkPreview(firstUrl) : null;

    // Helper to truncate long URLs for display
    const truncateUrl = (url, maxLength = 40) => {
      if (url.length <= maxLength) return url;
      return url.slice(0, maxLength - 3) + '...';
    };

    // Use OG image for Spotify if available
    let thumbnail = preview ? preview.thumbnail : null;
    if (preview && preview.type === 'spotify' && ogImages[firstUrl]) {
      thumbnail = ogImages[firstUrl];
    }

    // Helper to truncate post text to 2 lines with ellipsis
    const renderTruncatedText = (text, textStyle) => (
      <Text
        style={[textStyle, { color: colors.text }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {text}
      </Text>
    );

    return (
      <View
        style={[
          styles.postItem,
          isWeb && styles.webPostItem, // Apply web-specific style
          { backgroundColor: colors.card, borderColor: colors.border }
        ]}
      >
        <View style={styles.postHeader}>
          {/* Username clickable */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ViewUserProfile', { userId: item.userId })}
          >
            <Text style={[styles.postAuthor, { color: colors.primary }]}>
              {item.username}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.postAuthor, { color: colors.primary, marginLeft: 4 }]}>
            {item.anonymousId}
          </Text>
          {item.tag && (
            <View style={[styles.tagContainer, { borderColor: colors.primary }]}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{item.tag}</Text>
            </View>
          )}
        </View>
        {renderTruncatedText(item.text, styles.postText)}
        {/* Render preview for supported services */}
        {firstUrl && preview && (
          <TouchableOpacity
            onPress={() => Linking.openURL(firstUrl)}
            style={{ marginTop: 8, alignSelf: 'stretch' }}
            activeOpacity={0.85}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isWeb ? '#222' : colors.background,
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
                source={{ uri: thumbnail }}
                style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12, backgroundColor: '#fff' }}
                resizeMode="cover"
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
        )}
        {/* If not supported, just show the link */}
        {firstUrl && !preview && (
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
        )}
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
        {/* Make the post details navigation button explicit */}
        <TouchableOpacity
          style={{ marginTop: 8, alignSelf: 'flex-start' }}
          onPress={() => navigation.navigate('PostDetails', { postId: item.id })}
        >
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>View Full</Text>
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

  const filteredPosts = posts.filter(post => selectedCategory === 'All' || post.tag === selectedCategory);
  const searchedPosts = filteredPosts.filter(post =>
    post.text.toLowerCase().includes(searchText.toLowerCase()) ||
    post.username.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ height: 8 }} />
      <Header
        tagline="We listen and We don't judge"
        headerBgColor="black"
        headerTextColor="white"
        taglineFontSize={20}
        showLogo={false}
        centerTagline={true}
      />
      <View style={{ height: 10 }} />
      {/* Tighter row for filter and search */}
      <View style={[styles.topBarContainer, isWeb && styles.webTopBarContainer]}>
        <View style={[
          styles.filterContainer,
          { borderColor: colors.border, flex: 0.55, marginBottom: 0 },
          isWeb && styles.webFilterContainer
        ]}>
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
        <View style={[
          styles.searchContainer,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
            flex: 0.45,
            margin: 0,
            marginLeft: 0,
          },
          isWeb && styles.webSearchContainer
        ]}>
          <Ionicons name="search" size={20} color={colors.placeholder} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search thoughts or username..."
            placeholderTextColor={colors.placeholder}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>
      <View style={[isWeb && styles.webContentWrapper, !isWeb && styles.contentWrapper]}>
        <FlatList
          data={searchedPosts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={isWeb ? styles.webListContentContainer : styles.listContentContainer}
        />
      </View>
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
  webContentWrapper: {
    flex: 1,
    alignItems: 'center',
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: '#111',
    paddingTop: 24,
    paddingBottom: 24,
  },
  listContentContainer: {
    padding: 20,
  },
  webListContentContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 32,
    minHeight: '80vh',
  },
  postItem: Platform.select({
    web: {
      borderRadius: 12,
      padding: 20,
      margin: 0,
      width: 340,
      minHeight: 180,
      maxWidth: 340,
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      borderWidth: 1,
      borderColor: '#222',
      backgroundColor: '#181818',
      transition: 'box-shadow 0.2s',
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
  webPostItem: {
    margin: 0,
    marginBottom: 0,
    marginRight: 0,
    marginLeft: 0,
    backgroundColor: '#181818',
    borderColor: '#222',
    boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
    transition: 'box-shadow 0.2s',
    cursor: 'default',
  },
  topBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 0,
    gap: 0,
  },
  webTopBarContainer: {
    maxWidth: 1100,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 24,
    marginBottom: 24,
    paddingHorizontal: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  webFilterContainer: {
    backgroundColor: '#181818',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    padding: 12,
    minWidth: 220,
    marginRight: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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
    paddingHorizontal: 10,
    margin: 0,
    marginLeft: 0,
    height: 44,
    backgroundColor: '#fff',
  },
  webSearchContainer: {
    backgroundColor: '#222',
    borderColor: '#333',
    color: '#fff',
    borderRadius: 8,
    minWidth: 340,
    maxWidth: 420,
    width: '100%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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