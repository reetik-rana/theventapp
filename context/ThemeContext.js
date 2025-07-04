// context/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
  const [theme, setTheme] = useState('light'); // Default theme

  // Load theme from AsyncStorage on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('appTheme');
        if (storedTheme) {
          setTheme(storedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme from AsyncStorage', error);
      }
    };
    loadTheme();
  }, []);

  // Save theme to AsyncStorage whenever it changes
  useEffect(() => {
    const saveTheme = async () => {
      try {
        await AsyncStorage.setItem('appTheme', theme);
      } catch (error) {
        console.error('Failed to save theme to AsyncStorage', error);
      }
    };
    saveTheme();
  }, [theme]);


  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const isDarkMode = theme === 'dark';

  // Define your theme colors/styles here
  // These are example colors. You can adjust them to your preference.
  const colors = {
    background: isDarkMode ? '#1a1a1a' : '#f5f5f5', // Main screen background
    text: isDarkMode ? '#e0e0e0' : '#333333',     // Primary text color
    card: isDarkMode ? '#2c2c2c' : '#ffffff',     // Card backgrounds (e.g., post items, input fields)
    primary: isDarkMode ? '#bb86fc' : '#6200ee',  // Primary accent color (buttons, active tabs)
    secondary: isDarkMode ? '#03dac6' : '#03dac6', // Secondary accent color (if needed)
    border: isDarkMode ? '#4a4a4a' : '#dddddd',   // Border colors
    placeholder: isDarkMode ? '#888888' : '#aaaaaa', // Placeholder text in inputs
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);