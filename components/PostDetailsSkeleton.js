// components/PostDetailsSkeleton.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const PostDetailsSkeleton = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.postHeader, { backgroundColor: colors.card }]}>
        <View style={[styles.titlePlaceholder, { backgroundColor: colors.border }]} />
        <View style={[styles.authorPlaceholder, { backgroundColor: colors.border }]} />
      </View>
      <View style={[styles.contentPlaceholder, { backgroundColor: colors.card }]}>
        <View style={[styles.textLine, { backgroundColor: colors.border }]} />
        <View style={[styles.textLine, { backgroundColor: colors.border, width: '80%' }]} />
        <View style={[styles.textLine, { backgroundColor: colors.border, width: '90%' }]} />
      </View>
      <View style={[styles.repliesHeader, { backgroundColor: colors.card }]}>
        <View style={[styles.repliesTitlePlaceholder, { backgroundColor: colors.border }]} />
      </View>
      <View style={[styles.replyItem, { backgroundColor: colors.card }]}>
        <View style={[styles.replyAuthorPlaceholder, { backgroundColor: colors.border }]} />
        <View style={[styles.replyTextPlaceholder, { backgroundColor: colors.border }]} />
      </View>
      <View style={[styles.replyItem, { backgroundColor: colors.card }]}>
        <View style={[styles.replyAuthorPlaceholder, { backgroundColor: colors.border }]} />
        <View style={[styles.replyTextPlaceholder, { backgroundColor: colors.border }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
  },
  postHeader: {
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  titlePlaceholder: {
    height: 24,
    width: '85%',
    borderRadius: 4,
    marginBottom: 8,
  },
  authorPlaceholder: {
    height: 14,
    width: '40%',
    borderRadius: 4,
  },
  contentPlaceholder: {
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  textLine: {
    height: 16,
    borderRadius: 4,
    marginBottom: 6,
  },
  repliesHeader: {
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  repliesTitlePlaceholder: {
    height: 18,
    width: '50%',
    borderRadius: 4,
  },
  replyItem: {
    padding: 10,
    marginHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyAuthorPlaceholder: {
    height: 13,
    width: '30%',
    borderRadius: 4,
    marginBottom: 5,
  },
  replyTextPlaceholder: {
    height: 15,
    width: '90%',
    borderRadius: 4,
  },
});

export default PostDetailsSkeleton;