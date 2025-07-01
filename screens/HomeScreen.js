// screens/HomeScreen.js (Option A: Displaying ONLY 'posts')
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert 
} 
from 'react-native';
import Header from '../components/Header';
import { db } from '../firebaseConfig'; // Your Firestore instance
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedPosts = [];
      querySnapshot.forEach((doc) => {
        fetchedPosts.push({ id: doc.id, ...doc.data() });
      });
      setPosts(fetchedPosts); // Update state with fetched posts
      setLoading(false);
    }, (error) => {
      console.error('Error fetching posts:', error); //  Updated error message
      setLoading(false);
      Alert.alert('Error', 'Failed to load posts.'); // Display an alert to the user
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading posts...</Text>
      </View>
    );
  }

  // Render a single post item
  const renderItem = ({ item }) => (
    <View style={styles.postItem}>
      <Text style={styles.postAuthor}>
        {item.username ? item.username : item.anonymousId || 'Anonymous'}
      </Text>
      <Text style={styles.postText}>{item.text}</Text>
      {item.createdAt && (
        <Text style={styles.postTimestamp}>
          {new Date(item.createdAt.toDate()).toLocaleString()}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="All Thoughts" /> 
      {posts.length === 0 ? (
        <View style={styles.noPostsContainer}>
          <Text style={styles.noPostsText}>No posts yet. Share your first thought!</Text>
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
    backgroundColor: '#f8f8f8',
  },
  listContentContainer: {
    padding: 20,
  },
  postItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  postText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  postTimestamp: {
    fontSize: 12,
    color: '#999',
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
    color: '#777',
  },
});

export default HomeScreen;