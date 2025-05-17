import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  Text,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity, // Import TouchableOpacity for the "Post a Thought" button
} from 'react-native';
import ThoughtCard from '../components/ThoughtCard';
import Header from '../components/Header';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
// import { db } from '../services/firebaseConfig';
import { db } from '../firebaseConfig';
import PostThoughtScreen from '../components/PostThoughtScreen'; // Import the PostThoughtScreen

const HomeScreen = () => {
  const [thoughts, setThoughts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPostingNewThought, setIsPostingNewThought] = useState(false); // State to control visibility of PostThoughtScreen

  const fetchThoughts = async () => {
    setRefreshing(true);
    try {
      const thoughtsQuery = query(
        collection(db, 'thoughts'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(thoughtsQuery);
      const thoughtsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setThoughts(thoughtsList);
      setLoading(false);
      setRefreshing(false);
      setIsPostingNewThought(false); // Hide the post screen after refresh (if it was visible)
    } catch (error) {
      console.error('Error fetching thoughts:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchThoughts();
  }, []);

  const onRefresh = () => {
    fetchThoughts();
  };

  const handlePostButtonPress = () => {
    setIsPostingNewThought(true);
  };

  const handleCancelPost = () => {
    setIsPostingNewThought(false);
    // Optionally, you might want to refresh the thoughts list here
    // if the user started posting but then cancelled.
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="The Vent" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="The Vent" />

      {isPostingNewThought ? (
        <View style={styles.postContainer}>
          <PostThoughtScreen />
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPost}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.postButton} onPress={handlePostButtonPress}>
            <Text style={styles.postButtonText}>Post a Thought</Text>
          </TouchableOpacity>
          <FlatList
            data={thoughts}
            renderItem={({ item }) => <ThoughtCard thought={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#6200ee']}
              />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No thoughts yet. Be the first to share!</Text>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flex: 1,
  },
  postContainer: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  postButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 16,
    alignItems: 'center',
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e3e3e3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;