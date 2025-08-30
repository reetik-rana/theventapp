// components/Header.js
import React from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

import AppLogo from '../assets/ventlogo.png';

const Header = ({ showLogo = true, logoSource = AppLogo, tagline, headerBgColor, headerTextColor, taglineFontSize, centerTagline }) => {
  const { colors } = useTheme();

  const currentHeaderBg = headerBgColor || colors.primary;
  const currentHeaderTextColor = headerTextColor || colors.card;
  const currentTaglineFontSize = taglineFontSize || 20;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentHeaderBg }]}>
      <View style={[
        styles.headerContainer,
        !showLogo && styles.headerContainerNoLogo,
        { backgroundColor: currentHeaderBg }
      ]}>
        {showLogo && logoSource && (
          <Image
            source={logoSource}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
        <View style={[
          styles.textContainer,
          !showLogo && styles.textContainerNoLogo,
          centerTagline && styles.textContainerCentered,
        ]}>
          {tagline && <Text style={[styles.prominentTagline, { color: currentHeaderTextColor, fontSize: currentTaglineFontSize }]}>{tagline}</Text>}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    width: '100%',
    padding: 10,
    paddingTop: Platform.OS === 'android' ? 0 : 0, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
  },
  headerContainerNoLogo: {
    justifyContent: Platform.select({
      web: 'flex-start', // Align to the left on web
      default: 'center', // Keep centered on mobile
    }),
    paddingVertical: 10 + (Platform.OS === 'android' ? 10 : 0),
    paddingHorizontal: 10,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  textContainerNoLogo: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainerCentered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prominentTagline: {
    fontWeight: 'bold',
    textAlign: Platform.select({
      web: 'left', // Align text to the left on web
      default: 'center', // Keep centered on mobile
    }),
    marginTop: 0,
  },
});

export default Header;