// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import Header from '../components/Header';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedPosts = [];
      querySnapshot.forEach((doc) => {
        fetchedPosts.push({ id: doc.id, ...doc.data() });
      });
      setPosts(fetchedPosts);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load posts.');
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Loading posts...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={[styles.postItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.postAuthor, { color: colors.primary }]}>
        {item.username ? item.username : item.anonymousId || 'Anonymous'}
      </Text>
      <Text style={[styles.postText, { color: colors.text }]}>{item.text}</Text>
      {item.createdAt && (
        <Text style={[styles.postTimestamp, { color: colors.placeholder }]}>
          {new Date(item.createdAt.toDate()).toLocaleString()}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header tagline="We listen and We don't judge" />
      {posts.length === 0 ? (
        <View style={styles.noPostsContainer}>
          <Text style={[styles.noPostsText, { color: colors.text }]}>No posts yet. Share your first thought!</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
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
  listContentContainer: {
    padding: 20,
  },
  postItem: {
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
  postAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postText: {
    fontSize: 16,
    lineHeight: 24,
  },
  postTimestamp: {
    fontSize: 12,
    marginTop: 10,
    textAlign: 'right',
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