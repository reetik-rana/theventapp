import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  Text,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import ThoughtCard from '../components/ThoughtCard';
import Header from '../components/Header';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const HomeScreen = () => {
  const [thoughts, setThoughts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedThought, setSelectedThought] = useState(null);

  const numColumns = Platform.OS === 'web' ? 4 : 1;
  const navigation = useNavigation(); // Get the navigation object

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
    navigation.navigate('Post'); // Navigate to the 'Post' screen
  };

  const openModal = (thought) => {
    setSelectedThought(thought);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedThought(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="The Vent" />
      <View style={styles.listContainer}>
        <TouchableOpacity style={styles.postButton} onPress={handlePostButtonPress}>
          <Text style={styles.postButtonText}>Post a Thought</Text>
        </TouchableOpacity>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
          </View>
        ) : (
          <FlatList
            data={thoughts}
            renderItem={({ item }) => (
              <ThoughtCard thought={item} onPress={openModal} />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            style={styles.flatList}
            numColumns={numColumns}
            key={numColumns}
            columnWrapperStyle={Platform.select({
              web: styles.webRow,
            })}
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
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Thought</Text>
              <ScrollView>
                <Text style={styles.modalText}>{selectedThought?.text}</Text>
              </ScrollView>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
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
  listContent: {
    padding: 16,
  },
  flatList: {},
  webRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  cardContainer: {
    padding: 8,
    ...Platform.select({
      web: {
        flex: 1,
        maxWidth: '25%',
      },
    }),
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
    ...Platform.select({
      web: {
        fontSize: 20,
      },
    }),
  },
  postButton: {
    backgroundColor: '#6200ee',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 16,
    alignSelf: 'center', // Center the button horizontally
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    ...Platform.select({
      web: {
        fontSize: 20,
      },
    }),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;