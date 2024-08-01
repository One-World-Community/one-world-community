import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="Email"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        placeholder="Password"
        secureTextEntry
      />
      <Button title="Sign In" onPress={signInWithEmail} />
      <Button title="Create Account" onPress={() => router.push('/auth/sign-up')} />
      <Button title="Forgot Password" onPress={() => router.push('/auth/forgot-password')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
