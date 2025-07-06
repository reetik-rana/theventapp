import React from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ThoughtInput = ({ value, onChangeText, placeholder, maxLength }) => {
  const { colors } = useTheme();

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: colors.card,
          color: colors.text,
        }
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
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
    borderWidth: 0,
    textAlignVertical: 'top',
  },
});

export default ThoughtInput;