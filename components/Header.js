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
    <SafeAreaView style={[{ backgroundColor: currentHeaderBg }]}>
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
          {tagline && <Text style={[
            styles.prominentTagline,
            { color: currentHeaderTextColor, fontSize: currentTaglineFontSize },
            centerTagline && styles.centeredTagline
          ]}>
            {tagline}
          </Text>}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    paddingTop: 40, // just in case if something's wrong with the HEADING, change this value hehe
    paddingBottom: 15,
    paddingHorizontal: 15,
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
    paddingVertical: 15,
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
  centeredTagline: {
    textAlign: 'center',
  }
});

export default Header;