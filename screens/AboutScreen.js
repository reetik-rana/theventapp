import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';
import Header from '../components/Header';

const AboutScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="About" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>The Vent</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          
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
              • Violations may result in content removal
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy</Text>
            <Text style={styles.paragraph}>
              Your identity is kept anonymous. We do not collect personal data that can identify you.
              The app assigns a random animal emoji as your temporary identity for each post.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.paragraph}>
              For suggestions, issues, or feedback, please contact us at @capsprout2001@proton.me.
            </Text>
          </View>
          
          <Text style={styles.footer}>
            Made with passion by The Vent Team.{'\n'}
            {/* <Text style={{ fontWeight: 'bold' }}>REETIK RANA</Text> */}
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
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 14,
    color: '#757575',
    marginBottom: 20,
  },
});

export default AboutScreen;