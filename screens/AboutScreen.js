// screens/AboutScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Linking, Image } from 'react-native';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const APP_VERSION = '1.2.3';
const ADMIN_EMAIL = 'capsprout2001@proton.me';
const GITHUB_URL = 'https://github.com/reetik-rana/theventapp';

const AboutScreen = () => {
  const { colors } = useTheme();

  const handleContactPress = () => {
    Linking.openURL(`mailto:${ADMIN_EMAIL}`);
  };

  const handleGithubPress = () => {
    Linking.openURL(GITHUB_URL);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        tagline="About The Vent"
        headerBgColor="black"
        headerTextColor="white"
        taglineFontSize={20}
        showLogo={false}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.content}>
          <Image source={require('../assets/ventlogo.png')} style={styles.logo} />
          <Text style={[styles.title, { color: colors.text }]}>The Vent</Text>
          <Text style={[styles.version, { color: colors.placeholder }]}>Version {APP_VERSION}</Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Welcome</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              The Vent is a safe, anonymous space to share your thoughts, feelings, and opinions. Express yourself freely and connect with others—without the pressure of revealing your identity.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Mission</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              We believe everyone deserves a place to be heard. Our mission is to foster a supportive, respectful, and open community where you can vent, reflect, and find solidarity.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Guidelines</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              • Be respectful and kind{'\n'}
              • No hate speech, bullying, or harassment{'\n'}
              • Do not share personal information{'\n'}
              • No spam or inappropriate content{'\n'}
              • Violations may result in removal of content or account
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Anonymity</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              Your posts are anonymous to the community, but are linked to a unique User ID (UID) for moderation and account recovery. Only the platform admin can access this information, and it is never sold or used for advertising.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Email Authentication</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              We use email authentication to ensure each user has a unique account and to prevent spam. Your email is only used for account verification and recovery. We do not send promotional emails or newsletters, and your data is never sold.
            </Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              Forgot your username or password? Email <Text style={{ fontWeight: 'bold', color: colors.primary }} onPress={handleContactPress}>{ADMIN_EMAIL}</Text> for help. For maximum anonymity, you may use a temporary or fake email for signup/login.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact & Feedback</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              Have suggestions/want to contribute or need support? Reach out at <Text style={{ fontWeight: 'bold', color: colors.primary }} onPress={handleContactPress}>{ADMIN_EMAIL}</Text>.
            </Text>
          </View>

          <Text style={[styles.footer, { color: colors.placeholder }]}>Made with ❤️ by a Tech Enthusiast</Text>
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
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 12,
    borderRadius: 16,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1,
  },
  version: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#888',
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