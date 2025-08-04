// screens/AboutScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const comparisonData = [
  {
    feature: 'Primary User ID',
    yourApp: 'Custom, chosen Username (e.g., "ShadowWhisper")',
    others: 'User-chosen Username (e.g., "u/anonreader"), often linked to real identity on X',
  },
  {
    feature: 'Real-World Identity',
    yourApp: 'Not directly linked publicly (only internally by Firebase Auth UID if email/password used)',
    others: 'Often linked to email/phone (Reddit) or directly encouraged/publicly displayed (X/Facebook)',
  },
  {
    feature: 'Publicly Visible ID',
    yourApp: 'Custom Username (e.g., "ShadowWhisper") or Emoji (e.g., "🐱")',
    others: 'Username; sometimes real name/verified status (X)',
  },
  {
    feature: 'Platform Knowledge',
    yourApp: 'Firebase knows email/password/UID for authentication',
    others: 'Platform knows email/phone, potentially real name, IP, and other personal data',
  },
  {
    feature: 'Identity Traceability',
    yourApp: 'Difficult for other users to trace; possible for platform/legal means via Firebase Auth UID/IP',
    others: 'Easier for platform to trace; possible for others via public info, IP, or data breaches',
  },
  {
    feature: 'Focus of Interaction',
    yourApp: 'Primarily on the "thought" itself, pseudo-anonymous authors',
    others: 'Often on the persona/identity behind the post, building followers/reputation',
  },
  {
    feature: 'Data Collection',
    yourApp: 'Minimal beyond what\'s needed for authentication and app function',
    others: 'Extensive (location, contacts, Browse habits, linked accounts for ad targeting)',
  },
];

const AboutScreen = () => {
  const { colors, isDarkMode } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        tagline="Our mission and values"
        headerBgColor="black" // Set header background to black
        headerTextColor="white" // Set header text to white
        taglineFontSize={20} // Set tagline font size to smaller
        showLogo={false} // Hide the logo
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>The Vent</Text>
          <Text style={[styles.version, { color: colors.placeholder }]}>Version 1.2.1</Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>What is The Vent?</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              The Vent is a safe space for anyone who want to share their thoughts, feelings,
              and opinions without revealing their identity. Express yourself freely, rant about
              anything, or share your deepest thoughts.
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
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              Your identity is kept anonymous. We do not collect personal data that can identify you.
              Only your username will be visible to others, which doesn't need to be your real name.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>The Vent v/s Others</Text>
            <Text style={[styles.paragraph, { color: colors.text }]}>
              Our app offers a unique approach to thought sharing, prioritizing a form of anonymity that distinguishes it from traditional social media platforms like Reddit or X (Twitter).
            </Text>

            <View style={[styles.tableHeaderRow, { backgroundColor: colors.primary }]}>
              <Text style={[styles.tableHeaderText, styles.featureCol]}>Feature / Aspect</Text>
              <Text style={[styles.tableHeaderText, styles.yourAppCol]}>Our App</Text>
              <Text style={[styles.tableHeaderText, styles.othersCol]}>Other apps</Text>
            </View>

            {comparisonData.map((row, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  { borderBottomColor: colors.border },
                  index % 2 === 0 ? { backgroundColor: colors.card } : { backgroundColor: isDarkMode ? '#3c3c3c' : '#f0f8ff' },
                ]}
              >
                <Text style={[styles.tableCell, styles.featureCol, styles.boldFeature, { color: colors.text }]}>{row.feature}</Text>
                <Text style={[styles.tableCell, styles.yourAppCol, { color: colors.text }]}>{row.yourApp}</Text>
                <Text style={[styles.tableCell, styles.othersCol, { color: colors.text }]}>{row.others}</Text>
              </View>
            ))}

            <Text style={[styles.paragraph, { color: colors.text }]}>
              While no online platform can guarantee absolute anonymity against sophisticated threats, our design emphasizes decoupling your posting identity from real-world identifiers, fostering a community focused purely on shared thoughts.
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
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    marginTop: 15,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tableCell: {
    fontSize: 10,
    paddingHorizontal: 4,
    lineHeight: 14,
  },
  boldFeature: {
    fontWeight: 'bold',
  },
  featureCol: {
    width: '25%',
  },
  yourAppCol: {
    width: '37.5%',
  },
  othersCol: {
    width: '37.5%',
  },
});

export default AboutScreen;