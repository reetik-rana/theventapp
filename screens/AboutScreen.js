// screens/AboutScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const AboutScreen = () => {
  const { colors, isDarkMode } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        tagline="Our mission and values"
        headerBgColor="black"
        headerTextColor="white"
        taglineFontSize={20}
        showLogo={false}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>The Vent</Text>
          <Text style={[styles.version, { color: colors.placeholder }]}>Version 1.2.1</Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>What is The Vent?</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              The Vent is a safe space for anyone who wants to share their thoughts, feelings,
              and opinions without revealing their identity to the community. Express yourself freely,
              rant about anything, or share your deepest thoughts.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Guidelines</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              • Be respectful of others{'\n'}
              • No hate speech or bullying{'\n'}
              • No sharing of personal information{'\n'}
              • No spamming or inappropriate content{'\n'}
              • Violations may result in content/account removal
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy and Anonymity</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              Your identity is pseudo-anonymous. This means that while your posts are anonymous to the general community and other users, they are linked to a unique User ID (UID) on our backend. The UID is generated when you sign up with your email. This UID is visible to the platform administrator, who has the ability to connect posts to an account. We do not use this information for tracking or other purposes.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>A Note on Social Media</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              Unlike traditional social media where a user's reputation is tied to their profile, The Vent focuses on the content itself. This design choice is meant to promote open, honest conversation and reduce the social pressure that comes with posting publicly.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              For suggestions, issues, or feedback --- @capsprout2001@proton.me.
            </Text>
          </View>

          <Text style={[styles.footer, { color: colors.placeholder }]}>
            Developed by a Tech-Enthusiast {'\n'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
});

export default AboutScreen;