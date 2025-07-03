// components/Header.js
import React from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

import AppLogo from '../assets/ventlogo.png';

const Header = ({ showLogo = true, logoSource = AppLogo, tagline }) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.primary }]}>
      <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
        {showLogo && logoSource && (
          <Image
            source={logoSource}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
        <View style={styles.textContainer}>
          {tagline && <Text style={[styles.prominentTagline, { color: colors.card }]}>{tagline}</Text>}
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
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  prominentTagline: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default Header;