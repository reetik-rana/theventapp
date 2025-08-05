import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const ThoughtCard = ({ thought, onPress }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(thought.likes || 0);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } catch (error) {
      return 'Just now';
    }
  };

  const handleLike = async () => {
    if (liked) return;
    try {
      const thoughtRef = doc(db, 'thoughts', thought.id);
      await updateDoc(thoughtRef, { likes: increment(1) });
      setLiked(true);
      setLikesCount(prevCount => prevCount + 1);
    } catch (error) {
      console.error('Error updating like count:', error);
    }
  };

  const handleCardPress = () => {
    onPress(thought); // onPress, when the post card is clicked
  };

  return (
    <TouchableOpacity onPress={handleCardPress} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{thought.anonymousId || '🤔'}</Text>
        <Text style={styles.time}>{formatTime(thought.createdAt)}</Text>
      </View>
      <Text style={styles.thoughtText} numberOfLines={Platform.OS === 'web' ? 3 : 0} ellipsizeMode="tail">{thought.text}</Text>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.likeButton} onPress={handleLike} disabled={liked}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={18} color={liked ? "#e91e63" : "#757575"} />
          <Text style={[styles.likeCount, liked && styles.likedText]}>{likesCount}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    ...Platform.select({
      web: {
        width: 250,
        height: 200,
        marginRight: 16,
        marginBottom: 0,
        overflow: 'hidden',
        cursor: 'pointer', // Add a pointer cursor on web for clickability
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
  },
  time: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  thoughtText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#212121',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  likeCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#757575',
  },
  likedText: {
    color: '#e91e63',
  },
});

export default ThoughtCard;