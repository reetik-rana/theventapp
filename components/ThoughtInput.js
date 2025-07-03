import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext'; // NEW: Import useTheme

const ThoughtInput = ({ value, onChangeText, placeholder, maxLength }) => {
  const { colors } = useTheme(); // NEW: Get colors from theme context

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: colors.card, // Apply theme's card color
          color: colors.text,         // Apply theme's text color
          borderColor: colors.border  // Apply theme's border color
        }
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder} // Use theme's placeholder color
      multiline
      textAlignVertical="top"
      maxLength={maxLength}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: 8,
    padding: 16,
    minHeight: 120,
    maxHeight: 300,
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
});

export default ThoughtInput;