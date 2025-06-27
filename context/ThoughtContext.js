// context/ThoughtContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateRandomId } from '../utils/helpers';

export const ThoughtContext = createContext();

export const ThoughtProvider = ({ children }) => {
  const [thoughts, setThoughts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load thoughts from storage when the app starts
  useEffect(() => {
    const loadThoughts = async () => {
      try {
        const storedThoughts = await AsyncStorage.getItem('thoughts');
        if (storedThoughts !== null) {
          setThoughts(JSON.parse(storedThoughts));
        }
      } catch (error) {
        console.error('Failed to load thoughts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThoughts();
  }, []);

  // Save thoughts to storage whenever they change
  useEffect(() => {
    const saveThoughts = async () => {
      try {
        await AsyncStorage.setItem('thoughts', JSON.stringify(thoughts));
      } catch (error) {
        console.error('Failed to save thoughts:', error);
      }
    };

    if (!isLoading) {
      saveThoughts();
    }
  }, [thoughts, isLoading]);

  // Add a new thought
  const addThought = (content, category) => {
    const newThought = {
      id: generateRandomId(),
      content,
      category,
      timestamp: Date.now(),
      likes: 0,
      comments: []
    };

    setThoughts(prevThoughts => [newThought, ...prevThoughts]);
  };

  // Like a thought
  const likeThought = (id) => {
    setThoughts(prevThoughts =>
      prevThoughts.map(thought =>
        thought.id === id
          ? { ...thought, likes: thought.likes + 1 }
          : thought
      )
    );
  };

  // Add a comment to a thought
  const addComment = (thoughtId, comment) => {
    setThoughts(prevThoughts =>
      prevThoughts.map(thought =>
        thought.id === thoughtId
          ? {
              ...thought,
              comments: [
                ...thought.comments,
                { id: generateRandomId(), content: comment, timestamp: Date.now() }
              ]
            }
          : thought
      )
    );
  };

  return (
    <ThoughtContext.Provider
      value={{
        thoughts,
        isLoading,
        addThought,
        likeThought,
        addComment
      }}
    >
      {children}
    </ThoughtContext.Provider>
  );
};