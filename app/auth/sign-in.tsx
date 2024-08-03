import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function signInWithEmail() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    if (!data.user) {
      Alert.alert('Error', 'Sign in failed. Please try again.');
      return;
    }

    // Check if user exists in the public users table
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select()
      .eq('id', data.user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user data:', fetchError);
      Alert.alert('Error', 'Failed to fetch user profile. Please try again.');
      return;
    }

    // If user doesn't exist in the public table, add them
    if (!userData) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({ id: data.user.id, email: data.user.email });

      if (insertError) {
        console.error('Error inserting user into public table:', insertError);
        Alert.alert('Error', 'Failed to create user profile. Please try again.');
        return;
      }
    }

    // User is now signed in and exists in the public users table
    Alert.alert('Success', 'You are now signed in!');
    router.replace('/'); // Redirect to the main app screen
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
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
            color="gray"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={signInWithEmail}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
          <Text style={styles.link}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
          <Text style={styles.link}>Forgot Password?</Text>
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
    justifyContent: 'space-between',
    marginTop: 20,
  },
  link: {
    color: '#007AFF',
    fontSize: 14,
  },
});