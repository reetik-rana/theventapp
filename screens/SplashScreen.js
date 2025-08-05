// screens/SplashScreen.js
import React from 'react';
import { View, StyleSheet, SafeAreaView, Image, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AppLogo from '../assets/ventlogo.png';

const SplashScreen = () => {
  const { colors } = useTheme();

  return (
    // Changed backgroundColor to black
    <SafeAreaView style={[styles.container, { backgroundColor: 'black' }]}>
      <View style={styles.content}>
        <Image
          source={AppLogo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.tagline, { color: 'white' }]}>We listen and We don't judge</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default SplashScreen;