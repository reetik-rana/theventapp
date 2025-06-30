// screens/AuthScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed

export default function AuthScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false); // To toggle between login/signup
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();

  const handleAuth = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      if (isSigningUp) {
        await signup(username, password);
        Alert.alert('Success', 'Account created! You are now logged in.');
      } else {
        await login(username, password);
        Alert.alert('Success', 'Logged in successfully!');
      }
    } catch (error) {
      console.error('Auth Error:', error);
      // Firebase errors will have a 'code' property
      let errorMessage = 'An unexpected error occurred.';
      if (error.code === 'auth/email-already-in-use') { // This is for dummy email conflict
        errorMessage = 'This username is taken or login failed. Try another or log in.';
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        errorMessage = 'Invalid username or password.';
      } else if (error.message.includes('Username is already taken')) { // Custom error from signup
        errorMessage = error.message;
      }
      Alert.alert('Authentication Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSigningUp ? 'Sign Up' : 'Login'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? 'Loading...' : (isSigningUp ? 'Sign Up' : 'Login')}
        onPress={handleAuth}
        disabled={loading}
      />
      <Button
        title={isSigningUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        onPress={() => setIsSigningUp(!isSigningUp)}
        disabled={loading}
        color="gray"
      />
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  spinner: {
    marginTop: 20,
  }
});