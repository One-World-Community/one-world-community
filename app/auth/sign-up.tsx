import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { router } from 'expo-router';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function signUpWithEmail() {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error', error.message);
      return;
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

    // Sign in the user
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (signInError) {
      console.error('Error signing in after account creation:', signInError);
      Alert.alert('Account created', 'Your account was created successfully, but we couldn\'t sign you in automatically. Please sign in manually.');
      router.replace('/auth/sign-in');
    } else {
      Alert.alert('Success', 'Your account has been created and you\'re now signed in!');
      router.replace('/'); // Redirect to the main app screen
    }
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
      <Button title="Sign Up" onPress={signUpWithEmail} />
      <Button title="Back to Sign In" onPress={() => router.back()} />
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
