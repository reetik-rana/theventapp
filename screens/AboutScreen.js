import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';
import Header from '../components/Header';

// Data for the comparison table - moved inside the component or outside if preferred globally
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
  return (
    <SafeAreaView style={styles.container}>
      <Header title="About" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>The Vent</Text>
          <Text style={styles.version}>Version 1.1.0</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is The Vent?</Text>
            <Text style={styles.paragraph}>
              The Vent is a safe space for anyone who want to share their thoughts, feelings,
              and opinions without revealing their identity. Express yourself freely, rant about
              anything, or share your deepest thoughts.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community Guidelines</Text>
            <Text style={styles.paragraph}>
              • Be respectful of others{'\n'}
              • No hate speech or bullying{'\n'}
              • No sharing of personal information{'\n'}
              • No spamming or inappropriate content{'\n'}
              • Violations may result in content/account removal
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            <Text style={styles.paragraph}>
              Your identity is kept anonymous. We do not collect personal data that can identify you.
              Only your username will be visible to others, which doesn't need to be your real name.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>The Vent v/s Others</Text>
            {/* START OF NEWLY ADDED/MODIFIED TABLE CONTENT */}
            <Text style={styles.paragraph}>
              Our app offers a unique approach to thought sharing, prioritizing a form of anonymity that distinguishes it 
              from traditional social media platforms like Reddit, X (Twitter) or any other platform for anoymous sharing.
            </Text>

            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.tableHeaderText, styles.featureCol]}>Feature / Aspect</Text>
              <Text style={[styles.tableHeaderText, styles.yourAppCol]}>The Vent</Text>
              <Text style={[styles.tableHeaderText, styles.othersCol]}>Others</Text>
            </View>

            {/* Table Rows */}
            {comparisonData.map((row, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.evenRow : styles.oddRow, // Zebra striping
                ]}
              >
                <Text style={[styles.tableCell, styles.featureCol, styles.boldFeature]}>{row.feature}</Text>
                <Text style={[styles.tableCell, styles.yourAppCol]}>{row.yourApp}</Text>
                <Text style={[styles.tableCell, styles.othersCol]}>{row.others}</Text>
              </View>
            ))}

            <Text style={styles.paragraph}>
              While no online platform can guarantee absolute anonymity against sophisticated threats, 
              our design emphasizes decoupling your posting identity from real-world identifiers, fostering a community focused purely on shared thoughts.
            </Text>
            {/* END OF NEWLY ADDED/MODIFIED TABLE CONTENT */}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.paragraph}>
              For suggestions, issues, or feedback --- @capsprout2001@proton.me.
            </Text>
          </View>

          <Text style={styles.footer}>
            Made with passion by The Vent dev.{'\n'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    color: '#757575',
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
    color: '#212121',
    marginBottom: 10, // Added margin to paragraphs for better spacing
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#757575',
    marginBottom: 20,
  },
  // --- New styles for the table ---
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#007bff', // Professional blue for header
    paddingVertical: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden', // Ensures border radius is applied
    marginTop: 15, // Space above the table
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11, // Slightly smaller font for table headers
    paddingHorizontal: 4,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee', // Light border between rows
  },
  evenRow: {
    backgroundColor: '#fff', // White background for even rows
  },
  oddRow: {
    backgroundColor: '#f0f8ff', // Light blue (aliceblue) for odd rows
  },
  tableCell: {
    fontSize: 10, // Smaller font for table content
    color: '#333',
    paddingHorizontal: 4,
    lineHeight: 14, // Adjust line height for dense text
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