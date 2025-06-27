import React from 'react';
import { StyleSheet, TextInput } from 'react-native';

const ThoughtInput = ({ value, onChangeText, placeholder, maxLength }) => {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9e9e9e"
      multiline
      textAlignVertical="top"
      maxLength={maxLength}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    minHeight: 120, // You can adjust this initial height
    maxHeight: 300, // Add this to control the maximum visible height before scrolling
    fontSize: 16,
    lineHeight: 24,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlignVertical: 'top',
  },
});

export default ThoughtInput;