// components/Header.js
import React from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

import AppLogo from '../assets/ventlogo.png';

const Header = ({ showLogo = true, logoSource = AppLogo, tagline, headerBgColor, headerTextColor, taglineFontSize }) => {
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
        ]}>
          {tagline && <Text style={[styles.prominentTagline, { color: currentHeaderTextColor, fontSize: currentTaglineFontSize }]}>{tagline}</Text>}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
  },
  headerContainer: {
    width: '100%',
    padding: 15,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
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
    justifyContent: 'center',
    paddingVertical: 15 + (Platform.OS === 'android' ? 20 : 0),
    paddingHorizontal: 15,
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
  prominentTagline: {
    fontWeight: 'bold',
  },
});

export default Header;