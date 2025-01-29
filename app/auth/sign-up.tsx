import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function signUpWithEmail() {
    try {
      // Basic validation
      if (!email || !password) {
        Alert.alert('Error', 'Email and password are required');
        return;
      }

      // Password strength validation
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      // Try to sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        // Handle the case where the email is already registered
        if (error.message.includes('already registered')) {
          // Try to sign in with password to check if it's an OAuth-only user
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });

          if (signInError && signInError.message.includes('Invalid login credentials')) {
            Alert.alert(
              'OAuth Account Exists',
              'This email is registered with a social login. Please sign in using your social account first, then you can add a password.',
              [
                {
                  text: 'Go to Sign In',
                  onPress: () => router.replace('/auth/sign-in'),
                },
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
              ]
            );
            return;
          }

          // If the error is not about invalid credentials, it's a regular registered user
          Alert.alert(
            'Account Exists',
            'This email is already registered. Please sign in with your password.',
            [
              {
                text: 'Go to Sign In',
                onPress: () => router.replace('/auth/sign-in'),
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ]
          );
          return;
        }
        throw error;
      }

      if (!data.user) {
        Alert.alert('Error', 'User creation failed. Please try again.');
        return;
      }

      // Add user to public users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({ id: data.user.id, email: data.user.email });

      if (insertError) {
        console.error('Error inserting user into public table:', insertError);
        Alert.alert('Error', 'Failed to create user profile. Please try again.');
        return;
      }

      Alert.alert('Success', 'Your account has been created and you\'re now signed in!');
      router.replace('/');

    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unexpected error occurred');
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          placeholder="Password"
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#007AFF"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={signUpWithEmail}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
          <Text style={styles.link}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
  },
  eyeIcon: {
    padding: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    color: '#007AFF',
    fontSize: 14,
  },
});